import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DeleteReviewService {
  private urlV2 = environment.apiV2Url;

  private http = inject(HttpClient);

  deleteById(id: string) {
    return this.http.delete(`${this.urlV2}/reviews/delete/${id}`);
  }
}
