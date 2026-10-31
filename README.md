# P Square Interior Studio — website (PRIVATE preview)

Built 31 Oct 2026 for Sahil (family project — Ridham Patel, Sahil's cousin, works at P Square; free, keep it a surprise).
Design = the approved mockup (/home/user/tab/files/psquare-mockup/psquare-website-mockup.jpg): Dark Luxury, gold, their real gold-circle P logo.

## Live preview
- Public URL: https://psquare-studio-1dd3f5.sites.tab.bot/  → P Square "Coming soon" cover only (no timer, nothing private).
- Full site: https://psquare-studio-1dd3f5.sites.tab.bot/?preview=1  → login (username `sahil`; password in /home/user/tab/state/psquare-private/config.json).
- Logout: /logout. Session cookie lasts 30 days.

## Folders
- `site/` — the real website, pure static, Vercel-ready (deploy this folder as-is; `vercel.json` included).
  - `site/config.js` — THE one settings file: PHONE (Call + WhatsApp), optional WHATSAPP, ADDRESS, CITY, MAP_URL, INSTAGRAM,
    GOOGLE_REVIEWS_URL, STUDIO_VIDEO + STUDIO_POSTER (+ STUDIO_VIDEO_HAS_SOUND for the gold Sound button).
  - `site/index.html`, `site/assets/css/style.css`, `site/assets/js/main.js` (no libraries), `site/assets/fonts/`, `site/assets/img/`, `site/assets/media/office-studio.mp4`.
- `source-frames/` — the real P Square reel frames the photos come from; `prepare_assets.py` makes the web images (crops keep reel text/logo watermarks out).
- `private/` — login page, cover page, gate Worker + media Worker templates.
- `build_private.py` — builds `publish/` and publishes the preview. `publish/` is generated; never edit it.
- `tests/qa.py` (devices × engines, functional checks + screenshots), `tests/access_check.py` (logged-out / token checks), `tests/cover_shots.py`.
- `qa/` — QA screenshots + results.json.

## How the private preview works
- Main host `psquare-studio-1dd3f5`: one Worker. "/" = public cover; everything else needs the login (POST /login u,p,next → 303 + HttpOnly cookie).
  Only fonts, logo and favicon are public (the cover/login pages need them).
- Media hosts `psq-m1..m4-1dd3f5` (unlisted): photos are packed inside each Worker script; the studio video is an asset at a random
  unlisted path on m1. Every media URL answers 403 unless it carries a signed token (`?k=`), which only the logged-in page hands out (valid ~24 h).
  Honest note: the raw video asset path (random 24-hex folder, never sent to any browser) would be readable if someone knew it.
- Each publish folder stays under ~880 KB (bigger multi-slice publishes failed before), so photos are split over m2–m4 automatically.

## Common edits
- Phone/WhatsApp known → `PHONE: "+91 9xxxx xxxxx"` in site/config.js → `TAB_TASK_ID=<id> python3 build_private.py`.
  (Until then Call buttons show a toast "number will be added soon", WhatsApp buttons scroll to the form, the form shows the composed message.)
- Swap the studio video: copy the new mp4 (≤ 860 KB, H.264, +faststart) to `site/assets/media/office-studio.mp4`, its poster to
  `source-frames/studio-still-1.jpg`, run `python3 prepare_assets.py`, set STUDIO_VIDEO_HAS_SOUND true if it has music, then build_private.py.
- Go public: set `SITE_MODE = "live"` in build_private.py (or deploy `site/` to Vercel).
- Re-test: `PSQ_PASS=<pw> python3 tests/qa.py 'https://psquare-studio-1dd3f5.sites.tab.bot/?preview=1' qa/live` and `python3 tests/access_check.py`.

## Still placeholder (needs real info)
- Phone / WhatsApp number (config PHONE), full studio address + exact Google Maps pin, Google reviews (cards say "sample"),
  Google profile link. Project category labels (Residential / Commercial / Turnkey) were chosen by us from the photos — confirm with the studio.

## 31 Oct v2 — VIDEO projects + OUR TEAM (Sahil 4:55 PM: "Need to add video not image only… team section… we will update that later"; 4:57 PM "9+ years")
- PROJECTS is now video-led: 12 muted autoplay-on-view loops (playsinline, preload none, src set only when the card is on screen, paused off screen,
  off for prefers-reduced-motion) + 4 photos = 16 cards, all 4:5. Grid 4 cols (>900px) / 3 cols (641–900) / 2 cols (phones).
  Tap a card = full-screen viewer: videos play WITH SOUND + native controls (fullscreen button), photos larger; swipe/arrows move between visible cards.
  Filters (data-cat can hold several words, e.g. "residential turnkey"). EVEN GRID: a gold "Your space could be next → Book a FREE Site Visit"
  card (#pjcta) appears only when the visible count doesn't fill the last row and spans exactly the empty cells (re-checked on resize/filter).
- Clips = the cleaned P Square reel cuts from ridham-site (site/media p01–p11, H.264 + AAC, faststart): pr01..pr11.mp4 in site/assets/media,
  posters pr01..pr11.jpg in site/assets/img (pr06 poster re-cut from the final-render part at 7.5 s). Checked frame-by-frame (2 fps): no Instagram
  text, no handles, no client nameplates/flat numbers/family photos. P Square's own small gold logo shows in a few clips (their brand; the 4:5
  card crop, object-position 50% 15%, hides it in the grid).
- Commercial card = "Our Own Studio": grid preview pr12.mp4 (540x676, 15 s, silent, cut from office-pro-16x9.mp4 2–17 s, letterbox + title card
  cropped out); tap plays the full studio video (office-studio.mp4?v=pro2, with sound). Commercial photos c_conf / c_work = balloon-free frames of the
  same edit. Removed from the grid: office.jpg + st_conf.jpg (opening-day balloons), p_dining2 + p_bedroom2 (same rooms as videos), g_tv/g_bed1/g_lounge.
- Cache-busting: write "assets/media/x.mp4?v=N" in HTML/config; build_private.py turns it into "<host>/x.mp4?k=<token>&v=N". Bump N when a clip changes.
- build_private.py media plan: ONLY media referenced by index.html/config.js/css/js is shipped; videos (raw assets) + photos (packed) are spread
  first-fit-decreasing over psq-m1..m12 (config.json media_slugs), every folder < ~860 KB. Today: m1 = studio video alone, m2–m7 = 2 clips each,
  m8–m10 photos. Add more psq-mN-1dd3f5 slugs to config.json if the packer asks.
- OUR TEAM (#team, between Process and Reviews; in nav, mobile menu, footer): cards come from TEAM in site/config.js
  ([{name, role, photo}] — 4 empty entries now = gold silhouette, "Name — coming soon", "Role — coming soon", plus a small placeholder note that
  hides itself once every card has a name+role). Real people: fill the entries, copy square photos (~600x600 .jpg) into site/assets/img/, write
  photo: "assets/img/<file>.jpg", rebuild. Cards wrap centred, so 3 or 5 people also look balanced.
- "8+ years" -> "9+ years" everywhere (About badge + text, Studio intro).
- Backup before this pass: backup-pre-video-team/. QA script: /home/user/tab/tasks/78f99aed-6840-4840-847b-dfdc07cc18a8/work/qa_live.py.

## 31 Oct v3 — logo-free videos + polish + LAUNCH COUNTDOWN (Sahil 6:02 PM "Karo do"; 6:05 PM countdown + preview video)
- Project clips pr01–pr05 + pr09–pr11 swapped for the logo-free 4:5 cuts from ridham-site/site/media (p01–p05, p09–p11; 540x676, H.264+AAC).
  Posters pr01–05/09–11 = the matching 4:5 posters; pr09 poster re-cut sharp from the 1080p source (DdJzJm6yfxR @2.7 s, 648x810).
  pr06/pr07/pr08 unchanged (never had the logo). Cache-buster ?v=3 on those clips + posters.
- Studio video office-studio.mp4 re-cut: starts at 2.3 s (title card gone), letterbox cropped (crop 952:536:164:92 -> 960x540 16:9),
  15.25 s, 814 KB, music kept (fade in/out). Poster studio-v3.jpg (first frame). ?v=pro3.
- LAUNCH COUNTDOWN (copied feel of mm-site-v4): assets/js/countdown.js + "launch countdown" block at the end of style.css + #launch
  overlay at the top of <body>. config.js: LAUNCH_AT (null = "Launching soon — after Diwali" screen, no numbers, no reveal) and
  LAUNCH_NOTE. Set a date: LAUNCH_AT: "2026-11-15T10:00:00+05:30" -> rebuild (python3 build_private.py --main-only).
  At zero: logo flare -> curtains split -> full site fades in. ?preview=1 = full site; ?launch=<ISO> = test any date.
  Gate change (private/gate_template.js): logged OUT "/" = public cover (unchanged); logged IN "/" = countdown; /?preview=1 = full site.
  Going live later: SITE_MODE "live" makes "/" show the countdown to everyone until LAUNCH_AT.
- Known (not fixed): video files are also readable at their raw asset path (random 24-hex folder, never sent to any browser) without
  a token — the host serves static assets before the Worker runs, and there is no setting to change that. Signed URLs work for anyone
  holding them for ~24 h. Everything else needs the login/token (access_check 13/13).
- Backup before this pass: backup-pre-v3/ (index.html, config.js, gate_template.js, old clips + posters). QA: qa/v3/ (+ qa/v3/countdown/).

## 31 Oct v4 — FULL-SCREEN BACKGROUND FILM on the countdown (Sahil 6:37 PM "Ha" to "P Square mein bhi Ridham jaisa full screen video laga du?")
- Behind the countdown / "Launching soon" screen: a muted, looping, playsinline interior film, object-fit cover over the full viewport,
  dimmed (brightness .68 + dark veil + 1px blur) so the text stays readable. Two cuts, picked by screen shape in countdown.js:
  - portrait screens (aspect <= 1): assets/media/psq-bg-p.mp4 (576x720 4:5, 6.2 s, 437 KB) + poster assets/img/psq-bg-p.jpg
  - wide screens: assets/media/psq-bg-w.mp4 (1024x576 16:9, 6.2 s, 535 KB) + poster assets/img/psq-bg-w.jpg
  Footage = P Square's own logo-free cuts (same clean crop region as pr03/pr05/pr01, from ridham-site/media-src/audio 1080p sources):
  DcyR2GgS3Mz 2.78–5.23 s (dining + chandelier) -> DSMdcLtiOe_ 20.65–22.75 s (bedroom) -> DeXEMEXIjxk 5.4–8.0 s (white living), 0.5 s crossfades, no sound.
  Portrait crop = crop=iw:iw*5/4:0:ih*0.025 (same as the clean 4:5 clips); wide = crop=iw:iw*9/16:0:ih*0.33 (inside the clean region; the gold
  P logo sat at 77–93% of frame height). Checked at 2–5 fps: no logo, no text overlays, no handles. Cache-buster ?v=5.
- The film only loads when the countdown screen shows (never on ?preview=1). prefers-reduced-motion = poster only (no video request).
  If autoplay is refused (iOS Low Power Mode) the poster stays and the film starts on the first touch.
- Reveal at zero (~7.3 s): logo + tiles flare (1.1 s) -> text zooms away, film goes full bright with "NOW OPEN · P Square Interior Studio" (3.3 s)
  -> dark curtains close with a gold seam (1.15 s) -> curtains open on the full site, which scales in (1.7 s). Same feel as the Ridham countdown.
- Hosting: the two clips ride the normal media plan (signed ?k= URLs on psq-mN hosts; build_private.py packs them; m11 now used for photos).
- QA: tests/qa_v4.py -> qa/v4/ (webkit-375-*, chromium-1440-*: 1 soon, 2 countdown, 3 zero flare, 4 now open, 5 curtains, 6 site opening,
  7 site, 8 preview; results.json; contact-*.jpg) + qa/v4/psquare-countdown-v4-preview.mp4 (phone 720x1558, 19 s, 9 s test timer).
- Backup before this pass: backup-pre-v4/ (index.html, config.js, style.css, countdown.js, build_private.py, README.md).


## GitHub + Vercel (31 Oct 2026)
- GitHub repo (PRIVATE): https://github.com/sahilpatel5037/psquare-interior-studio — full source (site/, launch/, build scripts, templates, tests). No passwords: the private-preview login lives only in /home/user/tab/state/ on Tab's box.
- Vercel project `psquare-interior-studio` (imported from that repo, auto-deploys on every push to `main`).
- **Vercel serves ONLY the countdown page.** The root `vercel.json` sets `"outputDirectory": "launch"`, so production and every preview deployment contain only `launch/` (countdown HTML, its CSS/JS, logo, icons, fonts, background loop). `site/` (the full website) is in the repo but is never deployed until launch day. Unknown paths answer 404 -> back to the countdown.
- `launch/` is generated: `python3 build_launch.py` (reads LAUNCH_AT / LAUNCH_NOTE from site/config.js). Re-run it after any change to the countdown, then commit `launch/`.
- Private full preview (login): https://psquare-studio-1dd3f5.sites.tab.bot/?preview=1 (user `sahil`)

### Launch day (full site public on Vercel)
1. Set `LAUNCH_AT` in site/config.js (e.g. "2026-11-15T10:00:00+05:30"), run `python3 build_launch.py` and push: the Vercel page now counts down with numbers.
2. A few minutes before the launch time, change the root `vercel.json` `"outputDirectory": "launch"` -> `"site"` and push (Vercel redeploys in ~30 s). The full site's own countdown keeps showing until zero, then the reveal opens it.
   (Before that switch nothing of the full site is on Vercel; after it, the site's HTML is public, so keep that window short.)
3. Optional: remove the `X-Robots-Tag: noindex` header in `vercel.json` (and `<meta name="robots" content="noindex">` in site/index.html, `robots.txt`) so Google can index it.
