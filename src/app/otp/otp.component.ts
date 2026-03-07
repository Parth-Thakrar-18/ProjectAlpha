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
  ) { }

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
    
    // Simulating validation
    const otpValue = this.digitsArr.value.join('');
    
    setTimeout(() => {
      if (otpValue === '123456') { // We consider 123456 as valid for demo
        this.successMessage = 'OTP Verified! Redirecting...';
        setTimeout(() => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        }, 1000);
      } else {
        this.errorMessage = 'Invalid OTP code. Try "123456"';
        this.isLoading = false;
        this.digitsArr.controls.forEach(control => control.setValue(''));
        this.focusInput(0);
      }
    }, 1500);
  }
  
  resendOTP() {
    this.errorMessage = '';
    this.successMessage = 'A new OTP has been sent to your email.';
    setTimeout(() => this.successMessage = '', 3000);
  }

  async sendOtp() {

    const { error } = await this.supabaseService.sendOtp("parththakrar00@gmail.com");

    if (error) {
      alert(error.message);
    } else {
      alert("OTP sent to email");
    }
  }

  async verifyOtp() {
  const user = this.supabaseService.supabase.auth.user();

  if (user) {
    this.router.navigate(['/dashboard']);
  }
}
}
