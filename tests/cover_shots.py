
import sys
from playwright.sync_api import sync_playwright
B,out=sys.argv[1],sys.argv[2]
with sync_playwright() as pw:
  for eng in ["chromium","webkit"]:
    br=getattr(pw,eng).launch()
    for w,h in [(375,812),(1440,900)]:
      ctx=br.new_context(viewport={"width":w,"height":h},device_scale_factor=2 if w<800 else 1);p=ctx.new_page()
      p.goto(B+"/",wait_until="load");p.wait_for_timeout(800)
      sw=p.evaluate("document.scrollingElement.scrollWidth>document.documentElement.clientWidth+1")
      p.screenshot(path=f"{out}/cover-{eng}-{w}.png");
      p.goto(B+"/?preview=1",wait_until="load");p.wait_for_timeout(500);p.screenshot(path=f"{out}/login-{eng}-{w}.png")
      print(eng,w,"hscroll",sw);ctx.close()
    br.close()
