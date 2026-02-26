import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IReviewFullyPopulated } from 'app/shared/models/v2/review.schema';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetReviewService {
  private url = environment.apiV2Url;

  private http = inject(HttpClient);

  constructor() {}

  getMostLiked(n: number = 10): Observable<Array<IReviewFullyPopulated>> {
    const params = new HttpParams().set('n', n.toString());
    return this.http.get<Array<IReviewFullyPopulated>>(
      `${this.url}/reviews/popular`,
      { params }
    );
  }

  getReviewsByUser(userId: string): Observable<Array<IReviewFullyPopulated>> {
    return this.http.get<Array<IReviewFullyPopulated>>(`${this.url}/reviews/user/${userId}`);
  }
}
