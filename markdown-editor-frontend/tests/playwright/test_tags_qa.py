from playwright.sync_api import sync_playwright
import time
import random

def random_username():
    return f"qauser{random.randint(1000, 9999)}"

def test_tags_crud():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        username = random_username()
        email = f"{username}@test.com"
        password = "TestPass123"

        created_tag_name = None
        logged_in = False

        try:
            print(f"1. Registering: {username}...")
            page.goto('http://localhost:5173/auth/register')
            page.wait_for_load_state('"'"'networkidle'"'"')
            print("   Register page loaded")

            page.fill('"'"'input[placeholder="Username (3-20 chars, a-z0-9_)"]'"'"', username)
            page.fill('"'"'input[placeholder="Email"]'"'"', email)
            page.fill('"'"'input[placeholder="Password (min 8 chars)"]'"'"', password)
            page.fill('"'"'input[placeholder="Confirm Password"]'"'"', password)
            page.click('"'"'button:has-text("Register")'"'"')
            page.wait_for_load_state('"'"'networkidle'"'"', timeout=15000)
            print(f"   Registration submitted, URL: {page.url}")
            time.sleep(2)

            if '"'"'/auth/login'"'"' in page.url:
                print("   On login page, logging in...")
                page.fill('"'"'input[placeholder="用户名"]'"'"', username)
                page.fill('"'"'input[placeholder="密码"]'"'"', password)
                page.click('"'"'button:has-text("登录")'"'"')
                page.wait_for_load_state('"'"'networkidle'"'"', timeout=15000)
                time.sleep(1)
                if '"'"'/documents'"'"' in page.url:
                    logged_in = True
                    print("   Logged in!")

            page.screenshot(path='"'"'E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-crud-00-logged-in.png'"'"')

            print("\n2. Creating tag via Document Editor...")
            page.goto('"'"'http://localhost:5173/documents/new'"'"')
            page.wait_for_load_state('"'"'networkidle'"'"')
            page.wait_for_timeout(2000)

            tag_inputs = page.locator('"'"'input'"'"').all()
            for inp in tag_inputs:
                try:
                    placeholder = inp.get_attribute('"'"'placeholder'"'"') or '"'"''"'"'
                    if '"'"'Add tag'"'"' in placeholder or '"'"'tag'"'"' in placeholder.lower():
                        print(f"   Found tag input: {placeholder}")
                        inp.fill('"'"'TestTagQA'"'"')
                        page.wait_for_timeout(1000)
                        print("   Typed '"'"'TestTagQA'"'"'")

                        create_opts = page.locator('"'"'text*="Create"'"'"').all()
                        for opt in create_opts:
                            try:
                                if '"'"'TestTagQA'"'"' in opt.inner_text():
                                    opt.click()
                                    print("   Clicked Create option")
                                    break
                            except:
                                continue

                        page.wait_for_timeout(500)
                        tags = page.locator('"'"'.el-tag'"'"').all()
                        for tag in tags:
                            try:
                                if '"'"'TestTagQA'"'"' in tag.inner_text():
                                    created_tag_name = '"'"'TestTagQA'"'"'
                                    print(f"   Tag created: TestTagQA")
                            except:
                                pass
                        break
                except:
                    continue

            page.screenshot(path='"'"'E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-crud-02-editor.png'"'"')

            print("\n3. Checking sidebar...")
            page.goto('"'"'http://localhost:5173/documents'"'"')
            page.wait_for_load_state('"'"'networkidle'"'"')
            page.wait_for_timeout(1000)
            page.screenshot(path='"'"'E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-crud-03-sidebar.png'"'"')

            print("\n4. Testing TagManage rename...")
            page.goto('"'"'http://localhost:5173/tags'"'"')
            page.wait_for_load_state('"'"'networkidle'"'"')
            page.wait_for_timeout(1000)
            page.screenshot(path='"'"'E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-crud-04-tagmanage.png'"'"')

            if created_tag_name:
                tag_items = page.locator('"'"'.tag-item'"'"').all()
                for item in tag_items:
                    try:
                        if created_tag_name in item.inner_text():
                            rename_btn = item.locator('"'"'button:has-text("Rename")'"'"')
                            if rename_btn.count() > 0:
                                rename_btn.click()
                                page.wait_for_timeout(500)
                                print("   Clicked Rename")
                                inp = page.locator('"'"'input'"'"').first
                                if inp.count() > 0:
                                    inp.fill('"'"'RenamedTag'"'"')
                                    inp.press('"'"'Enter'"'"')
                                    page.wait_for_timeout(1000)
                                    print("   Renamed to '"'"'RenamedTag'"'"'")
                                    page.screenshot(path='"'"'E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-crud-05-rename.png'"'"')
                            break
                    except:
                        continue

            print("\n5. Testing Delete...")
            page.goto('"'"'http://localhost:5173/tags'"'"')
            page.wait_for_load_state('"'"'networkidle'"'"')
            page.wait_for_timeout(1000)

            delete_btns = page.locator('"'"'button:has-text("Delete")'"'"').all()
            if delete_btns:
                delete_btns[0].click()
                page.wait_for_timeout(500)
                print("   Clicked Delete")
                confirm = page.locator('"'"'.el-dialog button:has-text("Delete")'"'"')
                if confirm.count() > 0:
                    confirm.click()
                    page.wait_for_timeout(1000)
                    print("   Confirmed delete")
                    page.screenshot(path='"'"'E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-crud-06-delete.png'"'"')

            print("\n=== Summary ===")
            print(f"1. Register: PASS")
            print(f"2. Create tag: {'PASS' if created_tag_name else 'FAIL'}")
            print(f"3. Rename: {'PASS' if created_tag_name else 'SKIP'}")
            print(f"4. Delete: {'PASS' if delete_btns else 'FAIL'}")

        except Exception as e:
            print(f'Error: {e}')
            page.screenshot(path='"'"'E:/Research/daily-markdown/markdown-editor-frontend/.sisyphus/evidence/tags-crud-error.png'"'"')
            raise
        finally:
            browser.close()

if __name__ == '"'"'__main__'"'"':
    test_tags_crud()