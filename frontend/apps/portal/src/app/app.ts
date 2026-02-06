import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@frontend/auth';
import { MenuItem, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ToastModule,
    AvatarModule,
    ButtonModule,
    TooltipModule,
  ],
  providers: [MessageService],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private authService = inject(AuthService);

  items: MenuItem[] = [];
  userName = '';
  userInitial = 'U';
  userRole = '';

  ngOnInit() {
    this.items = [
      {
        label: 'Matriz Curricular',
        icon: 'pi pi-fw pi-objects-column',
        routerLink: '/coordenador',
        visible: this.authService.isCoordinator(),
      },
      {
        label: 'Minhas Matrículas',
        icon: 'pi pi-fw pi-bookmark',
        routerLink: '/aluno',
        visible: this.authService.isStudent(),
      },
    ];

    if (this.authService.isCoordinator()) {
      this.userRole = 'Coordenador';
    } else if (this.authService.isStudent()) {
      this.userRole = 'Aluno';
    }

    this.authService.userProfile$.subscribe({
      next: (profile) => {
        const name =
          profile?.firstName ||
          profile?.username ||
          '';
        this.userName = name;
        this.userInitial = name
          ? name.charAt(0).toUpperCase()
          : 'U';
      },
      error: () => {
        this.userName = '';
        this.userInitial = 'U';
      },
    });
  }

  logout() {
    this.authService.logout();
  }
}
