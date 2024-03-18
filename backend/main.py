import warnings

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import exc as sa_exc

from src.database.db import init_db
from src.routers import auth, company, contact, search, service, service_docs

app = FastAPI(
    title="Comfortel Technical Support API",
    contact={"name": "KELONMYOSA", "url": "https://t.me/KELONMYOSA"},
    version="0.0.1",
    root_path="/api",
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

# Database initialization
init_db()

# Include routers
app.include_router(auth.router)
app.include_router(search.router)
app.include_router(service.router)
app.include_router(contact.router)
app.include_router(company.router)
app.include_router(service_docs.router)

if __name__ == "__main__":
    host = "0.0.0.0"
    port = 5000
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=sa_exc.SAWarning)
        uvicorn.run(app, host=host, port=port)
