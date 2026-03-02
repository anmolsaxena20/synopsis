"""
ContractScan AI — PDF Text Extraction
AI Lead owns this file.

Used by the Node backend (via HTTP call) OR can be called locally for testing.
Handles:
  - Normal text-based PDFs (pdfminer.six)
  - Scanned/image PDFs (detected, returns error — no OCR in MVP)
  - .txt files (pass-through)
"""

import io
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """
    Extract raw text from a PDF given its bytes.
    Returns the extracted string, or raises ValueError for scanned PDFs.
    """
    output = io.StringIO()
    input_buffer = io.BytesIO(pdf_bytes)

    try:
        extract_text_to_fp(
            input_buffer,
            output,
            laparams=LAParams(
                line_margin=0.5,
                char_margin=2.0,
                word_margin=0.1,
            ),
            output_type="text",
            codec="utf-8",
        )
    except Exception as e:
        raise RuntimeError(f"PDF extraction failed: {e}")

    text = output.getvalue().strip()

    # Scanned PDF detection: pdfminer returns empty or near-empty string
    if len(text) < 200:
        raise ValueError(
            "Scanned PDF detected — pdf text extraction returned < 200 characters. "
            "Please paste the contract text directly using the text input tab."
        )

    return clean_text(text)


def clean_text(text: str) -> str:
    """
    Normalize extracted text:
    - Remove excessive blank lines
    - Replace smart quotes and dashes with ASCII equivalents
      (GPT-4o handles both fine, but clean text costs fewer tokens)
    - Strip leading/trailing whitespace per line
    """
    import re

    # Replace common Unicode characters with ASCII
    replacements = {
        "\u2018": "'", "\u2019": "'",   # smart single quotes
        "\u201c": '"', "\u201d": '"',   # smart double quotes
        "\u2013": "-", "\u2014": "--",  # em/en dashes
        "\u00a0": " ",                  # non-breaking space
        "\u2022": "-",                  # bullet
    }
    for unicode_char, ascii_char in replacements.items():
        text = text.replace(unicode_char, ascii_char)

    # Collapse 3+ consecutive blank lines into 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Strip trailing whitespace from each line
    lines = [line.rstrip() for line in text.splitlines()]
    return "\n".join(lines).strip()


# ── Standalone extraction endpoint (optional, for Node to call directly) ─────
# The Node backend can also call POST /extract with raw PDF bytes.
# This is an optional helper; the main flow uses pdf-parse in Node.

from fastapi import APIRouter, UploadFile, File, HTTPException

pdf_router = APIRouter()


@pdf_router.post("/extract")
async def extract_pdf(file: UploadFile = File(...)):
    """
    Optional: Node backend can POST a PDF here to extract text server-side.
    Usage: multipart/form-data with field name 'file'.
    """
    if file.content_type not in ("application/pdf", "text/plain"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Only PDF and plain text are accepted."
        )

    content = await file.read()

    if file.content_type == "text/plain":
        return {"text": content.decode("utf-8", errors="replace"), "page_count": 1}

    try:
        text = extract_text_from_pdf_bytes(content)
        page_count = max(1, len(text) // 3000)
        return {"text": text, "page_count": page_count, "char_count": len(text)}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
