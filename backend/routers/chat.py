from fastapi import APIRouter
from models.chat import ChatRequest, ChatResponse

router = APIRouter()

# ---------------------------------------------------------------------------
# Gemini AI chat is disabled. The endpoint is kept so the frontend doesn't
# break, but it returns a static message instead of calling the Gemini API.
# ---------------------------------------------------------------------------

UNAVAILABLE_MESSAGE = (
    "The AI assistant feature is currently unavailable. "
    "Please use the search and scheme matching features to find relevant schemes."
)

@router.post("", response_model=ChatResponse)
async def chat_counselor(request: ChatRequest):
    """
    Chat counselor endpoint.
    Gemini AI is disabled — returns a helpful fallback message directing
    users to the search and matching features instead.
    """
    return ChatResponse(
        reply=UNAVAILABLE_MESSAGE,
        matched_schemes=[]
    )

