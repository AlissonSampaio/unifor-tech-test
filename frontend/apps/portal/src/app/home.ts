import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@frontend/auth';

@Component({
  standalone: true,
  template: `
    <div class="flex flex-column align-items-center p-5">
      <i class="pi pi-spin pi-spinner mb-3" style="font-size: 2rem"></i>
      <p>Redirecionando... (Se esta tela persistir, verifique suas permissões no Keycloak)</p>
      <div class="mt-4 p-3 surface-100 border-round">
        <strong>Roles:</strong> {{ roles.join(', ') || 'Nenhuma role encontrada' }}
      </div>
    </div>
  `,
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
