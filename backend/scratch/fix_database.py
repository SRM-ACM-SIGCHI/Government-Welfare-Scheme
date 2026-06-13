import asyncio
import sys
import os
sys.path.insert(0, os.path.abspath("."))

from database import connect_db, disconnect_db, get_pool

async def main():
    await connect_db()
    pool = get_pool()
    if pool is None:
        print("Database is offline")
        return
    async with pool.acquire() as conn:
        print("Enabling vector extension...")
        try:
            await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
            print("Vector extension enabled successfully.")
        except Exception as e:
            print("Failed to enable vector extension:", e)
            
        print("Adding embedding column to schemes table...")
        try:
            await conn.execute("ALTER TABLE schemes ADD COLUMN IF NOT EXISTS embedding vector(768)")
            print("Embedding column added successfully.")
        except Exception as e:
            print("Failed to add embedding column:", e)
            
        print("Creating index on embedding column...")
        try:
            await conn.execute("CREATE INDEX IF NOT EXISTS schemes_embedding_idx ON schemes USING hnsw (embedding vector_cosine_ops)")
            print("HNSW index created successfully.")
        except Exception as e:
            print("Failed to create index:", e)

    await disconnect_db()

asyncio.run(main())
