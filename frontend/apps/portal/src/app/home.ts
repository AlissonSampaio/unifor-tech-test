import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@frontend/auth';

@Component({
  standalone: true,
  template: '<div class="flex justify-content-center p-5"><i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i></div>',
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (this.authService.isCoordinator()) {
      this.router.navigate(['/coordenador']);
    } else if (this.authService.isStudent()) {
      this.router.navigate(['/aluno']);
    } else {
      console.warn('Unknown role');
    }
  }
}
