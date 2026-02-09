import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, forkJoin, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { AulaDisponivel, Matricula } from './models';

@Injectable({ providedIn: 'root' })
export class MatriculaService {
  private http = inject(HttpClient);
  private apiUrl = '/api/aluno';

  private aulasSubject = new BehaviorSubject<AulaDisponivel[]>([]);
  aulasDisponiveis$ = this.aulasSubject.asObservable();

  private matriculasSubject = new BehaviorSubject<Matricula[]>([]);
  minhasMatriculas$ = this.matriculasSubject.asObservable();

  carregarAulasDisponiveis(): Observable<AulaDisponivel[]> {
    return this.http.get<AulaDisponivel[]>(`${this.apiUrl}/aulas-disponiveis`).pipe(
      tap((aulas) => this.aulasSubject.next(aulas)),
      catchError(this.handleError)
    );
  }

  carregarMinhasMatriculas(): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(`${this.apiUrl}/matriculas`).pipe(
      tap((matriculas) => this.matriculasSubject.next(matriculas)),
      catchError(this.handleError)
    );
  }

  realizarMatricula(matrizId: number): Observable<Matricula> {
    return this.http.post<Matricula>(`${this.apiUrl}/matriculas`, { matrizCurricularId: matrizId }).pipe(
      switchMap((result) =>
        forkJoin([
          this.carregarAulasDisponiveis(),
          this.carregarMinhasMatriculas()
        ]).pipe(map(() => result))
      ),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.error?.message || 'Erro no servidor'));
  }
}
