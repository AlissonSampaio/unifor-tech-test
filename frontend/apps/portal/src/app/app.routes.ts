import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '@frontend/auth';
import { HomeComponent } from './home';

export const appRoutes: Routes = [
  { 
    path: '', 
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'coordenador',
    loadChildren: () => import('./features/coordinator/routes').then(m => m.COORDINATOR_ROUTES),
    canActivate: [roleGuard(['COORDENADOR'])]
  },
  {
    path: 'aluno',
    loadChildren: () => import('./features/student/routes').then(m => m.STUDENT_ROUTES),
    canActivate: [roleGuard(['ALUNO'])]
  }
];
