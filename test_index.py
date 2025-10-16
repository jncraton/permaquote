import re
from playwright.sync_api import Page, expect
import pytest

from pathlib import Path

file_url = Path("index.html").resolve().as_uri()

@pytest.fixture
def example_page(page: Page):
    page.goto(f"{file_url}#https://example.com;The+Title;1970-01-01;c1Qozy/KzsxLV0itSMwtyEkFAA==")
    return page

@pytest.fixture
def blank_page(page: Page):
    page.goto(f"{file_url}")
    return page

def test_page_title(example_page):
    expect(example_page).to_have_title("The Title")

def test_title(example_page):
    expect(example_page.get_by_text("The Title")).to_be_visible()

def test_date(example_page):
    expect(example_page.get_by_text("1970-01-01")).to_be_visible()

def test_link(example_page):
    expect(example_page.get_by_text("example.com").first).to_be_visible()

def test_href(example_page):
    expect(example_page.get_by_text("example.com").first).to_have_attribute("href", "https://example.com")

def test_quote(example_page):
    expect(example_page.get_by_text("A working example")).to_be_visible()

def test_create_page_title(blank_page):
    blank_page.get_by_label("Title").fill("The Title")

    expect(blank_page).to_have_title("The Title")
