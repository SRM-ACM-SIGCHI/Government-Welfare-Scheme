from fastapi import APIRouter, Query, HTTPException
from database import get_pool
from services.fallback_data import MOCK_CENTERS, haversine_distance

router = APIRouter()

@router.get("/nearby")
async def get_nearby_centers(
    lat: float = Query(..., description="Latitude of the user"),
    lng: float = Query(..., description="Longitude of the user"),
    type: str = Query(None, description="Filter by type ('csc' or 'post_office')")
):
    pool = get_pool()

    # DB Connection Mode
    if pool is not None:
        try:
            async with pool.acquire() as conn:
                # Query using the Haversine formula directly in PostgreSQL
                # R = 6371 km
                rows = await conn.fetch(
                    """
                    SELECT 
                        center_id, name, type, address, state, 
                        latitude, longitude, phone_number, working_hours,
                        (6371 * acos(
                            cos(radians($1)) * cos(radians(latitude)) * 
                            cos(radians(longitude) - radians($2)) + 
                            sin(radians($1)) * sin(radians(latitude))
                        )) AS distance
                    FROM centers
                    WHERE ($3::text IS NULL OR type = $3)
                    ORDER BY distance
                    LIMIT 5
                    """,
                    lat, lng, type
                )
                
                results = []
                for r in rows:
                    center = dict(r)
                    # Round distance to 2 decimal places
                    center["distance"] = round(float(center["distance"]), 2)
                    results.append(center)
                return {"mode": "database", "results": results}
        except Exception as e:
            # Fallback to local if database query errors out
            print(f"[WARNING] Database center query failed: {e}. Falling back to offline memory calculation.")
    
    # Offline Fallback Mode
    results = []
    for c in MOCK_CENTERS:
        if type and c["type"] != type:
            continue
        dist = haversine_distance(lat, lng, c["latitude"], c["longitude"])
        center_copy = dict(c)
        center_copy["distance"] = round(dist, 2)
        results.append(center_copy)
        
    # Sort by distance ascending
    results.sort(key=lambda x: x["distance"])
    
    return {
        "mode": "offline_fallback",
        "results": results[:5]
    }
