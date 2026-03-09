import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.forgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() {
    return this.forgotForm.controls;
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { email } = this.forgotForm.value;

    try {
      const { error } = await this.supabaseService.resetPasswordForEmail(email);
      
      if (error) {
        this.errorMessage = error.message;
      } else {
        this.successMessage = 'Password reset link sent! Please check your email.';
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to send reset link';
    } finally {
      this.isLoading = false;
    }
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
