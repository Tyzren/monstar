import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Review } from 'app/shared/models/review.model';
import { IReview } from 'app/shared/models/v2/review.model';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostReviewService {
  private url = environment.apiV2Url;
  private http = inject(HttpClient);

  createReview(unitCode: string, review: Review): Observable<IReview> {
    return this.http.post<IReview>(
      `${this.url}/reviews/${unitCode}/create`,
      {
        title: review.title,
        semester: review.semester,
        grade: review.grade,
        year: review.year,
        overallRating: review.overallRating,
        relevancyRating: review.relevancyRating,
        facultyRating: review.facultyRating,
        contentRating: review.contentRating,
        description: review.description,
        author: review.author,
      },
      { withCredentials: true }
    );
  }
}
