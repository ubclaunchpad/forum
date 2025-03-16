import { supa } from "../../_shared/db.ts";

/**
 * Checks whether post exists or not
 * @returns True if the post exists, false otherwise
 */
export async function postExists(postId: string) : Promise<boolean> {
    const {count, error} = await supa.from("posts").select('*', { count: 'exact', head: true }).eq("id", postId);

    if (error) {
        throw error;
    }

    if (count == 0) {
        return false
    }

    return true
}

/**
 * Checks whether post exists within scope of course or not
 * @returns True if the post does exist, false otherwise
 */
export async function postExistsInCourse(numberId: string, courseId: string) : Promise<boolean> {
    const {count, error} = await supa.from("posts").select('*', { count: 'exact', head: true })
                            .eq("number_id", numberId).eq("course_id", courseId);

    if (error) {
        throw error;
    }

    if (count == 0) {
        return false
    }

    return true
}

/**
 * Checks if user is able to perform operation on given post 
 * @param postId 
 * @param userId 
 * @param operation 
 */
export async function getPostPermission(postId: string, userId: string, operation: 'create' | 'delete' | 'update' | 'get') {
  
}

export function generatePseudonym() {
  const adjective =
    PSEUDONYM[0][Math.floor(Math.random() * PSEUDONYM[0].length)];
  const color = PSEUDONYM[1][Math.floor(Math.random() * PSEUDONYM[1].length)];
  const animal = PSEUDONYM[2][Math.floor(Math.random() * PSEUDONYM[2].length)];
  return `${adjective}_${color}_${animal}`;
}

export const PSEUDONYM = [
  [
    "Small",
    "Smart",
    "Curious",
    "Adventurous",
    "Playful",
    "Friendly",
    "Courageous",
    "Clever",
    "Quick",
    "Clever",
  ],
  [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Orange",
    "Purple",
    "Pink",
  ],
  [
    "Cat",
    "Dog",
    "Bird",
    "Fish",
    "Snake",
    "Lizard",
    "Turtle",
    "Snake",
  ],
];


