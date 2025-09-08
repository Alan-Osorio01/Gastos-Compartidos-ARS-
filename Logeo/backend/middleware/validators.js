const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2).max(80).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(72),
}).strict();

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(72),
}).strict();

const createGroupSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  description: z.string().max(500).trim().optional().default(''),
  currency: z.enum(['COP','USD','EUR']).default('COP'),
  isFavorite: z.boolean().optional().default(false),
  inviteEmails: z.array(z.string().email().toLowerCase().trim()).optional().default([]),
}).strict();

const updateGroupSchema = z.object({
  name: z.string().min(3).max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
}).strict();

module.exports = { registerSchema, loginSchema, createGroupSchema, updateGroupSchema };
