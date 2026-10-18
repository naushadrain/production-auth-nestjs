
import {
  uuid,
  varchar,
  pgEnum,
  pgTable,
  timestamp,
  boolean,
  text,
} from 'drizzle-orm/pg-core';

// ==================================================
// 1. ENUMS: Restrict columns to predefined values
// ==================================================

// Allowed user roles: 'user' or 'admin'
export const userRoleEnum = pgEnum('user_role', [
  'user',
  'admin',
]);

// Allowed task statuses
export const taskStatusEnum = pgEnum('task_status_enum', [
  'todo',
  'in_progress',
  'done',
]);

// ==================================================
// 2. USERS TABLE
// ==================================================

export const users = pgTable('users', {
  // UUID primary key generated automatically by PostgreSQL
  id: uuid('id').defaultRandom().primaryKey(),

  // User email; must be unique and cannot be NULL
  email: varchar('email', { length: 255 })
    .notNull()
    .unique(),

  // Stores the HASHED password, never the plain password
  passwordHash: varchar('password_hash', { length: 255 })
    .notNull(),

  // User's display name
  name: varchar('name', { length: 255 })
    .notNull(),

  // Account role; new accounts default to 'user'
  role: userRoleEnum('role')
    .notNull()
    .default('user'),

  // Whether the user's email has been verified
  isVerified: boolean('is_verified')
    .notNull()
    .default(false),

  // Token used to verify the user's email
  verificationToken: text('verification_token'),

  // Expiration time for the verification token
  verificationTokenExpiresAt: timestamp(
    'verification_token_expires_at',
    { withTimezone: true },
  ),

  // Token used for password reset
  resetToken: text('reset_token'),

  // Expiration time for the password-reset token
  resetTokenExpiresAt: timestamp(
    'reset_token_expires_at',
    { withTimezone: true },
  ),

  // Stores a HASH of the refresh token, not the raw token
  refreshTokenHash: text('refresh_token_hash'),

  // Time when the user record was created
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  // Time when the user record was last updated
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ==================================================
// 3. TASKS TABLE
// ==================================================

export const tasks = pgTable('tasks', {
  // UUID primary key generated automatically
  id: uuid('id').defaultRandom().primaryKey(),

  // Task title; required
  title: varchar('title', { length: 255 })
    .notNull(),

  // Optional task description
  description: text('description'),

  // Task status; defaults to 'todo'
  status: taskStatusEnum('status')
    .notNull()
    .default('todo'),

  // Foreign key referencing users.id
  // Each task must belong to an existing user
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),

  // Time when the task was created
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  // Time when the task was last updated
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ==================================================
// 4. TYPESCRIPT TYPES INFERRED FROM THE SCHEMA
// ==================================================

// User returned from a SELECT query
export type User = typeof users.$inferSelect;

// Data accepted for an INSERT query
export type NewUser = typeof users.$inferInsert;

// Task returned from a SELECT query
export type Task = typeof tasks.$inferSelect;

// Data accepted for an INSERT query
export type NewTask = typeof tasks.$inferInsert;
