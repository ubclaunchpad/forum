import {
  courseTestSeedSetup,
  postTestSeedSetup,
  userTestSeedSetup,
} from "../../../_dev/setup.ts";
import {
  NewCourse,
  NewPost,
  NewPostOptions,
  ProfileWithoutId,
} from "@shared/mod.ts";
import { PSEUDONYM } from "../../../posts/controllers/helpers.ts";
import { supa } from "../../../_shared/db.ts";

/**
 * Setup function for creating temporary users, user profiles and courses for testing
 * @param authUsers
 * @param profiles
 * @param coursesToCreate
 * @returns A list of profile objects and a list of course objects
 * NOTE: All courses will be created (and hence only be accessible to) by user in tempProfiles[0]
 */
export async function userCourseSeedSetup(
  authUsers: { email: string; password: string }[],
  profiles: ProfileWithoutId[],
  coursesToCreate: NewCourse[],
) {
  const tempProfiles = await userTestSeedSetup(authUsers, profiles);
  const tempCourses = await courseTestSeedSetup(
    coursesToCreate,
    tempProfiles[0].id,
  );
  return { tempProfiles, tempCourses };
}

/**
 * Setup function for creating temporary users, user profiles, courses and posts for testing
 * @param authUsers
 * @param profiles
 * @param coursesToCreate
 * @param postsToCreate
 * @param postOptions
 * @returns A list of profile objects, list of course objects and a list of posts
 * NOTE: All courses and posts will be created (and hence only be accessible to) by user in tempProfiles[0]
 */
export async function postSeedSetup(
  authUsers: { email: string; password: string }[],
  profiles: ProfileWithoutId[],
  coursesToCreate: NewCourse[],
  postsToCreate: NewPost[],
  postOptions: NewPostOptions,
) {
  const { tempProfiles, tempCourses } = await userCourseSeedSetup(
    authUsers,
    profiles,
    coursesToCreate,
  );

  for (const post of postsToCreate) {
    post.course_id = tempCourses[0].id;
  }

  const tempPosts = await postTestSeedSetup(
    postsToCreate,
    postOptions,
    tempProfiles[0].id,
  );

  console.log("tempPosts", tempPosts);

  return { tempProfiles, tempCourses, tempPosts };
}

export const clearUsers = async () => {
  const users = await supa.auth.admin.listUsers();
  for (const user of users.data.users) {
    await supa.auth.admin.deleteUser(user.id);
  }
  const checkUsers = await supa.auth.admin.listUsers();
  console.log("checkUsers", checkUsers);
};

export const clearUsersAndCourses = async () => {
  const users = await supa.auth.admin.listUsers();
  for (const user of users.data.users) {
    await supa.auth.admin.deleteUser(user.id);
  }
  await supa.from("courses").delete().not("id", "is", null);
};

/**
 * Checks if given string is a possible pseudonym
 * @param str
 * @returns true if given pseudonym is valid, false otherwise
 */
export function checkPseudonym(str: string) {
  const parts = str.split("_");
  if (parts.length < 3) {
    return false;
  }
  return PSEUDONYM[0].includes(parts[0]) && PSEUDONYM[1].includes(parts[1]) &&
    PSEUDONYM[2].includes(parts[3]);
}
