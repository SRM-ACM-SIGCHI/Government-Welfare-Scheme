import asyncio
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

from services.gemini import generate_embedding

async def main():
    key = os.getenv("GEMINI_API_KEY")
    print("Gemini API Key format:", key[:10] + "..." if key else "None")
    try:
        emb = await generate_embedding("Test text")
        print("Success! Embedding length:", len(emb))
        print("First 5 values:", emb[:5])
    except Exception as e:
        print("Failed to generate embedding:")
        print(e)

if __name__ == "__main__":
    asyncio.run(main())
