import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IJob } from '@models/job.schema';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private urlV2 = environment.apiV2Url;

  private http = inject(HttpClient);

  getAllJobs(): Observable<Array<IJob>> {
    return this.http.get<Array<IJob>>(`${this.urlV2}/jobs`);
  }
}
