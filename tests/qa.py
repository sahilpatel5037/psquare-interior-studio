#!/usr/bin/env python3
"""Device QA (set PSQ_PASS=<password> to sign in to the private preview first) for the P Square site. Usage: qa.py <url> <outdir> [widths] [engines] [--shots]
Checks per engine x width: no horizontal scroll, no element past the viewport edge, no broken images,
filters / slider / form / menu / lightbox behaviour. Writes results.json + screenshots."""
import json, sys, os, time
from playwright.sync_api import sync_playwright
url, out = sys.argv[1], sys.argv[2]
widths = [int(w) for w in (sys.argv[3] if len(sys.argv) > 3 else "360,375,390,414,768,1024,1180,1366,1440,1920").split(",")]
engines = (sys.argv[4] if len(sys.argv) > 4 else "chromium,webkit").split(",")
shots = "--shots" in sys.argv
os.makedirs(out, exist_ok=True)
H = {360: 740, 375: 812, 390: 844, 414: 896, 768: 1024, 1024: 1366, 1180: 820, 1366: 768, 1440: 900, 1920: 1080}
CHECK = r"""() => {
 const W = document.documentElement.clientWidth, r = {};
 r.scrollW = document.scrollingElement.scrollWidth; r.W = W; r.hscroll = r.scrollW > W + 1;
 const off = [];
 for (const el of document.querySelectorAll('body *')) {
   if (el.closest('.chips,.menu,dialog,svg,.skip')) continue;
   const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
   const b = el.getBoundingClientRect(); if (!b.width || !b.height) continue;
   if (el.closest('.hero') && el.classList.contains('hero-img')) continue;
   if (b.right > W + 1 || b.left < -1) { if (!el.closest('.slider,.book-bg,.pj')) off.push((el.className||el.tagName)+' '+Math.round(b.left)+'..'+Math.round(b.right)); }
 }
 r.offscreen = off.slice(0, 12);
 r.broken = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && (i.currentSrc||i.src)).map(i => i.currentSrc || i.src).slice(0, 10);
 r.notLoaded = [...document.images].filter(i => !i.complete).map(i => i.currentSrc || i.src).slice(0, 10);
 // text overflowing its own box (clipped words)
 const clip = [];
 for (const el of document.querySelectorAll('h1,h2,h3,p,b,small,a.btn,button,label,li,span')) {
   if (el.closest('.menu,dialog,.skip,[hidden]')) continue; const cs = getComputedStyle(el); if (cs.display==='none') continue;
   if (el.scrollWidth > el.clientWidth + 2 && cs.overflow !== 'visible' && el.clientWidth>0) clip.push((el.className||el.tagName)+':'+el.textContent.trim().slice(0,30));
 }
 r.clipped = clip.slice(0, 10);
 return r; }"""
def scroll_all(p):
    h = p.evaluate("document.scrollingElement.scrollHeight")
    y = 0
    while y < h:
        p.evaluate(f"window.scrollTo(0,{y})"); p.wait_for_timeout(120); y += 500
        h = p.evaluate("document.scrollingElement.scrollHeight")
    p.wait_for_timeout(900)
    for _ in range(20):
        if p.evaluate("[...document.images].every(i=>i.complete)"): break
        p.wait_for_timeout(300)
    p.evaluate("window.scrollTo(0,0)"); p.wait_for_timeout(400)
results = []
with sync_playwright() as pw:
    for eng in engines:
        br = getattr(pw, eng).launch()
        for w in widths:
            mobile = w < 768
            ctx = br.new_context(viewport={"width": w, "height": H.get(w, 900)}, device_scale_factor=2 if w <= 1024 else 1,
                                 is_mobile=mobile if eng == "chromium" else False, has_touch=w <= 1180)
            p = ctx.new_page(); errs = []
            p.on("pageerror", lambda e: errs.append(str(e)))
            p.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
            p.goto(url, wait_until="load", timeout=60000)
            if os.environ.get("PSQ_PASS") and p.locator("form[action='/login']").count():
                p.fill("#u", os.environ.get("PSQ_USER", "sahil")); p.fill("#p", os.environ["PSQ_PASS"])
                with p.expect_navigation(wait_until="load", timeout=60000): p.click("form[action='/login'] button")
            p.wait_for_timeout(600); errs.clear()  # the login page itself answers 401 by design
            scroll_all(p)
            r = {"engine": eng, "w": w, **p.evaluate(CHECK)}
            tag = f"{eng}-{w}"
            if shots:
                p.screenshot(path=f"{out}/{tag}-top.png")
                p.screenshot(path=f"{out}/{tag}-full.png", full_page=True)
            # filters
            n_all = p.evaluate("document.querySelectorAll('.pj:not([hidden])').length")
            p.click(".chip[data-filter=commercial]"); p.wait_for_timeout(150)
            n_com = p.evaluate("document.querySelectorAll('.pj:not([hidden])').length")
            p.click(".chip[data-filter=turnkey]"); p.wait_for_timeout(150)
            n_tk = p.evaluate("document.querySelectorAll('.pj:not([hidden])').length")
            if shots and w in (375, 1440): p.locator("#projects").screenshot(path=f"{out}/{tag}-projects-turnkey.png")
            p.click(".chip[data-filter=all]"); p.wait_for_timeout(150)
            r["filter"] = [n_all, n_com, n_tk]
            # slider drag
            sl = p.locator("#slider"); sl.scroll_into_view_if_needed(); p.wait_for_timeout(200); b = sl.bounding_box()
            p.mouse.move(b["x"] + b["width"] * .5, b["y"] + b["height"] / 2); p.mouse.down()
            p.mouse.move(b["x"] + b["width"] * .2, b["y"] + b["height"] / 2, steps=6); p.mouse.up()
            r["slider"] = p.evaluate("document.querySelector('#slider .handle').getAttribute('aria-valuenow')")
            if shots and w in (375, 1440): sl.screenshot(path=f"{out}/{tag}-slider.png")
            # form: empty submit -> errors; valid -> preview message
            p.locator("#visit button[type=submit]").scroll_into_view_if_needed(); p.click("#visit button[type=submit]")
            r["form_err"] = p.evaluate("!document.getElementById('ferr').hidden")
            p.fill("#f-name", "Test Name"); p.fill("#f-mob", "9876543210"); p.select_option("#f-type", "3 BHK"); p.fill("#f-area", "Kudasan")
            p.click("#visit button[type=submit]"); p.wait_for_timeout(300)
            r["form_preview"] = p.evaluate("!document.getElementById('fprev').hidden && document.getElementById('fmsg').textContent.includes('3 BHK')")
            if shots and w in (375, 1440): p.locator("#visit").screenshot(path=f"{out}/{tag}-form.png")
            # lightbox
            p.locator(".pj").first.scroll_into_view_if_needed(); p.locator(".pj").first.click(); p.wait_for_timeout(400)
            r["lightbox"] = p.evaluate("document.getElementById('lb').open && document.getElementById('lbimg').complete && document.getElementById('lbimg').naturalWidth>0")
            if shots and w in (375, 1440): p.screenshot(path=f"{out}/{tag}-lightbox.png")
            p.keyboard.press("Escape"); p.wait_for_timeout(200)
            r["lightbox_closed"] = p.evaluate("!document.getElementById('lb').open")
            # video
            p.locator("#svid").scroll_into_view_if_needed(); p.wait_for_timeout(1500)
            r["video"] = p.evaluate("(()=>{const v=document.getElementById('svid');return {src:!!v.currentSrc,muted:v.muted,ready:v.readyState,paused:v.paused,err:v.error&&v.error.code}})()")
            # menu (mobile/tablet)
            if p.evaluate("getComputedStyle(document.querySelector('.burger')).display!=='none' && getComputedStyle(document.querySelector('.mob')).display!=='none'"):
                p.evaluate("window.scrollTo(0,0)"); p.wait_for_timeout(300)
                p.click(".burger"); p.wait_for_timeout(400)
                r["menu_open"] = p.evaluate("!document.getElementById('menu').hidden")
                if shots: p.screenshot(path=f"{out}/{tag}-menu.png")
                p.click("#menu nav a[href='#projects']"); p.wait_for_timeout(900)
                r["menu_nav"] = p.evaluate("document.getElementById('menu').hidden && Math.abs(document.getElementById('projects').getBoundingClientRect().top) < 120")
            r["errors"] = errs[:8]
            r["ok"] = (not r["hscroll"] and not r["offscreen"] and not r["broken"] and r["filter"][1] >= 1 and r["filter"][2] >= 1 and r["filter"][0] > r["filter"][1]
                       and int(r["slider"]) < 35 and r["form_err"] and r["form_preview"] and r["lightbox"] and r["lightbox_closed"] and not r["errors"] and r.get("menu_open", True) and r.get("menu_nav", True))
            print(json.dumps(r), flush=True); results.append(r)
            ctx.close()
        br.close()
json.dump(results, open(f"{out}/results.json", "w"), indent=1)
print("ALL OK" if all(r["ok"] for r in results) else "FAILURES: " + ", ".join(f"{r['engine']}-{r['w']}" for r in results if not r["ok"]))
