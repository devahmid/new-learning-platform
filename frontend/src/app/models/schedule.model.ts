import { Classe } from "./classe.model";
import { User } from "./user.model";

export interface Schedule {
    id: number;
    course?: string;
    startHour: string;
    endHour: string;
    day: string;
    teacher?: User;
    location?: string;
    online?: boolean;
    classe?: Classe;
    classeId?: number;
    teacherId?: number;
    description?: string;
  }
  