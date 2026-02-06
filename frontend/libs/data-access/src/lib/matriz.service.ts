import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { MatrizCurricular, MatrizCurricularRequest, MatrizFiltro } from './models';

@Injectable({ providedIn: 'root' })
export class MatrizService {
  private http = inject(HttpClient);
  private apiUrl = '/api/matriz';

  private matrizesSubject = new BehaviorSubject<MatrizCurricular[]>([]);
  matrizes$ = this.matrizesSubject.asObservable();

  listar(filtro?: MatrizFiltro): Observable<MatrizCurricular[]> {
    let params = new HttpParams();
    if (filtro) {
      if (filtro.periodo) params = params.set('periodo', filtro.periodo);
      if (filtro.cursoId) params = params.set('cursoId', filtro.cursoId.toString());
      if (filtro.horaInicio) params = params.set('horaInicio', filtro.horaInicio);
      if (filtro.horaFim) params = params.set('horaFim', filtro.horaFim);
      if (filtro.maxAlunosMin != null) params = params.set('maxAlunosMin', filtro.maxAlunosMin.toString());
      if (filtro.maxAlunosMax != null) params = params.set('maxAlunosMax', filtro.maxAlunosMax.toString());
    }

    return this.http.get<MatrizCurricular[]>(this.apiUrl, { params }).pipe(
      tap((matrizes) => this.matrizesSubject.next(matrizes)),
      catchError(this.handleError)
    );
  }

  criar(request: MatrizCurricularRequest): Observable<MatrizCurricular> {
    return this.http.post<MatrizCurricular>(this.apiUrl, request).pipe(
      switchMap((created) => this.listar().pipe(map(() => created))),
      catchError(this.handleError)
    );
  }

  atualizar(id: number, request: MatrizCurricularRequest): Observable<MatrizCurricular> {
    return this.http.put<MatrizCurricular>(`${this.apiUrl}/${id}`, request).pipe(
      switchMap((updated) => this.listar().pipe(map(() => updated))),
      catchError(this.handleError)
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      switchMap(() => this.listar().pipe(map(() => void 0))),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.error?.message || 'Server error'));
  }
}
