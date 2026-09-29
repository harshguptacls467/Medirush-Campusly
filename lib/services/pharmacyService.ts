import { supabase } from '../supabaseClient';

/**
 * Pharmacy API Service - Interfacing with Supabase database for Pharmacy Partner features
 */
export const pharmacyService = {
  /**
   * Fetch the pharmacy profile associated with a given owner UUID
   */
  async getPharmacyProfileByOwner(ownerId: string) {
    if (!ownerId) return { data: null, error: 'Owner ID is required' };
    
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching pharmacy profile:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Create a new pharmacy record for an authenticated user
   */
  async createPharmacyProfile(pharmacyData: any) {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .insert([pharmacyData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating pharmacy profile:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update an existing pharmacy profile
   */
  async updatePharmacyProfile(pharmacyId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', pharmacyId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating pharmacy profile:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Fetch inventory items for a specific pharmacy
   */
  async getPharmacyInventory(pharmacyId: string) {
    try {
      const { data, error } = await supabase
        .from('pharmacy_inventory')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching pharmacy inventory:', error.message);
      return { data: [], error: error.message };
    }
  },

  /**
   * Add a new stock item to pharmacy inventory
   */
  async addInventoryItem(inventoryData: any) {
    try {
      const { data, error } = await supabase
        .from('pharmacy_inventory')
        .insert([inventoryData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error adding inventory item:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update an inventory stock item
   */
  async updateInventoryItem(itemId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('pharmacy_inventory')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating inventory item:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Delete an inventory item
   */
  async deleteInventoryItem(itemId: string) {
    try {
      const { error } = await supabase
        .from('pharmacy_inventory')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error deleting inventory item:', error.message);
      return { error: error.message };
    }
  },

  /**
   * Fetch verification documents for a pharmacy
   */
  async getPharmacyDocuments(pharmacyId: string) {
    try {
      const { data, error } = await supabase
        .from('pharmacy_documents')
        .select('*')
        .eq('pharmacy_id', pharmacyId);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching pharmacy documents:', error.message);
      return { data: [], error: error.message };
    }
  },

  /**
   * Register or update a verification document
   */
  async uploadPharmacyDocument(docData: any) {
    try {
      const { data, error } = await supabase
        .from('pharmacy_documents')
        .insert([docData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error uploading pharmacy document:', error.message);
      return { data: null, error: error.message };
    }
  },

  /**
   * Fetch operating hours for a pharmacy
   */
  async getPharmacyOperatingHours(pharmacyId: string) {
    try {
      const { data, error } = await supabase
        .from('pharmacy_operating_hours')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching operating hours:', error.message);
      return { data: [], error: error.message };
    }
  },

  /**
   * Save or update operating hours
   */
  async updatePharmacyOperatingHours(hoursList: any[]) {
    try {
      const { data, error } = await supabase
        .from('pharmacy_operating_hours')
        .upsert(hoursList, { onConflict: 'pharmacy_id,day_of_week' })
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error saving operating hours:', error.message);
      return { data: null, error: error.message };
    }
  }
};
