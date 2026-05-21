from playwright.sync_api import sync_playwright

def test_documents():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            # Login
            page.goto('http://localhost:5173/auth/login')
            page.wait_for_load_state('networkidle')
            print('Login page loaded')
            
            # Fill form using nth
            page.locator('input[type="text"]').fill('finaltestuser')
            page.locator('input[type="password"]').fill('TestPass123')
            print('Form filled')
            
            # Click login
            page.locator('button:has-text(\"Login\")').click()
            page.wait_for_load_state('networkidle', timeout=15000)
            print('URL after login:', page.url)
            
            if '/documents' in page.url:
                print('SUCCESS: Redirected to documents')
                
                # Wait for document list to load
                page.wait_for_timeout(2000)
                
                # Count documents
                doc_count = page.locator('.card').count()
                print('Documents found:', doc_count)
                
                # Click first document
                page.locator('.card').first.click()
                page.wait_for_load_state('networkidle', timeout=10000)
                print('URL after document click:', page.url)
                
                # Wait for editor
                page.wait_for_timeout(2000)
                
                # Take screenshot
                page.screenshot(path='E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/editor-page.png', full_page=True)
                print('Editor screenshot taken')
                
            else:
                print('NOT at documents page:', page.url)
                
        except Exception as e:
            print('Error:', e)
            page.screenshot(path='E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/error.png')
            raise
        finally:
            browser.close()

if __name__ == '__main__':
    test_documents()