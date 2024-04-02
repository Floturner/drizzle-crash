import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const UserRole = pgEnum('userRole', ['ADMIN', 'BASIC']);

export const UserTable = pgTable(
  'user',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    age: integer('age').notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    role: UserRole('userRole').default('BASIC').notNull(),
  },
  (table) => {
    return {
      emailIndex: uniqueIndex('emailIndex').on(table.email),
      uniqueNameAndAge: unique('uniqueNameAndAge').on(table.name, table.age),
    };
  }
);

export const UserPreferencesTable = pgTable('userPreferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  emailUpdates: boolean('emailUpdates').notNull().default(false),
  userId: uuid('userId')
    .references(() => UserTable.id)
    .notNull(),
});

export const PostTable = pgTable('post', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  averageRating: real('averageRating').notNull().default(0),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  authorId: uuid('authorId')
    .references(() => UserTable.id)
    .notNull(),
});

export const CategoryTable = pgTable('category', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const PostCategoryTable = pgTable(
  'postCategory',
  {
    postId: uuid('postId')
      .references(() => PostTable.id)
      .notNull(),
    categoryId: uuid('categoryId')
      .references(() => CategoryTable.id)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.categoryId] }),
  })
);

// RELATIONS
export const UserTableRelations = relations(UserTable, ({ one, many }) => ({
  preferences: one(UserPreferencesTable),
  posts: many(PostTable),
}));

export const UserPreferencesRelations = relations(
  UserPreferencesTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserPreferencesTable.userId],
      references: [UserTable.id],
    }),
  })
);

export const PostRelations = relations(PostTable, ({ one, many }) => ({
  author: one(UserTable, {
    fields: [PostTable.authorId],
    references: [UserTable.id],
  }),
  postCategories: many(PostCategoryTable),
}));

export const CategoryTableRelations = relations(CategoryTable, ({ many }) => ({
  posts: many(PostCategoryTable),
}));

export const PostCategoryTableRelations = relations(
  PostCategoryTable,
  ({ one }) => ({
    post: one(PostTable, {
      fields: [PostCategoryTable.postId],
      references: [PostTable.id],
    }),
    category: one(CategoryTable, {
      fields: [PostCategoryTable.categoryId],
      references: [CategoryTable.id],
    }),
  })
);
