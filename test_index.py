import re
from playwright.sync_api import Page, expect

from pathlib import Path

file_url = Path("index.html").resolve().as_uri()

def test_quote(page: Page):
    page.goto(f"{file_url}#https://example.com;Example;1970-01-01;c1Qozy/KzsxLV0itSMwtyEkFAA==")

    assert "A working example" in page.text_content("body")
