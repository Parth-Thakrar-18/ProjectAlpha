import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ProjectAlpha';

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  ngOnInit() {
    this.supabaseService.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (this.supabaseService.isOtpVerified) {
          // Already verified, allow to dashboard
          this.router.navigate(['/dashboard']);
        } else {
          // Not verified, send OTP and redirect to OTP screen
          const email = session?.user?.email;
          if (email) {
            // Check if we haven't already sent the OTP in this exact session flow
            if (!this.supabaseService.otpSent) {
              this.supabaseService.sendOtp(email).then(({ error }) => {
                if (!error) {
                   this.supabaseService.otpSent = true;
                }
              });
            }
            this.router.navigate(['/otp'], { state: { email } });
          } else {
            // Edge case: no email in session, fallback to login
            this.router.navigate(['/login']);
          }
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        this.router.navigate(['/reset-password']);
      } else if (event === 'SIGNED_OUT') {
        this.supabaseService.isOtpVerified = false;
        this.supabaseService.otpSent = false;
        this.router.navigate(['/login']);
      }
    });
  }
}
