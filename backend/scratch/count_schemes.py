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
        count = await conn.fetchval("SELECT COUNT(*) FROM schemes")
        print("Total schemes in database:", count)
        
        rows = await conn.fetch("SELECT scheme_id, name, active FROM schemes")
        for r in rows:
            print(f"- {r['scheme_id']}: {r['name']} (active={r['active']})")
            
    await disconnect_db()

asyncio.run(main())
