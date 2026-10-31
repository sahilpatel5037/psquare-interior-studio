#!/usr/bin/env python3
"""Build + publish the PRIVATE preview of the P Square Interior Studio website (login-gated).
Source of truth: site/ (pure static, Vercel-ready). Secrets: /home/user/tab/state/psquare-private/config.json (never in site/).
- Main host (<slug>): login + public "Coming soon" cover; HTML/CSS/JS/fonts/logo packed inside the Worker, served only after login
  (cover/login need only fonts + logo + favicon, which are public).
- Media hosts (<media_slugs>): photos packed inside each Worker script, the studio video as an unlisted random-path asset; every file
  answers 403 unless the URL carries a fresh signed token (?k=) which only the logged-in page hands out (valid ~24 h).
- Publish limit: each folder is kept under ~880 KB (bigger multi-slice publishes have failed before).
Usage: TAB_TASK_ID=<id> python3 build_private.py [--no-publish] [--main-only]"""
import base64, json, os, re, shutil, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); SITE = HERE + "/site"; PUB = HERE + "/publish"
CFG = json.load(open("/home/user/tab/state/psquare-private/config.json"))
SITE_MODE = "paused"   # "paused" = public cover at "/", full site at /?preview=1 after login.  "live" = open to everyone.
LIMIT = 860000
CT = {".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml",
      ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".json": "application/json", ".mp4": "video/mp4"}
TEXT = (".html", ".css", ".js", ".svg", ".txt", ".json")
host = lambda m: f"https://{CFG['media_slugs'][m]}.sites.tab.bot"
# ---- media plan (31 Oct v2): only media referenced by the site's text files is shipped. Videos are raw assets, photos are packed
# (base64) inside each media Worker. First-fit-decreasing into hosts m1, m2, m3 ... (config.json media_slugs), each folder < LIMIT.
# Cache-busting: write "assets/media/x.mp4?v=2" in the HTML -> "<host>/x.mp4?k=<token>&v=2".
media = {}  # site path -> (host key, name)
_txt = ""
for root, _, fs in os.walk(SITE):
    for f in fs:
        if os.path.splitext(f)[1].lower() in TEXT: _txt += open(os.path.join(root, f), encoding="utf-8").read()
refs = sorted(set(re.findall(r"assets/((?:img|media)/[A-Za-z0-9_\-]+\.(?:jpg|mp4))", _txt)))
items = []  # (cost, kind, name, path)
for r in refs:
    p = SITE + "/assets/" + r; kind, name = r.split("/")
    assert os.path.exists(p), "referenced but missing: assets/" + r
    if kind == "media":
        assert os.path.getsize(p) < LIMIT - 8000, f"{name} is over the per-host limit: re-encode smaller"
        items.append((os.path.getsize(p), "vid", name, p))
    else: items.append(((os.path.getsize(p) * 4) // 3 + 64, "img", name, p))
host_keys = sorted(CFG["media_slugs"], key=lambda k: int(k[1:]))
bins = []  # [used, {"img":{}, "vid":{}}]
for cost, kind, name, p in sorted(items, key=lambda x: (x[1] != "vid", -x[0])):
    for bn in bins:
        if bn[0] + cost <= LIMIT - 8000: break
    else:
        bn = [0, {"img": {}, "vid": {}}]; bins.append(bn)
    bn[0] += cost; bn[1][kind][name] = p
assert len(bins) <= len(host_keys), f"need {len(bins)} media hosts, config.json has {len(host_keys)}: add psq-mN-1dd3f5 slugs"
groups = {}
for k, bn in zip(host_keys, bins):
    groups[k] = bn[1]
    for name in bn[1]["img"]: media["assets/img/" + name] = (k, name)
    for name in bn[1]["vid"]: media["assets/media/" + name] = (k, name)
def rewrite(body):
    def rep(m):
        p = m.group(1); h = media.get(p)
        if not h: return m.group(0)
        return f"{host(h[0])}/{h[1]}?k=__MK__" + (f"&v={m.group(2)}" if m.group(2) else "")
    return re.sub(r"(assets/(?:img|media)/[A-Za-z0-9_\-]+\.(?:jpg|mp4))(?:\?v=([A-Za-z0-9_.\-]+))?", rep, body)
# ---- main worker files
files = {}
for root, _, fs in os.walk(SITE):
    for f in fs:
        full = os.path.join(root, f); rel = os.path.relpath(full, SITE).replace(os.sep, "/"); ext = os.path.splitext(f)[1].lower()
        if rel in media or rel == "vercel.json" or re.match(r"assets/(?:img|media)/.+\.(?:jpg|mp4)$", rel): continue  # unreferenced media is not shipped
        ct = CT.get(ext, "application/octet-stream")
        if ext in TEXT: files[rel] = [ct, rewrite(open(full, encoding="utf-8").read()), False]
        else: files[rel] = [ct, base64.b64encode(open(full, "rb").read()).decode(), True]
left = re.findall(r"assets/(?:img|media)/[^\"' )]+\.(?:jpg|mp4)", json.dumps({k: v[1] for k, v in files.items() if not v[2]}))
assert not left, "un-rewritten media refs: %s" % left[:5]
logo = "data:image/png;base64," + base64.b64encode(open(SITE + "/assets/img/logo-192.png", "rb").read()).decode()
cover = open(HERE + "/private/cover_template.html", encoding="utf-8").read().replace("%LOGO%", logo)
login = open(HERE + "/private/login_template.html", encoding="utf-8").read().replace("%LOGO%", logo)
vals = {"USER": json.dumps(CFG["username"]), "PH": json.dumps(CFG["pw_hash"]), "SECRET": json.dumps(CFG["session_secret"]), "SALT": json.dumps(CFG["salt"]),
        "MSECRET": json.dumps(CFG["media_secret"]), "LOGIN": json.dumps(login), "COVER": json.dumps(cover), "MODE": json.dumps(SITE_MODE), "FILES": json.dumps(files, ensure_ascii=False)}
gate = re.sub(r"%(USER|PH|SECRET|SALT|MSECRET|LOGIN|COVER|MODE|FILES)%", lambda m: vals[m.group(1)], open(HERE + "/private/gate_template.js", encoding="utf-8").read())
if os.path.isdir(PUB): shutil.rmtree(PUB)
def folder_size(d): return sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(d) for f in fs)
out = {}
o = PUB + "/main"; os.makedirs(o)
open(o + "/_worker.js", "w", encoding="utf-8").write(gate); open(o + "/robots.txt", "w").write("User-agent: *\nDisallow: /\n")
json.dump({"kind": "worker", "entry": "_worker.js"}, open(o + "/tab-site.json", "w")); out["main"] = (CFG["slug"], o, "P Square Interior Studio (private preview)")
mt = open(HERE + "/private/media_worker_template.js", encoding="utf-8").read()
for k, g in sorted(groups.items()):
    o = PUB + "/" + k; os.makedirs(o)
    img = {n: ["image/jpeg", base64.b64encode(open(p, "rb").read()).decode()] for n, p in g["img"].items()}
    vid = {}
    for n, p in g["vid"].items():
        os.makedirs(o + "/" + CFG["video_dir"], exist_ok=True); shutil.copy(p, o + "/" + CFG["video_dir"] + "/" + n); vid[n] = CFG["video_dir"] + "/" + n
    js = mt.replace("%MSECRET%", json.dumps(CFG["media_secret"])).replace("%IMG%", json.dumps(img)).replace("%VID%", json.dumps(vid))
    open(o + "/_worker.js", "w").write(js); open(o + "/index.html", "w").write('<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>.</title>')
    json.dump({"kind": "worker", "entry": "_worker.js"}, open(o + "/tab-site.json", "w"))
    out[k] = (CFG["media_slugs"][k], o, f"P Square preview media {k}")
for k, (slug, o, t) in out.items():
    s = folder_size(o); print(f"{k}: {slug} {s} bytes" + (f" ({len(groups[k]['img'])} photos, {len(groups[k]['vid'])} video)" if k in groups else f" ({len(files)} files packed)"))
    assert s < 880000, f"{k} folder over ~880 KB"
if "--no-publish" in sys.argv: sys.exit(0)
order = ["main"] if "--main-only" in sys.argv else [k for k in out if k != "main"] + ["main"]
bad = 0
for k in order:
    slug, o, t = out[k]
    r = subprocess.run(["timeout", "-k", "5", "600", "node", "/home/user/tab/publish-cli.mjs", "site.publish", json.dumps({"slug": slug, "source_dir": o, "title": t})], capture_output=True, text=True)
    s = r.stdout
    try: res = json.loads(s[s.find("{"):]); rr = res.get("result", res)
    except Exception: res, rr = {"ok": False}, {"error": (s + r.stderr)[-800:]}
    print(k, json.dumps({"ok": res.get("ok"), **{x: rr.get(x) for x in ("status", "url", "error", "unchanged")}}, ensure_ascii=False), flush=True)
    if not res.get("ok"): bad += 1; print(s[:1500])
sys.exit(1 if bad else 0)
