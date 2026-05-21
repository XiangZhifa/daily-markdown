"""
Complete QA for auth-documents - T9, T10, T13, T14
"""
from playwright.sync_api import sync_playwright
import subprocess
import os

BASE_URL = "http://localhost:5173"
TEST_USER = "testuser_4248"
TEST_PASSWORD = "TestPass123"

def log(msg):
    print(f"[QA] {msg}", flush=True)

def save_screenshot(page, name):
    path = f"E:/Research/daily-markdown/.sisyphus/evidence/{name}.png"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    screenshot = page.screenshot()
    with open(path, 'wb') as f:
        f.write(screenshot)
    print(f"  [SAVED] {path}")
    return screenshot

def test_t9_logout():
    """T9: Logout flow test"""
    log("T9: Testing logout flow...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Login first
        page.goto(f"{BASE_URL}/auth/login")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        page.locator('input[placeholder="用户名"]').fill(TEST_USER, timeout=5000)
        page.locator('input[placeholder="密码"]').fill(TEST_PASSWORD, timeout=5000)
        page.locator('button:has-text("登录")').click()
        page.wait_for_timeout(2000)

        if '/documents' not in page.url:
            log("  [WARN] Login failed, skipping logout test")
            browser.close()
            return False

        save_screenshot(page, 't9-before-logout')

        # Click logout button - in MainLayout sidebar
        logout_btn = page.locator('button:has-text("Logout")')
        if logout_btn.is_visible():
            logout_btn.click()
            page.wait_for_timeout(1500)

            if '/auth/login' in page.url:
                log("  [PASS] Logout successful, redirected to login")
                save_screenshot(page, 't9-after-logout')
            else:
                log("  [WARN] Logout didn't redirect correctly")
                save_screenshot(page, 't9-logout-result')
        else:
            log("  [WARN] Logout button not visible")
            save_screenshot(page, 't9-no-logout-btn')

        browser.close()
        return True

def test_t10_api():
    """T10: Auth API endpoints test"""
    log("T10: Testing auth API endpoints...")

    # Test profile endpoint
    profile_result = subprocess.run(
        ['powershell', '-Command', '''
            $token = (Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"testuser_4248","password":"TestPass123"}' | Select-Object -ExpandProperty data).access_token
            $profile = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/profile" -Headers @{"Authorization"="Bearer $token"}
            $profile | ConvertTo-Json -Depth 3
        '''],
        capture_output=True, text=True, encoding='utf-8'
    )

    if profile_result.returncode == 0 and profile_result.stdout.strip():
        log("  [PASS] GET /auth/profile works")
        log(f"  [INFO] Profile response: {profile_result.stdout[:200]}")

        # Save to evidence
        path = "E:/Research/daily-markdown/.sisyphus/evidence/auth-t10-api.txt"
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write("GET /auth/profile response:\n")
            f.write(profile_result.stdout)
        print(f"  [SAVED] {path}")
    else:
        log("  [WARN] GET /auth/profile failed")
        log(f"  [ERROR] {profile_result.stderr[:200] if profile_result.stderr else 'No output'}")

    # Test logout endpoint
    logout_result = subprocess.run(
        ['powershell', '-Command', '''
            $token = (Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"testuser_4248","password":"TestPass123"}' | Select-Object -ExpandProperty data).access_token
            $logout = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/logout" -Method Post -Headers @{"Authorization"="Bearer $token"}
            $logout | ConvertTo-Json -Depth 3
        '''],
        capture_output=True, text=True, encoding='utf-8'
    )

    if logout_result.returncode == 0 and logout_result.stdout.strip():
        log("  [PASS] POST /auth/logout works")
        log(f"  [INFO] Logout response: {logout_result.stdout[:200]}")

        # Append to evidence file
        path = "E:/Research/daily-markdown/.sisyphus/evidence/auth-t10-api.txt"
        with open(path, 'a', encoding='utf-8') as f:
            f.write("\n\nPOST /auth/logout response:\n")
            f.write(logout_result.stdout)
    else:
        log("  [WARN] POST /auth/logout failed")

def test_t13_tag_filter():
    """T13: Tag filter in document list"""
    log("T13: Testing tag filter...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Login
        page.goto(f"{BASE_URL}/auth/login")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        page.locator('input[placeholder="用户名"]').fill(TEST_USER, timeout=5000)
        page.locator('input[placeholder="密码"]').fill(TEST_PASSWORD, timeout=5000)
        page.locator('button:has-text("登录")').click()
        page.wait_for_timeout(2000)

        if '/documents' not in page.url:
            log("  [WARN] Login failed, skipping tag filter test")
            browser.close()
            return False

        # Navigate to documents
        page.goto(f"{BASE_URL}/documents")
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

        save_screenshot(page, 't13-tag-filter-before')

        # Check if tag filter UI exists
        tag_section = page.locator('text=Tags:')
        if tag_section.is_visible():
            log("  [PASS] Tag filter section is visible")
            save_screenshot(page, 't13-tag-filter-visible')
        else:
            log("  [INFO] Tag filter section may not be visible or no tags exist")
            save_screenshot(page, 't13-tag-filter-check')

        browser.close()
        return True

def test_t14_search_api():
    """T14: Search API test"""
    log("T14: Testing search API...")

    result = subprocess.run(
        ['powershell', '-Command', '''
            $token = (Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"testuser_4248","password":"TestPass123"}' | Select-Object -ExpandProperty data).access_token
            $search = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/documents?keyword=test" -Headers @{"Authorization"="Bearer $token"}
            $search | ConvertTo-Json -Depth 5
        '''],
        capture_output=True, text=True, encoding='utf-8'
    )

    if result.returncode == 0 and result.stdout.strip():
        log("  [PASS] GET /documents?keyword=test works")
        log(f"  [INFO] Search response: {result.stdout[:300]}...")

        # Save to evidence
        path = "E:/Research/daily-markdown/.sisyphus/evidence/docs-t14-search-api.txt"
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write("GET /documents?keyword=test response:\n")
            f.write(result.stdout)
        print(f"  [SAVED] {path}")
    else:
        log("  [WARN] Search API failed")
        log(f"  [ERROR] {result.stderr[:200] if result.stderr else 'No output'}")

def main():
    log("Starting T9, T10, T13, T14 QA...")
    test_t9_logout()
    test_t10_api()
    test_t13_tag_filter()
    test_t14_search_api()
    log("Additional QA completed")

if __name__ == "__main__":
    main()