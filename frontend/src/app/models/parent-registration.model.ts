export interface Child {
  firstName: string;
  lastName: string;
  birthDate: string;
  arabicLevel: number;
  activityDetails: string;
  hasActivityOnWednesday: boolean;
  hasActivityOnSaturday: boolean;
  hasActivityOnSunday: boolean;
}

export interface ParentRegistration {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  acceptedConditions: boolean;
  wasRegisteredLastYear?: boolean;
  previousInscription?: boolean;
  children: Child[];
  // Optional fields used by admin UI / backend
  requestType?: 'new' | 'renewal' | string;
  schoolYear?: string;
  status?: string;
  notes?: string;
}
