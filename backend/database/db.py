import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
test_user_uuid: str = os.environ.get("SUPABASE_TEST_USER_UUID") or ""
# use the service key rather than the public api key to bypass RLS

print(url)
print(key)

supabase: Client = create_client(url, key)

print(supabase)
