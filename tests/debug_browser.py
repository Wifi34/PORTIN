from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", lambda msg: print(f"[Browser Console {msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: print(f"[Browser PageError] {err}"))
    page.goto("http://localhost:5173/login")
    page.wait_for_timeout(3000)
    print("Page Content Length:", len(page.content()))
    with open("tests/login_page_dump.html", "w", encoding="utf-8") as f:
        f.write(page.content())
    browser.close()
