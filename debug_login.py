"""
Debug script - inspect login page to find correct selectors
"""
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/auth/login")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)
        
        # Take screenshot
        page.screenshot(path='E:/Research/daily-markdown/.sisyphus/evidence/debug-login.png')
        
        # List all inputs
        inputs = page.locator('input').all()
        print(f"Found {len(inputs)} input elements:")
        for i, inp in enumerate(inputs):
            try:
                attrs = {
                    'type': inp.get_attribute('type'),
                    'placeholder': inp.get_attribute('placeholder'),
                    'autocomplete': inp.get_attribute('autocomplete'),
                    'class': inp.get_attribute('class'),
                }
                print(f"  {i}: {attrs}")
            except Exception as e:
                print(f"  {i}: Error - {e}")
        
        # Also try to find by text content
        buttons = page.locator('button').all()
        print(f"\nFound {len(buttons)} buttons:")
        for i, btn in enumerate(buttons):
            try:
                text = btn.inner_text()
                btn_type = btn.get_attribute('type')
                print(f"  {i}: text='{text}', type={btn_type}")
            except Exception as e:
                print(f"  {i}: Error - {e}")
        
        browser.close()

if __name__ == "__main__":
    main()