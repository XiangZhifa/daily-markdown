from playwright.sync_api import sync_playwright

def test_login():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            page.goto('http://localhost:5173/auth/login')
            page.wait_for_load_state('networkidle')
            print('Login page loaded')
            
            # Fill password first
            page.click('input[type="password"]')
            page.wait_for_timeout(200)
            page.type('input[type="password"]', 'TestPass123')
            print('Password filled')
            page.wait_for_timeout(500)
            
            # Fill username
            page.click('input[type="text"]')
            page.wait_for_timeout(200)
            page.type('input[type="text"]', 'testuser456')
            print('Username filled')
            page.wait_for_timeout(500)
            
            # Check button state
            button = page.locator('button:has-text(\"\\u767b\\u5f55\")')
            is_disabled = button.is_disabled()
            print('Button disabled:', is_disabled)
            
            # If button is enabled, click it
            if not is_disabled:
                button.click()
                page.wait_for_load_state('networkidle', timeout=15000)
                print('Login submitted')
                print('URL:', page.url)
                
                if '/documents' in page.url:
                    print('SUCCESS: Redirected to documents')
                else:
                    print('Current URL:', page.url)
            else:
                print('Button still disabled - form validation issue')
                
        except Exception as e:
            print('Error:', e)
            page.screenshot(path='E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/error.png')
            raise
        finally:
            browser.close()

if __name__ == '__main__':
    test_login()