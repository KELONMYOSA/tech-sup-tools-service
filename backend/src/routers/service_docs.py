import aiohttp
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter(
    prefix="/service_docs",
    tags=["Service Docs"],
)


@router.get("/{service_id}/{doc_name}")
async def get_pdf(service_id: int, doc_name: str):
    pdf_url = f"https://boss.comfortel.pro/service_docs/{service_id}/{doc_name}"

    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(pdf_url) as response:
                response.raise_for_status()
                content = await response.read()
        except aiohttp.ClientResponseError:
            raise HTTPException(status_code=404, detail="PDF not found")  # noqa: B904

    return StreamingResponse(iter([content]), media_type="application/pdf")
