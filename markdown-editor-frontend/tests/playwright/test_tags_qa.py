from playwright.sync_api import sync_playwright
import time
import random

def random_username():
    return f"testuser{random.randint(10000, 99999)}"

def test_tags_feature():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Step 1: Register a new user
            username = random_username()
            print(f"Registering user: {username}")

            page.goto('http://localhost:5173/auth/register')
            page.wait_for_load_state('networkidle')
            print("Register page loaded")

            # Fill registration form using correct placeholders from RegisterView.vue
            page.fill('input[placeholder="Username (3-20 chars, a-z0-9_)"]', username)
            page.fill('input[placeholder="Email"]', f'{username}@example.com')
            page.fill('input[placeholder="Password (min 8 chars)"]', 'TestPass123')
            page.fill('input[placeholder="Confirm Password"]', 'TestPass123')

            page.click('button:has-text("Register")')
            page.wait_for_load_state('networkidle', timeout=15000)
            print(f"Registration submitted, URL: {page.url}")

            # Wait for redirect
            time.sleep(2)

            # Check current state - register redirects to login on success
            print(f"Current URL: {page.url}")

            # If still on register page, try to login
            if '/auth/login' in page.url:
                print("On login page, logging in...")
                page.fill('input[placeholder="用户名"]', username)
                page.fill('input[placeholder="密码"]', 'TestPass123')
                page.click('button:has-text("登录")')
                page.wait_for_load_state('networkidle', timeout=15000)
                time.sleep(1)
                print(f"After login URL: {page.url}")
            elif '/documents' not in page.url:
                # Try navigating directly
                page.goto('http://localhost:5173/documents')
                page.wait_for_load_state('networkidle', timeout=15000)

            # Step 3: Take screenshot of documents page
            page.screenshot(path='E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-qa-01-documents.png', full_page=True)
            print("Documents page screenshot saved")

            # Step 4: Check if sidebar has Tags section
            # Look for the TagSidebar component
            page.wait_for_timeout(1000)

            # Take snapshot to understand the page structure
            html_content = page.content()
            with open('E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-qa-02-sidebar-snapshot.txt', 'w', encoding='utf-8') as f:
                f.write(html_content)
            print("Sidebar HTML snapshot saved")

            # Step 5: Navigate to /tags to test TagManage
            page.goto('http://localhost:5173/tags')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            print("TagManage page loaded")

            page.screenshot(path='E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-qa-03-tagmanage.png', full_page=True)
            print("TagManage page screenshot saved")

            # Step 6: Create a new tag
            # Click the first input field we find
            inputs = page.locator('input').all()
            if inputs:
                # Find an input that might be for creating a tag
                for inp in inputs:
                    try:
                        placeholder = inp.get_attribute('placeholder') or ''
                        if 'tag' in placeholder.lower() or '标签' in placeholder or '名称' in placeholder:
                            inp.fill('TestTag123')
                            print(f"Filled tag name: TestTag123")
                            break
                    except:
                        continue

            # Look for create/submit button
            buttons = page.locator('button').all()
            for btn in buttons:
                try:
                    text = btn.inner_text()
                    if '创建' in text or '添加' in text or 'add' in text.lower():
                        btn.click()
                        print(f"Clicked button: {text}")
                        page.wait_for_timeout(1000)
                        break
                except:
                    continue

            page.screenshot(path='E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-qa-04-after-create.png', full_page=True)
            print("After creating tag screenshot saved")

            # Step 7: Navigate to a document editor
            page.goto('http://localhost:5173/documents/new')
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)
            print("Document editor loaded")

            page.screenshot(path='E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-qa-05-editor.png', full_page=True)
            print("Document editor screenshot saved")

            # Look for tag input in editor
            tag_inputs = page.locator('input[placeholder*="tag" i], input[placeholder*="标签"], input[placeholder*="Add"]').all()
            if tag_inputs:
                print(f"Found {len(tag_inputs)} tag input(s)")
                for inp in tag_inputs:
                    try:
                        placeholder = inp.get_attribute('placeholder') or ''
                        print(f"  Input placeholder: {placeholder}")
                    except:
                        pass

            print("\n=== QA Test Complete ===")
            print("Evidence saved to .sisyphus/evidence/")

        except Exception as e:
            print('Error:', e)
            page.screenshot(path='E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-qa-error.png')
            raise
        finally:
            browser.close()

if __name__ == '__main__':
    test_tags_feature()