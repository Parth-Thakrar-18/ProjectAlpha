import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const session = this.supabaseService.supabase.auth.session();
    
    // If the user has a valid session and has verified OTP
    if (session && this.supabaseService.isOtpVerified) {
      return true;
    }

    // Otherwise, redirect to login
    return this.router.parseUrl('/login');
  }
}
