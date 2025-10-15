// Placeholder API service for emergency contacts
// Wire to real endpoints when available

import apiClient from '../../../API/APIClient';
import type { EmergencyContact } from '../store/useEmergencyContactsStore';

export type AddEmergencyContactsPayload = {
  contactsData: Array<{
    name: string;
    phone: string;
  }>;
};

export async function addEmergencyContacts(payload: AddEmergencyContactsPayload): Promise<any> {
  const { data } = await apiClient.post('/publicrides/customer/addEmergencyContact', payload);
  return data;
}

export async function fetchEmergencyContacts(): Promise<EmergencyContact[]> {
  return [];
}


