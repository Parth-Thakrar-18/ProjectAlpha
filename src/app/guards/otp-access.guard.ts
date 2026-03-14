import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class OtpAccessGuard implements CanActivate {

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const session = this.supabaseService.supabase.auth.session();
    // If they are already fully verified, they shouldn't be here (send to dashboard)
    if (session && this.supabaseService.isOtpVerified) {
        return this.router.parseUrl('/dashboard');
    }

    // They must have an OTP sent recently to be allowed on the OTP page
    if (this.supabaseService.otpSent) {
      return true;
    }

    // If neither, fallback to login
    return this.router.parseUrl('/login');
  }
}
