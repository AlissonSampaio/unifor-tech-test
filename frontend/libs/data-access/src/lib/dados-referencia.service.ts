import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { shareReplay } from 'rxjs';
import { Curso, Disciplina, Horario, Professor } from './models';

@Injectable({ providedIn: 'root' })
export class DadosReferenciaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/dados';

  disciplinas$ = this.http.get<Disciplina[]>(`${this.apiUrl}/disciplinas`).pipe(shareReplay(1));
  professores$ = this.http.get<Professor[]>(`${this.apiUrl}/professores`).pipe(shareReplay(1));
  horarios$ = this.http.get<Horario[]>(`${this.apiUrl}/horarios`).pipe(shareReplay(1));
  cursos$ = this.http.get<Curso[]>(`${this.apiUrl}/cursos`).pipe(shareReplay(1));
}
