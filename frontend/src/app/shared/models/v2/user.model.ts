export interface UserData {
  _id: string;
  email: string;
  username?: string;
  isGoogleUser: boolean;
  reviews: string[];
  profileImg?: string;
  admin: boolean;
  verified: boolean;

  verificationEmailsSent: number;

  refreshToken?: string;
  refreshTokenExpires?: Date;

  likedReviews: string[];
  dislikedReviews: string[];
  notifications: string[];
}
