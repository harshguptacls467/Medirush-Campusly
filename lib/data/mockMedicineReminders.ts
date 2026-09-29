export interface MedicineReminderItem {
  id: string;
  medicine_name: string;
  dosage: string;
  time: string;
  period: 'Morning' | 'Afternoon' | 'Night';
  frequency: string;
  start_date: string;
  end_date?: string | null;
  status: 'Active' | 'Paused' | 'Completed';
  taken_today: boolean;
}

export const mockMedicineReminders: MedicineReminderItem[] = [
  {
    id: 'r1',
    medicine_name: 'Amoxicillin 250mg',
    dosage: '1 Capsule',
    time: '08:00 AM',
    period: 'Morning',
    frequency: 'Twice daily',
    start_date: '2026-09-01',
    end_date: '2026-09-10',
    status: 'Active',
    taken_today: false
  },
  {
    id: 'r2',
    medicine_name: 'Vitamin D3 / Calcium',
    dosage: '1 Tablet',
    time: '09:00 AM',
    period: 'Morning',
    frequency: 'Once daily',
    start_date: '2026-09-01',
    end_date: null,
    status: 'Active',
    taken_today: true
  },
  {
    id: 'r3',
    medicine_name: 'Paracetamol 650mg',
    dosage: '1 Tablet after food',
    time: '02:00 PM',
    period: 'Afternoon',
    frequency: 'Three times daily',
    start_date: '2026-09-28',
    end_date: '2026-10-02',
    status: 'Active',
    taken_today: false
  },
  {
    id: 'r4',
    medicine_name: 'Lantus Insulin (Cold-chain)',
    dosage: '10 units Subcutaneous',
    time: '09:30 PM',
    period: 'Night',
    frequency: 'Once at bedtime',
    start_date: '2026-08-15',
    end_date: null,
    status: 'Active',
    taken_today: false
  }
];
