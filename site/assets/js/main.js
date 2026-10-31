/* P Square Interior Studio — site behaviour (no libraries) */
(function(){
"use strict";
var C=window.PSQ_CONFIG||{},d=document,$=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
var digits=function(s){return String(s||"").replace(/\D/g,"")};
var phoneDigits=digits(C.PHONE);if(phoneDigits.length===10)phoneDigits="91"+phoneDigits;
var waDigits=digits(C.WHATSAPP)||phoneDigits;
var yr=$("#yr");if(yr)yr.textContent=new Date().getFullYear();
/* toast */
var toastT,toast=$("#toast");
function say(msg){if(!toast)return;toast.textContent=msg;toast.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){toast.hidden=true},3600)}
/* config-driven text + links */
$$("[data-address]").forEach(function(e){if(C.ADDRESS)e.textContent=C.ADDRESS});
$$("[data-city]").forEach(function(e){if(C.CITY)e.textContent=C.CITY});
$$("[data-phone-text]").forEach(function(e){e.textContent=C.PHONE?C.PHONE:"Number coming soon"});
$$("[data-ig]").forEach(function(e){if(C.INSTAGRAM)e.href=C.INSTAGRAM});
$$("[data-map]").forEach(function(e){if(C.MAP_URL)e.href=C.MAP_URL});
$$("[data-reviews]").forEach(function(e){if(C.GOOGLE_REVIEWS_URL){e.href=C.GOOGLE_REVIEWS_URL;e.hidden=false}});
$$("[data-call]").forEach(function(e){
  if(phoneDigits){e.href="tel:+"+phoneDigits}
  else{e.classList.add("is-off");e.setAttribute("aria-label","Studio number coming soon");e.addEventListener("click",function(ev){ev.preventDefault();say("The studio's number will be added soon — please use the site-visit form for now.")})}
});
$$("[data-wa]").forEach(function(e){
  if(waDigits){e.href="https://wa.me/"+waDigits+"?text="+encodeURIComponent("Hello P Square Interior Studio, I'd like to know more about your interior services.");e.target="_blank";e.rel="noopener"}
  else{e.href="#book";e.addEventListener("click",function(){setTimeout(function(){say("WhatsApp number coming soon — fill the form and we'll show your message.")},400)})}
});
/* header: glass on scroll + active section */
var top=$("#top");
var waf=$(".waf");
function onScroll(){top.classList.toggle("scrolled",window.scrollY>30);if(waf)waf.classList.toggle("away",window.scrollY<window.innerHeight*.6)}
window.addEventListener("scroll",onScroll,{passive:true});onScroll();
if("IntersectionObserver" in window){
  var links=$$(".nav a");
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){var id=en.target.id;links.forEach(function(a){a.classList.toggle("on",a.getAttribute("href")==="#"+id)})}})},{rootMargin:"-45% 0px -50% 0px"});
  ["home","about","services","projects","concept","process","team","reviews","book","studio","contact"].forEach(function(id){var s=d.getElementById(id);if(s)io.observe(s)});
}
/* mobile menu */
var burger=$(".burger"),menu=$("#menu");
function setMenu(open){menu.hidden=!open;burger.setAttribute("aria-expanded",open?"true":"false");burger.setAttribute("aria-label",open?"Close menu":"Open menu");d.body.classList.toggle("locked",open);if(open)top.classList.add("scrolled");else onScroll()}
burger.addEventListener("click",function(){setMenu(menu.hidden)});
$$("a",menu).forEach(function(a){a.addEventListener("click",function(){setMenu(false)})});
d.addEventListener("keydown",function(e){if(e.key==="Escape"&&!menu.hidden)setMenu(false)});
window.addEventListener("resize",function(){if(window.innerWidth>900&&!menu.hidden)setMenu(false)});
/* project grid: filters, even grid (CTA card fills any gap), muted video previews that play only on screen */
var chips=$$(".chip"),grid=$("#grid"),tiles=$$(".pj[data-full]"),pcount=$("#pcount"),cta=$("#pjcta"),curCat="all";
var reduceMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function cols(){if(!grid)return 1;return getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length||1}
function balance(){
  if(!cta)return;var n=tiles.filter(function(t){return !t.hidden}).length,c=cols(),r=n%c;
  if(r===0||n===0){cta.hidden=true;cta.style.gridColumn=""}else{cta.hidden=false;cta.style.gridColumn="span "+(c-r)}
}
function filter(cat){
  curCat=cat;var n=0;
  tiles.forEach(function(t){var cs=(t.getAttribute("data-cat")||"").split(" ");var show=cat==="all"||cs.indexOf(cat)>-1;t.hidden=!show;if(show)n++;else stopTile(t)});
  chips.forEach(function(c){var on=c.getAttribute("data-filter")===cat;c.classList.toggle("on",on);c.setAttribute("aria-pressed",on?"true":"false")});
  balance();
  if(pcount)pcount.textContent=cat==="all"?"":("Showing "+n+" "+cat+" project"+(n===1?"":"s"));
  setTimeout(checkTiles,60);
}
chips.forEach(function(c){c.addEventListener("click",function(){filter(c.getAttribute("data-filter"))})});
var rT;window.addEventListener("resize",function(){clearTimeout(rT);rT=setTimeout(balance,120)});
balance();
/* grid video previews */
var vtiles=tiles.filter(function(t){return t.hasAttribute("data-video")}),lbOpen=false;
function startTile(t){
  if(reduceMotion||lbOpen||t.hidden)return;var v=t.querySelector("video");if(!v)return;
  if(!v.getAttribute("src")){v.muted=true;v.setAttribute("muted","");v.src=t.getAttribute("data-preview")||t.getAttribute("data-video")}
  if(v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){})}
}
function stopTile(t){var v=t.querySelector("video");if(v&&!v.paused)v.pause()}
vtiles.forEach(function(t){var v=t.querySelector("video");v.addEventListener("playing",function(){t.classList.add("playing")})});
var seen=[];
function checkTiles(){if(!vio)return;vtiles.forEach(function(t){if(seen.indexOf(t)>-1&&!t.hidden)startTile(t)})}
var vio=null;
if("IntersectionObserver" in window){
  vio=new IntersectionObserver(function(es){es.forEach(function(en){var t=en.target,i=seen.indexOf(t);
    if(en.isIntersecting){if(i<0)seen.push(t);startTile(t)}else{if(i>-1)seen.splice(i,1);stopTile(t)}})},{rootMargin:"120px 0px",threshold:0.2});
  vtiles.forEach(function(t){vio.observe(t)});
}
d.addEventListener("visibilitychange",function(){if(d.hidden)vtiles.forEach(stopTile);else checkTiles()});
/* lightbox: photos larger, videos full screen with sound + controls */
var lb=$("#lb"),lbimg=$("#lbimg"),lbvid=$("#lbvid"),cur=0;
function visible(){return tiles.filter(function(t){return !t.hidden})}
function stopLbVideo(){if(!lbvid)return;try{lbvid.pause()}catch(_){}lbvid.removeAttribute("src");try{lbvid.load()}catch(_){}lbvid.hidden=true}
function show(i){
  var v=visible();if(!v.length)return;cur=(i+v.length)%v.length;var t=v[cur],src=t.getAttribute("data-video");
  $("#lbcat").textContent=t.getAttribute("data-label");$("#lbtitle").innerHTML=t.getAttribute("data-title");$("#lbdesc").textContent=t.getAttribute("data-desc")||"";
  if(src&&lbvid){
    lbimg.hidden=true;lbimg.removeAttribute("src");
    lbvid.hidden=false;lbvid.poster=t.getAttribute("data-lbposter")||t.getAttribute("data-full");lbvid.src=src;lbvid.muted=false;lbvid.removeAttribute("muted");lbvid.volume=1;
    lbvid.setAttribute("aria-label",t.querySelector("img").alt);
    var p=lbvid.play();if(p&&p.catch)p.catch(function(){lbvid.muted=true;var q=lbvid.play();if(q&&q.catch)q.catch(function(){})});
  }else{
    stopLbVideo();lbimg.hidden=false;lbimg.src=t.getAttribute("data-full");lbimg.alt=t.querySelector("img").alt;
  }
}
tiles.forEach(function(t){t.addEventListener("click",function(){
  lbOpen=true;vtiles.forEach(stopTile);show(visible().indexOf(t));
  if(lb.showModal){if(!lb.open)lb.showModal();d.body.classList.add("locked")}
})});
if(lb){
  $(".lb-x",lb).addEventListener("click",function(){lb.close()});
  $(".lb-prev",lb).addEventListener("click",function(){show(cur-1)});
  $(".lb-next",lb).addEventListener("click",function(){show(cur+1)});
  lb.addEventListener("close",function(){d.body.classList.remove("locked");stopLbVideo();lbOpen=false;checkTiles()});
  lb.addEventListener("click",function(e){if(e.target===lb)lb.close()});
  lb.addEventListener("keydown",function(e){if(e.key==="ArrowLeft")show(cur-1);if(e.key==="ArrowRight")show(cur+1)});
  var sx=null;lb.addEventListener("touchstart",function(e){sx=e.touches[0].clientX},{passive:true});
  lb.addEventListener("touchend",function(e){if(sx===null)return;if(e.target===lbvid){sx=null;return}var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1));sx=null},{passive:true});
}
/* our team: cards come from TEAM in config.js (empty name/role = "coming soon") */
var tl=$("#teamlist");
if(tl&&C.TEAM&&C.TEAM.length){
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
  var sil='<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="11"/><path d="M12 54c2-11 10-17 20-17s18 6 20 17z"/></svg>';
  var anyPh=false;
  tl.innerHTML=C.TEAM.map(function(m){
    var nm=(m&&m.name||"").trim(),rl=(m&&m.role||"").trim(),ph=(m&&m.photo||"").trim();if(!nm||!rl)anyPh=true;
    return '<li class="tm'+(nm?'':' tm--ph')+'"><div class="av">'+(ph?'<img src="'+esc(ph)+'" alt="'+esc(nm||"Team member")+'" loading="lazy" decoding="async">':sil)+'</div>'+
      '<h3>'+(nm?esc(nm):'Name <span>— coming soon</span>')+'</h3><p>'+(rl?esc(rl):'Role — coming soon')+'</p></li>';
  }).join("");
  var tn=$("#teamnote");if(tn)tn.hidden=!anyPh;
}
/* before / after slider */
var sl=$("#slider");
if(sl){
  var h=$(".handle",sl),drag=false;
  var set=function(p){p=Math.max(0,Math.min(100,p));sl.style.setProperty("--pos",p+"%");h.setAttribute("aria-valuenow",Math.round(p))};
  var at=function(x){var r=sl.getBoundingClientRect();set((x-r.left)/r.width*100)};
  sl.addEventListener("pointerdown",function(e){drag=true;try{sl.setPointerCapture(e.pointerId)}catch(_){}at(e.clientX)});
  sl.addEventListener("pointermove",function(e){if(drag)at(e.clientX)});
  ["pointerup","pointercancel","lostpointercapture"].forEach(function(n){sl.addEventListener(n,function(){drag=false})});
  h.addEventListener("keydown",function(e){var v=+h.getAttribute("aria-valuenow");if(e.key==="ArrowLeft"||e.key==="ArrowDown"){set(v-5);e.preventDefault()}if(e.key==="ArrowRight"||e.key==="ArrowUp"){set(v+5);e.preventDefault()}if(e.key==="Home"){set(0);e.preventDefault()}if(e.key==="End"){set(100);e.preventDefault()}});
}
/* booking form -> WhatsApp */
var form=$("#visit");
if(form){
  var dt=$("#f-date"),now=new Date();now.setMinutes(now.getMinutes()-now.getTimezoneOffset());dt.min=now.toISOString().slice(0,10);
  form.addEventListener("submit",function(e){
    e.preventDefault();
    var name=form.name.value.trim(),mob=digits(form.mobile.value),type=form.type.value,area=form.area.value.trim(),date=form.date.value;
    if(mob.length===12&&mob.indexOf("91")===0)mob=mob.slice(2);
    var errs=[];$$(".bad",form).forEach(function(x){x.classList.remove("bad")});
    if(name.length<2){errs.push("your name");form.name.classList.add("bad")}
    if(!/^[6-9]\d{9}$/.test(mob)){errs.push("a valid 10-digit mobile number");form.mobile.classList.add("bad")}
    if(!type){errs.push("the property type");form.type.classList.add("bad")}
    var ferr=$("#ferr");
    if(errs.length){ferr.textContent="Please add "+errs.join(", ")+".";ferr.hidden=false;var b=$(".bad",form);if(b)b.focus();return}
    ferr.hidden=true;
    var nice=date?new Date(date+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"}):"Flexible";
    var msg="Hello P Square Interior Studio, I'd like to book a FREE site visit.\n\nName: "+name+"\nMobile: +91 "+mob+"\nProperty: "+type+"\nArea: "+(area||"—")+"\nPreferred date: "+nice;
    if(waDigits){window.open("https://wa.me/"+waDigits+"?text="+encodeURIComponent(msg),"_blank","noopener");$("#fprev").hidden=true}
    else{$("#fmsg").textContent=msg;$("#fprev").hidden=false;$("#fprev").scrollIntoView({block:"nearest",behavior:"smooth"})}
  });
}
/* studio video: silent loop, loaded only when near the screen */
var v=$("#svid");
if(v){
  if(C.STUDIO_POSTER)v.poster=C.STUDIO_POSTER;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var load=function(){if(v.getAttribute("src")||!C.STUDIO_VIDEO)return;v.muted=true;v.setAttribute("muted","");v.src=C.STUDIO_VIDEO;if(!reduce){var p=v.play();if(p&&p.catch)p.catch(function(){})}};
  if(reduce)v.removeAttribute("autoplay");
  var snd=$("#snd");
  if(snd&&C.STUDIO_VIDEO_HAS_SOUND){
    snd.hidden=false;
    snd.addEventListener("click",function(){
      load();var on=v.muted;v.muted=!on;if(on){v.removeAttribute("muted");v.volume=1;var p=v.play();if(p&&p.catch)p.catch(function(){v.muted=true;sync()})}
      sync();
    });
    var sync=function(){var on=!v.muted;snd.setAttribute("aria-pressed",on?"true":"false");snd.setAttribute("aria-label",on?"Turn sound off":"Turn sound on");snd.lastChild.textContent=on?"Sound on":"Sound"};
    v.addEventListener("volumechange",sync);
  }
  if("IntersectionObserver" in window){var vio=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){load();if(!reduce&&v.paused){var p=v.play();if(p&&p.catch)p.catch(function(){})}}else if(!v.paused)v.pause()})},{rootMargin:"300px 0px"});vio.observe(v)}else load();
}
})();
