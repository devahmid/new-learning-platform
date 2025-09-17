import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { LoaderService } from '../loader.service';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';




@Component({
    selector: 'app-loader',
    standalone:true,
    imports: [CommonModule],
    templateUrl: './loader.component.html',
    styleUrl: './loader.component.scss'
})
export class LoaderComponent implements AfterViewInit, OnDestroy{
  constructor(public loader: LoaderService) {}
  @ViewChild('glCanvas', { static: true }) canvasRef!: ElementRef;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private animationId!: number;

  ngAfterViewInit(): void {
    this.initScene();
    this.animate();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }

  initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(
      -canvas.clientWidth / 2,
      canvas.clientWidth / 2,
      canvas.clientHeight / 2,
      -canvas.clientHeight / 2,
      1,
      1000
    );
    this.camera.position.z = 10;

    // Créer une carte de cours (ex : Arabe)
    const cardWidth = 300;
    const cardHeight = 100;
    const cardColor = 0x006241;

    const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
    const material = new THREE.MeshBasicMaterial({ color: cardColor });
    const card = new THREE.Mesh(geometry, material);
    card.position.set(0, 0, 0);
    this.scene.add(card);

    // Ajouter une image sprite (ex: crayons)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/logo.png', (texture) => {
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(64, 64, 1);
      sprite.position.set(-cardWidth / 2 + 40, cardHeight / 2 - 40, 1);
      this.scene.add(sprite);
    });

    // Ajouter texte (Français + Arabe)
    const loader = new FontLoader();
    loader.load('assets/fonts/helvetiker_regular.typeface.json', (font) => {

     // this.scene = new THREE.Scene();
//this.scene.background = new THREE.Color(0x222222);

      const matText = new THREE.MeshBasicMaterial({ color: 0x222222 });

      const textFr = new TextGeometry('Arabe', {
        font,
        size: 24,
       
      });
      const meshFr = new THREE.Mesh(textFr, matText);
      meshFr.position.set(-60, -10, 1);
      this.scene.add(meshFr);

      const textAr = new TextGeometry('العربية', {
        font,
        size: 20,
        
      });
      const meshAr = new THREE.Mesh(textAr, matText);
      meshAr.position.set(-60, -40, 1);
      meshFr.position.set(-120, 20, 1);
      meshAr.position.set(-120, -20, 1);
      
      this.scene.add(meshAr);
    });
  }

  animate(): void {
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}
