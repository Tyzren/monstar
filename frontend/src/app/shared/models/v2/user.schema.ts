import { z } from 'zod';

export const UserSchema = z.object({
  _id: z.string(),
  email: z.union([
    z.string().regex(/^[a-zA-Z]{4}\d{4}@student\.monash\.edu$/),
    z.string().regex(/^[a-zA-Z]+\.[a-zA-Z]+@monash\.edu$/),
  ]),
  username: z.string().optional(),
  isGoogleUser: z.boolean().default(false),
  googleID: z.string().nullable().default(null),
  
  reviews: z.array(z.string()).default([]),

  profileImg: z.string().optional(),
  admin: z.boolean().default(false),

  refreshToken: z.string().optional(),
  refreshTokenExpires: z.date().optional(),

  likedReviews: z.array(z.string()).default([]),
  dislikedReviews: z.array(z.string()).default([]),

  notifications: z.array(z.string()).default([]),
})

export interface IUser extends z.infer<typeof UserSchema> {};
