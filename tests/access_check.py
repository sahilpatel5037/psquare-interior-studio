#!/usr/bin/env python3
"""Logged-out / logged-in access check for the live private preview. Usage: python3 tests/access_check.py
Reads slugs + password from /home/user/tab/state/psquare-private/config.json (never prints the password)."""
import json, re, sys, requests
C = json.load(open("/home/user/tab/state/psquare-private/config.json")); B = f"https://{C['slug']}.sites.tab.bot"
fails = []
def check(name, cond):
    print(("PASS " if cond else "FAIL ") + name); cond or fails.append(name)
r = requests.get(B + "/", timeout=30)
check("cover is public (200) and says coming soon", r.status_code == 200 and "coming soon" in r.text)
check("cover leaks nothing private", not any(x in r.text for x in ["psq-m", "Selected", "main.js", "config.js", "__MK__"]))
for p in ["/?preview=1", "/config.js", "/assets/js/main.js", "/assets/css/style.css"]:
    r = requests.get(B + p, timeout=30, allow_redirects=False); check(f"logged out {p} -> login (401)", r.status_code == 401 and "Sign in" in r.text)
s = requests.Session()
r = s.post(B + "/login", data={"u": C["username"], "p": "wrong-password", "next": "/?preview=1"}, allow_redirects=False, timeout=30)
check("wrong password refused", r.status_code == 401)
r = s.post(B + "/login", data={"u": C["username"], "p": C["password"], "next": "/?preview=1"}, allow_redirects=False, timeout=30)
check("right password -> 303 + session cookie", r.status_code == 303 and "psq_session" in s.cookies)
r = s.get(B + "/?preview=1", timeout=30); check("logged in -> full site", r.status_code == 200 and "Selected" in r.text)
urls = sorted(set(u.replace("&amp;", "&") for u in re.findall(r"https://psq-m\d+-[0-9a-f]+\.sites\.tab\.bot/[^\"\s,]+", r.text + s.get(B + "/config.js", timeout=30).text)))
check(f"page carries signed media URLs ({len(urls)})", len(urls) > 20)
bad = [u for u in urls if requests.get(u, timeout=30, headers={"Range": "bytes=0-99"}).status_code not in (200, 206)]
check("every signed media URL loads", not bad)
unsigned = [u for u in urls[:6] + [x for x in urls if x.split("?")[0].endswith(".mp4")] if requests.get(u.split("?")[0], timeout=30).status_code != 403]
check("media without token -> 403", not unsigned)
forged = requests.get(urls[0].split("?")[0] + "?k=1900000000." + "a" * 32, timeout=30).status_code
check("forged token -> 403", forged == 403)
print("ALL PASS" if not fails else f"{len(fails)} FAIL"); sys.exit(1 if fails else 0)
