import { sqlClient } from "../../../_shared/db.ts";
import { MutatePostOptions, PostCommentReply } from "@shared/mod.ts";
import { generatePseudonym } from "../helpers.ts";

export async function createReply(
  user_id: string,
  comment_id: string,
  content: string,
  options: MutatePostOptions
): Promise<PostCommentReply> {
  const sql = sqlClient();

  const pseudonym = generatePseudonym();

  const reply = await sql.begin(async (tx) => {
    const [newReply] = await tx`
        INSERT INTO post_comment_replies (comment_id, content)
        VALUES (${comment_id}, ${content})
        RETURNING *
    `;

    if (!newReply) {
        throw new Error("Failed to create comment reply");
    }

    const commentAuthor = await sql`
        SELECT * FROM post_authors WHERE comment_id = ${comment_id} LIMIT 1
    `;

    if (!commentAuthor || commentAuthor.length === 0) {
        throw new Error("Author for comment not found");
    }

    const post_id = commentAuthor[0].post_id;
    
    const [authorPseudonym] = await tx`
        INSERT INTO post_author_pseudonyms (post_id, user_id, pseudonym)
        VALUES (${post_id}, ${user_id}, ${pseudonym})
        ON CONFLICT (post_id, user_id) DO UPDATE
            SET pseudonym = post_author_pseudonyms.pseudonym
        RETURNING *
    `;

    if (!authorPseudonym || authorPseudonym.length === 0) {
        throw new Error("Failed to create author pseudonym");
    }

    const [author] = await tx`
        INSERT INTO post_authors (post_id, reply_id, comment_id, user_id, is_anonymous, visibility)
        VALUES (${post_id}, ${newReply.id}, ${comment_id}, ${user_id}, ${options.use_pseudonym}, ${options.visibility})
        RETURNING *
    `;

    if (!author) {
        throw new Error("Failed to create post author entry");
    }

    return {
        ...newReply,
        authors: [{
            ...author,
            pseudonym: authorPseudonym.pseudonym
        }]
    };
  });

  return reply as PostCommentReply;
}
