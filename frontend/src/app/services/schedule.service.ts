import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Schedule } from "../models/schedule.model";
import { ApiPaths } from "../shared/api-paths";

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private base = ApiPaths.schedules;

  constructor(private http: HttpClient) {}

  create(data: Partial<Schedule>): Observable<Schedule> {
    return this.http.post<Schedule>(this.base, data);
  }


  updateSchedule(scheduleId: number, data: Partial<Schedule>): Observable<Schedule> {
  return this.http.patch<Schedule>(`${this.base}/${scheduleId}`, data);
}

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
