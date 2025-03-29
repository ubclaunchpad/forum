import {
  NewCourse,
  ProfileWithoutId,
  User,
} from "@shared/mod.ts";
import { userController } from "../users/controller.ts";
import { getSupabaseClient, supa } from "../_shared/db.ts";
import { createCourse } from "../courses/controller/create_course_activity.ts";
import { deleteCourse } from "../courses/controller/delete_course_activity.ts";
import { getAllCourses } from "../courses/controller/get_all_courses_activity.ts";
import { getAllPosts } from "../posts/controllers/helpers.ts";
import { createPost, deletePost, getPosts } from "../posts/controllers/crud.ts";
import { documentHandler } from "../documents/documentController.ts";
import { DEFAULT_FILE_MANAGER_OPTIONS, fileManager } from "../_shared/utils/fileManager.ts";


const authUsers = [
  {
    email: "admin@test.com",
    password: "Test123!",
  },
  {
    email: "user@test.com",
    password: "Test123!",
  },
  {
    email: "user2@test.com",
    password: "Test123!",
  },
];

const profiles: ProfileWithoutId[] = [
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

const courses: NewCourse[] = [
  {
    code: 301,
    department: "CS",
    section: "001",
    access: "public",
    name: "Introduction to Computer Science",
    config: {
      theme_colour: "#347370",
      font: "Quicksand",
    },
    start_date: new Date("2024-01-01"),
  },
  {
    code: 302,
    department: "CS",
    section: "002",
    access: "public",
    name: "Introduction to Computer Science",
    config: {
      theme_colour: "#B2ABF2",
      font: "Space Grotesk",
    },
  },
];

const postArgs = [
  {
    title: "Post 1",
    content: "This is post 1",
  },
  {
    title: "Post 2",
    content: "this is a very long post that is more than 200 characters" + "a".repeat(200)
  },
  {
    title: "Post 3",
    content: "This is post 3",
  },
  {
    title: "Post 4",
    content: "This is post 4",
  },
  {
    title: "Post 5",
    content: "This is post 5",
  },
];

/**
 * This file is used to setup the database for development purposes.
 * It is gitignored so it is not committed to the repo.
 * When you run e2e tests, your database will be reset.
 * This file will be used to reset and fill the database with any data you need that would take the pain of redoing it every time.
 */
export async function setupDevSeedData() {
  console.log("Setting up dev seed data");
  await emptyDatabase();
  console.log("Database emptied");

  const { data: image_url } = await supa.storage.from("images").getPublicUrl(
    "defaults/default1.png",
  );
  const users = [];

  for (let i = 0; i < authUsers.length; i++) {
    const user = authUsers[i];
    const result = await userController.createUserViaEmailPassword({
      email: user.email,
      password: user.password,
    });

    users.push(result);
  }

  console.log("Users created:", users);

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    const profileWithImage = {
      ...profile,
      avatar_url: image_url.publicUrl,
    };
    await userController.approveUserAccount(users[i].id);
    await userController.activateAccountAndProfile(
      users[i].id,
      profileWithImage,
    );
    const status = await userController.getUserAccountStatus(users[i].id);
    console.log("Status:", status);
  }

  console.log("Profiles created:", profiles);
  await userController.makeUserAdmin(users[0].id);

  // create two courses
  const course1 = await createCourse(courses[0], users[0].id);
  const course2 = await createCourse(courses[1], users[0].id);

  console.log("Courses created:", course1, course2);
  console.log("Database setup complete");

  // create a document
  // const documentController = documentHandler();
  // const localFilePathRelative = "supabase/functions/_dev/test_data/bayou.pdf";
  // const localFilePath = Deno.cwd() + "/" + localFilePathRelative;
  // const localFile = Deno.readFileSync(localFilePath)
  // const file = new File([localFile], localFilePathRelative, { type: "application/pdf" });
  // const document = await documentController.withCourse(course1.id).createDocument({description: "Test document", file: file, createdBy: users[0].id }); 
  // console.log("Document created", document);

  // create posts
  const post1 = await createPost(users[0].id, {title: "Post 1", content: "This is post 1", course_id: course1.id}, {visibility: "public", usePseudonym: true});
  console.log("Post created", post1);

  const post2 = await createPost(users[0].id, {title: "Post 2", content: "This is post 2 " + "a".repeat(200) + "b".repeat(500), course_id: course1.id}, {visibility: "public", usePseudonym: true});
  console.log("Post created", post2);

  const post3 = await createPost(users[0].id, {title: "Post 3", content: "This is post 3", course_id: course1.id}, {visibility: "public", usePseudonym: true});
  console.log("Post created", post3);

  console.log("--------------------------------");
  const listPosts = await getPosts(users[0].id, course1.id, false, false);
  console.log("List of posts", listPosts);
}

export async function emptyDatabase() {
  const fakeUUID = "00000000-0000-0000-0000-000000000000";

  const {error: profilesError} = await supa.from("profiles").delete().neq("id", fakeUUID);
  if (profilesError) {
    console.error("Error deleting profiles:", profilesError);
  }
  const {error: courseRolesError} = await supa.from("courses").delete().neq("id", fakeUUID);
  if (courseRolesError) {
    console.error("Error deleting courses:", courseRolesError);
  }

  const courses = await supa.from("courses").select("*");
  console.log("Courses:", courses);
  const users2 = await supa.auth.admin.listUsers();
  for (const user of users2.data.users) {
    await supa.auth.admin.deleteUser(user.id);
  }
 
}

// emptyDatabase();
// setupDevSeedData();

export async function userTestSeedSetup(
  authUsers: { email: string; password: string }[],
  profiles: ProfileWithoutId[],
): Promise<User[]> {
  // console.log("Setting up test seed data");
  await emptyDatabase();

  const { data: image_url } = await supa.storage.from("images").getPublicUrl(
    "defaults/default1.png",
  );
  const users = [];

  for (let i = 0; i < authUsers.length; i++) {
    const user = authUsers[i];
    const result = await userController.createUserViaEmailPassword({
      email: user.email,
      password: user.password,
    });

    users.push(result);
  }

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    const profileWithImage = {
      ...profile,
      avatar_url: image_url.publicUrl,
    };
    await userController.approveUserAccount(users[i].id);
    await userController.activateAccountAndProfile(
      users[i].id,
      profileWithImage,
    );
     await userController.getUserAccountStatus(users[i].id);
    // console.log("Status:", status);
  }

  return userController.getAllUsers();
}

export async function courseTestSeedSetup(
  coursesToCreate: NewCourse[],
  creatorId: string,
) {
  //clean up any existing courses
  const courses = await getAllCourses();
  for (const course of courses) {
    await deleteCourse(course.id);
  }
  const coursesCreated = [];
  for (const course of coursesToCreate) {
    const createdCourse = await createCourse(course, creatorId);
    coursesCreated.push(createdCourse);
  }
  return coursesCreated;
}

export async function postTestSeedSetup(
  postsToCreate: NewPost[],
  postOptions: NewPostOptions,
  creatorId: string,
) {
  const posts = await getAllPosts();

  // Assume all posts created by same profile
  for (const post of posts) {
    await deletePost(post.id, creatorId);
  }

  const postsCreated = [];
  for (const post of postsToCreate) {
    const createdPost = await createPost(creatorId, post, postOptions);
    postsCreated.push(createdPost);
  }
  return postsCreated;
}
// emptyDatabase().then(() => {
//   console.log("Database emptied");
//   setupDevSeedData().then(() => {
//     console.log("Database setup complete");
//   });
// });
