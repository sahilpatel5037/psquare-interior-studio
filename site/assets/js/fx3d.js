(function(){
"use strict";
var d=document;if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var phone=matchMedia("(max-width:820px)").matches;
function mk(c,p){var e=d.createElement("div");e.className=c;if(p)p.appendChild(e);return e}
function cuboid(w,h,dp,x,y,z,parent){var b=mk("p3-box",parent);b.style.cssText="width:"+w+"px;height:"+h+"px;left:50%;top:50%;margin:-"+h/2+"px 0 0 -"+w/2+"px;transform:translate3d("+x+"px,"+y+"px,"+z+"px)";
 [["rotateY(0deg)",w,h,dp/2],["rotateY(180deg)",w,h,dp/2],["rotateY(90deg)",dp,h,w/2],["rotateY(-90deg)",dp,h,w/2],["rotateX(90deg)",w,dp,h/2],["rotateX(-90deg)",w,dp,h/2]].forEach(function(f){var i=d.createElement("i");i.style.cssText="width:"+f[1]+"px;height:"+f[2]+"px;left:50%;top:50%;margin:-"+f[2]/2+"px 0 0 -"+f[1]/2+"px;transform:"+f[0]+" translateZ("+f[3]+"px)";b.appendChild(i)});return b}
var shapes={
 arch:function(r){cuboid(26,150,26,-52,0,0,r);cuboid(26,150,26,52,0,0,r);cuboid(130,26,26,0,-62,0,r)},
 sofa:function(r){cuboid(160,34,70,0,30,0,r);cuboid(160,44,16,0,-8,-26,r);cuboid(22,54,70,-72,14,0,r);cuboid(22,54,70,72,14,0,r)},
 cube:function(r){cuboid(120,120,120,0,0,0,r);cuboid(60,60,60,0,0,0,r)},
 frame:function(r){cuboid(110,150,8,-60,0,0,r);cuboid(110,150,8,60,0,70,r);cuboid(150,6,6,0,86,35,r)},
 steps:function(r){for(var i=0;i<4;i++)cuboid(44,30+i*28,44,(i-1.5)*50,-(i*14),0,r)},
 pillars:function(r){for(var i=0;i<3;i++)cuboid(30,150-i*14,30,(i-1)*70,i*7,(i%2)*30,r);cuboid(220,10,60,0,82,0,r)},
 lamp:function(r){cuboid(12,130,12,0,20,0,r);cuboid(80,14,80,0,88,0,r);cuboid(70,34,70,0,-60,0,r)},
 desk:function(r){cuboid(170,12,86,0,-10,0,r);[[-72,34],[72,34]].forEach(function(p){cuboid(10,70,10,p[0],26,p[1],r);cuboid(10,70,10,p[0],26,-p[1],r)});cuboid(44,30,40,40,-34,0,r)},
 house:function(r){cuboid(120,80,120,0,20,0,r);cuboid(140,10,140,0,-26,0,r);cuboid(80,40,80,0,-50,0,r)}
};
var map={about:"arch",services:"sofa",projects:"cube",concept:"frame",process:"steps",team:"pillars",reviews:"lamp",studio:"desk",contact:"house"};
var orbs=[];
Object.keys(map).forEach(function(id){var sec=d.getElementById(id);if(!sec)return;sec.classList.add("p3-sec");
 var o=mk("p3-orb "+(orbs.length%2?"p3-orb--l":"p3-orb--r"));o.setAttribute("aria-hidden","true");var r=mk("p3-s",o);shapes[map[id]](r);sec.insertBefore(o,sec.firstChild);orbs.push({sec:sec,r:r,seed:orbs.length*1.7})});
var hero=d.getElementById("home");
if(hero){hero.classList.add("p3-sec","p3-hero");var f=mk("p3-floor",hero);f.setAttribute("aria-hidden","true")}
var ft=d.querySelector("footer");if(ft){ft.classList.add("p3-sec");var f2=mk("p3-floor");f2.setAttribute("aria-hidden","true");ft.insertBefore(f2,ft.firstChild)}
var bar=mk("p3-bar",d.body);bar.setAttribute("aria-hidden","true");
var tilt=[].slice.call(d.querySelectorAll(".sv,.pj,.st,.tm,.rc,#slider,.about .pic"));
tilt.forEach(function(e){e.classList.add("p3-t");if(e.parentElement)e.parentElement.style.perspective="1300px"});
if(matchMedia("(hover:hover) and (pointer:fine)").matches){
 [].forEach.call(d.querySelectorAll(".pj,.sv"),function(m){m.classList.add("p3-card-shine");
  m.addEventListener("pointermove",function(e){var r=m.getBoundingClientRect();m.style.setProperty("--gx",((e.clientX-r.left)/r.width*100)+"%");m.style.setProperty("--gy",((e.clientY-r.top)/r.height*100)+"%")})})}
var io="IntersectionObserver" in window?new IntersectionObserver(function(es){es.forEach(function(e){e.target.__v=e.isIntersecting})},{rootMargin:"10% 0px 10% 0px"}):null;
orbs.forEach(function(w){if(io){w.sec.__v=false;io.observe(w.sec)}});tilt.forEach(function(e){e.__v=true;if(io)io.observe(e)});
var px=0,py=0,sy=0,amp=phone?5:8,t0=performance.now(),vh=innerHeight;
addEventListener("resize",function(){vh=innerHeight});
addEventListener("pointermove",function(e){px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5},{passive:true});
function onScroll(){sy=scrollY;var m=d.documentElement.scrollHeight-innerHeight;bar.style.transform="scaleX("+(m>0?Math.min(1,sy/m):0)+")"}
addEventListener("scroll",onScroll,{passive:true});onScroll();
function frame(t){requestAnimationFrame(frame);if(d.hidden)return;var s=(t-t0)/1000;
 if(hero){hero.style.setProperty("--hx",(px*-16).toFixed(1)+"px");hero.style.setProperty("--hy",(py*-10+Math.min(sy,700)*.06).toFixed(1)+"px")}
 orbs.forEach(function(w){if(w.sec.__v===false)return;var b=w.sec.getBoundingClientRect(),p=(b.top+b.height/2-vh/2)/(vh+b.height);
  w.r.style.transform="rotateX("+(-24+p*40).toFixed(1)+"deg) rotateY("+(s*14+w.seed*60+p*120).toFixed(1)+"deg) translateY("+(p*-30).toFixed(1)+"px)"});
 tilt.forEach(function(e){if(e.__v===false)return;var b=e.getBoundingClientRect(),p=Math.max(-1,Math.min(1,(b.top+b.height/2-vh/2)/(vh/2)));
  e.style.setProperty("--rd",(p*amp*.7).toFixed(2)+"deg");e.style.setProperty("--tz",(Math.abs(p)*-14).toFixed(1)+"px")})}
requestAnimationFrame(frame);
})();
