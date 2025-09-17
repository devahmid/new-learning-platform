import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as express from 'express';
import { json, urlencoded } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ajouter le préfixe global pour toutes les routes
  app.setGlobalPrefix('api');

  console.log('🚀 Application démarrée sur http://localhost:3000');

  // Stripe a besoin d’un raw body uniquement pour le webhook
  app.use('/webhook/stripe', express.raw({ type: 'application/json' }));

  // Le reste de l'app utilise du JSON standard
  app.use(json());
  app.use(urlencoded({ extended: true }));

  app.enableCors({
    origin: '*', // Pour dev uniquement, t'oublieras pas de restreindre en prod hein...
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  // 💥 Attrape les erreurs non gérées pour éviter que l'appli se crashe
  process.on('unhandledRejection', (reason) => {
    console.error('🔥 UNHANDLED PROMISE REJECTION:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION:', err);
  });

  await app.listen(3000, '0.0.0.0'); // ← nécessaire si tu veux exposer en LAN
}
bootstrap();
