import { z } from 'zod';

// --- Shared Enums ---
export const RoleEnum = z.enum(['CITIZEN', 'OFFICER', 'CONTROL_ROOM', 'AUTHORITY']);
export const ComplaintTypeEnum = z.enum([
  'CIVIL', 'CRIMINAL', 'CYBER_CRIME', 'MISSING_PERSON', 
  'TRAFFIC', 'WOMEN_SAFETY', 'CHILD_SAFETY', 'DOMESTIC_VIOLENCE'
]);

// --- SOS Schemas ---
export const createSosSchema = z.object({
  coordinates: z.tuple([z.number(), z.number()]),
  servicesRequired: z.array(z.enum(['POLICE', 'AMBULANCE', 'FIRE'])).min(1),
});
export type CreateSosSchema = z.infer<typeof createSosSchema>;

// --- FIR Schemas ---
export const createFIRSchema = z.object({
  complaintId: z.string(),
  accusedDetails: z.string().optional(),
  incidentDetails: z.string(),
  witnesses: z.array(z.string()).optional(),
  officerRemarks: z.string().optional(),
});
export type CreateFIRSchema = z.infer<typeof createFIRSchema>;

export const aiDraftSchema = z.object({
  informalDescription: z.string().min(10),
});
export type AiDraftSchema = z.infer<typeof aiDraftSchema>;

// --- Dispatch Schemas ---
export const updateStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'EN_ROUTE', 'ON_SCENE', 'COMPLETED']),
});
export type UpdateStatusSchema = z.infer<typeof updateStatusSchema>;

export const createDispatchSchema = z.object({
  incidentId: z.string(),
  unitType: z.enum(['POLICE', 'MEDICAL', 'FIRE']),
});
export type CreateDispatchSchema = z.infer<typeof createDispatchSchema>;

// --- Complaint Schemas ---
export const createComplaintSchema = z.object({
  type: ComplaintTypeEnum,
  title: z.string().min(5),
  description: z.string().min(20),
  incidentDate: z.string().datetime(),
  location: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
    address: z.string().optional(),
  }),
  evidenceUrls: z.array(z.string()).optional(),
});
export type CreateComplaintSchema = z.infer<typeof createComplaintSchema>;

// --- Auth Schemas ---
export const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: RoleEnum.optional(),
});
export type RegisterSchema = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginSchema = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  password: z.string().min(6).optional(),
});
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
