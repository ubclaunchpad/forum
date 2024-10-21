from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from supabase import Client

router = APIRouter()


@router.get("/callback")
async def callback(request: Request, supabase: Client = Depends(lambda: supabase)):
  code = request.query_params.get('code')
  next_path = request.query_params.get("next", "/")
  
  if code:
    try:
      # Exchange the code for a session
      response = await supabase.auth.exchange_code_for_session(code)
      # Check if the session is created successfully
      if response.error:
        raise HTTPException(status_code=400, detail=response.error.message)
    except Exception as e:
      raise HTTPException(status_code=500, detail=str(e))

  # Redirect to the next path
  return RedirectResponse(url=f"/{next_path.lstrip('/')}", status_code=303)