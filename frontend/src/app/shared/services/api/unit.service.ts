import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Unit } from '../../models/unit.model';
import { FilteredUnitsResponse } from '../../models/v2/unit.model';

@Injectable({
  providedIn: 'root',
})
export class UnitService {
  private urlV2 = environment.apiV2Url;

  constructor(private http: HttpClient) {}

  getUnitsFiltered({
    offset = 0,
    limit = 24,
    search = '',
    sort = 'Alphabetic',
    showReviewed = false,
    showUnreviewed = false,
    hideNoOfferings = false,
    selectedFaculties = [],
    selectedSemesters = [],
    selectedCampuses = [],
  }): Observable<FilteredUnitsResponse> {
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('search', search)
      .set('sort', sort)
      .set('showReviewed', showReviewed ? 'true' : 'false')
      .set('showUnreviewed', showUnreviewed ? 'true' : 'false')
      .set('hideNoOfferings', hideNoOfferings ? 'true' : 'false');

    selectedFaculties.forEach((f) => {
      params = params.append('faculty', f);
    });
    selectedSemesters.forEach((s) => {
      params = params.append('semesters', s);
    });
    selectedCampuses.forEach((c) => {
      params = params.append('campuses', c);
    });

    return this.http.get<FilteredUnitsResponse>(`${this.urlV2}/units/filter`, {
      params,
    });
  }
}
