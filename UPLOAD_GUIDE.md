# 📁 Guide d'Upload de Fichiers - Course Builder

## 🎯 Fonctionnalités intégrées

Votre `course-builder.component.ts` dispose maintenant d'un système complet d'upload de fichiers avec :

### ✅ **Fonctionnalités principales**
- **Upload de vidéos** pour le cours principal et les leçons
- **Upload de PDFs** et documents pour le cours principal
- **Upload de fichiers** (images, documents) pour les leçons
- **URLs automatiques** générées après upload
- **Validation des fichiers** (taille, type)
- **Interface drag & drop** intuitive
- **Indicateur de progression** en temps réel
- **Gestion des erreurs** avec messages toast

## 🚀 **Comment utiliser l'upload**

### **1. Upload pour le cours principal**

#### **Vidéo de présentation :**
```html
<!-- Zone d'upload avec drag & drop -->
<div class="border-2 border-dashed border-gray-300 rounded-xl p-4">
  <input type="file" #videoInput (change)="onCourseFileUpload($event, 'videoUrl')" 
         accept="video/*" class="hidden">
  <button (click)="videoInput.click()">Choisir une vidéo</button>
</div>
```

#### **Document PDF :**
```html
<!-- Zone d'upload PDF -->
<div class="border-2 border-dashed border-gray-300 rounded-xl p-4">
  <input type="file" #pdfInput (change)="onCourseFileUpload($event, 'pdfUrl')" 
         accept=".pdf" class="hidden">
  <button (click)="pdfInput.click()">Choisir un PDF</button>
</div>
```

### **2. Upload pour les leçons**

#### **Vidéo de leçon :**
```typescript
onLessonFileUpload(event: any, lessonIndex: number, 'videoUrl'): void {
  const file = event.target.files?.[0];
  const control = this.getLessonControl(lessonIndex, 'videoUrl');
  this.uploadFile(file, control, 'Vidéo de leçon');
}
```

#### **Fichier de leçon :**
```typescript
onLessonFileUpload(event: any, lessonIndex: number, 'fileUrl'): void {
  const file = event.target.files?.[0];
  const control = this.getLessonControl(lessonIndex, 'fileUrl');
  this.uploadFile(file, control, 'Fichier de leçon');
}
```

## 🔧 **Méthodes disponibles**

### **Upload et gestion :**
```typescript
// Upload principal
uploadFile(file: File, targetControl: FormControl, fileType: string): void

// Upload pour cours
onCourseFileUpload(event: any, field: 'videoUrl' | 'pdfUrl'): void

// Upload pour leçons
onLessonFileUpload(event: any, lessonIndex: number, field: 'videoUrl' | 'fileUrl'): void

// Supprimer un fichier
removeFile(control: FormControl): void
```

### **Utilitaires :**
```typescript
// Vérifier si un fichier est uploadé
hasFile(control: FormControl): boolean

// Obtenir l'URL du fichier
getFileUrl(control: FormControl): string | null

// Obtenir le nom du fichier
getFileName(url: string): string

// Obtenir l'icône selon le type
getFileIcon(url: string): string
```

## 📋 **Types de fichiers supportés**

### **Vidéos :**
- MP4, WebM, AVI
- Taille max : 50MB

### **Images :**
- JPEG, PNG, GIF
- Taille max : 50MB

### **Documents :**
- PDF, DOC, DOCX, TXT
- Taille max : 50MB

### **Audio :**
- MP3, WAV
- Taille max : 50MB

## 🎨 **Interface utilisateur**

### **Zone d'upload vide :**
```html
<div class="text-center">
  <i class="fa-solid fa-video text-4xl text-gray-400 mb-3"></i>
  <p class="text-gray-600 mb-2">Cliquez pour uploader une vidéo</p>
  <button class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg">
    <i class="fa-solid fa-upload mr-2"></i>
    Choisir une vidéo
  </button>
</div>
```

### **Fichier uploadé :**
```html
<div class="flex items-center justify-between bg-green-50 p-3 rounded-lg">
  <div class="flex items-center">
    <i class="fa-solid fa-video text-green-600 mr-3"></i>
    <div>
      <p class="text-sm font-medium text-green-800">fichier.mp4</p>
      <p class="text-xs text-green-600">Vidéo uploadée</p>
    </div>
  </div>
  <div class="flex items-center space-x-2">
    <a href="url" target="_blank" class="text-green-600">
      <i class="fa-solid fa-external-link-alt"></i>
    </a>
    <button (click)="removeFile(control)" class="text-red-600">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>
</div>
```

## ⚙️ **Configuration backend**

### **Variables d'environnement :**
```env
API_BASE_URL=https://votre-domaine.com
UPLOAD_MAX_SIZE=52428800  # 50MB
```

### **URLs générées :**
```
https://votre-domaine.com/upload/files-1234567890.pdf
https://votre-domaine.com/upload/files-1234567891.mp4
```

## 🚨 **Gestion des erreurs**

### **Messages toast automatiques :**
- ✅ **Succès :** "Fichier uploadé avec succès"
- ❌ **Erreur :** "Impossible d'uploader le fichier"
- ⚠️ **Validation :** "Fichier trop volumineux" / "Type non autorisé"
- ℹ️ **Info :** "Fichier supprimé"

### **Indicateur de progression :**
```html
<div *ngIf="isUploading" class="fixed top-4 right-4 z-50">
  <p-progressBar [value]="uploadProgress"></p-progressBar>
</div>
```

## 🔄 **Flux d'upload complet**

1. **Sélection** : L'utilisateur clique sur la zone d'upload
2. **Validation** : Vérification de la taille et du type
3. **Upload** : Envoi vers `/api/upload/multiple`
4. **Réponse** : Récupération de l'URL générée
5. **Mise à jour** : Le contrôle du formulaire est mis à jour
6. **Affichage** : Interface mise à jour avec le fichier uploadé

## 🎯 **Exemple d'utilisation complète**

```typescript
// Dans votre composant
export class CourseBuilderComponent {
  // Upload d'une vidéo pour le cours
  onVideoUpload(event: any) {
    const file = event.target.files?.[0];
    const control = this.courseForm.get('videoUrl');
    this.uploadFile(file, control, 'Vidéo de présentation');
  }
  
  // Upload d'un PDF pour une leçon
  onLessonPdfUpload(event: any, lessonIndex: number) {
    const file = event.target.files?.[0];
    const control = this.getLessonControl(lessonIndex, 'fileUrl');
    this.uploadFile(file, control, 'PDF de leçon');
  }
}
```

Votre système d'upload est maintenant **complètement intégré** et prêt à l'emploi ! 🎉
