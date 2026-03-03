import { z } from 'zod';

export const BaseJobSchema = z.object({
  notionId: z.string(),
  lastVerified: z.date().pipe(z.coerce.date()),
  status: z.enum(['OPEN', 'CLOSED']),
  sourceLink: z.url(),
  scope: z.string(),
  applicationLink: z.url(),
  eligibility: z.string(),
  roleType: z.array(z.string()),
  interviewWindow: z.union([z.string(), z.date().pipe(z.coerce.date())]),
  opportunityTitle: z.string(),
  timeCommitment: z.array(z.string()),
  closeDate: z.date().pipe(z.coerce.date()),
  organisation: z.string(),
});

export interface IJob extends z.infer<typeof BaseJobSchema> {}
