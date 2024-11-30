from database.db import supabase
from typing import List

def add_tag(doc_id: str, tag_ids: List[str]):
    res = {"data" : []}
    for i in tag_ids:
        temp = supabase.table("document_tags").insert({"document_id": doc_id, "tag_id" : i}).execute()
        res["data"].append(temp.data[0])
    return res

def get_tags(doc_id : str):
    res1 = (supabase.table("document_tags").select("tag_id").eq("document_id", doc_id).execute())
    res2 = {"data" : []}
    for i in res1.data:
        temp = (supabase.table("course_tags").select("id","name", "colour").eq("id", i["tag_id"]).execute())
        res2["data"].append(temp.data[0])
    return res2

def delete_tag(doc_id : str, tag_id : str):
    res = supabase.table("document_tags").delete().eq("document_id", doc_id).eq("tag_id", tag_id).execute()
    return res

def update_tag(doc_id : str, tag_ids : List[str]):
    supabase.table("document_tags").delete().eq("document_id", doc_id).execute()
    res = add_tag(doc_id, tag_ids)
    return res