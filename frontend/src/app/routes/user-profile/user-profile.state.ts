import { IReviewFullyPopulated } from "app/shared/models/v2/review.schema";
import { IUser } from "@models/user.schema";

export interface State {
  username: string | null;
  user: IUser | null;
  profileImg: string;
  isCurrentUser: boolean;
  reviews: IReviewFullyPopulated[];
}
