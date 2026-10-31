#!/usr/bin/env python3
"""v4 QA: logged-in countdown with full-screen background film (webkit 375 + chromium 1440) + reveal frames + preview recording.
Usage: python3 tests/qa_v4.py [outdir]   (password read from the private config, never printed)"""
import asyncio, sys, json, datetime, os
from playwright.async_api import async_playwright
C=json.load(open("/home/user/tab/state/psquare-private/config.json")); B=f"https://{C['slug']}.sites.tab.bot"
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.dirname(os.path.abspath(__file__))+"/../qa/v4"
FILM="(()=>{const v=document.querySelector('.ln-film video');if(!v)return null;const r=v.getBoundingClientRect();return {host:(v.currentSrc||'').split('/')[2]||null,paused:v.paused,ready:v.readyState,t:+v.currentTime.toFixed(2),vw:v.videoWidth,vh:v.videoHeight,box:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],on:v.classList.contains('on')}})()"
res={}
async def login(ctx):
  r=await ctx.request.post(B+"/login",form={"u":C["username"],"p":C["password"],"next":"/?preview=1"},max_redirects=0)
  assert r.status==303,r.status
async def run():
  async with async_playwright() as p:
    for eng,w,h in [("webkit",375,812),("chromium",1440,900)]:
      b=await getattr(p,eng).launch()
      ctx=await b.new_context(viewport={"width":w,"height":h},device_scale_factor=2 if w<500 else 1,has_touch=w<500)
      await login(ctx); pg=await ctx.new_page(); errs=[]
      pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None); pg.on("pageerror",lambda e: errs.append(str(e)))
      pg.on("requestfailed",lambda r: errs.append("requestfailed "+r.url.split("?")[0]) if "psq-bg" in r.url else None)
      R=res.setdefault(f"{eng}-{w}",{})
      # 1) current state: LAUNCH_AT null -> "Launching soon" over the film
      await pg.goto(B+"/",wait_until="load"); await pg.wait_for_timeout(4000)
      R["soon_film"]=await pg.evaluate(FILM); R["soon_text"]=await pg.evaluate("document.querySelector('.ln-soontxt')&&getComputedStyle(document.querySelector('.ln-soonbox')).display")
      await pg.screenshot(path=f"{OUT}/{eng}-{w}-1-soon.png")
      # 2) test timer ~9 s
      t=(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(seconds=9)).strftime("%Y-%m-%dT%H:%M:%SZ")
      await pg.goto(B+"/?launch="+t,wait_until="load"); await pg.wait_for_timeout(3000)
      R["countdown_film"]=await pg.evaluate(FILM)
      await pg.screenshot(path=f"{OUT}/{eng}-{w}-2-countdown.png")
      while await pg.evaluate("!document.querySelector('#launch.opening')"): await pg.wait_for_timeout(100)
      await pg.wait_for_timeout(500); await pg.screenshot(path=f"{OUT}/{eng}-{w}-3-zero-flare.png")
      await pg.wait_for_timeout(2300); R["play_film"]=await pg.evaluate(FILM); await pg.screenshot(path=f"{OUT}/{eng}-{w}-4-now-open.png")
      await pg.wait_for_timeout(1900); await pg.screenshot(path=f"{OUT}/{eng}-{w}-5-curtains.png")
      await pg.wait_for_timeout(900); await pg.screenshot(path=f"{OUT}/{eng}-{w}-6-site-opening.png")
      await pg.wait_for_timeout(2500); await pg.screenshot(path=f"{OUT}/{eng}-{w}-7-site.png")
      R["after_overlay_gone"]=await pg.evaluate("!document.getElementById('launch')")
      # 3) owner preview unchanged, film never requested
      await pg.goto(B+"/?preview=1",wait_until="load"); await pg.wait_for_timeout(1500)
      R["preview"]=await pg.evaluate("({launch:!!document.querySelector('#launch:not([hidden])'),film_src:(document.querySelector('.ln-film video')||{}).src||'',title:document.title,h1:(document.querySelector('h1')||{}).textContent})")
      await pg.screenshot(path=f"{OUT}/{eng}-{w}-8-preview.png")
      R["errors"]=errs; await b.close()
    # preview recording (phone, chromium)
    b=await p.chromium.launch()
    ctx=await b.new_context(viewport={"width":390,"height":844},device_scale_factor=2,record_video_dir=OUT+"/rec",record_video_size={"width":780,"height":1688})
    await login(ctx); pg=await ctx.new_page()
    t=(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(seconds=11)).strftime("%Y-%m-%dT%H:%M:%SZ")
    await pg.goto(B+"/?launch="+t,wait_until="load"); await pg.wait_for_timeout(21000)
    await ctx.close(); res["recording"]=str(await pg.video.path()); await b.close()
asyncio.run(run()); json.dump(res,open(OUT+"/results.json","w"),indent=1); print(json.dumps(res,indent=1))
