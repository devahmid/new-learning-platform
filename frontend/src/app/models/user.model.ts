// import { Classe } from "./classe.model";
// import { Level } from "./level.model";

// export interface User {
//   type: 'parent' | 'child';
//   classe?: Classe | null;
//   level?: Level;
//     id: number;
//     email: string;
//     password: string;
//     firstName?: string;
//     lastName?: string;
//     role: string;
//     createdAt: Date;
//     updatedAt: Date;
//     resetToken?: string;
//     resetTokenExpiration?: Date;
//     children?: User[];
//   }

//   export interface RegisterDto {
//     email: string;
//     password: string;
//     firstName?: string;
//     lastName?: string;
//   }

//   export interface LoginDto {
//     email: string;
//     password: string;
//   }
import { Classe } from './classe.model';
import { Level } from './level.model';

export interface ParentProfile {
  secondaryPhone?: string;
  platforms?: string[];
  preferredGroups?: string[];
  emailOnly?: boolean;
}

export interface ChildProfile {
  isAvailableWednesdayMorning?: boolean;
  hasExtracurricularActivity?: boolean;
  extracurricularDetails?: string;
  preferredTimeSlots?: string[];
  priorArabicExperience?: string;
  arabicLevel?: 'debutant' | 'lecture' | 'fluide' | 'ecriture';
  hasLearningDisability?: boolean;
  disabilities?: string[];
  supportDetails?: string;
}

export interface User {
  id: number;
  email: string | null;
  password: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  type: 'parent' | 'child' | 'admin';
  role: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  resetToken?: string;
  resetTokenExpiration?: Date;
  classeId?: number | null;
  approved_at?: string;
  approved_by?: number;
  rejection_reason?: string;

  // Relations
  children?: User[];
  parent?: User;
  classe?: Classe | null;
  level?: Level;

  // Profils
  parentProfile?: ParentProfile;
  childProfile?: ChildProfile;
}
export interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}