import { create } from 'zustand';

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relation: string;
};

type EmergencyContactsState = {
  contacts: EmergencyContact[];
  addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Omit<EmergencyContact, 'id'>>) => void;
  removeContact: (id: string) => void;
  reset: () => void;
};

export const useEmergencyContactsStore = create<EmergencyContactsState>((set, get) => ({
  contacts: [],

  addContact: (contact) => {
    const newContact: EmergencyContact = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...contact,
    };
    set({ contacts: [...get().contacts, newContact] });
  },

  updateContact: (id, updates) => {
    set({
      contacts: get().contacts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  },

  removeContact: (id) => {
    set({ contacts: get().contacts.filter((c) => c.id !== id) });
  },

  reset: () => set({ contacts: [] }),
}));

export default useEmergencyContactsStore;


