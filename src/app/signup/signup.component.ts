import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword = false;
  showConfirmPassword = false;
  showWelcomePopup = false;
  @Output() switchToLogin = new EventEmitter<void>();
  users: any;
  supabase: any;

  constructor(private formBuilder: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.showWelcomeMessage();
  }

  initializeForm(): void {
    this.signupForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator.bind(this)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private showWelcomeMessage(): void {
    this.showWelcomePopup = true;
    setTimeout(() => {
      this.showWelcomePopup = false;
    }, 3000);
  }

  // Custom validator for password strength
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

    if (!passwordValid) {
      return { 
        passwordStrength: {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSpecialChar
        }
      };
    }
    return null;
  }

  // Validator to check if passwords match
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  get f() {
    return this.signupForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;

    try {
      const formData = this.signupForm.value;
      
      // Check if user already exists
      const users = await this.supabaseService.getData();
      const existingUser = users?.find((u: any) => u.email === formData.email);

      if (existingUser) {
        this.errorMessage = 'Account with this email already exists';
        this.isLoading = false;
        return;
      }

      await this.supabaseService.InsertData(formData);
      
      this.isLoading = false;
      this.successMessage = "Account created successfully";

      // Show popup for 1 second then redirect
      setTimeout(() => {
        this.router.navigate(['/login']);
        this.resetForm();
      }, 1000);
    } catch (error) {
      this.errorMessage = 'An error occurred during signup';
      this.isLoading = false;
    }
  }

  resetForm(): void {
    this.signupForm.reset();
    this.submitted = false;
    this.successMessage = '';
  }

  async goToLogin(): Promise<void> {
    this.router.navigate(['/login']); 
    this.resetForm();
  }

  getPasswordStrengthMessage(): string {
    const passwordControl = this.signupForm.get('password');
    if (!passwordControl || !passwordControl.hasError('passwordStrength')) {
      return '';
    }

    const errors = passwordControl.getError('passwordStrength');
    const missing = [];
    
    if (!errors.hasUpperCase) missing.push('uppercase letter');
    if (!errors.hasLowerCase) missing.push('lowercase letter');
    if (!errors.hasNumeric) missing.push('number');
    if (!errors.hasSpecialChar) missing.push('special character (!@#$%^&*)');

    return `Password must contain: ${missing.join(', ')}`;
  }

  hasUpperCase(): boolean {
    const password = this.signupForm.get('password')?.value;
    if (!password) return false;
    return /[A-Z]/.test(password);
  }

  hasLowerCase(): boolean {
    const password = this.signupForm.get('password')?.value;
    if (!password) return false;
    return /[a-z]/.test(password);
  }

  hasNumeric(): boolean {
    const password = this.signupForm.get('password')?.value;
    if (!password) return false;
    return /[0-9]/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.signupForm.get('password')?.value;
    if (!password) return false;
    return /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  hasPasswordMismatch(): boolean {
    return this.submitted && this.signupForm.errors && this.signupForm.errors['passwordMismatch'] ? true : false;
  }

  
  
}
