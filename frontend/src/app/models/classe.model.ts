import { Schedule } from './schedule.model';
import { User } from './user.model';

export interface Classe {
  id: number;
  name: string;
  description?: string;
  color?: string;
  students?: User[]; 
  schedules?: Schedule[]; // Changé de schedule à schedules
  teacher?: User; 
}
