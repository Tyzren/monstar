import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IJob } from '@models/job.schema';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** Maps a raw Notion-keyed job object to the camelCase IJob interface. */
function mapRawJob(raw: Record<string, unknown>): IJob {
  return {
    notionId: raw['notionId'] as string,
    lastVerified: raw['Last Verified'] as Date,
    status: raw['Status'] as IJob['status'],
    sourceLink: raw['Source Link'] as string,
    scope: raw['Scope'] as string,
    applicationLink: raw['Application Link'] as string,
    eligibility: raw['Eligibility'] as string,
    roleType: (raw['Role Type'] as string[]) ?? [],
    interviewWindow: raw['Interview Window'] as string,
    opportunityTitle: raw['Opportunity title'] as string,
    timeCommitment: (raw['Time Commitment'] as string[]) ?? [],
    closeDate: raw['Close Date'] as Date,
    organisation: raw['Organisation'] as string,
  };
}

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private urlV2 = environment.apiV2Url;

  private http = inject(HttpClient);

  getAllJobs(): Observable<Array<IJob>> {
    return this.http
      .get<Array<Record<string, unknown>>>(`${this.urlV2}/jobs`)
      .pipe(map((jobs) => jobs.map(mapRawJob)));
  }
}
