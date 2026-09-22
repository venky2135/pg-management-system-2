import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { StudentFormComponent } from './components/student-form/student-form.component';
import { RoomSelectionComponent } from './components/room-selection/room-selection.component';
import { ComplaintsComponent } from './components/complaints/complaints.component';

import { RegisterComponent } from './components/register/register.component';
import { PropertyWizardComponent } from './components/property-wizard/property-wizard.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public Routes (Guest only)
  { path: '', component: WelcomeComponent, pathMatch: 'full', canActivate: [guestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'property-setup', component: PropertyWizardComponent, canActivate: [authGuard] }, // Assuming this needs auth, or maybe not? 

  // Authenticated Routes (Wrapped in Main Layout)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'students', component: StudentListComponent },
      { path: 'add-student', component: StudentFormComponent },
      { path: 'rooms', component: RoomSelectionComponent },
      { path: 'payments', component: StudentListComponent },
      { path: 'complaints', component: ComplaintsComponent },
    ]
  },

  { path: '**', redirectTo: '' }
];
