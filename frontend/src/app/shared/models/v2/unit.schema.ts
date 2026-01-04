import { z } from 'zod';
import {
  IReview,
  ReviewAuthorPopulatedSchema,
  ReviewSchema,
} from './review.schema';

const UnitTagEnum = z.enum(['most-reviews', 'controversial', 'wam-booster']);
const RequisiteSchema = z.object({
  NumReq: z.number().optional(),
  units: z.array(z.string()).default([]),
});
const RequisitesSchema = z.object({
  permission: z.boolean().default(false),
  prohibitions: z.array(z.string()).default([]),
  corequisites: z.array(RequisiteSchema).default([]),
  prerequisites: z.array(RequisiteSchema).default([]),
  cpRequired: z.number().default(0),
});
const OfferingSchema = z.object({
  location: z.string(),
  mode: z.string(),
  name: z.string(),
  period: z.string(),
});
export interface IOffering extends z.infer<typeof OfferingSchema> {}

const AiOverviewSchema = z.object({
  summary: z.string().optional(),
  generatedAt: z.date().optional(),
  model: z.string().optional(),
  totalReviewsConsidered: z.number().optional(),
  setuSeasons: z.array(z.string()).optional(),
});
export interface AiOverview extends z.infer<typeof AiOverviewSchema> {}

const BaseUnitSchema = z.object({
  _id: z.string(),
  unitCode: z.string().regex(/^[A-Za-z]{3}\d{4}$/),
  name: z.string().min(1),
  description: z.string().min(1),

  avgOverallRating: z.number().min(0).max(5).default(0),
  avgRelevancyRating: z.number().min(0).max(5).default(0),
  avgFacultyRating: z.number().min(0).max(5).default(0),
  avgContentRating: z.number().min(0).max(5).default(0),

  level: z.number(),
  creditPoints: z.number(),
  school: z.string(),
  academicOrg: z.string(),
  scaBand: z.string(),

  requisites: RequisitesSchema,
  offerings: z.array(OfferingSchema).default([]),

  tags: z.array(UnitTagEnum).default([]),

  aiOverview: AiOverviewSchema.optional(),
});

// Had to add reviews field manually to fix circular type inference
export interface IUnit extends z.infer<typeof BaseUnitSchema> {
  reviews: (string | IReview)[];
}
export const UnitSchema: z.ZodType<IUnit> = BaseUnitSchema.extend({
  reviews: z
    .array(z.union([z.string(), z.lazy(() => ReviewSchema)]))
    .default([]),
});

export const UnitPopulatedSchema = BaseUnitSchema.extend({
  reviews: z.array(ReviewSchema),
});
export interface IUnitPopulated extends z.infer<typeof UnitPopulatedSchema> {}

export const UnitDeeplyPopulatedSchema = BaseUnitSchema.extend({
  reviews: z.array(ReviewAuthorPopulatedSchema),
});
export interface IUnitDeeplyPopulated extends z.infer<
  typeof UnitDeeplyPopulatedSchema
> {}
