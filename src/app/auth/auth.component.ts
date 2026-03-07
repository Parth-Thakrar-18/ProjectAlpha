import { Component } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isLoginMode = true;

  switchMode(mode: 'login' | 'signup'): void {
    this.isLoginMode = mode === 'login';
  }

  onSwitchToSignup(): void {
    this.switchMode('signup');
  }

  onSwitchToLogin(): void {
    this.switchMode('login');
  }
}
