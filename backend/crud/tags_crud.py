from database.db import supabase
import uuid

def create_tag(course_id, req):
    tag_id = uuid.uuid4()
    res = (supabase.table("course_tags")
           .insert({"id" : str(tag_id),
                    "course_id" : course_id,
                    "colour" : req["colour"],
                    "name" : req["name"],
                    "parent_id" : req["parent_id"]})
            .execute())
    return res

def get_tags(course_id):
    res = (supabase.table("course_tags").select("name").eq("course_id", course_id).execute())
    return res

def update_tag(tag_id, req):
    res = (supabase.table("course_tags")
            .update({"name" : req["name"],
                    "colour" : req["colour"]})
            .eq("id", tag_id)
            .execute())
    return res

def delete_tag(tag_id):
    children = (supabase.table("course_tags")
                .update({"parent_id" : None})
                .eq("parent_id", tag_id)
                .execute())
    res = (supabase.table("course_tags").delete().eq("id", tag_id).execute())
    return res

def get_content(course_id, tag_id):
    return