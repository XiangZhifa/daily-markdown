from playwright.sync_api import sync_playwright

def test_auth_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            page.goto('http://localhost:5173/auth/register')
            page.wait_for_load_state('networkidle')
            print('Register page loaded')
            
            page.fill('input[placeholder*="Username"]', 'testuser789')
            page.fill('input[type="email"]', 'testuser789@example.com')
            page.fill('input[type="password"]:nth-of-type(1)', 'TestPass123')
            page.fill('input[placeholder="Confirm Password"]', 'TestPass123')
            
            page.click('button:has-text("Register")')
            page.wait_for_load_state('networkidle')
            print('Registration submitted')
            print('URL after register:', page.url)
            
            page.fill('input[placeholder="Username"]', 'testuser789')
            page.fill('input[placeholder="Password"]', 'TestPass123')
            page.click('button:has-text("Login")')
            page.wait_for_load_state('networkidle')
            print('Login submitted')
            print('URL after login:', page.url)
            
            print('Auth flow test PASSED')
        except Exception as e:
            print('Error:', e)
            raise
        finally:
            browser.close()

if __name__ == '__main__':
    test_auth_flow()