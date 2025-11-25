import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { Home } from './components/home/home';
import { Register } from './register/register';
import { ResetPassword } from './components/reset-password/reset-password';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'home', component: Home },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  {
    path: 'reset-password/:token', // ⬅️ IMPORTANTE: Esto le dice a Angular que espere un parámetro aquí
    component: ResetPassword,
  },
];
