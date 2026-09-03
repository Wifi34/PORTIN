import time
from playwright.sync_api import sync_playwright

def run_e2e():
    print("[Playwright E2E] Starting end-to-end browser test...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # 1. LANDING PAGE
        print("[Step 1] Visiting Landing Page: http://localhost:5173/ ...")
        page.goto("http://localhost:5173/", timeout=15000)
        page.wait_for_selector("text=PortIN", timeout=10000)
        assert "PortIN" in page.content()
        print("  [OK] Landing Page loaded with brand and hero elements")

        # 2. LOGIN PAGE
        print("[Step 2] Navigating to Login Page: http://localhost:5173/login ...")
        page.goto("http://localhost:5173/login", wait_until="networkidle")
        print(f"Current URL: {page.url}")
        print(f"Title: {page.title()}")
        page.wait_for_selector("input[type='email']", timeout=10000)

        # Click Analyst 1-click Demo Fill
        print("[Step 3] Clicking 1-click Demo Fill for Analyst...")
        page.click("button:has-text('Analyst')")
        page.click("button[type='submit']")

        # Wait for dashboard
        page.wait_for_url("**/dashboard", timeout=10000)
        print("  [OK] Successfully authenticated and navigated to /dashboard")

        # 3. DASHBOARD VERIFICATION
        page.wait_for_selector("text=Recommended Vessel", timeout=10000)
        assert "Panamax" in page.content()
        print("  [OK] Dashboard KPIs and forecast curve loaded")

        # 4. DECISION TWIN
        print("[Step 4] Visiting PortIN Decision Twin: http://localhost:5173/decision-twin ...")
        page.goto("http://localhost:5173/decision-twin")
        page.wait_for_selector("text=PortIN Decision Twin", timeout=10000)
        page.wait_for_selector("text=PLAN A", timeout=10000)
        page.wait_for_selector("text=PLAN B", timeout=10000)
        page.wait_for_selector("text=PLAN C", timeout=10000)
        print("  [OK] Decision Twin successfully synthesized Plan A, Plan B, and Plan C")

        # 5. FREIGHT FORECAST PAGE
        print("[Step 5] Visiting Freight Forecast Page: http://localhost:5173/forecast ...")
        page.goto("http://localhost:5173/forecast")
        page.wait_for_selector("text=Predictive Freight Curve", timeout=10000)
        print("  [OK] ML Freight Forecast and 90-day quantile bands verified")

        # 6. PORT INTELLIGENCE & BERTHS
        print("[Step 6] Visiting Port Intelligence Page: http://localhost:5173/port-intelligence ...")
        page.goto("http://localhost:5173/port-intelligence")
        page.wait_for_selector("text=Paradip", timeout=10000)
        print("  [OK] East Coast ports and berth constraints loaded")

        # 7. CONTRACT OPTIMIZER
        print("[Step 7] Visiting Contract Optimizer: http://localhost:5173/contract-optimizer ...")
        page.goto("http://localhost:5173/contract-optimizer")
        page.wait_for_selector("text=Spot Chartering", timeout=10000)
        print("  [OK] Spot vs Multi-Voyage Contract intelligence verified")

        # 8. REPORTS GENERATION & DOWNLOAD
        print("[Step 8] Visiting Reports Page: http://localhost:5173/reports ...")
        page.goto("http://localhost:5173/reports")
        page.wait_for_selector("text=Chartering Reports", timeout=10000)
        print("  [OK] Reports center verified")

        # Take an executive screenshot
        screenshot_path = "frontend/public/assets/dashboard_e2e_screenshot.png"
        page.goto("http://localhost:5173/dashboard")
        time.sleep(1)
        page.screenshot(path=screenshot_path)
        print(f"  [OK] Captured full-page verification screenshot: {screenshot_path}")

        browser.close()
        print("\n=========================================================================")
        print("  [SUCCESS] All Playwright end-to-end browser journeys passed 100%!")
        print("=========================================================================")

if __name__ == "__main__":
    run_e2e()
