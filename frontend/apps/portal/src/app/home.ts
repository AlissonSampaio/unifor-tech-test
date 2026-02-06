import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@frontend/auth';

@Component({
  standalone: true,
  template: `
    <div class="loading-container">
      <div class="loading-card">
        <div class="loading-icon">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <h3 class="loading-title">Carregando seu portal...</h3>
        <p class="loading-text">Estamos preparando tudo para você.</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }

    .loading-card {
      text-align: center;
      padding: 3rem 2rem;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      max-width: 360px;
      width: 100%;
    }

    .loading-icon {
      font-size: 2.5rem;
      color: #3b82f6;
      margin-bottom: 1.25rem;
    }

    .loading-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }

    .loading-text {
      font-size: 0.9375rem;
      color: #64748b;
      margin: 0;
    }
  `],
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  get roles() {
    return this.authService.roles;
  }

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
