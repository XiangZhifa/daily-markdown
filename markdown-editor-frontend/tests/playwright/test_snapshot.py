from playwright.sync_api import sync_playwright

def test_page_snapshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            page.goto('http://localhost:5173/auth/login')
            page.wait_for_load_state('networkidle')
            print('Page loaded')
            print('URL:', page.url)
            
            # Take snapshot to see what's on the page
            page.snapshot(path='E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/login-page-snapshot.txt')
            print('Snapshot saved')
            
            # Try clicking to see if it focuses
            page.click('input')
            page.wait_for_timeout(1000)
            page.snapshot(path='E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/after-click-snapshot.txt')
            print('After click snapshot saved')
            
        except Exception as e:
            print('Error:', e)
            raise
        finally:
            browser.close()

if __name__ == '__main__':
    test_page_snapshot()