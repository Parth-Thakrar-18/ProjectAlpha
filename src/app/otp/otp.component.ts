import { Component, OnInit, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OTPComponent implements OnInit, AfterViewInit {
  otpForm!: FormGroup;
  isLoading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  otp = '';
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  constructor(private fb: FormBuilder, private router: Router,
    private supabaseService: SupabaseService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.email = navigation.extras.state.email;
    }
  }

  ngOnInit(): void {
    this.otpForm = this.fb.group({
      digits: this.fb.array(
        Array(6).fill('').map(() => new FormControl('', [Validators.required, Validators.pattern('^[0-9]$')]))
      )
    });
  }

  ngAfterViewInit() {
    // Focus first input
    this.focusInput(0);
  }

  get digitsArr(): FormArray {
    return this.otpForm.get('digits') as FormArray;
  }

  onInputEvent(event: any, index: number) {
    const value = event.target.value;

    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) {
      this.digitsArr.at(index).setValue('');
      return;
    }

    if (value && index < 5) {
      this.focusInput(index + 1);
    }
  }

  onKeyDownEvent(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.digitsArr.at(index).value && index > 0) {
      this.focusInput(index - 1);
    }
  }

  focusInput(index: number) {
    setTimeout(() => {
      this.otpInputs.toArray()[index]?.nativeElement.focus();
    });
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');
    if (pastedData) {
      const numbers = pastedData.replace(/[^0-9]/g, '').slice(0, 6).split('');
      numbers.forEach((num, index) => {
        if (index < 6) {
          this.digitsArr.at(index).setValue(num);
        }
      });
      if (numbers.length > 0) {
        this.focusInput(Math.min(numbers.length, 5));
      }
    }
  }

  async verifyOTP(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';

    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const otpValue = this.digitsArr.value.join('');
    // Use the email that the OTP was sent to (hardcoded for now as it is in sendOtp)
    const targetEmail = this.email || 'parththakrar00@gmail.com';

    try {
      const { session, error } = await this.supabaseService.verifyOtp(targetEmail, otpValue);

      if (error) {
        this.errorMessage = 'Invalid OTP code. Please try again.';
        this.isLoading = false;
        this.digitsArr.controls.forEach(control => control.setValue(''));
        this.focusInput(0);
      } else {
        this.successMessage = 'OTP Verified! Redirecting...';
        this.supabaseService.isOtpVerified = true;
        setTimeout(() => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        }, 1000);
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'An error occurred. Please try again.';
      this.isLoading = false;
    }
  }

  resendOTP() {
    this.errorMessage = '';
    this.successMessage = 'A new OTP has been sent to your email.';
    setTimeout(() => this.successMessage = '', 3000);
  }

  async sendOtp() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Fallback to demo email if not populated, but typically passed from previous logic
    const targetEmail = this.email;

    try {
      const { error } = await this.supabaseService.sendOtp(targetEmail);

      if (error) {
        this.errorMessage = error.message;
      } else {
        this.successMessage = `OTP sent to ${targetEmail}`;
        // Optionally clear success message after 5 seconds
        setTimeout(() => this.successMessage = '', 5000);
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to send OTP';
    } finally {
      this.isLoading = false;
    }
  }

  async verifyOtp() {
    // Rely on app.component.ts logic instead of auto-verifying if user object exists.
    // If they got here, they need to input an actual OTP.
  }
}
