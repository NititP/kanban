import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SECRET_KEY"])
res = supabase.table("cards").select("*").execute()
print("Connected! Cards in table:", res.data)