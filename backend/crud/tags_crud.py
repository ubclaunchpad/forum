from database.db import supabase
import uuid


def create_tag(course_id, req):  # Still need to validate for admin permissions
    tag_id = uuid.uuid4()
    if req["colour"]:
        res = (
            supabase.table("course_tags")
            .insert(
                {
                    "id": str(tag_id),
                    "course_id": course_id,
                    "colour": req.get("colour"),
                    "name": req["name"],
                    "parent_id": req.get("parent_id"),
                }
            )
            .execute()
        )
    return res


def get_tags(course_id):  # Still need to check if user has access to course via roles
    res = (
        supabase.table("course_tags")
        .select("name")
        .eq("course_id", course_id)
        .execute()
    )
    return res


def update_tag(tag_id, req):
    res = (
        supabase.table("course_tags")
        .update({"name": req["name"], "colour": req.get("colour")})
        .eq("id", tag_id)
        .execute()
    )
    return res


def delete_tag(
    tag_id,
):  # Check user is admin before making the delete//Also delete content once content portion of database is made
    children = (
        supabase.table("course_tags")
        .update({"parent_id": None})
        .eq("parent_id", tag_id)
        .execute()
    )
    res = supabase.table("course_tags").delete().eq("id", tag_id).execute()
    return res


def get_content(course_id, tag_id):  # Check user course access//list all course content
    return
