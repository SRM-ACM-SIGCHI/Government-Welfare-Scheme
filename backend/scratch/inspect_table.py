import asyncio
import sys
import os
sys.path.insert(0, os.path.abspath("."))

from database import connect_db, disconnect_db, get_pool

async def main():
    await connect_db()
    pool = get_pool()
    if pool is None:
        return
    async with pool.acquire() as conn:
        # Fetch columns of schemes table
        rows = await conn.fetch(
            """
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'schemes'
            """
        )
        print("Columns in 'schemes' table:")
        for r in rows:
            print(f"- {r['column_name']}: {r['data_type']}")
    await disconnect_db()

asyncio.run(main())
