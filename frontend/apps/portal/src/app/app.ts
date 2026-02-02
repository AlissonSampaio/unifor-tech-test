import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@frontend/auth';
import { MenuItem, MessageService } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, ToastModule],
  providers: [MessageService],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private authService = inject(AuthService);
  
  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Matriz Curricular',
        icon: 'pi pi-fw pi-calendar',
        routerLink: '/coordenador',
        visible: this.authService.isCoordinator()
      },
      {
        label: 'Minhas Matrículas',
        icon: 'pi pi-fw pi-user',
        routerLink: '/aluno',
        visible: this.authService.isStudent()
      },
      {
        label: 'Sair',
        icon: 'pi pi-fw pi-power-off',
        command: () => this.authService.logout()
      }
    ];
  }
}
