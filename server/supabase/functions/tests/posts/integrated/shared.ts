import {
  NewCourse,
  NewPost,
  NewPostOptions,
  ProfileWithoutId,
} from "@shared/mod.ts";

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
  },
];

export const postsToCreate: NewPost[] = [
  {
    title: "Test Post",
    content: "Test Content",
    course_id: "",
  },
  {
    title: "Test Post 2",
    content: "Test Content 2",
    course_id: "",
  },
  {
    title: "Test Post 3",
    content: "Test Content 3",
    course_id: "",
  },
  {
    title: "Test Post 4",
    content: "Test Content 4",
    course_id: "",
  },
];

export const postOptions: NewPostOptions = {
  visibility: "public",
  usePseudonym: true,
};
