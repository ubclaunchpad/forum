import { MutatePostOptions, PostAuthor, PostCommentReply } from "@shared/mod.ts";
import { sqlClient } from "../../../_shared/db.ts";

export async function updateReply(
  reply_id: string,
  user_id: string,
  newContent: string,
  options: MutatePostOptions,
): Promise<PostCommentReply> {
  const sql = sqlClient();

  const result = await sql.begin(async (tx) => {
    const [reply] = await tx`
      SELECT * FROM post_comment_replies WHERE id = ${reply_id}
    `;
    if (!reply) {
      throw new Error("Reply does not exist");
    }

    const authors = await tx`
      SELECT * FROM post_authors WHERE reply_id = ${reply_id}
    `;

    if (!authors || authors.length === 0) {
        throw new Error(`Failed to retrieve authors for reply ${reply_id}`);
    }

    const post_id = authors[0].post_id;

    const [author] = await tx`
        INSERT INTO post_authors (reply_id, comment_id, post_id, user_id, is_anonymous, visibility)
        VALUES (
          ${reply_id},
          ${reply.comment_id},
          ${post_id},
          ${user_id},
          ${options.use_pseudonym ?? false},
          ${options.visibility}
        ) 
        ON CONFLICT (reply_id, user_id, post_id, comment_id) DO UPDATE
            SET user_id = post_authors.user_id
        RETURNING *
    `;

    if (!author || author.length === 0) {
        throw new Error("Failed to create author pseudonym");
    }

    const [updatedReply] = await tx`
      UPDATE post_comment_replies
      SET content = ${newContent}, updated_at = ${new Date()}
      WHERE id = ${reply_id}
      RETURNING *
    `;

    if (!updatedReply) {
      throw new Error("Failed to update reply");
    }

    return {
        ...updatedReply,
        authors: authors.push(author)
    };
  });

  await sql.end();
  return result as unknown as PostCommentReply;
}
