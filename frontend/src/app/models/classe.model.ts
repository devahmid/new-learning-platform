import { Schedule } from './schedule.model';
import { User } from './user.model';
import { Category } from './category.model';
import { Course } from './course.model';

export interface Classe {
  id: number;
  name: string;
  description?: string;
  color?: string;
  capacity?: number;
  isActive?: boolean;
  students?: User[]; 
  schedules?: Schedule[];
  teacher?: User;
  categories?: Category[];  // ✅ Nouvelles relations
  courses?: Course[];
}
