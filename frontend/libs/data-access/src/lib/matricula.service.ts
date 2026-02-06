import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable, switchMap, tap } from 'rxjs';
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
      tap((aulas) => this.aulasSubject.next(aulas))
    );
  }

  carregarMinhasMatriculas(): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(`${this.apiUrl}/matriculas`).pipe(
      tap((matriculas) => this.matriculasSubject.next(matriculas))
    );
  }

  realizarMatricula(matrizId: number): Observable<Matricula> {
    return this.http.post<Matricula>(`${this.apiUrl}/matriculas`, { matrizCurricularId: matrizId }).pipe(
      switchMap((result) =>
        forkJoin([
          this.carregarAulasDisponiveis(),
          this.carregarMinhasMatriculas()
        ]).pipe(map(() => result))
      )
    );
  }
}
