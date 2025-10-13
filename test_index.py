import re
from playwright.sync_api import Page, expect
import pytest

from pathlib import Path

file_url = Path("index.html").resolve().as_uri()

@pytest.fixture
def example_page(page: Page):
    page.goto(f"{file_url}#https://example.com;Example;1970-01-01;c1Qozy/KzsxLV0itSMwtyEkFAA==")
    return page

def test_quote(example_page):
    assert "A working example" in example_page.text_content("body")
