import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  constructor() {}

  getSubjects() {
    return [
      {
        id: 1,
        name: 'Arabe',
        fr: 'Arabe',
        ar: 'العَرَبِيَّةُ',
        color: 'bg-green-800',
        innerColor: 'bg-green-900',
        icon: 'fa-book-quran',
        iconColor: 'text-green-600',
      },
      {
        id: 2,
        name: 'Croyance',
        fr: 'Croyance',
        ar: 'العَقِيدَةُ',
        color: 'bg-yellow-500',
        innerColor: 'bg-yellow-600',
        icon: 'fa-kaaba',
        iconColor: 'text-yellow-600',
      },
      {
        id: 3,
        name: 'At-Tafsir',
        fr: 'At-Tafsir',
        ar: 'التَّفْسِيرُ',
        color: 'bg-red-600',
        innerColor: 'bg-red-700',
        icon: 'fa-scroll',
        iconColor: 'text-red-600',
      },
      {
        id: 4,
        name: 'Fiqh',
        fr: 'Fiqh',
        ar: 'الفِقْهُ',
        color: 'bg-blue-900',
        innerColor: 'bg-blue-950',
        icon: 'fa-scale-balanced',
        iconColor: 'text-blue-700',
      },
      {
        id: 5,
        name: 'Hadith',
        fr: 'Hadith',
        ar: 'الحَدِيثُ',
        color: 'bg-blue-400',
        innerColor: 'bg-blue-600',
        icon: 'fa-star-and-crescent',
        iconColor: 'text-blue-400',
      },
      {
        id: 6,
        name: 'As-Sirah',
        fr: 'as-sīrah an-nabawiyya',
        ar: 'السِّيرَةُ النَّبَوِيَّةُ',
        color: 'bg-pink-500',
        innerColor: 'bg-pink-700',
        icon: ' fa-book-open',
        iconColor: 'text-pink-500',
      },
      {
        id: 7,
        name: 'Sirat as-sahabah',
        fr: 'La biographie des compagnons',
        ar: 'سِيَرَةُ الصَّحَابَةِ',
        color: 'bg-green-600',
        innerColor: 'bg-green-700',
        icon: 'fa-users',
        iconColor: 'text-green-700',
      },
      {
        id: 8,
        name: 'Invocations',
        fr: 'Les invocations du musulman',
        ar: 'أذْكَارُ المُسْلِمِ',
        color: 'bg-yellow-500',
        innerColor: 'bg-yellow-600',
        icon: ' fa-hand-point-up',
        iconColor: 'text-yellow-500',
      },
    ];
  }

  getSubjectByName(name: string) {
    return this.getSubjects().find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
  }
}
