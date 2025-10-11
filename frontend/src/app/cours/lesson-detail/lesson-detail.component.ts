import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Lesson } from '../../models/lesson';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SubjectService } from '../../services/subject.service';
import {
  CourseService,
  Course,
  Lesson as ApiLesson,
  Quiz,
} from '../../services/course.service';
import { CommonModule, Location } from '@angular/common';
import { SafePipe } from '../../pipes/safe.pipe';
import { Exercise } from '../../models/exercise.model';
import { VideoTrackingService, VideoWatchSession } from '../../services/video-tracking.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lesson-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SafePipe],
  templateUrl: './lesson-detail.component.html',
  styleUrl: './lesson-detail.component.css',
})
export class LessonDetailComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer', { static: false })
  videoPlayer!: ElementRef<HTMLVideoElement>;

  lessonId = '';
  subjectData: any;
  lesson: Lesson | undefined;
  course: Course | undefined;
  isLoading = true;
  error: string | null = null;
  
  // Navigation properties (simplified for testing)
  currentLevel: number = 1;
  currentCourseId: number = 1;
  
  // Next lesson navigation properties
  allLessons: ApiLesson[] = [];
  currentLessonIndex: number = -1;
  nextLesson: ApiLesson | null = null;
  previousLesson: ApiLesson | null = null;
  isLastLesson: boolean = false;
  isFirstLesson: boolean = false;

  // Navigation entre sections
  currentSection: 'video' | 'quiz' | 'exercises' = 'video';

  // Quiz properties
  quizQuestions: any[] = [];
  currentQuizIndex = 0;
  quizAnswers: { [questionId: number]: number } = {};
  quizScore = 0;
  showQuizResults = false;
  isQuizCompleted = false;
  courseId: number | null = null;

  // Exercise properties
  exercises: Exercise[] = [];
  currentExerciseIndex = 0;
  exerciseAnswers: { [exerciseId: number]: any } = {};
  exerciseScore = 0;
  showExerciseResults = false;
  isExerciseCompleted = false;
  currentExerciseType: 'flashcard' | 'translation' | 'listening' = 'flashcard';

  // Video tracking properties
  private videoTrackingSubscriptions: Subscription[] = [];
  currentVideoSession: VideoWatchSession | null = null;

  // UI State properties
  isRetrying = false;
  retryCount = 0;
  maxRetries = 3;
  videoProgress = 0;
  isVideoTracking = false;
  private progressUpdateInterval: any;
  
  // Video speed control properties
  currentPlaybackRate = 1;
  playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
  showSpeedMenu = false;
  
  // Keyboard shortcuts properties
  private keyboardEventListeners: (() => void)[] = [];
  isMuted = false;
  currentVolume = 1;
  isFullscreen = false;
  
  // Fullscreen properties
  private fullscreenChangeListeners: (() => void)[] = [];
  private fullscreenSupportAvailable = false;
  
  // Mindmap fullscreen properties
  isMindmapFullscreen = false;
  
  // Auto-resume properties
  private autoResumeKey = '';
  private lastSavedPosition = 0;
  private positionSaveInterval: any;
  private readonly POSITION_SAVE_INTERVAL = 5000; // 5 secondes
  private readonly MIN_POSITION_TO_SAVE = 10; // Ne pas sauvegarder si < 10s
  private hasResumedFromSavedPosition = false; // Éviter de reprendre plusieurs fois
  
  // Vimeo player instance
  private vimeoPlayer: any = null;
  showFlashcardAnswer = false; // Nouveau: pour gérer l'affichage de la réponse des flashcards

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subjectService: SubjectService,
    private courseService: CourseService,
    private location: Location,
    private videoTrackingService: VideoTrackingService
  ) {}

  ngOnInit() {
    // Écouter les changements de paramètres de route
    this.route.paramMap.subscribe(params => {
      const newLessonId = params.get('id') || '';
      if (newLessonId !== this.lessonId) {
        this.lessonId = newLessonId;
        this.loadLessonData();
      }
    });
    
    // Initialiser les raccourcis clavier
    this.initializeKeyboardShortcuts();
    
    // Initialiser la gestion du plein écran
    this.initializeFullscreenSupport();

    this.lessonId = this.route.snapshot.paramMap.get('id') || '';
    const subjectName = this.route.snapshot.paramMap.get('subject');
    const level = this.route.snapshot.paramMap.get('level');
    const courseId = this.route.snapshot.paramMap.get('courseId');

    if (subjectName) {
      // Gestion spéciale pour "replay"
      if (subjectName === 'replay') {
        this.subjectData = {
          name: 'Replay',
          ar: '🎬',
          color: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600',
          innerColor: 'bg-gradient-to-r from-purple-600 to-indigo-600',
          icon: 'fa-video',
          iconColor: 'text-purple-600',
          fr: 'Cours enregistrés'
        };
      } else {
        this.subjectData = this.subjectService.getSubjectByName(subjectName);
      }
    }

    // Récupérer les paramètres de navigation
    if (level) {
      this.currentLevel = parseInt(level, 10);
    }
    if (courseId) {
      this.currentCourseId = parseInt(courseId, 10);
    }

    if (this.lessonId && this.subjectData) {
      this.loadLessonData();
    } else {
      this.error = 'Paramètres manquants';
      this.isLoading = false;
    }
  }

  private loadLessonData() {
    this.isLoading = true;
    this.error = null;
    
    // Charger les leçons du cours en parallèle
    this.loadCourseLessons();

    // Récupérer la leçon depuis l'API
    this.courseService.getLessonById(Number(this.lessonId)).subscribe({
      next: (apiLesson: ApiLesson) => {
        // Debug: Vérifier les données reçues
        console.log('🔍 Données API reçues:', apiLesson);
        console.log('🧠 mindMapUrl:', apiLesson.mindMapUrl);
        
        // Convertir l'API lesson vers le format local
        this.lesson = this.convertApiLessonToLocal(apiLesson);
        
        // Debug: Vérifier la conversion
        console.log('✅ Leçon convertie:', this.lesson);
        console.log('🧠 mindMapUrl après conversion:', this.lesson?.mindMapUrl);
        
        // Initialiser la reprise automatique maintenant que la leçon est chargée
        this.initializeAutoResumeKey();
        
        // Récupérer le courseId pour charger les quiz
        this.courseId = apiLesson.courseId;
        // Charger les données du cours pour avoir accès au titre
        this.loadCourseData();
        // Charger les données du quiz et des exercices maintenant qu'on a le courseId
        this.loadQuizData();
        this.loadExerciseData();
        
        // Charger toutes les leçons du cours pour la navigation
        this.loadCourseLessons();
        
        this.isLoading = false;
        this.resetRetryCount(); // Reset du compteur en cas de succès
      },
      error: (err: any) => {
        this.handleError(err, 'loadLessonData');
        this.isLoading = false;
        
        // Vérifier si l'erreur est récupérable
        if (this.isRecoverableError(err) && this.retryCount < this.maxRetries) {
          // Ne pas appeler retryLoadLesson() ici pour éviter la récursion
          // L'utilisateur pourra cliquer sur le bouton de retry
        } else {
          // Pas de données disponibles - afficher 0
          this.lesson = undefined;
          this.error = 'Aucune donnée de leçon disponible';
        }
      },
    });
  }

  // Méthode supprimée - plus de données mockées

  private convertApiLessonToLocal(apiLesson: ApiLesson): Lesson {
    return {
      id: apiLesson.id,
      title: apiLesson.title,
      category: 'vocabulaire', // Par défaut
      videoUrl: apiLesson.videoUrl || '',
      fileUrl: apiLesson.fileUrl || '',
      mindMapUrl: apiLesson.mindMapUrl || '', // ← AJOUT DU CHAMP MANQUANT
      flashcards: [],
      quiz: [],
      progress: 0, // Progression réelle depuis l'API
      icon: 'fa-book',
      statusts: 'unlocked',
      status: 'unlocked',
    };
  }

  // ===== MÉTHODES DE GESTION DES VIDÉOS =====

  // Détecte le type de vidéo
  getVideoType(url: string): 'youtube' | 'vimeo' | 'direct' | 'unknown' {
    if (!url) return 'unknown';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    // Vérifie si c'est un fichier vidéo direct
    if (this.isDirectVideoFile(url)) {
      return 'direct';
    }
    return 'unknown';
  }

  // Vérifie si c'est un fichier vidéo direct
  private isDirectVideoFile(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
  }

  // YOUTUBE - Extrait l'ID de la vidéo
  extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  // YOUTUBE - Génère l'URL d'embed
  getYouTubeEmbedUrl(url: string): string {
    const videoId = this.extractYouTubeVideoId(url);
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1`
      : '';
  }

  // VIMEO - Extrait l'ID de la vidéo
  extractVimeoVideoId(url: string): string | null {
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /vimeo\.com\/video\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  // VIMEO - Génère l'URL d'embed (version avec API)
  // getVimeoEmbedUrl est définie plus bas avec l'API Vimeo

  // Contrôles pour vidéo directe (simplifiés)
  toggleVideo() {
    if (this.getVideoType(this.lesson?.videoUrl || '') !== 'direct') {
      console.warn('Toggle video ne fonctionne que pour les vidéos directes');
      return;
    }

    const video = this.videoPlayer?.nativeElement;
    if (!video) return;

    if (video.paused) {
      video.play().catch((error) => {
        console.error('Erreur de lecture:', error);
        this.handleVideoError(error);
      });
    } else {
      video.pause();
    }
  }

  // Méthode pour démarrer la vidéo (remplace l'overlay)
  startVideo() {
    if (this.isDirect()) {
      this.toggleVideo();
    }
  }

  // ===== MÉTHODES DE CONTRÔLE DE VITESSE =====

  /**
   * Changer la vitesse de lecture de la vidéo
   */
  setPlaybackRate(rate: number) {
    this.currentPlaybackRate = rate;
    this.showSpeedMenu = false;

    if (this.isDirect()) {
      const video = this.videoPlayer?.nativeElement;
      if (video) {
        video.playbackRate = rate;
        console.log(`Vitesse de lecture changée à ${rate}x`);
      }
    } else if (this.isVimeo()) {
      // Initialiser le player Vimeo si nécessaire
      if (!this.vimeoPlayer) {
        this.initializeVimeoPlayer();
      }
      
      if (this.vimeoPlayer) {
        this.vimeoPlayer.setPlaybackRate(rate).then(() => {
          console.log(`Vitesse Vimeo changée à ${rate}x`);
        }).catch((error: any) => {
          console.error('Erreur lors du changement de vitesse Vimeo:', error);
        });
      } else {
        console.warn('Player Vimeo non disponible, tentative d\'initialisation...');
        // Retry après un court délai
        setTimeout(() => {
          this.initializeVimeoPlayer();
          if (this.vimeoPlayer) {
            this.vimeoPlayer.setPlaybackRate(rate);
          }
        }, 1000);
      }
    } else if (this.isYouTube()) {
      // Pour YouTube, on ne peut pas contrôler la vitesse via l'API embed
      console.warn('Contrôle de vitesse non disponible pour YouTube');
    }
  }

  /**
   * Basculer l'affichage du menu de vitesse
   */
  toggleSpeedMenu() {
    this.showSpeedMenu = !this.showSpeedMenu;
  }

  /**
   * Fermer le menu de vitesse
   */
  closeSpeedMenu() {
    this.showSpeedMenu = false;
  }

  /**
   * Obtenir le texte d'affichage de la vitesse actuelle
   */
  getSpeedDisplayText(): string {
    return `${this.currentPlaybackRate}x`;
  }

  /**
   * Vérifier si le contrôle de vitesse est disponible
   */
  isSpeedControlAvailable(): boolean {
    const isDirect = this.isDirect();
    const isVimeo = this.isVimeo();
    
    // Afficher le bouton pour les vidéos directes et Vimeo (même si player pas encore initialisé)
    return isDirect || isVimeo;
  }

  // ===== MÉTHODES DE RACCOURCIS CLAVIER =====

  /**
   * Initialiser les raccourcis clavier
   */
  private initializeKeyboardShortcuts() {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer si on est dans un input, textarea ou si une modal est ouverte
      if (this.isInputFocused() || this.isModalOpen()) {
        return;
      }

      // Empêcher le comportement par défaut pour nos raccourcis
      const handledKeys = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'm', 'M', 'f', 'F', 'j', 'J', 'l', 'L', 'Escape'];
      if (handledKeys.includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case ' ':
          this.handleSpaceKey();
          break;
        case 'ArrowLeft':
        case 'j':
        case 'J':
          this.handleSeekBackward();
          break;
        case 'ArrowRight':
        case 'l':
        case 'L':
          this.handleSeekForward();
          break;
        case 'ArrowUp':
          this.handleVolumeUp();
          break;
        case 'ArrowDown':
          this.handleVolumeDown();
          break;
        case 'm':
        case 'M':
          this.handleMuteToggle();
          break;
        case 'f':
        case 'F':
          this.handleFullscreenToggle();
          break;
        case 'Escape':
          this.handleEscapeKey();
          this.handleMindmapEscapeKey();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    this.keyboardEventListeners.push(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });
  }

  /**
   * Vérifier si un input est focalisé
   */
  private isInputFocused(): boolean {
    const activeElement = document.activeElement;
    return !!(activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      (activeElement as HTMLElement).contentEditable === 'true'
    ));
  }

  /**
   * Vérifier si une modal est ouverte
   */
  private isModalOpen(): boolean {
    return this.showSpeedMenu || this.showFlashcardAnswer;
  }

  /**
   * Gérer la touche Espace (Play/Pause)
   */
  private handleSpaceKey() {
    if (this.isDirect()) {
      this.toggleVideo();
    } else if (this.isVimeo() && this.vimeoPlayer) {
      this.vimeoPlayer.getPaused().then((paused: boolean) => {
        if (paused) {
          this.vimeoPlayer.play();
        } else {
          this.vimeoPlayer.pause();
        }
      });
    }
  }

  /**
   * Gérer le recul (10 secondes)
   */
  private handleSeekBackward() {
    if (this.isDirect()) {
      const video = this.videoPlayer?.nativeElement;
      if (video) {
        video.currentTime = Math.max(0, video.currentTime - 10);
      }
    } else if (this.isVimeo() && this.vimeoPlayer) {
      this.vimeoPlayer.getCurrentTime().then((currentTime: number) => {
        this.vimeoPlayer.setCurrentTime(Math.max(0, currentTime - 10));
      });
    }
  }

  /**
   * Gérer l'avance (10 secondes)
   */
  private handleSeekForward() {
    if (this.isDirect()) {
      const video = this.videoPlayer?.nativeElement;
      if (video) {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
      }
    } else if (this.isVimeo() && this.vimeoPlayer) {
      this.vimeoPlayer.getCurrentTime().then((currentTime: number) => {
        this.vimeoPlayer.getDuration().then((duration: number) => {
          this.vimeoPlayer.setCurrentTime(Math.min(duration, currentTime + 10));
        });
      });
    }
  }

  /**
   * Gérer l'augmentation du volume
   */
  private handleVolumeUp() {
    this.currentVolume = Math.min(1, this.currentVolume + 0.1);
    this.updateVolume();
  }

  /**
   * Gérer la diminution du volume
   */
  private handleVolumeDown() {
    this.currentVolume = Math.max(0, this.currentVolume - 0.1);
    this.updateVolume();
  }

  /**
   * Mettre à jour le volume
   */
  private updateVolume() {
    if (this.isDirect()) {
      const video = this.videoPlayer?.nativeElement;
      if (video) {
        video.volume = this.currentVolume;
        video.muted = this.isMuted;
      }
    } else if (this.isVimeo() && this.vimeoPlayer) {
      this.vimeoPlayer.setVolume(this.isMuted ? 0 : this.currentVolume);
    }
  }

  /**
   * Gérer le basculement du muet
   */
  private handleMuteToggle() {
    this.isMuted = !this.isMuted;
    this.updateVolume();
  }

  /**
   * Gérer le basculement du plein écran
   */
  handleFullscreenToggle() {
    if (this.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  /**
   * Gérer la touche Échap (sortir du plein écran)
   */
  private handleEscapeKey() {
    if (this.isFullscreen) {
      this.exitFullscreen();
    }
  }

  /**
   * Entrer en mode plein écran
   */
  private enterFullscreen() {
    if (!this.fullscreenSupportAvailable) {
      console.warn('Plein écran non supporté par ce navigateur');
      return;
    }

    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
      const requestFullscreen = videoContainer.requestFullscreen ||
        (videoContainer as any).webkitRequestFullscreen ||
        (videoContainer as any).mozRequestFullScreen ||
        (videoContainer as any).msRequestFullscreen;

      if (requestFullscreen) {
        requestFullscreen.call(videoContainer).then(() => {
          console.log('Plein écran activé');
        }).catch((error: any) => {
          console.warn('Erreur lors de l\'activation du plein écran:', error);
        });
      }
    }
  }

  /**
   * Sortir du mode plein écran
   */
  private exitFullscreen() {
    if (!this.isFullscreen) {
      return;
    }

    const exitFullscreen = document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).mozCancelFullScreen ||
      (document as any).msExitFullscreen;

    if (exitFullscreen) {
      exitFullscreen.call(document).then(() => {
        console.log('Plein écran désactivé');
      }).catch((error: any) => {
        console.warn('Erreur lors de la désactivation du plein écran:', error);
      });
    }
  }

  /**
   * Nettoyer les écouteurs de raccourcis clavier
   */
  private cleanupKeyboardShortcuts() {
    this.keyboardEventListeners.forEach(cleanup => cleanup());
    this.keyboardEventListeners = [];
  }

  /**
   * Nettoyer les écouteurs de plein écran
   */
  private cleanupFullscreenListeners() {
    this.fullscreenChangeListeners.forEach(cleanup => cleanup());
    this.fullscreenChangeListeners = [];
  }

  // ===== MÉTHODES DE GESTION DU PLEIN ÉCRAN =====

  /**
   * Initialiser la gestion du plein écran
   */
  private initializeFullscreenSupport() {
    // Vérifier le support du plein écran
    this.fullscreenSupportAvailable = !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
    );

    if (this.fullscreenSupportAvailable) {
      this.setupFullscreenEventListeners();
    }
  }

  /**
   * Configurer les écouteurs d'événements de plein écran
   */
  private setupFullscreenEventListeners() {
    const handleFullscreenChange = () => {
      this.updateFullscreenState();
    };

    // Écouter les différents événements de changement de plein écran
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ];

    events.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
      this.fullscreenChangeListeners.push(() => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    });
  }

  /**
   * Mettre à jour l'état du plein écran
   */
  private updateFullscreenState() {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    this.isFullscreen = isCurrentlyFullscreen;
    console.log('État du plein écran:', this.isFullscreen);
  }

  /**
   * Vérifier si le plein écran est supporté
   */
  isFullscreenSupported(): boolean {
    return this.fullscreenSupportAvailable;
  }

  /**
   * Vérifier si on est actuellement en plein écran
   */
  isCurrentlyFullscreen(): boolean {
    return this.isFullscreen;
  }

  // ===== MÉTHODES DE GESTION DU PLEIN ÉCRAN DE LA CARTE MENTALE =====

  /**
   * Basculer le mode plein écran de la carte mentale
   */
  toggleMindmapFullscreen() {
    this.isMindmapFullscreen = !this.isMindmapFullscreen;
    
    if (this.isMindmapFullscreen) {
      // Empêcher le scroll du body quand la carte mentale est en plein écran
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurer le scroll du body
      document.body.style.overflow = '';
    }
  }

  /**
   * Entrer en mode plein écran pour la carte mentale
   */
  enterMindmapFullscreen() {
    this.isMindmapFullscreen = true;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Sortir du mode plein écran de la carte mentale
   */
  exitMindmapFullscreen() {
    this.isMindmapFullscreen = false;
    document.body.style.overflow = '';
  }

  /**
   * Gérer le clic sur la carte mentale
   */
  onMindmapClick() {
    if (this.lesson?.mindMapUrl) {
      this.enterMindmapFullscreen();
    }
  }

  /**
   * Gérer la fermeture du plein écran avec la touche Échap
   */
  private handleMindmapEscapeKey() {
    if (this.isMindmapFullscreen) {
      this.exitMindmapFullscreen();
    }
  }

  // ===== MÉTHODES DE REPRISE AUTOMATIQUE =====

  /**
   * Initialiser la clé de reprise automatique
   */
  private initializeAutoResumeKey() {
    if (this.lesson?.id) {
      this.autoResumeKey = `video_position_${this.lesson.id}`;
      this.loadSavedPosition();
      this.hasResumedFromSavedPosition = false; // Reset à chaque nouvelle leçon
    }
  }

  /**
   * Charger la position sauvegardée
   */
  private loadSavedPosition() {
    try {
      const savedPosition = localStorage.getItem(this.autoResumeKey);
      
      if (savedPosition) {
        this.lastSavedPosition = parseFloat(savedPosition);
        console.log(`Position sauvegardée chargée: ${this.lastSavedPosition}s`);
      } else {
        this.lastSavedPosition = 0;
      }
    } catch (error) {
      console.warn('Erreur lors du chargement de la position:', error);
      this.lastSavedPosition = 0;
    }
  }

  /**
   * Sauvegarder la position actuelle
   */
  private saveCurrentPosition(position: number) {
    if (position >= this.MIN_POSITION_TO_SAVE) {
      try {
        localStorage.setItem(this.autoResumeKey, position.toString());
        this.lastSavedPosition = position;
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde de la position:', error);
      }
    }
  }

  /**
   * Démarrer la sauvegarde automatique de position
   */
  private startPositionSaving() {
    this.stopPositionSaving(); // S'assurer qu'il n'y a pas de doublon
    
    this.positionSaveInterval = setInterval(() => {
      this.saveCurrentVideoPosition();
    }, this.POSITION_SAVE_INTERVAL);
  }

  /**
   * Arrêter la sauvegarde automatique de position
   */
  private stopPositionSaving() {
    if (this.positionSaveInterval) {
      clearInterval(this.positionSaveInterval);
      this.positionSaveInterval = null;
    }
  }

  /**
   * Sauvegarder la position de la vidéo actuelle
   */
  private saveCurrentVideoPosition() {
    if (this.isDirect()) {
      const video = this.videoPlayer?.nativeElement;
      if (video && !video.paused) {
        this.saveCurrentPosition(video.currentTime);
      }
    } else if (this.isVimeo() && this.vimeoPlayer) {
      this.vimeoPlayer.getCurrentTime().then((currentTime: number) => {
        this.vimeoPlayer.getPaused().then((paused: boolean) => {
          if (!paused) {
            this.saveCurrentPosition(currentTime);
          }
        });
      }).catch((error: any) => {
        console.warn('Erreur lors de la récupération de la position Vimeo:', error);
      });
    }
  }

  /**
   * Reprendre la lecture à la position sauvegardée
   */
  private resumeFromSavedPosition() {
    if (this.lastSavedPosition > 0 && !this.hasResumedFromSavedPosition) {
      console.log(`Reprise à la position: ${this.lastSavedPosition}s`);
      this.hasResumedFromSavedPosition = true; // Marquer comme déjà repris
      
      if (this.isDirect()) {
        const video = this.videoPlayer?.nativeElement;
        if (video) {
          video.currentTime = this.lastSavedPosition;
        }
      } else if (this.isVimeo() && this.vimeoPlayer) {
        this.vimeoPlayer.setCurrentTime(this.lastSavedPosition).then(() => {
          console.log('Position Vimeo restaurée');
        }).catch((error: any) => {
          console.warn('Erreur lors de la restauration de la position Vimeo:', error);
        });
      }
    }
  }

  /**
   * Effacer la position sauvegardée (quand la vidéo est terminée)
   */
  private clearSavedPosition() {
    try {
      localStorage.removeItem(this.autoResumeKey);
      this.lastSavedPosition = 0;
      console.log('Position sauvegardée effacée');
    } catch (error) {
      console.warn('Erreur lors de l\'effacement de la position:', error);
    }
  }

  /**
   * Vérifier si une position est disponible pour la reprise
   */
  hasSavedPosition(): boolean {
    return this.lastSavedPosition > 0;
  }

  /**
   * Obtenir la position sauvegardée formatée
   */
  getSavedPositionFormatted(): string {
    if (this.lastSavedPosition <= 0) return '';
    
    const minutes = Math.floor(this.lastSavedPosition / 60);
    const seconds = Math.floor(this.lastSavedPosition % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Forcer la reprise manuelle (pour debug ou bouton)
   */
  forceResumeFromSavedPosition() {
    if (this.hasSavedPosition()) {
      this.hasResumedFromSavedPosition = false; // Reset le flag
      this.resumeFromSavedPosition();
    }
  }

  // Gestion d'erreurs pour vidéos directes
  onVideoError(event: Event) {
    console.error('Erreur vidéo:', event);
    const video = event.target as HTMLVideoElement;

    if (video.error) {
      switch (video.error.code) {
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          this.showError('Format vidéo non supporté');
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          this.showError('Erreur réseau lors du chargement');
          break;
        case MediaError.MEDIA_ERR_DECODE:
          this.showError('Erreur de décodage vidéo');
          break;
        case MediaError.MEDIA_ERR_ABORTED:
          this.showError('Lecture vidéo interrompue');
          break;
        default:
          this.showError('Erreur de lecture vidéo inconnue');
      }
    }
  }

  private handleVideoError(error: any) {
    if (error.name === 'NotSupportedError') {
      this.showError('Format vidéo non supporté par votre navigateur');
    } else if (error.name === 'NotAllowedError') {
      this.showError('Lecture vidéo bloquée par le navigateur');
    } else {
      this.showError('Erreur de lecture vidéo');
    }
  }

  private showError(message: string) {
    console.error(message);
    alert(message); // Temporaire, à remplacer par votre service de notification
  }

  // Events pour vidéos directes
  onVideoPlay() {
    console.log('Vidéo démarrée');
    this.startVideoTracking();
    this.startPositionSaving();
    
    // Reprendre à la position sauvegardée si c'est la première lecture
    if (this.hasSavedPosition() && !this.hasResumedFromSavedPosition) {
      setTimeout(() => {
        this.resumeFromSavedPosition();
      }, 1000);
    }
  }

  onVideoPause() {
    console.log('Vidéo en pause');
    this.pauseVideoTracking();
  }

  onVideoEnd() {
    console.log('Vidéo terminée');
    this.endVideoTracking();
    this.stopPositionSaving();
    this.clearSavedPosition();
  }

  // Events pour Vimeo
  onVimeoPlayerReady(event: any) {
    console.log('Iframe Vimeo chargée');
    // Attendre que l'API Vimeo soit disponible
    setTimeout(() => {
      this.initializeVimeoPlayer();
    }, 1000);
  }

  private initializeVimeoPlayer() {
    const iframe = document.getElementById('vimeo-player') as HTMLIFrameElement;
    if (iframe && (window as any).Vimeo) {
      this.vimeoPlayer = new (window as any).Vimeo.Player(iframe);
      this.setupVimeoTracking();
      console.log('Player Vimeo initialisé');
      
      // Reprendre à la position sauvegardée après l'initialisation
      setTimeout(() => {
        this.resumeFromSavedPosition();
      }, 1000);
    }
  }

  onVimeoPlay() {
    console.log('Vimeo démarré');
    this.startVideoTracking();
    this.startPositionSaving();
    
    // Reprendre à la position sauvegardée si c'est la première lecture
    if (this.hasSavedPosition() && !this.hasResumedFromSavedPosition) {
      setTimeout(() => {
        this.resumeFromSavedPosition();
      }, 1000);
    }
  }

  onVimeoPause() {
    console.log('Vimeo en pause');
    this.pauseVideoTracking();
  }

  onVimeoEnd() {
    console.log('Vimeo terminé');
    this.endVideoTracking();
    this.stopPositionSaving();
    this.clearSavedPosition();
  }

  onVideoSeek(event: any) {
    console.log('Recherche dans la vidéo:', event.target.currentTime);
    this.seekVideoTracking(event.target.currentTime);
  }

  onVideoTimeUpdate(event: any) {
    if (this.isVideoTracking) {
      const currentTime = event.target.currentTime;
      const duration = event.target.duration;
      this.updateVideoProgress(currentTime, duration);
    }
  }

  // Méthode helper pour le template
  isYouTube(): boolean {
    return this.getVideoType(this.lesson?.videoUrl || '') === 'youtube';
  }

  isVimeo(): boolean {
    return this.getVideoType(this.lesson?.videoUrl || '') === 'vimeo';
  }

  isDirect(): boolean {
    return this.getVideoType(this.lesson?.videoUrl || '') === 'direct';
  }

  // Méthode pour obtenir le type MIME de la vidéo
  getVideoMimeType(url: string): string {
    if (!url) return 'video/mp4';

    if (url.includes('.mp4')) return 'video/mp4';
    if (url.includes('.webm')) return 'video/webm';
    if (url.includes('.ogg')) return 'video/ogg';
    if (url.includes('.mov')) return 'video/quicktime';
    if (url.includes('.avi')) return 'video/x-msvideo';
    if (url.includes('.mkv')) return 'video/x-matroska';

    return 'video/mp4'; // Par défaut
  }

  goBack() {
    this.location.back();
  }

  // Navigation entre les leçons
  loadCourseLessons() {
    if (!this.courseId) {
      return;
    }
    
    this.courseService.getLessonsByCourse(this.courseId).subscribe({
      next: (lessons) => {
        this.allLessons = lessons.sort((a, b) => a.order - b.order);
        this.updateLessonNavigation();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des leçons:', error);
        // En cas d'erreur, on peut essayer de charger les leçons depuis le cours
        this.loadLessonsFromCourse();
      }
    });
  }

  // Méthode de fallback pour charger les leçons depuis le cours
  loadLessonsFromCourse() {
    if (!this.course) return;
    
    if (this.course.lessons && this.course.lessons.length > 0) {
      this.allLessons = this.course.lessons.sort((a, b) => a.order - b.order);
      this.updateLessonNavigation();
    }
  }

  updateLessonNavigation() {
    if (!this.lesson || this.allLessons.length === 0) {
      return;
    }

    // Trouver l'index de la leçon actuelle
    this.currentLessonIndex = this.allLessons.findIndex(l => l.id === this.lesson?.id);
    
    if (this.currentLessonIndex === -1) {
      return;
    }

    // Déterminer la leçon suivante et précédente
    this.nextLesson = this.currentLessonIndex < this.allLessons.length - 1 
      ? this.allLessons[this.currentLessonIndex + 1] 
      : null;
    
    this.previousLesson = this.currentLessonIndex > 0 
      ? this.allLessons[this.currentLessonIndex - 1] 
      : null;

    // Mettre à jour les états
    this.isLastLesson = this.currentLessonIndex === this.allLessons.length - 1;
    this.isFirstLesson = this.currentLessonIndex === 0;
  }

  goToNextLesson() {
    if (this.nextLesson) {
      this.navigateToLesson(this.nextLesson);
    }
  }

  goToPreviousLesson() {
    if (this.previousLesson) {
      this.navigateToLesson(this.previousLesson);
    }
  }

  navigateToLesson(targetLesson: ApiLesson) {
    if (!targetLesson) {
      return;
    }

    // Marquer la leçon actuelle comme complétée avant de naviguer
    this.markCurrentLessonAsCompleted();

    // Construire l'URL de navigation en utilisant les paramètres de la route actuelle
    const subjectName = this.route.snapshot.paramMap.get('subject');
    const level = this.route.snapshot.paramMap.get('level');
    
    if (!subjectName || !level) {
      return;
    }
    
    // Navigation avec Angular Router
    this.router.navigate(['/cours', subjectName, level, 'lesson', targetLesson.id]);
  }

  markCurrentLessonAsCompleted() {
    if (!this.lesson) return;
    
    // Sauvegarder dans le localStorage pour l'instant
    const completedLessons = this.getCompletedLessons();
    if (!completedLessons.includes(this.lesson.id)) {
      completedLessons.push(this.lesson.id);
      localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
    }
  }

  getCompletedLessons(): number[] {
    const stored = localStorage.getItem('completedLessons');
    return stored ? JSON.parse(stored) : [];
  }

  isLessonCompleted(lessonId: number): boolean {
    return this.getCompletedLessons().includes(lessonId);
  }

  getLessonProgress(): string {
    if (this.allLessons.length === 0) return '0/0';
    return `${this.currentLessonIndex + 1}/${this.allLessons.length}`;
  }


  // Méthodes helper pour le breadcrumb
  getCurrentLevel(): number {
    return this.currentLevel;
  }

  getCurrentCourseId(): number {
    return this.currentCourseId;
  }

  getSubjectName(): string {
    // Récupérer le nom de la matière depuis les paramètres de route
    const subjectName = this.route.snapshot.paramMap.get('subject');
    if (subjectName) {
      // Gestion spéciale pour "replay"
      if (subjectName === 'replay') {
        return 'Replay';
      }
      return subjectName.charAt(0).toUpperCase() + subjectName.slice(1);
    }
    return 'Arabe'; // Valeur par défaut
  }

  getLevel(): string {
    // Récupérer le niveau depuis les paramètres de route
    const level = this.route.snapshot.paramMap.get('level');
    if (level) {
      return level;
    }
    return this.currentLevel.toString();
  }

  getCourseId(): string {
    return this.courseId?.toString() || this.currentCourseId.toString();
  }

  private loadCourseData() {
    if (this.courseId) {
      this.courseService.getCourseById(this.courseId).subscribe({
        next: (courseData) => {
          this.course = courseData;
        },
        error: (err) => {
          console.error('Erreur lors du chargement du cours:', err);
        }
      });
    }
  }

  getCourseTitle(): string {
    // Récupérer le vrai titre du cours
    if (this.course?.title) {
      return this.course.title;
    }
    return `Cours ${this.currentCourseId}`;
  }

  // Navigation entre sections
  setSection(section: 'video' | 'quiz' | 'exercises') {
    this.currentSection = section;
  }

  // Méthodes pour bloquer les boutons
  onDisabledButtonClick(type: 'quiz' | 'exercices' | 'flashcard') {
    let message = '';
    switch (type) {
      case 'quiz':
        message = 'Les quiz seront bientôt disponibles !';
        break;
      case 'exercices':
        message = 'Les exercices seront bientôt disponibles !';
        break;
      case 'flashcard':
        message = 'Les flashcards seront bientôt disponibles !';
        break;
    }
    alert(message);
  }

  // Quiz methods
  loadQuizData() {
    if (!this.courseId) {
      console.warn('No course ID available for loading quiz data');
      this.quizQuestions = [];
      return;
    }

    this.courseService.getCourseQuizzes(this.courseId).subscribe({
      next: (quizzes: Quiz[]) => {
        if (quizzes && quizzes.length > 0) {
          // Prendre le premier quiz et convertir le format
          const quiz = quizzes[0];
          
          // Vérifier si le quiz a des questions
          if (quiz.questions && quiz.questions.length > 0) {
            this.quizQuestions = quiz.questions.map((question) => ({
              id: question.id,
              question: question.text,
              options: question.options.map((option) => ({
                id: option.id,
                text: option.text,
                isCorrect: option.isCorrect,
              })),
            }));
          } else {
            this.quizQuestions = [];
          }
        } else {
          this.quizQuestions = [];
        }
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des quiz:', err);
        this.quizQuestions = [];
      },
    });
  }


  selectQuizAnswer(questionId: number, answerId: number) {
    this.quizAnswers[questionId] = answerId;
  }

  nextQuizQuestion() {
    if (this.currentQuizIndex < this.quizQuestions.length - 1) {
      this.currentQuizIndex++;
    } else {
      this.completeQuiz();
    }
  }

  previousQuizQuestion() {
    if (this.currentQuizIndex > 0) {
      this.currentQuizIndex--;
    }
  }

  completeQuiz() {
    this.calculateQuizScore();
    this.showQuizResults = true;
    this.isQuizCompleted = true;

    // Sauvegarder la progression
    this.saveQuizProgress();
  }

  /**
   * Calculer le score du quiz
   */
  calculateQuizScore(): void {
    let correctAnswers = 0;
    this.quizQuestions.forEach((question) => {
      const selectedAnswer = this.quizAnswers[question.id];
      if (selectedAnswer) {
        const selectedOption = question.options.find(
          (opt: any) => opt.id === selectedAnswer
        );
        if (selectedOption && selectedOption.isCorrect) {
          correctAnswers++;
        }
      }
    });

    this.quizScore = Math.round(
      (correctAnswers / this.quizQuestions.length) * 100
    );
    
  }

  /**
   * Soumettre le quiz (méthode publique pour le template)
   */
  submitQuiz(): void {
    if (this.currentQuizIndex === this.quizQuestions.length - 1) {
      this.completeQuiz();
    } else {
      this.nextQuizQuestion();
    }
  }

  restartQuiz() {
    this.currentQuizIndex = 0;
    this.quizAnswers = {};
    this.quizScore = 0;
    this.showQuizResults = false;
    this.isQuizCompleted = false;
  }

  /**
   * Sauvegarder la progression du quiz
   */
  private saveQuizProgress(): void {
    if (!this.courseId || !this.lessonId) {
      console.warn('Impossible de sauvegarder la progression: courseId ou lessonId manquant');
      return;
    }

    // Trouver le quiz actuel (on prend le premier quiz du cours)
    const currentQuiz = this.quizQuestions.length > 0 ? { id: 1 } : null; // TODO: Récupérer l'ID réel du quiz
    
    if (!currentQuiz) {
      console.warn('Aucun quiz trouvé pour sauvegarder la progression');
      return;
    }

    const quizData = {
      lessonId: Number(this.lessonId),
      score: this.quizScore,
      answers: this.quizAnswers,
      completedAt: new Date().toISOString(),
      totalQuestions: this.quizQuestions.length
    };


    // Sauvegarder via l'API
    this.courseService.saveQuizProgress(currentQuiz.id, quizData).subscribe({
      next: (response) => {
        // Optionnel: Afficher un message de succès à l'utilisateur
      },
      error: (error) => {
        console.error('❌ Erreur lors de la sauvegarde de la progression du quiz:', error);
        // Optionnel: Afficher un message d'erreur à l'utilisateur
      }
    });
  }

  // Helper methods pour le template
  getCurrentQuizQuestion() {
    return this.quizQuestions[this.currentQuizIndex];
  }

  isQuizAnswerSelected(questionId: number, answerId: number): boolean {
    return this.quizAnswers[questionId] === answerId;
  }

  getQuizProgress(): number {
    return Math.round(
      ((this.currentQuizIndex + 1) / this.quizQuestions.length) * 100
    );
  }

  // Helper method pour le template
  getOptionLetter(index: number): string {
    return String.fromCharCode(64 + index);
  }

  // Exercise methods
  loadExerciseData() {
    if (!this.lessonId) {
      console.warn('No lesson ID available for loading exercise data');
      this.exercises = [];
      return;
    }

    this.courseService.getLessonExercises(Number(this.lessonId)).subscribe({
      next: (exercises: Exercise[]) => {
        if (exercises && exercises.length > 0) {
          this.exercises = exercises;
        } else {
          this.exercises = [];
        }
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des exercices:', err);
        this.exercises = [];
      },
    });
  }

  // Méthode supprimée - plus de données mockées

  setExerciseType(type: 'flashcard' | 'translation' | 'listening') {
    this.currentExerciseType = type;
    this.showFlashcardAnswer = false; // Reset l'affichage de la réponse
  }

  revealFlashcardAnswer() {
    this.showFlashcardAnswer = true;
  }

  getCurrentExercise() {
    return this.exercises.find((ex) => ex.type === this.currentExerciseType);
  }

  getCurrentExerciseQuestion() {
    const currentExercise = this.getCurrentExercise();
    if (currentExercise && currentExercise.questions) {
      return currentExercise.questions[this.currentExerciseIndex];
    }
    return null;
  }

  nextExercise() {
    const currentExercise = this.getCurrentExercise();
    if (currentExercise && currentExercise.questions) {
      if (this.currentExerciseIndex < currentExercise.questions.length - 1) {
        this.currentExerciseIndex++;
        this.showFlashcardAnswer = false; // Reset pour la nouvelle question
      } else {
        this.completeExercise();
      }
    }
  }

  previousExercise() {
    if (this.currentExerciseIndex > 0) {
      this.currentExerciseIndex--;
      this.showFlashcardAnswer = false; // Reset pour la question précédente
    }
  }

  completeExercise() {
    this.calculateExerciseScore();
    this.showExerciseResults = true;
    this.isExerciseCompleted = true;
    this.saveExerciseProgress();
  }

  /**
   * Calculer le score des exercices
   */
  calculateExerciseScore(): void {
    const currentExercise = this.getCurrentExercise();
    if (!currentExercise || !currentExercise.questions) {
      this.exerciseScore = 0;
      return;
    }

    let correctAnswers = 0;
    let totalQuestions = currentExercise.questions.length;

    // Pour les exercices de traduction, vérifier les réponses utilisateur
    if (currentExercise.type === 'translation') {
      currentExercise.questions.forEach((question) => {
        const userAnswer = this.exerciseAnswers[question.id];
        if (userAnswer) {
          const correctAnswer = question.answers.find(
            (answer) => answer.isCorrect
          );
          if (
            correctAnswer &&
            userAnswer.toLowerCase().trim() ===
              correctAnswer.text.toLowerCase().trim()
          ) {
            correctAnswers++;
          }
        }
      });
    } else if (currentExercise.type === 'listening') {
      // Pour les exercices d'écoute, vérifier les réponses correctes/incorrectes
      currentExercise.questions.forEach((question) => {
        const userAnswer = this.exerciseAnswers[question.id];
        if (userAnswer === 'correct') {
          correctAnswers++;
        }
      });
    } else {
      // Pour les flashcards et autres types, considérer comme complété si toutes les questions ont été vues
      correctAnswers = totalQuestions;
    }

    this.exerciseScore =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    
  }

  restartExercise() {
    this.currentExerciseIndex = 0;
    this.exerciseAnswers = {};
    this.exerciseScore = 0;
    this.showExerciseResults = false;
    this.isExerciseCompleted = false;
  }

  /**
   * Sauvegarder la progression des exercices
   */
  private saveExerciseProgress(): void {
    if (!this.lessonId) {
      console.warn('Impossible de sauvegarder la progression: lessonId manquant');
      return;
    }

    const currentExercise = this.getCurrentExercise();
    if (!currentExercise) {
      console.warn('Impossible de sauvegarder la progression: exercice actuel non trouvé');
      return;
    }

    // Mapper le type d'exercice vers les types supportés par l'API
    const mapExerciseType = (type: string): 'flashcard' | 'translation' | 'listening' => {
      switch (type) {
        case 'flashcard':
        case 'translation':
        case 'listening':
          return type;
        case 'multiple_choice':
        case 'fill_blank':
        default:
          return 'flashcard'; // Fallback vers flashcard pour les types non supportés
      }
    };

    const exerciseData = {
      lessonId: Number(this.lessonId),
      exerciseType: mapExerciseType(currentExercise.type),
      score: this.exerciseScore,
      answers: this.exerciseAnswers,
      completedAt: new Date().toISOString(),
      totalQuestions: currentExercise.questions?.length || 0
    };


    // Sauvegarder via l'API
    this.courseService.saveExerciseProgressNew(currentExercise.id, exerciseData).subscribe({
      next: (response) => {
        // Optionnel: Afficher un message de succès à l'utilisateur
      },
      error: (error) => {
        console.error('❌ Erreur lors de la sauvegarde de la progression des exercices:', error);
        // Optionnel: Afficher un message d'erreur à l'utilisateur
      }
    });
  }

  // Helper methods pour les exercices
  getExerciseProgress(): number {
    const currentExercise = this.getCurrentExercise();
    if (!currentExercise || !currentExercise.questions) return 0;

    const total = currentExercise.questions.length;
    return total > 0
      ? Math.round(((this.currentExerciseIndex + 1) / total) * 100)
      : 0;
  }

  updateTranslationAnswer(questionId: number, answer: string) {
    this.exerciseAnswers[questionId] = answer;
  }

  checkTranslationAnswer(questionId: number): boolean {
    const currentExercise = this.getCurrentExercise();
    if (currentExercise && currentExercise.questions) {
      const question = currentExercise.questions.find(
        (q) => q.id === questionId
      );
      if (question) {
        const userAnswer = this.exerciseAnswers[questionId];
        const correctAnswer = question.answers.find(
          (answer) => answer.isCorrect
        );
        if (userAnswer && correctAnswer) {
          return (
            userAnswer.toLowerCase().trim() ===
            correctAnswer.text.toLowerCase().trim()
          );
        }
      }
    }
    return false;
  }

  playAudio(audioUrl: string) {
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => {
      console.error('Erreur lors de la lecture audio:', error);
      // Fallback: utiliser l'API de synthèse vocale du navigateur
      this.speakText(this.getCurrentAudioExercise()?.word || '');
    });
  }

  speakText(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA'; // Arabe
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
    }
  }

  // Méthode pour obtenir la réponse correcte d'une question
  getCorrectAnswer(questionId: number): string {
    const currentExercise = this.getCurrentExercise();
    if (currentExercise && currentExercise.questions) {
      const question = currentExercise.questions.find(
        (q) => q.id === questionId
      );
      if (question) {
        const correctAnswer = question.answers.find(
          (answer) => answer.isCorrect
        );
        return correctAnswer ? correctAnswer.text : '';
      }
    }
    return '';
  }

  getCurrentAudioExercise() {
    const currentExercise = this.getCurrentExercise();
    if (currentExercise && currentExercise.questions) {
      const question = currentExercise.questions[this.currentExerciseIndex];
      if (question && question.audioUrl) {
        return {
          word: question.text,
          audioUrl: question.audioUrl,
          translation: question.answers.find((a) => a.isCorrect)?.text || '',
        };
      }
    }
    return null;
  }

  markAudioExerciseCorrect() {
    const currentExercise = this.getCurrentExercise();
    if (currentExercise && currentExercise.questions) {
      const question = currentExercise.questions[this.currentExerciseIndex];
      if (question) {
        this.exerciseAnswers[question.id] = 'correct';
      }
    }
  }

  markAudioExerciseIncorrect() {
    const currentExercise = this.getCurrentExercise();
    if (currentExercise && currentExercise.questions) {
      const question = currentExercise.questions[this.currentExerciseIndex];
      if (question) {
        this.exerciseAnswers[question.id] = 'incorrect';
      }
    }
  }

  // Helper method pour le template
  onTranslationInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const currentExercise = this.getCurrentExercise();
    if (currentExercise && currentExercise.questions) {
      const question = currentExercise.questions[this.currentExerciseIndex];
      if (question) {
        this.updateTranslationAnswer(question.id, target.value);
      }
    }
  }

  // Méthode pour obtenir la réponse utilisateur d'une question
  getUserAnswer(questionId: number): string {
    return this.exerciseAnswers[questionId] || '';
  }

  // ===========================================
  // MÉTHODES DE GESTION D'ERREURS ET RETRY
  // ===========================================

  /**
   * Retry pour charger les données de la leçon
   */
  retryLoadLesson(): void {
    if (this.retryCount >= this.maxRetries) {
      console.error('Nombre maximum de tentatives atteint');
      return;
    }

    this.isRetrying = true;
    this.retryCount++;
    
    
    // Attendre un peu avant de réessayer
    setTimeout(() => {
      this.loadLessonData();
    }, 1000 * this.retryCount); // Délai progressif
  }

  /**
   * Reset du compteur de retry
   */
  resetRetryCount(): void {
    this.retryCount = 0;
    this.isRetrying = false;
  }

  /**
   * Gestion d'erreur générique avec retry
   */
  handleError(error: any, context: string): void {
    console.error(`Erreur dans ${context}:`, error);
    
    // Afficher un message d'erreur approprié
    if (context.includes('lesson')) {
      this.error = 'Erreur lors du chargement de la leçon. Veuillez réessayer.';
    } else if (context.includes('quiz')) {
      this.error = 'Erreur lors du chargement du quiz.';
    } else if (context.includes('exercise')) {
      this.error = 'Erreur lors du chargement des exercices.';
    } else {
      this.error = 'Une erreur inattendue s\'est produite.';
    }
  }

  /**
   * Vérifier si une erreur est récupérable
   */
  isRecoverableError(error: any): boolean {
    // Erreurs réseau, timeouts, etc.
    return error.status === 0 || 
           error.status >= 500 || 
           error.name === 'TimeoutError' ||
           error.message?.includes('network');
  }

  // ===========================================
  // MÉTHODES DE SUIVI VIDÉO
  // ===========================================

  /**
   * Démarrer le suivi vidéo
   */
  private startVideoTracking() {
    if (!this.lesson?.videoUrl || this.isVideoTracking) return;

    const videoElement = this.videoPlayer?.nativeElement;
    if (!videoElement) return;

    const totalDuration = videoElement.duration || 0;
    
    this.videoTrackingService.startWatchSession(
      parseInt(this.lessonId), 
      this.lesson.videoUrl, 
      totalDuration
    ).subscribe({
      next: (session) => {
        this.currentVideoSession = session;
        this.isVideoTracking = true;
        this.videoProgress = 0;
        
        // Enregistrer l'événement de lecture
        this.videoTrackingService.recordEvent('play', 0).subscribe();
        
        // Démarrer la mise à jour de progression
        this.startProgressUpdate();
        
      },
      error: (error) => {
        console.error('Erreur lors du démarrage du suivi vidéo:', error);
      }
    });
  }

  /**
   * Mettre en pause le suivi vidéo
   */
  private pauseVideoTracking() {
    if (!this.isVideoTracking || !this.currentVideoSession) return;

    const videoElement = this.videoPlayer?.nativeElement;
    if (!videoElement) return;

    this.videoTrackingService.recordEvent('pause', videoElement.currentTime).subscribe();
    
    // Arrêter la mise à jour de progression
    this.stopProgressUpdate();
    
  }

  /**
   * Gérer la recherche dans la vidéo
   */
  private seekVideoTracking(currentTime: number) {
    if (!this.isVideoTracking || !this.currentVideoSession) return;

    this.videoTrackingService.recordEvent('seek', currentTime).subscribe();
  }

  /**
   * Mettre à jour la progression vidéo
   */
  private updateVideoProgress(currentTime: number, totalDuration: number) {
    if (!this.isVideoTracking) return;

    this.videoProgress = (currentTime / totalDuration) * 100;
    this.videoTrackingService.updateWatchProgress(currentTime, totalDuration);
  }

  /**
   * Terminer le suivi vidéo
   */
  private endVideoTracking() {
    if (!this.isVideoTracking || !this.currentVideoSession) return;

    const videoElement = this.videoPlayer?.nativeElement;
    if (!videoElement) return;

    this.stopProgressUpdate();

    this.videoTrackingService.endWatchSession(
      videoElement.currentTime, 
      videoElement.duration
    ).subscribe({
      next: () => {
        this.isVideoTracking = false;
        this.currentVideoSession = null;
      },
      error: (error) => {
        console.error('Erreur lors de la fin du suivi vidéo:', error);
      }
    });
  }

  /**
   * Démarrer la mise à jour périodique de progression
   */
  private startProgressUpdate() {
    this.progressUpdateInterval = setInterval(() => {
      if (this.isVideoTracking && this.videoPlayer?.nativeElement) {
        const videoElement = this.videoPlayer.nativeElement;
        this.updateVideoProgress(videoElement.currentTime, videoElement.duration);
      }
    }, 5000); // Mise à jour toutes les 5 secondes
  }

  /**
   * Arrêter la mise à jour périodique de progression
   */
  private stopProgressUpdate() {
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
      this.progressUpdateInterval = null;
    }
  }

  /**
   * Configurer le suivi pour Vimeo
   */
  private setupVimeoTracking() {
    if (!this.vimeoPlayer) return;

    // Écouter les événements Vimeo
    this.vimeoPlayer.on('play', () => this.onVimeoPlay());
    this.vimeoPlayer.on('pause', () => this.onVimeoPause());
    this.vimeoPlayer.on('ended', () => this.onVimeoEnd());
    this.vimeoPlayer.on('seeked', (data: any) => this.seekVideoTracking(data.seconds));
    this.vimeoPlayer.on('timeupdate', (data: any) => {
      if (this.isVideoTracking) {
        this.updateVideoProgress(data.seconds, this.vimeoPlayer.getDuration());
      }
    });

  }

  /**
   * Obtenir l'ID Vimeo depuis l'URL
   */
  getVimeoId(url: string): string | null {
    const match = url.match(/(?:vimeo\.com\/)(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Obtenir l'URL d'embed Vimeo
   */
  getVimeoEmbedUrl(url: string): string {
    const vimeoId = this.getVimeoId(url);
    if (!vimeoId) return url;
    
    return `https://player.vimeo.com/video/${vimeoId}?api=1&player_id=vimeo-player`;
  }

  // ===== MÉTHODES POUR LE SUPPORT DE COURS =====

  /**
   * Télécharger le fichier de support de cours
   */
  downloadSupportFile(): void {
    if (!this.lesson?.fileUrl) {
      console.warn('Aucun fichier de support disponible');
      return;
    }

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = this.lesson.fileUrl;
    link.download = this.getFileName(this.lesson.fileUrl);
    link.target = '_blank';
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  }

  /**
   * Obtenir l'icône appropriée selon le type de fichier
   */
  getFileIcon(fileUrl: string): string {
    const extension = this.getFileExtension(fileUrl).toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'fa-solid fa-file-pdf text-red-500';
      case 'doc':
      case 'docx':
        return 'fa-solid fa-file-word text-blue-500';
      case 'txt':
        return 'fa-solid fa-file-lines text-gray-500';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'fa-solid fa-file-video text-purple-500';
      case 'mp3':
      case 'wav':
        return 'fa-solid fa-file-audio text-green-500';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'fa-solid fa-file-image text-yellow-500';
      default:
        return 'fa-solid fa-file text-gray-500';
    }
  }

  /**
   * Obtenir le nom du fichier depuis l'URL
   */
  getFileName(fileUrl: string): string {
    try {
      const url = new URL(fileUrl);
      const pathname = url.pathname;
      const filename = pathname.split('/').pop() || 'fichier';
      
      // Nettoyer le nom de fichier
      return decodeURIComponent(filename);
    } catch (error) {
      console.error('Erreur lors de l\'extraction du nom de fichier:', error);
      return 'fichier-inconnu';
    }
  }

  /**
   * Obtenir l'extension d'un fichier
   */
  private getFileExtension(fileUrl: string): string {
    try {
      const url = new URL(fileUrl);
      const pathname = url.pathname;
      const filename = pathname.split('/').pop() || '';
      const parts = filename.split('.');
      
      return parts.length > 1 ? parts.pop() || '' : '';
    } catch (error) {
      console.error('Erreur lors de l\'extraction de l\'extension:', error);
      return '';
    }
  }

  /**
   * Ouvrir le fichier dans un nouvel onglet
   */
  openSupportFile(): void {
    if (!this.lesson?.fileUrl) {
      console.warn('Aucun fichier de support disponible');
      return;
    }

    window.open(this.lesson.fileUrl, '_blank');
  }

  /**
   * Nettoyer les ressources au destruction du composant
   */
  ngOnDestroy() {
    // Nettoyer les abonnements
    this.videoTrackingSubscriptions.forEach(sub => sub.unsubscribe());
    
    // Arrêter le suivi vidéo si actif
    if (this.isVideoTracking) {
      this.endVideoTracking();
    }
    
    // Nettoyer l'intervalle de progression
    this.stopProgressUpdate();
    
    // Nettoyer le player Vimeo
    if (this.vimeoPlayer) {
      this.vimeoPlayer.destroy();
      this.vimeoPlayer = null;
    }
    
    // Nettoyer les raccourcis clavier
    this.cleanupKeyboardShortcuts();
    
    // Nettoyer les écouteurs de plein écran
    this.cleanupFullscreenListeners();
    
    // Arrêter la sauvegarde de position
    this.stopPositionSaving();
    
    // Restaurer le scroll du body si la carte mentale était en plein écran
    if (this.isMindmapFullscreen) {
      document.body.style.overflow = '';
    }
  }
}
