import pytest
from app.domain.entities.document import Document, MAX_SIZE_BYTES

def test_valid_document():
    doc = Document(mime_type="application/pdf", size_bytes=1024)
    assert doc.status.value == "pending"

def test_invalid_mime_raises():
    with pytest.raises(ValueError):
        Document(mime_type="application/exe", size_bytes=100)

def test_exceeds_size_raises():
    with pytest.raises(ValueError):
        Document(mime_type="application/pdf", size_bytes=MAX_SIZE_BYTES + 1)

def test_status_transitions():
    doc = Document(mime_type="application/pdf", size_bytes=100)
    doc.mark_processing()
    assert doc.status.value == "processing"
    doc.mark_done()
    assert doc.status.value == "done"
