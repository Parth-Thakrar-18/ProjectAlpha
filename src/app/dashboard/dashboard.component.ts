import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isSidebarCollapsed = false;
  modules: string[] = ['Planning 1', 'Planning 2', 'Planning 3', 'Planning 4', 'Planning 5'];
  selectedModule: string = this.modules[0];

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  selectModule(module: string): void {
    this.selectedModule = module;
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
