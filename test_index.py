import re
from playwright.sync_api import Page, expect
import pytest

from pathlib import Path

file_url = Path("index.html").resolve().as_uri()

@pytest.fixture
def web(page: Page):
    page.goto(f"{file_url}#https://example.com;The+Title;1970-01-01;c1Qozy/KzsxLV0itSMwtyEkFAA==")
    return page

@pytest.fixture
def blank(page: Page):
    page.goto(f"{file_url}")
    return page

def test_page_title(web):
    expect(web).to_have_title("The Title")

def test_title(web):
    expect(web.get_by_text("The Title")).to_be_visible()

def test_date(web):
    expect(web.get_by_text("1970-01-01")).to_be_visible()

def test_link(web):
    expect(web.get_by_text("example.com").first).to_be_visible()

def test_href(web):
    expect(web.get_by_text("example.com").first).to_have_attribute("href", re.compile("https://example.com.*"))

def test_quote(web):
    expect(web.get_by_text("A working example")).to_be_visible()

def test_create_page_title(blank):
    blank.get_by_label("Title").fill("The Title")

    expect(blank).to_have_title("The Title")
