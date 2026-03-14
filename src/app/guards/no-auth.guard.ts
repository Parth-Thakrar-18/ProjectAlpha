import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const session = this.supabaseService.supabase.auth.session();
    
    // If user is fully authenticated (logged in AND verifiedOTP)
    if (session && this.supabaseService.isOtpVerified) {
       // redirect away from auth pages (login/signup) to dashboard
       return this.router.parseUrl('/dashboard');
    }

    // Allowed to visit auth pages
    return true;
  }
}
