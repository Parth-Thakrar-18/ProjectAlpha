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

  constructor(private formBuilder: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
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

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;

    const { email, password } = this.loginForm.value;

    const users = await this.supabaseService.getData();
    const user = users?.find((u: any) => u.email === email);
    if (!user) {
      this.errorMessage = 'No user found';
      this.isLoading = false;
      return;
    }
    if (user.password !== password) {
      this.errorMessage = 'Incorrect password';
      this.isLoading = false;
      return;
    }

    this.successMessage = 'Login successful!';

    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/otp']);
    }, 1000);
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


