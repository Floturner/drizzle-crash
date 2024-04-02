import 'dotenv/config';

import { lte } from 'drizzle-orm';
import { db } from './drizzle/db';
import { UserPreferencesTable, UserTable } from './drizzle/schema';

async function main() {
  // Delete
  await Promise.all([db.delete(UserPreferencesTable), db.delete(UserTable)]);

  // Insert
  const createdUsers = await db
    .insert(UserTable)
    .values([
      { name: 'Reb', age: 27, email: 'dev@email.com' },
      { name: 'John', age: 30, email: 'john@mail.com' },
      { name: 'Lala', age: 25, email: 'lala@email.com' },
      { name: 'Sarah', age: 28, email: 'sarah@mail.com' },
    ])
    .returning({
      id: UserTable.id,
    });

  await db.insert(UserPreferencesTable).values(
    createdUsers.map((user) => ({
      userId: user.id,
      emailUpdates: true,
    }))
  );

  // Select with QUERY
  const users = await db.query.UserTable.findMany({
    columns: { email: true, name: true, age: true },
    with: {
      posts: true,
      preferences: {
        columns: {
          emailUpdates: true,
        },
      },
    },
    // where: (table, funcs) => funcs.lte(table.age, 27),
    // orderBy: asc(UserTable.name),
    // orderBy: (table, funcs) => funcs.asc(table.age),
  });

  console.log(users);

  // Update
  await db.update(UserTable).set({ age: 32 }).where(lte(UserTable.age, 27));

  // Select with SELECT
  const updatedUsers = await db
    .select({ id: UserTable.id, age: UserTable.age })
    .from(UserTable);
  // .where(lte(UserTable.age, 27));

  console.log(updatedUsers);
}

main();
