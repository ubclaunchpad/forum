import { Tag, UpdateTag } from "@shared/schema/tag.ts";
import { supa } from "../../_shared/db.ts";
import { NotFoundError } from "../../_shared/errors.ts";

export async function updateTag(updateTagData: UpdateTag, tag_id: string) {
    const tag = await getTag(tag_id);
    const { id, ...updatedTag } = { ...tag, ...updateTagData };
    const { error } = await supa.from("tags").update(updatedTag).eq("id", tag_id);

    if (error) {
        throw new Error(`Failed to update tag ${tag_id}: ${error.message}`);
    }
}

async function getTag(tag_id: string): Promise<Tag> {
    const { data: tagData, error } = await supa.from("tags").select("*").eq("id", tag_id);

    if (error) {
        throw new Error(`Failed to get tag ${tag_id}: ${error.message}`);
    }

    if (!tagData || tagData.length !== 1) {
        throw new NotFoundError(`Tag with id ${tag_id} not found`);
    }

    return tagData[0] as Tag;
}