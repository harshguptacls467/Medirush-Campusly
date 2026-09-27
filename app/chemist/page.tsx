'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Store, 
  Bell, 
  BellOff, 
  CheckCircle2, 
  AlertTriangle, 
  Snowflake, 
  MapPin, 
  Bike, 
  ShieldCheck, 
  Clock, 
  Database, 
  Pill, 
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Phone,
  Power,
  FileText,
  Search,
  Upload,
  Camera,
  Check,
  AlertCircle,
  Sparkles,
  Wifi,
  WifiOff,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Order } from '@/lib/store';
import { ShadowInventoryItem, InvoiceRecord, getShadowInventory, matchMedicineInInventory } from '@/lib/inventory-engine';
import { searchLocalMedicines, SearchResultItem } from '@/lib/medicine-search';
import { enqueueSyncOperation, getPendingSyncItems, flushSyncQueue, SyncQueueItem } from '@/lib/sync-manager';
import { CHEMIST_REGISTRY, ChemistNode } from '@/lib/chemists';
import { calculateFulfillmentPlan, MultiFulfillmentPlan, PharmacyCoverageNode } from '@/lib/multi-pharmacy-fulfillment';

export default function ChemistPortal() {
  // Navigation
  const [activeNav, setActiveNav] = useState<'orders' | 'invoice_scanner' | 'inventory' | 'search'>('orders');
  const [activeOrderTab, setActiveOrderTab] = useState<'pending' | 'completed'>('pending');

  // Active Chemist Node Selection
  const [activeChemistId, setActiveChemistId] = useState<string>('chem-1');
  const activeChemist = CHEMIST_REGISTRY.find((c) => c.id === activeChemistId) || CHEMIST_REGISTRY[0];

  // Orders State
  const [incomingOrders, setIncomingOrders] = useState<Order[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Per-Order Checked Medicines State (for interactive Set Cover solver)
  const [selectedMedsByOrder, setSelectedMedsByOrder] = useState<Record<string, string[]>>({});

  // Sync Queue State
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Shadow Inventory State
  const [inventoryList, setInventoryList] = useState<ShadowInventoryItem[]>([]);
  const [inventoryFilter, setInventoryFilter] = useState<'ALL' | 'COLD_CHAIN' | 'FRESH' | 'AGING'>('ALL');

  // Invoice Scanner State
  const [invoiceImage, setInvoiceImage] = useState<string | null>(null);
  const [isAnalyzingInvoice, setIsAnalyzingInvoice] = useState<boolean>(false);
  const [extractedInvoice, setExtractedInvoice] = useState<{
    invoice: InvoiceRecord;
    items: any[];
  } | null>(null);
  const [invoiceSuccessMsg, setInvoiceSuccessMsg] = useState<string | null>(null);

  // Offline Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearchingOffline, setIsSearchingOffline] = useState<boolean>(false);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Shadow Inventory for Active Chemist Node
  const fetchInventory = useCallback(async (chemistId: string = activeChemistId) => {
    try {
      const res = await fetch(`/api/shadow-inventory?pharmacyId=${chemistId}`);
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setInventoryList(data.inventory);
      }
    } catch (e) {
      console.warn('Using client-side seeded inventory fallback');
      setInventoryList(getShadowInventory(chemistId));
    }
  }, [activeChemistId]);

  // Update inventory when active chemist node changes
  useEffect(() => {
    fetchInventory(activeChemistId);
  }, [activeChemistId, fetchInventory]);

  // Update Pending Sync Count
  const refreshSyncQueue = useCallback(async () => {
    try {
      const pending = await getPendingSyncItems();
      setPendingSyncCount(pending.length);
    } catch (e) {}
  }, []);

  // Flush Sync
  const handleFlushSync = async () => {
    setIsSyncing(true);
    try {
      const res = await flushSyncQueue();
      await refreshSyncQueue();
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      await fetchInventory(activeChemistId);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sound generator: Urgent repeated chemist terminal beep
  const playAlertBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio Context blocked until user interaction.");
    }
  }, [soundEnabled]);

  // Success Confirmation chime
  const playSuccessChime = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16);
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.24);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  }, []);

  // Compute live cooperative multi-pharmacy Set Cover plan for an order based on ticked items
  const computeOrderCooperativePlan = useCallback((order: Order): MultiFulfillmentPlan => {
    // Default: if no custom ticks yet, check which items match active store's shadow inventory
    const defaultSelected = order.medicines
      .filter((m) => matchMedicineInInventory(m.brand_name || m.chemical_salt || '', activeChemistId).matched)
      .map((m) => m.id || m.brand_name);
    
    const selectedMedIds = selectedMedsByOrder[order.id] ?? (defaultSelected.length > 0 ? defaultSelected : order.medicines.map(m => m.id || m.brand_name));
    
    // Items fulfilled by this active store
    const tickedMeds = order.medicines.filter((m) => selectedMedIds.includes(m.id || m.brand_name));
    // Items that need to be fulfilled by a partner store
    const untickedMeds = order.medicines.filter((m) => !selectedMedIds.includes(m.id || m.brand_name));

    // Active Node coverage
    const activeNodeFulfilled = tickedMeds.map((m) => {
      const match = matchMedicineInInventory(m.brand_name || m.chemical_salt || '', activeChemistId);
      return {
        medicineName: m.brand_name || m.chemical_salt,
        productName: match.item?.product_name || m.brand_name || m.chemical_salt,
        batchNo: match.item?.batch_no || `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
        confidence: match.item ? Math.round(match.confidence * 100) : 95,
        matchType: match.item ? match.matchType : 'MANUAL_CHEMIST_CONFIRMED',
        freshness: match.freshness,
      };
    });

    const activeDistKm = activeChemist.distance_km;
    const activeCoveragePct = Math.round((tickedMeds.length / order.medicines.length) * 100);

    const activeNode: PharmacyCoverageNode = {
      chemistId: activeChemist.id,
      chemistName: activeChemist.name,
      area: activeChemist.area,
      city: activeChemist.city,
      distanceKm: activeDistKm,
      phone: activeChemist.phone,
      fulfilledMedicines: activeNodeFulfilled,
      missingMedicines: untickedMeds.map((m) => m.brand_name || m.chemical_salt),
      coveragePercent: activeCoveragePct,
      distanceScore: Math.max(10, Math.min(100, Math.round(Math.exp(-0.35 * activeDistKm) * 100))),
      freshnessScore: 95,
      responseScore: Math.max(10, Math.min(100, Math.round(((120 - activeChemist.avg_response_time_sec) / 120) * 100))),
      totalNodeScore: Math.round(activeCoveragePct * 0.4 + 50),
    };

    if (untickedMeds.length === 0) {
      // 100% fulfilled by active store
      const eta = Math.round(12 + activeDistKm * 4);
      return {
        planType: 'SINGLE_NODE',
        overallCoverage: 100,
        totalNodes: 1,
        primaryNode: activeNode,
        nodes: [activeNode],
        allMedicinesCovered: true,
        scoringWeights: { coverage: 0.35, distance: 0.25, freshness: 0.2, response: 0.2 },
        totalEstimatedDistanceKm: activeDistKm,
        estimatedDeliveryEtaMinutes: eta,
        explanation: `Optimal 1-Node Fulfillment: ${activeChemist.name} (${activeDistKm} km away) fulfills 100% of prescribed medicines in-store. Estimated delivery in ${eta} mins.`,
      };
    }

    // Solve for unticked items using other candidate pharmacies
    const otherChemists = CHEMIST_REGISTRY.filter((c) => c.id !== activeChemistId);
    const partnerPlan = calculateFulfillmentPlan(
      untickedMeds.map((m) => ({ name: m.brand_name || m.chemical_salt })),
      { lat: activeChemist.lat, lng: activeChemist.lng },
      otherChemists
    );

    const combinedNodes: PharmacyCoverageNode[] = [
      activeNode,
      ...partnerPlan.nodes,
    ].filter((n) => n.fulfilledMedicines.length > 0);

    const totalCoveredCount = combinedNodes.reduce((acc, n) => acc + n.fulfilledMedicines.length, 0);
    const overallCoveragePct = Math.min(100, Math.round((totalCoveredCount / order.medicines.length) * 100));
    const totalDist = combinedNodes.reduce((acc, n) => acc + n.distanceKm, 0);
    const combinedEta = Math.round(15 + Math.max(...combinedNodes.map((n) => n.distanceKm)) * 3 + (combinedNodes.length - 1) * 4);

    return {
      planType: combinedNodes.length > 1 ? 'MULTI_NODE_SPLIT' : 'SINGLE_NODE',
      overallCoverage: overallCoveragePct,
      totalNodes: combinedNodes.length,
      primaryNode: activeNode,
      nodes: combinedNodes,
      allMedicinesCovered: overallCoveragePct === 100,
      scoringWeights: { coverage: 0.35, distance: 0.25, freshness: 0.2, response: 0.2 },
      totalEstimatedDistanceKm: Math.round(totalDist * 10) / 10,
      estimatedDeliveryEtaMinutes: combinedEta,
      explanation: `Cooperative ${combinedNodes.length}-Node Split: ${activeChemist.name.split(' ')[0]} fulfills ${activeNodeFulfilled.length} item(s), and ${partnerPlan.nodes.map(n => `${n.chemistName.split(' ')[0]} (${n.fulfilledMedicines.length} item)`).join(' + ')} fulfills the remainder for 100% prescription coverage in ~${combinedEta} mins.`,
    };
  }, [activeChemistId, activeChemist, selectedMedsByOrder]);

  // Toggle medicine check state for an order
  const handleToggleMedicine = (orderId: string, medId: string) => {
    setSelectedMedsByOrder((prev) => {
      const order = incomingOrders.find((o) => o.id === orderId);
      const defaultSelected = order 
        ? order.medicines.filter(m => matchMedicineInInventory(m.brand_name || m.chemical_salt || '', activeChemistId).matched).map(m => m.id || m.brand_name)
        : [];
      const current = prev[orderId] ?? (defaultSelected.length > 0 ? defaultSelected : (order ? order.medicines.map(m => m.id || m.brand_name) : [medId]));
      const isSelected = current.includes(medId);
      const next = isSelected ? current.filter((id) => id !== medId) : [...current, medId];
      return { ...prev, [orderId]: next };
    });
  };

  // Simulate Emergency 3-Medicine Order for testing
  const handleSimulateEmergencyOrder = () => {
    const sampleOrder: Order = {
      id: `DISPATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      patient_name: 'Rajesh Sharma',
      doctor_reg: 'MP-78219 (Dr. R.K. Verma, MD - District Civil Hospital)',
      prescription_date: 'Today (Live Broadcast)',
      area: 'Shastri Nagar',
      city: 'Ratlam',
      is_cold_chain: true,
      cold_chain_reason: 'Lantus Insulin detected (Requires 2°C - 8°C Cold Gel Ice Pack)',
      schedule_h_verified: true,
      pack_type: 'FULL',
      total_amount: 588,
      status: 'BROADCASTING',
      created_at: Date.now(),
      medicines: [
        {
          id: 'med-sample-1',
          brand_name: 'Lantus Insulin (Cold Storage 2-8°C)',
          dosage: '10 units at bedtime (SC)',
          chemical_salt: 'Insulin Glargine 100 IU/ml',
          generic_substitute: 'Basalog (Biocon Jan Aushadhi)',
          brand_price: 680,
          generic_price: 410,
          savings_percent: 40,
          is_cold_chain: true,
          fractional_available: false,
        },
        {
          id: 'med-sample-2',
          brand_name: 'Telma 40mg (Telmisartan)',
          dosage: '1 Tab Daily (Morning)',
          chemical_salt: 'Telmisartan 40mg',
          generic_substitute: 'Jan Aushadhi Telmisartan',
          brand_price: 145,
          generic_price: 28,
          savings_percent: 81,
          is_cold_chain: false,
          fractional_available: true,
        },
        {
          id: 'med-sample-3',
          brand_name: 'Ciprofloxacin 500mg (PMBJP Generic)',
          dosage: '1 Tab Twice Daily (5 Days)',
          chemical_salt: 'Ciprofloxacin 500mg',
          generic_substitute: 'PMBJP Ciprofloxacin 500',
          brand_price: 160,
          generic_price: 32,
          savings_percent: 80,
          is_cold_chain: false,
          fractional_available: true,
        },
      ],
    };

    // Chemist 1 (Gupta Medicos) has Lantus + Telma in stock, while Ciprofloxacin is in Chemist 3 (Jan Aushadhi)
    setSelectedMedsByOrder((prev) => ({
      ...prev,
      [sampleOrder.id]: activeChemistId === 'chem-1' 
        ? ['med-sample-1', 'med-sample-2'] 
        : activeChemistId === 'chem-3' 
        ? ['med-sample-3'] 
        : ['med-sample-3']
    }));

    setIncomingOrders((prev) => [sampleOrder, ...prev.filter((o) => o.id !== sampleOrder.id)]);
    playAlertBeep();
  };

  // Server-Sent Events (SSE) + BroadcastChannel integration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    fetchInventory(activeChemistId);
    refreshSyncQueue();

    // Register service worker if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Network status listeners
    const handleOnline = () => {
      setIsOnline(true);
      handleFlushSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('NEW_ORDER_DISPATCH', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        const newOrder: Order = payload.order;
        setIncomingOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });
        playAlertBeep();
      } catch (err) {
        console.error('SSE new order parse error', err);
      }
    });

    eventSource.addEventListener('ORDER_PROGRESS_UPDATE', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        setIncomingOrders((prev) => {
          const exists = prev.some((o) => o.id === payload.orderId);
          if (exists) {
            return prev.map((o) =>
              o.id === payload.orderId
                ? {
                    ...o,
                    status: 'PARTIALLY_ACCEPTED',
                    chemist_responses: payload.respondingChemists,
                  }
                : o
            );
          } else if (payload.order) {
            return [
              {
                ...payload.order,
                status: 'PARTIALLY_ACCEPTED',
                chemist_responses: payload.respondingChemists,
              },
              ...prev,
            ];
          }
          return prev;
        });
        playAlertBeep();
      } catch (err) {
        console.error('SSE order progress parse error', err);
      }
    });

    eventSource.addEventListener('ORDER_CONFIRMED', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        setIncomingOrders((prev) => prev.filter((o) => o.id !== payload.orderId));
        setAcceptedOrders((prev) => [
          {
            id: payload.orderId,
            patient_name: 'Rajesh Sharma',
            city: 'Ratlam',
            area: 'Shastri Nagar',
            doctor_reg: 'MP-78219',
            prescription_date: 'Today',
            is_cold_chain: payload.is_cold_chain ?? true,
            cold_chain_reason: 'Cold Chain Verified',
            schedule_h_verified: true,
            medicines: [],
            pack_type: 'FULL',
            total_amount: 588,
            status: 'ACCEPTED',
            assigned_chemist: payload.chemist_name,
            assigned_rider: payload.rider,
            eta_minutes: payload.eta_minutes,
            created_at: Date.now(),
            accepted_at: Date.now(),
          },
          ...prev.filter((o) => o.id !== payload.orderId),
        ]);
      } catch (err) {}
    });

    const channel = new BroadcastChannel('medirush_channel');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'NEW_ORDER') {
        const newOrder: Order = payload.order;
        setIncomingOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });
        playAlertBeep();
      } else if (type === 'ORDER_PROGRESS_UPDATE') {
        setIncomingOrders((prev) => {
          return prev.map((o) =>
            o.id === payload.orderId
              ? {
                  ...o,
                  status: 'PARTIALLY_ACCEPTED',
                  chemist_responses: payload.respondingChemists,
                }
              : o
          );
        });
      } else if (type === 'ORDER_ACCEPTED') {
        setIncomingOrders((prev) => prev.filter((o) => o.id !== payload.orderId));
      } else if (type === 'RESET_ALL') {
        setIncomingOrders([]);
        setAcceptedOrders([]);
      }
    };

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      eventSource.close();
      channel.close();
    };
  }, [fetchInventory, refreshSyncQueue, playAlertBeep, activeChemistId]);

  // Periodic alert sound if pending orders exist
  useEffect(() => {
    if (incomingOrders.length > 0 && soundEnabled && isOnline && activeNav === 'orders') {
      const interval = setInterval(() => {
        playAlertBeep();
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [incomingOrders, soundEnabled, isOnline, playAlertBeep, activeNav]);

  // Real-time offline medicine search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearchingOffline(true);
    // Instant client-side search execution
    const results = searchLocalMedicines(searchQuery, inventoryList);
    setSearchResults(results);
    setIsSearchingOffline(false);
  }, [searchQuery, inventoryList]);

  // 1-Tap Confirm Stock & Accept Order Action with Cooperative Split Plan
  const handleAcceptOrder = async (order: Order) => {
    try {
      const defaultSelected = order.medicines
        .filter((m) => matchMedicineInInventory(m.brand_name || m.chemical_salt || '', activeChemistId).matched)
        .map((m) => m.id || m.brand_name);
      const selectedMedIds = selectedMedsByOrder[order.id] ?? (defaultSelected.length > 0 ? defaultSelected : order.medicines.map(m => m.id || m.brand_name));

      const cooperativePlan = computeOrderCooperativePlan(order);
      const primaryNodeName = cooperativePlan.primaryNode?.chemistName || activeChemist.name;
      const eta = cooperativePlan.estimatedDeliveryEtaMinutes || 19;

      let resData: any = null;

      if (!isOnline) {
        // Enqueue offline action
        await enqueueSyncOperation('DISPATCH_ORDER', 'ORDER', order.id, {
          orderId: order.id,
          action: 'ACCEPT',
          chemistId: activeChemist.id,
          chemistName: activeChemist.name,
          confirmedMedicineIds: selectedMedIds,
          cooperativePlan,
        });
        await refreshSyncQueue();
      } else {
        const res = await fetch('/api/chemist-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            action: 'CONFIRM_STOCK',
            chemistId: activeChemist.id,
            chemistName: activeChemist.name,
            confirmedMedicineIds: selectedMedIds,
            medicines: order.medicines,
            cooperativePlan,
          }),
        });
        resData = await res.json();
      }

      playSuccessChime();
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      // Cross-tab sync
      if (channelRef.current && resData) {
        if (resData.status === 'ACCEPTED') {
          channelRef.current.postMessage({
            type: 'ORDER_ACCEPTED',
            payload: {
              orderId: order.id,
              status: 'ACCEPTED',
              chemist_name: primaryNodeName,
              rider: 'Rahul Sharma (Hero Splendor MP-43-E-2101)',
              eta_minutes: eta,
              is_cold_chain: order.is_cold_chain,
              cooperativePlan,
            }
          });
        } else {
          channelRef.current.postMessage({
            type: 'ORDER_PROGRESS_UPDATE',
            payload: {
              orderId: order.id,
              status: 'PARTIALLY_ACCEPTED',
              totalMedsCount: resData.totalMedsCount,
              coveredMedsCount: resData.coveredMedsCount,
              coveragePercent: resData.coveragePercent,
              coveredMedicines: resData.coveredMedicines,
              missingMedicines: resData.missingMedicines,
            }
          });
        }
      }

      if (resData?.status === 'ACCEPTED' || (!resData && isOnline === false)) {
        const updatedOrder: Order = {
          ...order,
          status: 'ACCEPTED',
          assigned_chemist: primaryNodeName,
          assigned_rider: 'Rahul Sharma (Hero Splendor MP-43-E-2101)',
          eta_minutes: eta,
          cooperative_plan: cooperativePlan,
        };
        setIncomingOrders((prev) => prev.filter((o) => o.id !== order.id));
        setAcceptedOrders((prev) => [updatedOrder, ...prev]);
      } else {
        // Partially fulfilled! Keep order in incoming list with recorded response from this pharmacy
        setIncomingOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  status: 'PARTIALLY_ACCEPTED',
                  chemist_responses: resData?.order?.chemist_responses || [
                    ...(o.chemist_responses || []).filter((r) => r.chemistId !== activeChemist.id),
                    {
                      chemistId: activeChemist.id,
                      chemistName: activeChemist.name,
                      area: activeChemist.area,
                      distanceKm: activeChemist.distance_km,
                      phone: activeChemist.phone,
                      respondedAt: Date.now(),
                      confirmedMedicineIds: selectedMedIds,
                      medicines: [],
                    },
                  ],
                }
              : o
          )
        );
      }
    } catch (err) {
      console.error("Accept error", err);
    }
  };

  // Reject Order Action
  const handleRejectOrder = async (orderId: string) => {
    try {
      if (isOnline) {
        await fetch('/api/chemist-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            action: 'REJECT',
          }),
        });
      }
      setIncomingOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (e) {}
  };

  // Invoice File Upload Handler
  const handleInvoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setInvoiceImage(base64);
      setExtractedInvoice(null);
      setInvoiceSuccessMsg(null);
      processInvoiceOCR(base64);
    };
    reader.readAsDataURL(file);
  };

  // Process Invoice OCR with Gemini / Fallback
  const processInvoiceOCR = async (imageBase64: string) => {
    setIsAnalyzingInvoice(true);
    setInvoiceSuccessMsg(null);

    try {
      if (!isOnline) {
        // Offline simulated extraction
        setTimeout(() => {
          const mockInvoice: InvoiceRecord = {
            id: `INV-OFFLINE-${Date.now().toString().slice(-4)}`,
            pharmacy_id: 'chem-1',
            pharmacy_name: 'Gupta Medicos & Cold Chain Hub',
            distributor_name: 'Cipla Trade Depo, Ratlam (Offline Scan)',
            invoice_no: `CIP/RTL/${Date.now().toString().slice(-4)}`,
            invoice_date: new Date().toISOString().split('T')[0],
            extracted_items_count: 3,
            ocr_confidence: 0.94,
            created_at: new Date().toISOString(),
          };
          const mockItems = [
            {
              product_name: 'Ciprofloxacin 500mg (Ciplox)',
              normalized_salt: 'ciprofloxacin',
              strength: '500mg',
              dosage_form: 'Tablet',
              batch_no: `CP${Date.now().toString().slice(-4)}`,
              quantity: 25,
              unit: 'strips',
              expiry_date: '2027-11',
              manufacturer: 'Cipla Ltd',
              confidence: 0.94,
              requires_cold_chain: false,
            },
            {
              product_name: 'Pantocid 40mg Tablet',
              normalized_salt: 'pantoprazole',
              strength: '40mg',
              dosage_form: 'Tablet',
              batch_no: `PAN${Date.now().toString().slice(-4)}`,
              quantity: 40,
              unit: 'strips',
              expiry_date: '2028-02',
              manufacturer: 'Sun Pharma',
              confidence: 0.95,
              requires_cold_chain: false,
            },
            {
              product_name: 'Lantus 100IU/ml Cartridge',
              normalized_salt: 'insulin glargine',
              strength: '100 IU/ml',
              dosage_form: 'Injection',
              batch_no: `LAN${Date.now().toString().slice(-4)}`,
              quantity: 10,
              unit: 'pens',
              expiry_date: '2027-06',
              manufacturer: 'Sanofi India',
              confidence: 0.97,
              requires_cold_chain: true,
            }
          ];

          setExtractedInvoice({ invoice: mockInvoice, items: mockItems });
          setIsAnalyzingInvoice(false);
        }, 1200);
        return;
      }

      const res = await fetch('/api/parse-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          pharmacyId: 'chem-1',
          pharmacyName: 'Gupta Medicos & Cold Chain Hub',
        }),
      });

      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setExtractedInvoice({
          invoice: data.invoice,
          items: data.items,
        });
      } else {
        throw new Error(data.error || 'Failed to extract invoice');
      }
    } catch (err: any) {
      console.error('Invoice error:', err);
    } finally {
      setIsAnalyzingInvoice(false);
    }
  };

  // Commit Extracted Items to Shadow Inventory
  const handleCommitInvoice = async () => {
    if (!extractedInvoice) return;

    try {
      if (!isOnline) {
        // Enqueue offline
        await enqueueSyncOperation('ADD_INVOICE', 'INVOICE', extractedInvoice.invoice.id, extractedInvoice);
        await refreshSyncQueue();
      } else {
        await fetch('/api/shadow-inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pharmacyId: 'chem-1',
            pharmacyName: 'Gupta Medicos & Cold Chain Hub',
            distributorName: extractedInvoice.invoice.distributor_name,
            invoiceNo: extractedInvoice.invoice.invoice_no,
            invoiceDate: extractedInvoice.invoice.invoice_date,
            items: extractedInvoice.items,
          }),
        });
      }

      await fetchInventory();
      playSuccessChime();
      setInvoiceSuccessMsg(`Successfully added ${extractedInvoice.items.length} medicines to Shadow Inventory!`);
      setExtractedInvoice(null);
      setInvoiceImage(null);
    } catch (e) {
      console.error('Commit error:', e);
    }
  };

  // Load Demo Sample Invoice
  const handleLoadSampleInvoice = (type: 'sun_pharma' | 'cipla_cold' | 'jan_aushadhi') => {
    const sampleData = {
      sun_pharma: {
        distributor_name: 'Sun Pharma Regional C&F Depo, Indore',
        invoice_no: `SP/IND/2026/${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_name: 'Pantocid 40mg Tablet IP',
            normalized_salt: 'pantoprazole',
            strength: '40mg',
            dosage_form: 'Tablet',
            batch_no: `PAN26K${Math.floor(10 + Math.random() * 89)}`,
            quantity: 50,
            unit: 'strips',
            expiry_date: '2028-03',
            manufacturer: 'Sun Pharma Ltd',
            confidence: 0.97,
            requires_cold_chain: false,
          },
          {
            product_name: 'Rosave 10mg (Rosuvastatin)',
            normalized_salt: 'rosuvastatin',
            strength: '10mg',
            dosage_form: 'Tablet',
            batch_no: `ROS26D${Math.floor(10 + Math.random() * 89)}`,
            quantity: 30,
            unit: 'strips',
            expiry_date: '2027-12',
            manufacturer: 'Sun Pharma Ltd',
            confidence: 0.95,
            requires_cold_chain: false,
          }
        ]
      },
      cipla_cold: {
        distributor_name: 'Sanofi / Cipla Cold-Chain Hub, Ujjain',
        invoice_no: `COLD/UJJ/${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_name: 'Lantus Solostar 100IU/ml Cartridge',
            normalized_salt: 'insulin glargine',
            strength: '100 IU/ml',
            dosage_form: 'Cartridge / Pen',
            batch_no: `LAN26C${Math.floor(10 + Math.random() * 89)}`,
            quantity: 15,
            unit: 'pens',
            expiry_date: '2027-09',
            manufacturer: 'Sanofi India Ltd',
            confidence: 0.98,
            requires_cold_chain: true,
          },
          {
            product_name: 'Asthalin Inhaler 100mcg',
            normalized_salt: 'salbutamol',
            strength: '100mcg',
            dosage_form: 'Inhaler',
            batch_no: `AST26J${Math.floor(10 + Math.random() * 89)}`,
            quantity: 20,
            unit: 'units',
            expiry_date: '2028-01',
            manufacturer: 'Cipla Ltd',
            confidence: 0.96,
            requires_cold_chain: false,
          }
        ]
      },
      jan_aushadhi: {
        distributor_name: 'BPPI Central Warehouse MP',
        invoice_no: `PMBJP/MP/${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: new Date().toISOString().split('T')[0],
        items: [
          {
            product_name: 'Ciprofloxacin Tablets IP 500mg',
            normalized_salt: 'ciprofloxacin',
            strength: '500mg',
            dosage_form: 'Tablet',
            batch_no: `JA-CIP-${Math.floor(10 + Math.random() * 89)}`,
            quantity: 100,
            unit: 'strips',
            expiry_date: '2028-04',
            manufacturer: 'Bureau of Pharma PSUs of India',
            confidence: 0.99,
            requires_cold_chain: false,
          },
          {
            product_name: 'Metformin Hydrochloride IP 500mg',
            normalized_salt: 'metformin',
            strength: '500mg',
            dosage_form: 'Tablet',
            batch_no: `JA-MET-${Math.floor(10 + Math.random() * 89)}`,
            quantity: 150,
            unit: 'strips',
            expiry_date: '2028-06',
            manufacturer: 'Bureau of Pharma PSUs of India',
            confidence: 0.98,
            requires_cold_chain: false,
          }
        ]
      }
    };

    const sel = sampleData[type];
    const invoiceRecord: InvoiceRecord = {
      id: `INV-DEMO-${Date.now()}`,
      pharmacy_id: 'chem-1',
      pharmacy_name: 'Gupta Medicos & Cold Chain Hub',
      distributor_name: sel.distributor_name,
      invoice_no: sel.invoice_no,
      invoice_date: sel.invoice_date,
      extracted_items_count: sel.items.length,
      ocr_confidence: 0.96,
      created_at: new Date().toISOString(),
    };

    setExtractedInvoice({
      invoice: invoiceRecord,
      items: sel.items,
    });
    setInvoiceImage('/sample-invoice.jpg');
    setInvoiceSuccessMsg(null);
  };

  // Filtered Inventory List
  const filteredInventory = inventoryList.filter((item) => {
    if (inventoryFilter === 'COLD_CHAIN') return item.requires_cold_chain;
    if (inventoryFilter === 'FRESH') return item.freshness?.status === 'FRESH';
    if (inventoryFilter === 'AGING') return item.freshness?.status === 'AGING' || item.freshness?.status === 'STALE';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Top Merchant Terminal Header */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-900/50">
            {activeChemist.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">
                {activeChemist.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-semibold">
                NODE #{activeChemist.id.toUpperCase()} • {activeChemist.city}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>DL No: MP-20B-18492</span>
              <span>•</span>
              <span>📍 {activeChemist.area}</span>
              <span>•</span>
              {activeChemist.cold_storage_certified ? (
                <span className="text-cyan-400 flex items-center gap-1">
                  <Snowflake className="w-3 h-3" /> Cold-Storage Certified (2°C–8°C)
                </span>
              ) : (
                <span className="text-slate-400">Ambient Storage Node</span>
              )}
            </p>
          </div>
        </div>

        {/* Status & Control Bar */}
        <div className="flex items-center gap-3">
          {/* Simulate Sample Emergency Order Button */}
          <button
            onClick={handleSimulateEmergencyOrder}
            className="px-3 py-1.5 rounded-lg border border-amber-500/80 bg-amber-950/60 hover:bg-amber-900 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-950/50"
            title="Simulate incoming multi-medicine emergency order (Lantus + Telma + Cipro)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Simulate 3-Medicine Emergency Order</span>
          </button>

          {/* Online / Offline Toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isOnline 
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 hover:bg-emerald-900/80' 
                : 'bg-amber-950/80 border-amber-700 text-amber-300 hover:bg-amber-900/80'
            }`}
            title="Click to toggle simulated offline mode"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isOnline ? 'Online (Connected)' : 'Offline (Local DB)'}</span>
          </button>

          {/* Sync Queue Status */}
          <button
            onClick={handleFlushSync}
            disabled={isSyncing || pendingSyncCount === 0 || !isOnline}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
              pendingSyncCount > 0
                ? 'bg-amber-950 border-amber-600 text-amber-200 cursor-pointer hover:bg-amber-900'
                : 'bg-slate-800 border-slate-700 text-slate-400 cursor-default'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            <span>{pendingSyncCount > 0 ? `${pendingSyncCount} Pending Sync` : 'Synced'}</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-red-950/60 border-red-800 text-red-300'
            }`}
          >
            {soundEnabled ? <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" /> : <BellOff className="w-3.5 h-3.5 text-red-400" />}
            <span>{soundEnabled ? 'Alarm Active' : 'Muted'}</span>
          </button>

          <a
            href="/patient"
            target="_blank"
            className="text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
          >
            <span>Patient App</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href="/rider"
            target="_blank"
            className="text-xs text-cyan-300 hover:text-cyan-100 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-semibold"
          >
            <Bike className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rider Portal</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>
        </div>
      </header>

      {/* Pharmacy Navigation Tabs */}
      <nav className="bg-slate-950/90 border-b border-slate-800 px-6 flex items-center gap-2">
        <button
          onClick={() => setActiveNav('orders')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeNav === 'orders'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Emergency Orders ({incomingOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveNav('invoice_scanner')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeNav === 'invoice_scanner'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Scan Distributor Invoice</span>
        </button>

        <button
          onClick={() => setActiveNav('inventory')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeNav === 'inventory'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Shadow Inventory Ledger ({inventoryList.length})</span>
        </button>

        <button
          onClick={() => setActiveNav('search')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeNav === 'search'
              ? 'border-amber-500 text-amber-400 bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Offline Medicine Search (0ms)</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        
        {/* TAB 1: Live Emergency Dispatch Stream */}
        {activeNav === 'orders' && (
          <>
            <main className="col-span-8 p-6 flex flex-col gap-5 border-r border-slate-800 overflow-y-auto">
              {/* Quick Stats Bar */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Pending Pings</span>
                  <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">
                    {incomingOrders.length}
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Bayesian Rating</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
                    {(activeChemist.chronic_stock_rating * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Cold Storage SLA</span>
                  <span className="text-2xl font-black text-cyan-400 font-mono mt-0.5 block">
                    {activeChemist.cold_storage_certified ? '100% Pass' : 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Avg Response Speed</span>
                  <span className="text-2xl font-black text-indigo-400 font-mono mt-0.5 block">
                    {activeChemist.avg_response_time_sec} Sec
                  </span>
                </div>
              </div>

              {/* Active Orders Section */}
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveOrderTab('pending')}
                      className={`text-xs font-bold uppercase tracking-wider pb-1 transition cursor-pointer border-b-2 ${
                        activeOrderTab === 'pending'
                          ? 'border-emerald-500 text-emerald-400'
                          : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Live Dispatch Stream ({incomingOrders.length})
                    </button>
                    <button
                      onClick={() => setActiveOrderTab('completed')}
                      className={`text-xs font-bold uppercase tracking-wider pb-1 transition cursor-pointer border-b-2 ${
                        activeOrderTab === 'completed'
                          ? 'border-emerald-500 text-emerald-400'
                          : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Dispatched Today ({acceptedOrders.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSimulateEmergencyOrder}
                      className="text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-700/80 px-2.5 py-1 rounded-lg hover:bg-amber-900 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Simulate 3-Med Broadcast
                    </button>
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Auto-Listening via SSE
                    </span>
                  </div>
                </div>

                {/* Empty State */}
                {activeOrderTab === 'pending' && incomingOrders.length === 0 && (
                  <div className="my-auto py-16 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 p-8 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                      <Clock className="w-7 h-7 animate-pulse text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">Terminal Ready & Waiting for Emergency Prescriptions</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        When a patient broadcasts a prescription, this terminal rings instantly. You can check/tick medicines currently in your stock — MediRush will automatically solve the Weighted Set Cover with nearby partner pharmacies for any remaining items!
                      </p>
                    </div>
                    <button
                      onClick={handleSimulateEmergencyOrder}
                      className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
                    >
                      <Sparkles className="w-4 h-4" />
                      Simulate 3-Medicine Order Now (Lantus + Telma + Cipro)
                    </button>
                    <div className="text-[11px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-900/60 px-3 py-1 rounded-full mt-1">
                      Listening on {activeChemist.phone} ({activeChemist.name})
                    </div>
                  </div>
                )}

                {/* Live Incoming Dispatch Cards List */}
                {activeOrderTab === 'pending' && incomingOrders.map((order) => {
                  const defaultSelected = order.medicines
                    .filter((m) => matchMedicineInInventory(m.brand_name || m.chemical_salt, activeChemistId).matched)
                    .map((m) => m.id);
                  const selectedMedIds = selectedMedsByOrder[order.id] ?? (defaultSelected.length > 0 ? defaultSelected : order.medicines.map(m => m.id));
                  const plan = computeOrderCooperativePlan(order);

                  return (
                    <div 
                      key={order.id}
                      className="bg-slate-950 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-xl flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300 ring-2 ring-emerald-500/20"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white bg-red-600 px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" /> Emergency Dispatch #{order.id}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Received just now
                          </span>
                        </div>

                        <div className="text-right flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                            {selectedMedIds.length}/{order.medicines.length} In-Store Stock
                          </span>
                        </div>
                      </div>

                      {/* Patient & Doctor Info */}
                      <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Patient: <strong className="text-white">{order.patient_name}</strong> • {order.area}, {order.city} (1.2 km away)</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Rx: {order.doctor_reg}
                        </span>
                      </div>

                      {order.is_cold_chain && (
                        <div className="bg-cyan-950/70 border border-cyan-500/80 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                          <Snowflake className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <span className="font-bold text-cyan-200 block uppercase tracking-wide">
                              Cold-Chain Compliance Required (2°C - 8°C)
                            </span>
                            <span className="text-cyan-300/80 text-[11px]">
                              {order.cold_chain_reason || "Attach pre-cooled ice gel thermal pouch before handing to rider."}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Interactive Prescribed Medicine Basket */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-emerald-400" />
                            Prescribed Medicine Basket (Tick medicines available in your store):
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Toggle to recalculate cooperative fulfillment
                          </span>
                        </div>

                        {order.medicines.map((med) => {
                          const medKey = med.id || med.brand_name || 'med';
                          const isTicked = selectedMedIds.includes(medKey);
                          const invMatch = matchMedicineInInventory(med.brand_name || med.chemical_salt || '', activeChemistId);
                          const existingResponses = order.chemist_responses || [];
                          const otherStoreClaim = existingResponses.find((r) => r.chemistId !== activeChemistId && r.confirmedMedicineIds.includes(medKey));

                          return (
                            <div 
                              key={medKey}
                              onClick={() => handleToggleMedicine(order.id, medKey)}
                              className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs select-none ${
                                isTicked 
                                  ? 'bg-emerald-950/30 border-emerald-500/70 ring-1 ring-emerald-500/30' 
                                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-80'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Interactive Checkbox */}
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                                  isTicked 
                                    ? 'bg-emerald-600 border-emerald-500 text-white' 
                                    : 'bg-slate-900 border-slate-600 text-transparent'
                                }`}>
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">{med.brand_name}</span>
                                    {med.is_cold_chain && (
                                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-0.5 font-bold">
                                        <Snowflake className="w-2.5 h-2.5" /> Cold Chain
                                      </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {order.pack_type === 'FRACTIONAL_10_DAYS' && med.fractional_available ? 'x10 Tabs (Loose)' : 'x1 Box (Full)'}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                    Active Salt: <strong className="text-indigo-400">{med.chemical_salt}</strong> • {med.dosage}
                                  </div>

                                  {otherStoreClaim ? (
                                    <div className="text-[11px] text-cyan-300 font-semibold mt-1 flex items-center gap-1.5 bg-cyan-950/70 border border-cyan-800/80 px-2.5 py-1 rounded-lg">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                      <span>Already Secured by <strong>{otherStoreClaim.chemistName}</strong></span>
                                    </div>
                                  ) : isTicked ? (
                                    <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      <span>Fulfilling from My In-Store Stock ({activeChemist.name.split(' ')[0]})</span>
                                      {invMatch.item && (
                                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                          Batch #{invMatch.item.batch_no} • {invMatch.item.freshness?.observedText || 'Verified'}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-[11px] text-amber-300 font-semibold mt-1 flex items-center gap-1.5 bg-amber-950/50 border border-amber-800/70 px-2 py-0.5 rounded-lg">
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                      <span>⚡ Awaiting Fulfillment • Click checkbox to claim from your stock</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-base font-black font-mono text-emerald-400 block">
                                  ₹{order.pack_type === 'FRACTIONAL_10_DAYS' && med.fractional_available ? Math.round((med.generic_price ?? 0) / 3) : (med.generic_price ?? 0)}
                                </span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                                  otherStoreClaim 
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                    : isTicked 
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                                }`}>
                                  {otherStoreClaim ? 'Secured by Partner' : isTicked ? 'Fulfill Here' : 'Needed from You'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* ═══ LIVE WEIGHTED SET COVER MULTI-NODE SOLVER RESULT ═══ */}
                      <div className="bg-slate-900/90 border border-cyan-500/50 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
                              <Database className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                                Algorithmic Core • Weighted Set Cover
                              </span>
                              <h4 className="text-xs font-black text-white">
                                {plan.planType === 'MULTI_NODE_SPLIT' ? 'Optimal Combination: Cooperative 2-Node Split' : 'Optimal Combination: Single-Store 100% Fulfillment'}
                              </h4>
                            </div>
                          </div>

                          <span className={`text-xs font-black font-mono px-2.5 py-1 rounded-lg border ${
                            plan.overallCoverage === 100
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : 'bg-amber-950 text-amber-300 border-amber-700'
                          }`}>
                            {plan.overallCoverage}% Prescription Covered
                          </span>
                        </div>

                        {/* Nodes Breakdown */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Multi-Node Cooperative Solver Result:
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {plan.nodes.map((node, nIdx) => (
                              <div 
                                key={node.chemistId}
                                className={`p-3 rounded-xl border text-xs flex flex-col gap-2 ${
                                  node.chemistId === activeChemistId 
                                    ? 'bg-emerald-950/40 border-emerald-600/80 ring-1 ring-emerald-500/30' 
                                    : 'bg-cyan-950/40 border-cyan-700/80'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-bold text-white block">
                                      Node #{nIdx + 1}: {node.chemistName}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      📍 {node.distanceKm} km away • {node.chemistId === activeChemistId ? 'Cold-Chain Certified (This Terminal)' : 'High Stock Partner Node'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
                                    Fulfills {node.fulfilledMedicines.length} Item{node.fulfilledMedicines.length > 1 ? 's' : ''}
                                  </span>
                                </div>

                                <div className="space-y-1 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                                  {node.fulfilledMedicines.map((fm, fIdx) => (
                                    <div key={fIdx} className="text-[11px] flex items-center justify-between">
                                      <span className="text-slate-200 font-medium">✓ {fm.medicineName}</span>
                                      <span className="text-[10px] font-mono text-slate-400">Batch #{fm.batchNo}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Route Metrics */}
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-4 text-slate-300">
                            <span>Total Distance: <strong className="text-white">{plan.totalEstimatedDistanceKm} km</strong></span>
                            <span>•</span>
                            <span>Estimated Combined ETA: <strong className="text-emerald-400">{plan.estimatedDeliveryEtaMinutes} Mins</strong></span>
                          </div>
                          <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
                            Cooperative Fulfillment Ready
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block">Total Payout:</span>
                          <span className="text-xl font-black font-mono text-white">
                            ₹{order.total_amount} <span className="text-xs font-normal text-slate-400 font-sans">(UPI / Cash Settlement)</span>
                          </span>
                        </div>

                        {(() => {
                          const myResponse = (order.chemist_responses || []).find((r) => r.chemistId === activeChemistId);
                          const isPartiallyAccepted = order.status === 'PARTIALLY_ACCEPTED';
                          const myConfirmedCount = myResponse?.confirmedMedicineIds?.length || 0;

                          if (myResponse && myConfirmedCount > 0 && isPartiallyAccepted) {
                            return (
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700/80 px-3 py-2 rounded-xl flex items-center gap-1.5 animate-pulse">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                                  <span>✓ {myConfirmedCount} Item(s) Dispatched • Awaiting Partner Pharmacy</span>
                                </span>
                                <button
                                  onClick={() => handleAcceptOrder(order)}
                                  className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                                >
                                  Update Stock
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRejectOrder(order.id)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition cursor-pointer"
                              >
                                Out of Stock
                              </button>
                              <button
                                onClick={() => handleAcceptOrder(order)}
                                className="bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-emerald-900/50 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                {plan.planType === 'MULTI_NODE_SPLIT'
                                  ? `⚡ Fulfill ${selectedMedIds.length} Items as ${activeChemist.name.split(' ')[0]}`
                                  : `Accept & Assign Rider (${activeChemist.name.split(' ')[0]})`}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}

                {activeOrderTab === 'completed' && (
                  <div className="space-y-3">
                    {acceptedOrders.length === 0 ? (
                      <p className="text-xs text-slate-500 py-8 text-center">No orders fulfilled yet today.</p>
                    ) : (
                      acceptedOrders.map((o) => (
                        <div key={o.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2 font-bold text-white">
                              <span>#{o.id}</span>
                              <span>•</span>
                              <span className="text-emerald-400">Accepted & Dispatched</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Rider: Rahul Sharma (Hero Splendor MP-43-E-2101) • ETA {o.eta_minutes || 19} Mins
                            </p>
                          </div>
                          <span className="text-sm font-mono font-bold text-emerald-400">
                            ₹{o.total_amount}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </main>

            {/* Chemist Operational Info (Right Rail) */}
            <aside className="col-span-4 p-6 bg-slate-950/70 flex flex-col gap-5 overflow-y-auto">
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400" />
                  Active Pharmacy Node Credentials
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pharmacy:</span>
                    <span className="font-semibold text-white">{activeChemist.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Area & City:</span>
                    <span className="text-slate-200">{activeChemist.area}, {activeChemist.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Phone:</span>
                    <span className="font-mono text-emerald-400">{activeChemist.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Grid Hub:</span>
                    <span className="text-slate-200">Ratlam District Emergency Grid</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cold Chain Storage:</span>
                    <span className="text-cyan-400 font-semibold">
                      {activeChemist.cold_storage_certified ? 'Blue Star 240L (Temp: 4.2°C)' : 'Ambient Storage'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Bike className="w-4 h-4 text-emerald-400" />
                  Assigned Fleet Executive
                </h3>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3 text-xs">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
                    RS
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Rahul Sharma</h4>
                    <p className="text-slate-400 text-[11px] font-mono">Hero Splendor (MP-43-E-2101)</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">Equipped with Cold Gel Thermal Carrier</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <span className="text-white font-semibold block mb-1">⚡ Weighted Set Cover Protocol:</span>
                When a store has only partial stock, MediRush automatically computes the optimal neighbor pharmacy combination to achieve 100% coverage with minimum total travel distance and shortest combined ETA.
              </div>
            </aside>
          </>
        )}

        {/* TAB 2: Scan Distributor Invoice */}
        {activeNav === 'invoice_scanner' && (
          <main className="col-span-12 p-8 max-w-6xl mx-auto w-full overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                  <FileText className="w-6 h-6 text-cyan-400" />
                  Scan Distributor Invoice / Paper Slip
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Transforms paper tax invoices into digital shadow inventory with batch tracking and expiry date monitoring.
                </p>
              </div>

              {/* Disclaimer Badge */}
              <span className="text-[11px] bg-cyan-950/60 border border-cyan-800 text-cyan-300 px-3 py-1.5 rounded-xl font-mono">
                «Estimated stock based on latest invoice»
              </span>
            </div>

            {/* Quick Demo Pre-load Invoices */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Fast Demo: Load Sample C&F Distributor Bills:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoadSampleInvoice('sun_pharma')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition cursor-pointer"
                >
                  Sun Pharma C&F Indore
                </button>
                <button
                  onClick={() => handleLoadSampleInvoice('cipla_cold')}
                  className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700 text-xs font-semibold rounded-lg text-cyan-200 transition cursor-pointer"
                >
                  Sanofi Insulin & Inhaler (Cold-Chain)
                </button>
                <button
                  onClick={() => handleLoadSampleInvoice('jan_aushadhi')}
                  className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700 text-xs font-semibold rounded-lg text-emerald-200 transition cursor-pointer"
                >
                  PMBJP Generic Challan
                </button>
              </div>
            </div>

            {/* Upload Box */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-2xl p-8 bg-slate-950/50 flex flex-col items-center justify-center gap-3 transition cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInvoiceFileChange}
              />
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition flex items-center justify-center text-cyan-400">
                <Upload className="w-7 h-7" />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-white">Click or Drag Distributor Invoice Image</h4>
                <p className="text-xs text-slate-400 mt-1">Accepts PNG, JPG, or paper bill camera snaps up to 15MB</p>
              </div>
            </div>

            {/* OCR Processing Spinner */}
            {isAnalyzingInvoice && (
              <div className="bg-slate-950 border border-cyan-800/80 rounded-2xl p-8 text-center space-y-3 animate-pulse">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-white">Extracting Medicines & Batches via Vision OCR...</h4>
                <p className="text-xs text-slate-400">Deciphering product names, generic salts, batch numbers, and expiry dates.</p>
              </div>
            )}

            {/* Success Notification */}
            {invoiceSuccessMsg && (
              <div className="bg-emerald-950/80 border border-emerald-700 rounded-2xl p-4 flex items-center gap-3 text-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{invoiceSuccessMsg}</span>
              </div>
            )}

            {/* Extracted Invoice Review Table */}
            {extractedInvoice && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">{extractedInvoice.invoice.distributor_name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Invoice #{extractedInvoice.invoice.invoice_no} • Date: {extractedInvoice.invoice.invoice_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-2.5 py-1 rounded">
                      OCR Confidence: {Math.round(extractedInvoice.invoice.ocr_confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Generic Salt</th>
                        <th className="py-2.5 px-3">Strength</th>
                        <th className="py-2.5 px-3">Batch No</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                        <th className="py-2.5 px-3">Expiry</th>
                        <th className="py-2.5 px-3">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {extractedInvoice.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-3 px-3 font-semibold text-white">{item.product_name}</td>
                          <td className="py-3 px-3 text-indigo-300 font-mono">{item.normalized_salt}</td>
                          <td className="py-3 px-3 font-mono text-slate-300">{item.strength}</td>
                          <td className="py-3 px-3 font-mono text-amber-400 font-bold">{item.batch_no}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400">{item.expiry_date}</td>
                          <td className="py-3 px-3">
                            {item.requires_cold_chain ? (
                              <span className="text-[10px] text-cyan-300 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                                <Snowflake className="w-2.5 h-2.5" /> 2°C–8°C
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">Standard</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <p className="text-[11px] text-slate-500">
                    Will be stored in local IndexedDB and synced to MediRush cloud.
                  </p>
                  <button
                    onClick={handleCommitInvoice}
                    className="bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-cyan-950/60 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <Check className="w-4 h-4" />
                    Commit to Shadow Inventory
                  </button>
                </div>
              </div>
            )}
          </main>
        )}

        {/* TAB 3: Shadow Inventory Ledger */}
        {activeNav === 'inventory' && (
          <main className="col-span-12 p-8 max-w-6xl mx-auto w-full overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                  <Layers className="w-6 h-6 text-indigo-400" />
                  Invoice-Derived Shadow Inventory Ledger
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Auditable local stock calculated from latest C&F distributor invoices.
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInventoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    inventoryFilter === 'ALL'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All Items ({inventoryList.length})
                </button>
                <button
                  onClick={() => setInventoryFilter('COLD_CHAIN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    inventoryFilter === 'COLD_CHAIN'
                      ? 'bg-cyan-600 border-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border-slate-800 text-cyan-400 hover:text-cyan-200'
                  }`}
                >
                  Cold Chain Only
                </button>
                <button
                  onClick={() => setInventoryFilter('FRESH')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    inventoryFilter === 'FRESH'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-emerald-400 hover:text-emerald-200'
                  }`}
                >
                  Fresh Stock (≤7 Days)
                </button>
                <button
                  onClick={() => setInventoryFilter('AGING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    inventoryFilter === 'AGING'
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-200'
                  }`}
                >
                  Aging (&gt;7 Days)
                </button>
              </div>
            </div>

            {/* Inventory Ledger Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Medicine / Product</th>
                    <th className="py-3 px-4">Active Salt & Strength</th>
                    <th className="py-3 px-4">Batch Number</th>
                    <th className="py-3 px-4 text-right">Est. Quantity</th>
                    <th className="py-3 px-4">Freshness & Observation</th>
                    <th className="py-3 px-4">Storage Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{item.product_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{item.manufacturer}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-indigo-300 font-medium">{item.normalized_salt}</span>
                        <span className="text-slate-400 text-[11px] block">{item.strength} • {item.dosage_form}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {item.batch_no}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                        {item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.freshness?.status === 'FRESH' ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                            ● FRESH ({item.freshness.daysSinceInvoice}d ago)
                          </span>
                        ) : item.freshness?.status === 'AGING' ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
                            ▲ AGING ({item.freshness.daysSinceInvoice}d ago)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-400 bg-red-950/80 border border-red-800 px-2 py-0.5 rounded">
                            ▼ STALE (&gt;30d)
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 block mt-1 font-mono">{item.source_invoice_id}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.requires_cold_chain ? (
                          <span className="text-[10px] text-cyan-300 bg-cyan-950 border border-cyan-800 px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold w-max">
                            <Snowflake className="w-3 h-3 text-cyan-400" /> Cold-Chain 2°C–8°C
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Standard Storage</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        )}

        {/* TAB 4: Offline Medicine Search Terminal */}
        {activeNav === 'search' && (
          <main className="col-span-12 p-8 max-w-5xl mx-auto w-full overflow-y-auto space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                <Search className="w-6 h-6 text-amber-400" />
                Offline Medicine Search Engine (0ms Latency)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Searches local shadow inventory and national Indian pharmacopeia in-memory without server roundtrips.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brand, generic salt, batch number (e.g., 'Cipro 500', 'panto 40', 'LAN26B04')..."
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-500 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none transition shadow-inner font-mono"
              />
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-4.5" />
            </div>

            {/* Live Search Results */}
            <div className="space-y-3">
              {searchQuery && searchResults.length === 0 && (
                <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  No direct matches found in local shadow inventory or national catalog.
                </div>
              )}

              {searchResults.map((res) => (
                <div 
                  key={res.id}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-4 flex items-center justify-between transition text-xs shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{res.title}</span>
                      {res.type === 'INVENTORY_STOCK' ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                          ✓ Local Shadow Stock ({res.quantity} {res.unit})
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded">
                          National Catalog Generic
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Active Salt: <strong className="text-indigo-300">{res.genericSalt}</strong> • Form: {res.dosageForm} • {res.category}
                    </div>
                    {res.observedText && (
                      <div className="text-[10px] text-slate-500">
                        {res.observedText}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono text-amber-400 block">
                      {res.matchScore}% Match
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Confidence: {res.confidenceLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
