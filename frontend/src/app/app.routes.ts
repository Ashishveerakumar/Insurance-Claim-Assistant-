import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent),
    canActivate: [LoginGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent),
    canActivate: [LoginGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'plan/:id',
    loadComponent: () => import('./components/plan-details/plan-details').then(m => m.PlanDetails),
    canActivate: [AuthGuard]
  },
  {
    path: 'life-insurance/:id',
    loadComponent: () => import('./components/car-insurance-form/car-insurance-form').then(m => m.CarInsuranceFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'my-plans',
    loadComponent: () => import('./components/my-plans/my-plans.component').then(m => m.MyPlansComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'claim-insurance',
    loadComponent: () => import('./components/claim-insurance/claim-insurance').then(m => m.ClaimInsuranceComponent),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
  
];
