import {
  ApplicationConfig,
  importProvidersFrom,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { loaderInterceptor } from './shared/loader.interceptor';
import { validationErrorInterceptor } from './interceptors/validation-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideRouter(routes),
    importProvidersFrom(
      MenubarModule,
      CardModule,
      InputTextModule,
      PasswordModule,
      ButtonModule,
      TableModule,
      ToastModule
    ),
    MessageService,
    provideHttpClient(withInterceptors([authInterceptor, loaderInterceptor, validationErrorInterceptor])),
    provideAnimations(),
  ],
};
