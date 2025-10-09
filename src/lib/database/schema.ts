import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  profilePicture: varchar('profile_picture', { length: 500 }),
  role: varchar('role', { length: 20 }).default('user').notNull(), // 'user' or 'admin'
  questionnaire: jsonb('questionnaire'), // Stores questionnaire answers
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'image' or 'pdf'
  content: text('content').notNull(), // URL or file path
  testId: varchar('test_id', { length: 50 }), // for PDF tests: 'blood', 'hormone', etc.
  processed: boolean('processed').default(false).notNull(),
  extractedData: jsonb('extracted_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const nutritionReviews = pgTable('nutrition_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').references(() => posts.id).notNull(),
  reviewerName: varchar('reviewer_name', { length: 255 }).notNull().default('Доктор Виктория'),
  reviewData: jsonb('review_data'), // Full review structure from mobile app
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  reviews: many(nutritionReviews),
}));

export const nutritionReviewsRelations = relations(nutritionReviews, ({ one }) => ({
  post: one(posts, {
    fields: [nutritionReviews.postId],
    references: [posts.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type NutritionReview = typeof nutritionReviews.$inferSelect;
export type NewNutritionReview = typeof nutritionReviews.$inferInsert;