import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage: string = '';
  successMessage: string = '';
  @Output() switchToSignup = new EventEmitter<void>();
  email: any;

  // Rate Limiting Variables
  failedLoginAttempts = 0;
  loginLockoutUntil: number | null = null;
  lockoutTimer: any;
  lockoutRemaining = 0;

  constructor(private formBuilder: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.checkLockoutState();
  }

  checkLockoutState(): void {
    const lockoutUntilStr = localStorage.getItem('loginLockoutUntil');
    const attemptsStr = localStorage.getItem('failedLoginAttempts');
    
    if (attemptsStr) {
      this.failedLoginAttempts = parseInt(attemptsStr, 10);
    }
    
    if (lockoutUntilStr) {
      this.loginLockoutUntil = parseInt(lockoutUntilStr, 10);
      this.startLockoutTimer();
    }
  }

  startLockoutTimer(): void {
    if (!this.loginLockoutUntil) return;
    
    this.isLoading = true; // Disable form while locked out
    
    this.lockoutTimer = setInterval(() => {
      if (!this.loginLockoutUntil) return;
      
      const now = Date.now();
      const remaining = Math.ceil((this.loginLockoutUntil - now) / 1000);
      
      if (remaining <= 0) {
        // Lockout expired
        clearInterval(this.lockoutTimer);
        this.loginLockoutUntil = null;
        this.failedLoginAttempts = 0;
        this.lockoutRemaining = 0;
        this.errorMessage = '';
        this.isLoading = false;
        localStorage.removeItem('loginLockoutUntil');
        localStorage.removeItem('failedLoginAttempts');
      } else {
        this.lockoutRemaining = remaining;
        this.errorMessage = `Too many failed attempts. Try again in ${remaining}s.`;
      }
    }, 1000);
  }

  handleFailedAttempt(message: string): void {
    this.failedLoginAttempts++;
    localStorage.setItem('failedLoginAttempts', this.failedLoginAttempts.toString());
    
    if (this.failedLoginAttempts >= 4) {
      // Lock out for 1 minute (60000 ms)
      this.loginLockoutUntil = Date.now() + 60000;
      localStorage.setItem('loginLockoutUntil', this.loginLockoutUntil.toString());
      this.startLockoutTimer();
    } else {
      this.errorMessage = `${message} (${4 - this.failedLoginAttempts} attempts remaining before 1m lockout)`;
      this.isLoading = false;
    }
  }

  initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  async onSubmit(): Promise<boolean> {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginLockoutUntil && Date.now() < this.loginLockoutUntil) {
      return false; // Already locked out
    }

    if (this.loginForm.invalid) {
      return false;
    }

    this.isLoading = true;

    const { email, password } = this.loginForm.value;

    const users = await this.supabaseService.getData();
    const user = users?.filter((u: any) => u.email === email);
    if (user.length === 0) {
      this.handleFailedAttempt('No user found');
      return false;
    }
    if (user[0].password !== password) {
      this.handleFailedAttempt('Incorrect password');
      return false;
    }

    // Success - reset counters
    this.failedLoginAttempts = 0;
    localStorage.removeItem('failedLoginAttempts');
    localStorage.removeItem('loginLockoutUntil');

    this.successMessage = 'Login successful!';

    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/otp']);
    }, 1000);

    return true;
  }

  resetForm(): void {
    this.loginForm.reset();
    this.submitted = false;
    this.successMessage = '';
  }

  forgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  createAccount(): void {
    this.router.navigate(['/signup']);
  }
  async sendOtp() {
    const loginSuccess = await this.onSubmit();
    if (!loginSuccess) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Fallback to demo email if not populated, but typically passed from previous logic
    const targetEmail = this.loginForm.value.email;

    try {
      const { error } = await this.supabaseService.sendOtp(targetEmail);

      if (error) {
        this.errorMessage = error.message;
      } else {
        this.supabaseService.otpSent = true;
        this.successMessage = `OTP sent to ${targetEmail}`;
        // Optionally clear success message after 5 seconds
        setTimeout(() => this.successMessage = '', 5000);
        this.router.navigate(['/otp'], { state: { email: targetEmail } });
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to send OTP';
    } finally {
      this.isLoading = false;
    }
  }

  async verifyOtp() {
    const user = this.supabaseService.supabase.auth.user();

    if (user) {
      this.router.navigate(['/dashboard']);
    }
  }

  async loginWithProvider(provider: 'google' | 'facebook') {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const { error } = await this.supabaseService.signInWithProvider(provider);

      if (error) {
        this.errorMessage = error.message;
      }
      // Note: Oauth will typically result in a redirect, so execution may pause here.
    } catch (err: any) {
      this.errorMessage = err.message || `Failed to login with ${provider}`;
    } finally {
      this.isLoading = false;
    }
  }
}


