import subprocess
import tempfile
from io import BytesIO

import aiohttp
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from yarl import URL

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


class FileRequest(BaseModel):
    url: str


@router.post("/drawio/svg")
async def drawio_to_svg(file_request: FileRequest):
    url = file_request.url

    # Download the HTML page
    try:
        async with aiohttp.ClientSession() as session:  # noqa: SIM117
            async with session.get(url) as response:
                if response.status != status.HTTP_200_OK:
                    raise HTTPException(status_code=400, detail=f"Error downloading file: {response.status}")
                html_data = await response.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error downloading file: {e}")  # noqa: B904

    # Parse the HTML and find the download link
    try:
        soup = BeautifulSoup(html_data, "html.parser")
        download_link = soup.find("a", {"id": "downloadFile"})["href"]
        download_url = response.url.join(URL(download_link))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing HTML or finding download link: {e}")  # noqa: B904

    # Download the .drawio file
    try:
        async with aiohttp.ClientSession() as session:  # noqa: SIM117
            async with session.get(download_url) as response:
                if response.status != status.HTTP_200_OK:
                    raise HTTPException(status_code=400, detail=f"Error downloading file: {response.status}")
                drawio_data = await response.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error downloading file: {e}")  # noqa: B904

    # Convert .drawio to .svg using drawio command-line tool
    with (
        tempfile.NamedTemporaryFile(suffix=".drawio") as temp_drawio,
        tempfile.NamedTemporaryFile(suffix=".svg") as temp_svg,
    ):
        temp_drawio.write(drawio_data)
        temp_drawio.flush()

        try:
            subprocess.run(
                [
                    "drawio",
                    "--export",
                    "--format",
                    "svg",
                    "--output",
                    temp_svg.name,
                    temp_drawio.name,
                    "--no-sandbox",
                    "--disable-gpu",
                ],
                check=True,
                capture_output=True,
            )
            temp_svg.seek(0)
            svg_data = temp_svg.read()
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500, detail=f"Error converting file: {e}")  # noqa: B904

    return StreamingResponse(BytesIO(svg_data), media_type="image/svg+xml")
