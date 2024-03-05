import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers import auth

app = FastAPI(
    title="Comfortel Technical Support API",
    contact={"name": "KELONMYOSA", "url": "https://t.me/KELONMYOSA"},
    version="0.0.1",
    docs_url="/docs",
    redoc_url="/docs/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)

if __name__ == "__main__":
    host = "0.0.0.0"
    port = 5000
    uvicorn.run(app, host=host, port=port)
