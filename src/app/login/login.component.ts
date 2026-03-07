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

  constructor(private formBuilder: FormBuilder,
    private supabaseService: SupabaseService,
    private router:Router
  ) {}

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
    console.log('Forgot password clicked');
    // TODO: Navigate to forgot password page
  }

  createAccount(): void {
    this.router.navigate(['/signup']);
  }
}
