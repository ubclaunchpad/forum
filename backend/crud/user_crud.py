from database.db import supabase


# Creates user in supabase
def create_user(user):
    response = supabase.auth.sign_up(
        {
            "email": user.email,
            "password": user.password,
            "options": {
                "data": {
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                }
            },
        }
    )

    return response


# Get all users from supabase
def get_all_users():
    # Requires valid RLS access to work
    response = supabase.table("profiles").select("*").execute()
    return response


# Gets user by id from supabase
def get_user_by_id(id: str):
    # Requires valid RLS access to work
    response = supabase.table("profiles").select("*").eq("id", id).execute()
    return response.data


# Updates user in supabase
def update_user_by_id(user_id: int, updated_fields):
    return None


# Deletes user in supabase using their id
def delete_user_by_id(id: int):
    return False


# Gets user by email from supabase
def get_user_by_email(email: str):
    return None


# Updates user in supabase
def update_user_by_email(email: str, updated_fields):
    return None


# Deletes user in supabase using their email
def delete_user_by_email(email: str):
    return False
