import { ProfileWithoutId, NewCourse } from "@shared/mod.ts";
import { supa } from "../../../../_shared/db.ts";

export const authUsers = [
  {
    email: "admin@test.com",
    password: "Test123!!",
  },
  {
    email: "user@test.com",
    password: "Test123!!",
  },
  {
    email: "user2@test.com",
    password: "Test123!!",
  },
];

export const profiles: ProfileWithoutId[] = [
  {
    first_name: "Admin",
    last_name: "Test",
    email: "admin@test.com",
    username: "admin",
    display_name: "Admin Test",
    pronouns: "he/him",
    avatar_url: "https://example.com/avatar.png",
    bio: "I am an admin",
    social_links: [],
  },
  {
    first_name: "User",
    last_name: "Test",
    email: "user@test.com",
    username: "user",
    display_name: "User Test",
    pronouns: "he/him",
    avatar_url: "https://example.com/avatar.png",
    bio: "I am a user",
    social_links: [],
  },

  {
    first_name: "User",
    last_name: "Test",
    email: "user2@test.com",
    username: "user2",
    display_name: "User Test 2",
  },
];

export const coursesToCreate: NewCourse[] = [
  {
    department: "TEST",
    code: 101,
    section: "001",
    name: "Test Course",
    access: "public",
  },
  {
    department: "TEST 2",
    code: 102,
    section: "002",
    name: "Test Course 2",
    access: "public",
  }
];

export const beforeEachFunc = async () => {
    const users = await supa.auth.admin.listUsers();
    for (const user of users.data.users) {
      await supa.auth.admin.deleteUser(user.id);
    }
    const checkUsers = await supa.auth.admin.listUsers();
    console.log("checkUsers", checkUsers);
  };

export const afterEachFunc = async () => {
    const users = await supa.auth.admin.listUsers();
    for (const user of users.data.users) {
      await supa.auth.admin.deleteUser(user.id);
    }
    await supa.from("courses").delete().not('id', 'is', null);
  }