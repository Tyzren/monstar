import { IUnit } from "./unit.schema";

export interface FilterData {
  offset: number;
  limit: number;
  search: string;
  sort: string;
  showReviewed: boolean;
  showUnreviewed: boolean;
  hideNoOfferings: boolean;
  selectedFaculties: Array<string>;
  selectedSemesters: Array<string>;
  selectedCampuses: Array<string>;
}
export interface FilteredUnitsResponse {
  units: Array<IUnit>;
  total: number;
}
