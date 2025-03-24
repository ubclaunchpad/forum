import { z } from "@shared/deps.ts";

export const testUser = {
  first_name: "Test",
  last_name: "User",
  email: "test@example.com",
  password: "securePassword123!",
  timezone: "UTC",
  pronouns: "they/them",
};

export const testUser2 = {
  first_name: "Test2",
  last_name: "User2",
  email: "test2@example.com",
  password: "securePassword123!",
  timezone: "UTC",
  pronouns: "they/them",
  username: "testuser2",
};

export const testUser1ProfileWithoutId = {
    first_name: "Test",
    last_name: "User",
    email: "test@example.com",
    username: "testuser"
};

export const testUser2ProfileWithoutId = {
    first_name: "Test2",
    last_name: "User2",
    email: "test2@example.com",
    username: "testuser2"
};

export const coursePublic = {
    department: "Test Department",
    code: 101,
    section: "A",
    name: "Test Course",
    access: "public",
};

export const coursePublic2 = {
    department: "Test Department",
    code: 102,
    section: "A",
    name: "Test Course 2",
    access: "public"
};

export const coursePrivate = {
    department: "Test Department",
    code: 200,
    section: "B",
    name: "Test Course Private",
    access: "private"
};

export const newTagPermissions = {
    can_view_post: {
        instructor: true,
        staff: true,
        student: false
    },
    can_edit_post: {
        instructor: true,
        staff: true,
        student: true
    },
    can_delete_post: {
        instructor: true,
        staff: true,
        student: false
    },
    can_change_post_visibility: {
        instructor: true,
        staff: true,
        student: false
    }
};

export const newTagData = {
    name: "New Tag",
    permissions: newTagPermissions,
    can_use_tag: {
        instructor: true,
        staff: true,
        student: false
    }
}