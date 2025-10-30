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
  content: text('content'), // URL or file path (photo/pdf), nullable for text-only posts
  photos: jsonb('photos'), // Array of photo URLs for multi-photo posts: ['url1', 'url2']
  description: text('description'), // User text/description for the post
  testId: varchar('test_id', { length: 50 }), // for PDF tests: 'blood', 'hormone', etc.
  processed: boolean('processed').default(false).notNull(),
  extractedData: jsonb('extracted_data'),
  commentsAllowed: boolean('comments_allowed').default(true).notNull(), // Whether user can comment
  tag: varchar('tag', { length: 50 }), // 'food', 'test', 'question', null
  happenedAt: timestamp('happened_at'), // When the event happened (food consumed, test taken, etc.)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const nutritionReviews = pgTable('nutrition_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').references(() => posts.id).notNull(),
  userId: uuid('user_id').references(() => users.id), // For user comments
  reviewerName: varchar('reviewer_name', { length: 255 }).notNull().default('Доктор Виктория'),
  reviewData: jsonb('review_data'), // Full review structure from mobile app (or simple text for user comments)
  isUserComment: boolean('is_user_comment').default(false).notNull(), // true = user comment, false = doctor review
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
  user: one(users, {
    fields: [nutritionReviews.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type NutritionReview = typeof nutritionReviews.$inferSelect;
export type NewNutritionReview = typeof nutritionReviews.$inferInsert;