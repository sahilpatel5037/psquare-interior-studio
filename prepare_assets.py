#!/usr/bin/env python3
"""Make the web images for site/assets/img from source-frames/ (real P Square reel frames).
Every crop below keeps reel text / the small corner logo watermark OUT of the frame. Re-run after changing a crop."""
import os
from PIL import Image
HERE=os.path.dirname(os.path.abspath(__file__)); SRC=HERE+"/source-frames"; OUT=HERE+"/site/assets/img"
os.makedirs(OUT,exist_ok=True)
def save(im,name,w,q=72):
    im=im.convert("RGB")
    if im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
    im.save(f"{OUT}/{name}.jpg","JPEG",quality=q,optimize=True,progressive=True)
def both(im,name,big=1280,small=640,q=70):
    save(im,name,big,q); save(im,name+"-sm",small,q)
def crop(name,box=None):
    im=Image.open(f"{SRC}/{name}")
    return im.crop(box) if box else im
# landscape frames (1276x720) — already text-free crops from the reels
for n in ["hero","cta","g_bed1","g_kitchen","g_tv","turnkey","kitchen"]: both(crop(n+".jpg"),n)
for n in ["res","design3d","office"]: both(crop(n+".jpg"),n,big=720,small=480)
both(crop("g_lounge.jpg"),"g_lounge",big=720,small=480)
for n in ["st_cabin","st_conf","st_lounge","st_lounge2"]: both(crop(n+".jpg"),n,big=1080,small=560)
# vertical reel frames 720x1280: keep y 40..940 (the reel's small gold logo sits near the bottom-left, below y~1000)
both(crop("p_foyer.png",(0,60,720,960)),"p_foyer",big=720,small=480)
both(crop("p_dining2.png",(0,40,720,940)),"p_dining2",big=720,small=480)
both(crop("p_bedroom2.png",(0,120,720,1020)),"p_bedroom2",big=720,small=480)
# before/after: the same camera from reel DcfrMM_SR4X — 3D concept (t=0.5 s) and the final design (t=9.6 s); band y 400..880
for a,b in [("ba_concept_full.png","ba_concept"),("ba_final_full.png","ba_final")]:
    both(crop(a,(0,404,720,876)),b,big=720,small=480,q=74)
# studio walkthrough poster: still-1 of the clean office edit (text-free, same grade as the loop)
both(crop("studio-still-1.jpg"),"studio-1")
# logo: their real gold-circle P mark
lm=Image.open(f"{SRC}/logo-mark.png").convert("RGBA")
for s in (96,192): lm.resize((s,round(lm.height*s/lm.width)),Image.LANCZOS).save(f"{OUT}/logo-{s}.png",optimize=True)
lm.resize((64,64),Image.LANCZOS).save(HERE+"/site/favicon.png",optimize=True)
lm.resize((180,180),Image.LANCZOS).save(HERE+"/site/apple-touch-icon.png",optimize=True)
tot=sum(os.path.getsize(f"{OUT}/{f}") for f in os.listdir(OUT)); print(len(os.listdir(OUT)),"images",tot//1024,"KB")
