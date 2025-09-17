import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Schedule } from '../models/schedule.model';
import { Classe } from '../models/classe.model';
import { User } from '../models/user.model';
import { ScheduleService } from '../services/schedule.service';
import { ClasseService } from '../services/classe.service';
import { AuthService } from '../auth/auth.service';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  day: string;
  classe: Classe;
  schedule: Schedule;
  color: string;
  isConflict?: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar-classe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar-classe.component.html',
  styleUrls: ['./calendar-classe.component.scss']
})
export class CalendarClasseComponent implements OnInit, OnChanges {
  @Input() classes: Classe[] = [];
  @Input() isEditable: boolean = false;
  @Input() parentId?: number; // ID du parent connecté pour filtrer les classes
  @Output() scheduleUpdated = new EventEmitter<void>();
  @Output() scheduleCreated = new EventEmitter<Schedule>();
  @Output() scheduleDeleted = new EventEmitter<number>();

  // État du calendrier
  currentDate = new Date();
  selectedDate: Date | null = null;
  filteredClasses: Classe[] = []; // Classes filtrées selon le parent
  selectedEvent: CalendarEvent | null = null;
  viewMode: 'month' | 'week' | 'day' = 'week';
  
  // Filtres
  selectedClassFilter: number | null = null;
  selectedTeacherFilter: number | null = null;
  showConflicts = true;
  
  // Modals
  showEventDetails = false;
  showCreateEvent = false;
  showFilters = false;
  
  // Données
  events: CalendarEvent[] = [];
  calendarDays: CalendarDay[] = [];
  teachers: User[] = [];
  
  // Nouveau créneau
  newSchedule: Partial<Schedule> = {
    day: '',
    startHour: '',
    endHour: '',
    description: ''
  };

  // Jours de la semaine
  weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Couleurs prédéfinies
  colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  constructor(
    private scheduleService: ScheduleService,
    private classeService: ClasseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadTeachers();
    this.loadClassesForCalendar();
    this.updateCalendar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['parentId']) {
      // Seulement si parentId change, recharger les classes
      this.loadClassesForCalendar();
    }
  }

  // Méthode pour recharger les classes
  reloadClasses() {
    this.classeService.findAll().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.updateCalendar();
      },
      error: (error) => {
        console.error('Erreur lors du rechargement des classes:', error);
      }
    });
  }

  // 📅 Mise à jour du calendrier
  updateCalendar() {
    this.events = this.buildEvents();
    this.detectConflicts();
    this.buildCalendarDays();
  }

  buildEvents(): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    
    this.filteredClasses.forEach((classe, index) => {
      if (this.selectedClassFilter && classe.id !== this.selectedClassFilter) return;
      
      classe.schedules?.forEach(schedule => {
        if (this.selectedTeacherFilter && schedule.teacherId !== this.selectedTeacherFilter) return;
        
        const dayIndex = this.weekDays.indexOf(schedule.day);
        if (dayIndex === -1) return;
        
        const event: CalendarEvent = {
          id: `event-${schedule.id}`,
          title: classe.name,
          start: this.createEventDate(schedule.day, schedule.startHour),
          end: this.createEventDate(schedule.day, schedule.endHour),
          day: schedule.day,
          classe: classe,
          schedule: schedule,
          color: classe.color || this.colors[index % this.colors.length]
        };
        
        events.push(event);
      });
    });
    
    return events;
  }

  createEventDate(day: string, time: string): Date {
    const dayIndex = this.weekDays.indexOf(day);
    const currentWeekStart = this.getWeekStart(this.currentDate);
    const eventDate = new Date(currentWeekStart);
    eventDate.setDate(currentWeekStart.getDate() + dayIndex);
    
    const [hours, minutes] = time.split(':');
    eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    return eventDate;
  }

  detectConflicts() {
    this.events.forEach(event => {
      event.isConflict = this.events.some(otherEvent => 
        otherEvent.id !== event.id &&
        otherEvent.day === event.day &&
        this.hasTimeConflict(event, otherEvent)
      );
    });
  }

  hasTimeConflict(event1: CalendarEvent, event2: CalendarEvent): boolean {
    const start1 = this.timeToMinutes(event1.schedule.startHour);
    const end1 = this.timeToMinutes(event1.schedule.endHour);
    const start2 = this.timeToMinutes(event2.schedule.startHour);
    const end2 = this.timeToMinutes(event2.schedule.endHour);
    
    return (start1 < end2 && end1 > start2);
  }

  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  }

  /**
   * Trie les événements par ordre horaire (heure de début)
   */
  sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
    return events.sort((a, b) => {
      return this.timeToMinutes(a.schedule.startHour) - this.timeToMinutes(b.schedule.startHour);
    });
  }

  buildCalendarDays() {
    this.calendarDays = [];
    
    if (this.viewMode === 'month') {
      this.buildMonthView();
    } else if (this.viewMode === 'week') {
      this.buildWeekView();
    } else {
      this.buildDayView();
    }
  }

  buildMonthView() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = this.sortEventsByTime(
        this.events.filter(event => 
          event.start.getDate() === date.getDate() &&
          event.start.getMonth() === date.getMonth() &&
          event.start.getFullYear() === date.getFullYear()
        )
      );
      
      this.calendarDays.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: this.isToday(date),
        events: dayEvents
      });
    }
  }

  buildWeekView() {
    const weekStart = this.getWeekStart(this.currentDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const dayEvents = this.sortEventsByTime(
        this.events.filter(event => 
          event.day === this.weekDays[i]
        )
      );
      
      this.calendarDays.push({
        date: new Date(date),
        isCurrentMonth: true,
        isToday: this.isToday(date),
        events: dayEvents
      });
    }
  }

  buildDayView() {
    const date = this.selectedDate || this.currentDate;
    const dayEvents = this.sortEventsByTime(
      this.events.filter(event => 
        event.start.getDate() === date.getDate() &&
        event.start.getMonth() === date.getMonth() &&
        event.start.getFullYear() === date.getFullYear()
      )
    );
    
    this.calendarDays = [{
      date: new Date(date),
      isCurrentMonth: true,
      isToday: this.isToday(date),
      events: dayEvents
    }];
  }

  // 🎛️ Contrôles du calendrier
  previousPeriod() {
    if (this.viewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    } else if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    }
    this.updateCalendar();
  }

  nextPeriod() {
    if (this.viewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    } else if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    }
    this.updateCalendar();
  }

  goToToday() {
    this.currentDate = new Date();
    this.updateCalendar();
  }

  setViewMode(mode: 'month' | 'week' | 'day') {
    this.viewMode = mode;
    this.updateCalendar();
  }

  // 🎯 Sélection et interactions
  selectDate(date: Date) {
    this.selectedDate = date;
    if (this.viewMode === 'day') {
      this.updateCalendar();
    }
  }

  selectEvent(event: CalendarEvent) {
    this.selectedEvent = event;
    this.showEventDetails = true;
  }

  openCreateEvent(date?: Date) {
    if (date) {
      this.selectedDate = date;
    }
    this.resetNewSchedule();
    this.showCreateEvent = true;
  }

  // 📝 Gestion des créneaux
  createSchedule() {
    if (!this.newSchedule.day || !this.newSchedule.startHour || !this.newSchedule.endHour) {
      return;
    }

    // Trouver la classe sélectionnée
    const selectedClass = this.filteredClasses.find(c => c.id === this.selectedClassFilter);
    if (!selectedClass) {
      console.error('Aucune classe sélectionnée');
      return;
    }

    const scheduleData: Partial<Schedule> = {
      ...this.newSchedule,
      classeId: selectedClass.id
    };

    this.scheduleService.create(scheduleData).subscribe({
      next: (createdSchedule) => {
        this.scheduleCreated.emit(createdSchedule);
        this.showCreateEvent = false;
        this.resetNewSchedule();
        this.updateCalendar();
      },
      error: (error) => {
        console.error('Erreur lors de la création du créneau:', error);
      }
    });
  }

  deleteSchedule(scheduleId: number) {
    this.scheduleService.delete(scheduleId).subscribe({
      next: () => {
        this.scheduleDeleted.emit(scheduleId);
        this.showEventDetails = false;
        this.updateCalendar();
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du créneau:', error);
      }
    });
  }

  // 🔍 Filtres
  applyFilters() {
    this.updateCalendar();
    this.showFilters = false;
  }

  clearFilters() {
    this.selectedClassFilter = null;
    this.selectedTeacherFilter = null;
    this.updateCalendar();
  }

  // 🛠️ Utilitaires
  getWeekStart(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    return start;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  getEventTimeRange(event: CalendarEvent): string {
    return `${this.formatTime(event.schedule.startHour)} - ${this.formatTime(event.schedule.endHour)}`;
  }

  resetNewSchedule() {
    this.newSchedule = {
      day: '',
      startHour: '',
      endHour: '',
      description: ''
    };
  }

  loadClassesForCalendar() {
    // Le calendrier charge toujours ses propres classes filtrées
    this.classeService.findAll().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.filterClassesByParent();
        this.updateCalendar();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
      }
    });
  }

  filterClassesByParent() {
    if (this.parentId) {
      // Filtrer les classes qui contiennent des enfants de ce parent
      this.filteredClasses = this.classes.filter(classe => {
        // Vérifier que la classe a des étudiants ET qu'au moins un étudiant appartient à ce parent
        return classe.students && 
               classe.students.length > 0 && 
               classe.students.some(student => student.parent?.id === this.parentId);
      });
    } else {
      // Si pas de parentId, afficher toutes les classes (mode admin)
      this.filteredClasses = this.classes;
    }
  }

  loadTeachers() {
    // TODO: Implémenter le chargement des enseignants
    this.teachers = [];
  }

  // 📱 Responsive
  get isMobile() {
    return window.innerWidth < 768;
  }

  get isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  }
}