import { AiOverview } from '../ai-overview.model';
import { IReview, IReviewAuthorPopulated } from './review.model';

export enum UnitTag {
  MOST_REVIEWS = 'most-reviews',
  CONTROVERSIAL = 'controversial',
  WAM_BOOSTER = 'wam-booster',
}
export interface Requisites {
  permission: boolean;
  prerequisites: { NumReq: number; units: string[] }[];
  corequisites: string[];
  prohibitions: string[];
  cpRequired: number;
}
export interface Offering {
  location: string;
  mode: string;
  name: string;
  period: string;
  _id: string;
}
export interface IUnit {
  _id: string;
  unitCode: string;
  name: string;
  description?: string;
  reviews: string[];
  avgOverallRating: number;
  avgRelevancyRating: number;
  avgFacultyRating: number;
  avgContentRating: number;
  level: number;
  creditPoints: number;
  school: string;
  academicOrg: string;
  scaBand: number;
  requisites: Requisites;
  offerings: Offering[];
  tags: UnitTag[];
  aiOverview: AiOverview;
}
export interface IUnitPopulated extends Omit<IUnit, 'reviews'> {
  reviews: IReview[];
}
export interface IUnitDeeplyPopulated extends Omit<IUnit, 'reviews'> {
  reviews: IReviewAuthorPopulated[];
}

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
