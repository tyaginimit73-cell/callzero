import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/, 'Username must be 3-20 chars (a-z, 0-9, _)'),
  email: z.string().trim().toLowerCase().email('Please provide a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  avatar: z.string().url('Avatar must be a URL').or(z.literal('')).optional(),
  status: z.enum(['online', 'offline', 'away', 'busy']).optional(),
});

export const contactRequestSchema = z.object({
  userId: z.string().min(1, 'User id is required'),
});

export const respondRequestSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(['accept', 'reject']),
});

export const contactUpdateSchema = z.object({
  nickname: z.string().max(40).optional(),
  favorite: z.boolean().optional(),
});

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  receiverId: z.string().min(1),
  content: z.string().min(1, 'Message cannot be empty').max(4000),
  replyTo: z.string().optional().nullable(),
});

export const emergencySchema = z.object({
  name: z.string().trim().min(1).max(60),
  relationship: z.string().max(40).optional().default(''),
  contactUser: z.string().optional().nullable(),
  phone: z.string().max(20).optional().default(''),
  priority: z.number().int().min(1).max(5).optional().default(1),
});
