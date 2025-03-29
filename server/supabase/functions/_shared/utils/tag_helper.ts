import { Tag, NestedTag } from "@shared/schema/tag.ts";
import { supa } from "../db.ts";
import { NotFoundError } from "../errors.ts";

export async function getTag(tag_id: string): Promise<Tag> {
    const { data: tagData, error: tagError } = await supa.from("tags").select("*").eq("id", tag_id);

    if (tagError) {
        throw new Error(`Failed to get tag ${tag_id}: ${tagError.message}`);
    }

    if (!tagData || tagData.length !== 1) {
        throw new NotFoundError(`Tag ${tag_id} was not found`);
    }

    return tagData[0] as Tag;
}

export async function getTagNested(tag_id: string): Promise<NestedTag> {
    const { data: tagdata, error: tagError } = await supa.rpc('get_tag_with_nested_parents', {tag_id: tag_id});

    if (tagError) {
        throw new Error(`Failed to retrieve the nested tag ${tag_id}: ${tagError.message}`);
    }

    return tagdata as NestedTag;
}