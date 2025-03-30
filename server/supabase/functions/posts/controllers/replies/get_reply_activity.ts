import { PostCommentReply } from "@shared/mod.ts";
import { sqlClient } from "../../../_shared/db.ts";

export async function getReply(replyId: string): Promise<PostCommentReply> {
  const sql = sqlClient();

  const result = await sql.begin(async (tx) => {
    const [reply] = await tx`
      SELECT * FROM post_comment_replies WHERE id = ${replyId}
    `;
    if (!reply) {
      throw new Error("Reply not found");
    }

    const [authors] = await tx`
      SELECT 
        pa.user_id, pa.comment_id, pa.reply_id, pa.post_id,
        pa.is_anonymous, pa.visibility,
        pap.pseudonym
      FROM post_authors pa
      LEFT JOIN post_author_pseudonyms pap
        ON pap.user_id = pa.user_id AND pap.post_id = pa.post_id
      WHERE pa.reply_id = ${replyId}
    `;

    if (!authors || authors.length === 0) {
      throw new Error("Author for reply not found");
    }

    return {
      ...reply,
      authors: authors,
    };
  });

  await sql.end();
  return result as PostCommentReply;
}
