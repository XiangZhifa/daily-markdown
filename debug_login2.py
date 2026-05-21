"""
Debug script - inspect login page HTML to understand structure
"""
from playwright.sync_api import sync_playwright
import json

BASE_URL = "http://localhost:5173"

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Enable console logging
        page.on("console", lambda msg: print(f"CONSOLE {msg.type}: {msg.text}"))

        page.goto(f"{BASE_URL}/auth/login")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(3000)

        # Take screenshot
        page.screenshot(path='E:/Research/daily-markdown/.sisyphus/evidence/debug-login2.png', full_page=True)

        # Get HTML content
        html = page.content()
        print(f"HTML length: {len(html)}")

        # Check if Vue app mounted
        app_div = page.locator('#app').first
        if app_div.count() > 0:
            inner_html = app_div.inner_html()
            print(f"App div inner HTML length: {len(inner_html)}")
            if len(inner_html) < 100:
                print(f"App content: {inner_html}")
            else:
                print(f"App content preview: {inner_html[:500]}...")

        # Check for any errors in page
        print(f"\nCurrent URL: {page.url}")
        print(f"Title: {page.title()}")

        browser.close()

if __name__ == "__main__":
    main()