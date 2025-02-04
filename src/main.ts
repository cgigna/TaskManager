import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { TaskManagerComponent } from './app/components/task-manager/task-manager.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(FormsModule), // Agregar FormsModule para ngModel
    TaskManagerComponent, // Importar el componente Task Manager
    provideHttpClient()
    
  ]
}).catch(err => console.error(err));