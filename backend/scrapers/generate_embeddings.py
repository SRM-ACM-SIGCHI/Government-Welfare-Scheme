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

async def generate_scheme_embedding(pool, scheme, sem, progress_counter):
    async with sem:
        scheme_id = scheme["scheme_id"]
        name = scheme["name"]
        search_text = build_scheme_search_text(scheme)
        
        vector = None
        for attempt in range(4):
            try:
                vector = await generate_embedding(search_text)
                if all(v == 0.0 for v in vector):
                    await asyncio.sleep(1.0 * (attempt + 1))
                    continue
                break
            except Exception as e:
                await asyncio.sleep(1.5 * (attempt + 1))
        
        if not vector or all(v == 0.0 for v in vector):
            print(f"  [FAILED] No vector generated for: {name} ({scheme_id})", flush=True)
            progress_counter["failed"] += 1
            return False

        # Save to database
        for attempt in range(3):
            try:
                async with pool.acquire() as conn:
                    await conn.execute(
                        "UPDATE schemes SET embedding = $1 WHERE scheme_id = $2",
                        str(vector),
                        scheme_id
                    )
                progress_counter["success"] += 1
                curr = progress_counter["success"] + progress_counter["failed"]
                if curr % 50 == 0 or curr == progress_counter["total"]:
                    print(f"  [PROGRESS] Embedded {curr}/{progress_counter['total']} schemes...", flush=True)
                return True
            except Exception as e:
                await asyncio.sleep(1.0 * (attempt + 1))
        
        progress_counter["failed"] += 1
        return False

async def generate_all_embeddings():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("[ERROR] DATABASE_URL not set in environment.", flush=True)
        return
    
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        print("[ERROR] GEMINI_API_KEY not set in environment. Cannot proceed with embedding generation.", flush=True)
        return
        
    print("Connecting to database to fetch schemes...", flush=True)
    try:
        conn = await asyncpg.connect(dsn=db_url, ssl="require", statement_cache_size=0)
        rows = await conn.fetch("SELECT * FROM schemes WHERE active = TRUE AND (embedding IS NULL)")
        await conn.close()
        print(f"[SUCCESS] Fetched {len(rows)} schemes to embed.", flush=True)
    except Exception as e:
        print(f"[ERROR] Database error: {e}", flush=True)
        return
        
    if not rows:
        print("All schemes are already embedded!", flush=True)
        return

    # Create connection pool
    pool = await asyncpg.create_pool(
        dsn=db_url,
        ssl="require",
        statement_cache_size=0,
        min_size=2,
        max_size=15
    )

    progress_counter = {
        "success": 0,
        "failed": 0,
        "total": len(rows)
    }

    # Process concurrently using a semaphore to avoid rate limits
    sem = asyncio.Semaphore(12) 
    
    print("Generating embeddings concurrently...", flush=True)
    tasks = [generate_scheme_embedding(pool, dict(row), sem, progress_counter) for row in rows]
    await asyncio.gather(*tasks)
    
    await pool.close()
    print("\n=== Embedding CLI Job Complete ===", flush=True)
    print(f"  Successfully processed: {progress_counter['success']}", flush=True)
    print(f"  Errors / Failures:      {progress_counter['failed']}", flush=True)

if __name__ == "__main__":
    asyncio.run(generate_all_embeddings())
