from pathlib import Path
import tempfile

import pypdfium2 as pdfium
from reportlab.pdfgen import canvas


SOURCE = Path("/Users/phamvuxuanquynh/Downloads/(Confidential) Full SPILL Concept.pdf")
OUTPUT = Path("src/private/investor-overview.pdf")
RENDER_SCALE = 100 / 72


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    source = pdfium.PdfDocument(str(SOURCE))
    target = canvas.Canvas(str(OUTPUT), pagesize=(1440, 810), pageCompression=1)
    target.setTitle("Confidential SPILL Investor Overview")
    target.setAuthor("SPILL")

    with tempfile.TemporaryDirectory(prefix="spill-investor-pdf-") as temp_dir:
        temp = Path(temp_dir)
        for index, page in enumerate(source):
            width, height = page.get_size()
            image_path = temp / f"page-{index + 1:02d}.jpg"
            page.render(scale=RENDER_SCALE).to_pil().convert("RGB").save(
                image_path,
                "JPEG",
                quality=76,
                optimize=True,
                progressive=True,
            )
            target.setPageSize((width, height))
            target.drawImage(str(image_path), 0, 0, width=width, height=height)
            target.showPage()

    target.save()
    print(f"Created {OUTPUT} ({OUTPUT.stat().st_size / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    main()
