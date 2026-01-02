import { IUnit } from './unit.model';
import { UserData } from './user.model';

export interface IReview {
  _id: string;
  title: string;
  semester: string;
  year: number;
  grade: string;
  overallRating: number;
  relevancyRating: number;
  facultyRating: number;
  contentRating: number;
  description: string;
  likes: number;
  dislikes: number;
  unit: string[] | IUnit;
  author: string | UserData;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewAuthorPopulated extends Omit<IReview, 'author'> {
  author: UserData;
}
