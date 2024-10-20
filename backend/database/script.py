import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")  
# use the service key rather than the public api key to bypass RLS

supabase: Client = create_client(url, key)
queries_path = "./migrations/"


def read_file(name):
    f = open(os.path.join(queries_path, name), "r")
    query = f.read()
    f.close()
    return query


def ensure_migration_log_table_exists():
    query = """
    CREATE TABLE IF NOT EXISTS migrations_log (
    migration_id TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    status BOOLEAN DEFAULT FALSE);
    """
    supabase.rpc("execute_sql", {"sql": query}).execute()
    # execute_sql(sql TEXT) is a postgres function which executes the query parameter
    # and returns true if the query was successfully ran, false otherwise


def get_applied_migrations():  # returns a dict where the key is the name of the file and the value is the status (was the query successful)
    result = supabase.table("migrations_log").select("*").execute()
    m = {}
    for i in result.data:
        m[i["migration_id"]] = i["status"]
    return m


def apply_migrations():
    migration_files = [f for f in os.listdir(queries_path)]

    applied_migrations = get_applied_migrations()

    for migration in migration_files:
        if migration not in applied_migrations or not applied_migrations[migration]:
            query = read_file(migration)
            try:
                response = supabase.rpc("execute_sql", {"sql": query}).execute()
                if response.data:
                    if (
                        migration in applied_migrations
                        and not applied_migrations[migration]
                    ):

                        (
                            supabase.table("migrations_log")
                            .update({"status": True})
                            .eq("migration_id", migration)
                            .execute()
                        )

                    elif migration not in applied_migrations:

                        (
                            supabase.table("migrations_log")
                            .insert({"migration_id": migration, "status": True})
                            .execute()
                        )

                    print(f"Successfully applied {migration}")

                else:
                    if (
                        migration in applied_migrations
                        and not applied_migrations[migration]
                    ):

                        (
                            supabase.table("migrations_log")
                            .update({"status": False})
                            .eq("migration_id", migration)
                            .execute()
                        )

                    elif migration not in applied_migrations:

                        (
                            supabase.table("migrations_log")
                            .insert({"migration_id": migration, "status": False})
                            .execute()
                        )

                    print(f"Error applying {migration}: Query error")
                    break

            except Exception as e:
                if migration not in applied_migrations:

                    (
                        supabase.table("migrations_log")
                        .insert({"migration_id": migration, "status": False})
                        .execute()
                    )

                print(f"Error applying {migration}: {e}")
                break
        else:
            print(f"{migration} was already migrated")


if __name__ == "__main__":
    ensure_migration_log_table_exists()
    apply_migrations()
