import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    raise ValueError("Supabase credentials not found in .env")

# The connection object
supabase: Client = create_client(url, key)


def test_connection() -> tuple[bool, str]:
    try:
        supabase.auth.admin.list_users(page=1, per_page=1)
        return True, "Supabase connection successful."
    except Exception as error:
        return False, f"Supabase connection failed: {error}"


if __name__ == "__main__":
    ok, message = test_connection()
    print(message)
    raise SystemExit(0 if ok else 1)