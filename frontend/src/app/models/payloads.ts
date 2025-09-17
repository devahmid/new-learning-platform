// payloads.ts

export type ParentProfilePayload = {
  secondaryPhone?: string;
  platforms?: string[];         // ex. ['WhatsApp','Telegram']
  preferredGroups?: string[];
  emailOnly?: boolean;
};

export type ChildProfilePayload = {
  gender?: 'masculin' | 'féminin';
  isAvailableWednesdayMorning?: boolean;
  hasExtracurricularActivity?: boolean;
  extracurricularDetails?: string;
  preferredTimeSlots?: string[];  // ex. ['16h-17h','17h-18h']
  priorArabicExperience?: string;
  arabicLevel?: 'debutant' | 'lecture' | 'fluide' | 'ecriture';
  hasLearningDisability?: boolean;
  disabilities?: string[];
  supportDetails?: string;
};

export type UserPayload = {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  type: 'parent' | 'child';
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;         // ISO string
  parentProfile?: ParentProfilePayload;
  childProfile?: ChildProfilePayload;
  children?:CreateChildPayload;
  payments?: any;
  status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
};

export type CreateChildPayload = {
  parentId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  classeId: number; // ✅ Changé de levelId à classeId
  childProfile: ChildProfilePayload;
};