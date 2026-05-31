import asyncio
import asyncpg
import os
import sys

# Ensure backend directory is in the import path
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from services.gemini import build_scheme_search_text, generate_embedding
from dotenv import load_dotenv

load_dotenv(os.path.join(BACKEND_DIR, ".env"))

async def generate_all_embeddings():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("[ERROR] DATABASE_URL not set in environment.")
        return
    
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        print("[ERROR] GEMINI_API_KEY not set in environment. Cannot proceed with embedding generation.")
        return
        
    print("Connecting to Supabase database...")
    try:
        conn = await asyncpg.connect(dsn=db_url, ssl="require")
        print("[SUCCESS] Database connected successfully.")
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
        return
        
    print("Fetching active schemes...")
    rows = await conn.fetch("SELECT * FROM schemes WHERE active = TRUE")
    print(f"Found {len(rows)} active schemes to embed.")
    
    success = 0
    errors = 0
    
    for row in rows:
        scheme = dict(row)
        scheme_id = scheme["scheme_id"]
        name = scheme["name"]
        print(f"Generating embedding for: '{name}' ({scheme_id})...")
        
        # Build the descriptive semantic indexing chunk
        search_text = build_scheme_search_text(scheme)
        
        try:
            # Generate the 768-dimensional embedding from text-embedding-004
            vector = await generate_embedding(search_text)
            
            # Save into Postgres pgvector embedding field
            await conn.execute(
                "UPDATE schemes SET embedding = $1 WHERE scheme_id = $2",
                str(vector),
                scheme_id
            )
            success += 1
            print("  [SUCCESS] Saved vector successfully.")
        except Exception as e:
            errors += 1
            print(f"  [ERROR] Error processing scheme '{scheme_id}': {e}")
            
    await conn.close()
    print("\n=== Embedding CLI Job Complete ===")
    print(f"  Successfully processed: {success}")
    print(f"  Errors / Failures:      {errors}")


if __name__ == "__main__":
    asyncio.run(generate_all_embeddings())
