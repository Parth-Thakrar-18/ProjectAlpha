import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isSidebarCollapsed = false;
  modules: string[] = ['Planning 1', 'Planning 2', 'Planning 3', 'Planning 4', 'Planning 5'];
  selectedModule: string = this.modules[0];

  constructor(private router: Router, private supabaseService: SupabaseService) { }

  ngOnInit(): void {
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  selectModule(module: string): void {
    this.selectedModule = module;
  }

  async logout(): Promise<void> {
    await this.supabaseService.supabase.auth.signOut();
    this.router.navigate(['/login']);
  }
}
