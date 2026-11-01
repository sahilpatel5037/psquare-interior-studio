/* P Square — motion layer (applied 1 Nov). No libraries. Reveal on scroll, hero blueprint draw, project hover light, service line icons. */
(function(){
"use strict";
var d=document,calm=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function $$(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))}
var NS="http://www.w3.org/2000/svg";
function lens(svg){$$("path,line,rect,circle,polyline",svg).forEach(function(el){var L=120;try{L=Math.ceil(el.getTotalLength())+2}catch(e){}el.style.setProperty("--len",L)})}

/* 3 · hero: floor plan draws itself in thin gold, then the photo fades in. Text is shown at once. */
var hero=d.querySelector(".hero");
if(hero){
  if(!calm){
    var plan='<svg class="fx-bp" viewBox="0 0 700 560" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'+
    // outer walls
    '<path class="wall" d="M40 40H660V520H40Z"/>'+
    // inner walls with door gaps
    '<path class="wall" d="M300 40V210M300 270V520"/>'+
    '<path class="wall" d="M300 300H420M480 300H660"/>'+
    '<path class="wall" d="M40 330H200M250 330H300"/>'+
    // door swings
    '<path class="th" d="M300 210A60 60 0 0 1 360 270M300 270H360"/>'+
    '<path class="th" d="M420 300A60 60 0 0 0 480 360M480 300V360"/>'+
    '<path class="th" d="M200 330A50 50 0 0 0 250 380M250 330V380"/>'+
    // windows
    '<path class="th" d="M110 36H230M110 44H230M440 36H580M440 44H580M656 380V470M664 380V470"/>'+
    // living: sofa + coffee table + rug
    '<path d="M80 250V200a10 10 0 0 1 10-10H250a10 10 0 0 1 10 10V250M80 250H260M100 250V215H240V250"/>'+
    '<rect x="125" y="110" width="90" height="50" rx="6"/>'+
    '<rect class="th" x="90" y="90" width="160" height="90" rx="4"/>'+
    // bedroom: bed + pillows + side tables
    '<rect x="470" y="80" width="140" height="170" rx="6"/>'+
    '<path class="th" d="M470 120H610M490 88h45v24h-45zM545 88h45v24h-45z"/>'+
    '<rect class="th" x="440" y="82" width="24" height="24"/><rect class="th" x="616" y="82" width="24" height="24"/>'+
    // dining: table + 4 chairs
    '<rect x="420" y="390" width="130" height="70" rx="6"/>'+
    '<circle cx="450" cy="375" r="11"/><circle cx="520" cy="375" r="11"/><circle cx="450" cy="475" r="11"/><circle cx="520" cy="475" r="11"/>'+
    // kitchen: L counter + hob + sink
    '<path d="M60 350V500H260M60 350H90V470H260V500"/>'+
    '<circle class="th" cx="75" cy="390" r="7"/><circle class="th" cx="75" cy="420" r="7"/><rect class="th" x="160" y="476" width="40" height="18" rx="3"/>'+
    // dimension lines
    '<path class="th" d="M40 18H660M40 12V24M660 12V24M300 12V24M682 40V520M676 40H688M676 520H688"/>'+
    '</svg>';
    var hi=hero.querySelector(".hero-img");if(hi)hi.insertAdjacentHTML("afterend",plan);else hero.insertAdjacentHTML("afterbegin",plan);
    var bp=hero.querySelector(".fx-bp");
    // place the plan where it never sits under the words: right side on wide screens, top band on phones
    var place=function(){var w=hero.clientWidth,h=hero.clientHeight,s=bp.style,hh=(d.querySelector(".top")||{}).offsetHeight||70;
      var first=hero.querySelector(".wrap > *"),y=first?first.getBoundingClientRect().top-hero.getBoundingClientRect().top:h*.5;
      if(w>900){s.left="auto";s.right="3%";s.top=(hh+24)+"px";s.width=Math.min(w*.40,640)+"px";s.height=Math.max(h*.55,260)+"px";s.opacity=""}
      else{var room=y-hh-18;s.left="8%";s.right="auto";s.top=(hh+6)+"px";s.width="84%";
        s.height=(room>=160?room:Math.max(h*.34,200))+"px"}};
    place();window.addEventListener("resize",place,{passive:true});
    lens(bp);
    $$("*",bp).forEach(function(el,i){el.style.setProperty("--fxd",(i*0.045).toFixed(3)+"s")});
  }
}

/* 4 · service icons: thin line icons, drawn on reveal, a little lift on hover */
var IC={
  sofa:'<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 11.5a1.8 1.8 0 0 1 3.6 0V14h10.8v-2.5a1.8 1.8 0 0 1 3.6 0V18H3z"/><path d="M5 18v2M19 18v2"/>',
  desk:'<rect x="5" y="3" width="14" height="9" rx="1"/><path d="M12 12v3M9 15h6"/><path d="M2 18h20M4 18v3M20 18v3"/>',
  key:'<circle cx="8" cy="15" r="4.2"/><path d="M11 12l9-9M16.5 6.5l3 3M14 9l2.2 2.2"/>',
  kitchen:'<path d="M8 2.5h8l2.5 5h-13z"/><path d="M12 7.5v2"/><rect x="3" y="11" width="18" height="10" rx="1"/><path d="M3 14.5h18M12 14.5V21"/><path d="M7.5 17.5h1.5M15 17.5h1.5"/>',
  cube:'<path d="M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z"/><path d="M12 12l8.5-4.7M12 12v9.5M12 12L3.5 7.3"/>',
  lamp:'<path d="M8 3h8l3 7H5z"/><path d="M12 10v9M8 21h8"/>'
};
var order=["sofa","desk","key","kitchen","cube"];
$$(".svc .sv").forEach(function(sv,i){
  var box=sv.querySelector(":scope > div");if(!box||box.querySelector(".fx-ic"))return;
  var k=order[i]||"lamp";
  box.insertAdjacentHTML("afterbegin",'<span class="fx-ic" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">'+IC[k]+'</svg></span>');
  lens(box.querySelector(".fx-ic svg"));
});

/* 1 · scroll reveal: sections slide/fade in, cards staggered */
var groups=[
  [".about .pic",0,"fx-l"],[".about .wrap > div:last-child",0,"fx-rt"],
  [".head",0],[".chips",0],
  [".svc .sv",.12],[".grid .pj",.07],[".steps .st",.12],
  [".ba .wrap > div:first-child",0,"fx-l"],["#slider",0,"fx-rt"],
  ["#team .tm",.1],["#reviews .rc",.12],[".team-note",0],
  [".studio .wrap > *",.12],[".book .wrap > *",.12],[".ct .wrap > *",.12],["footer .wrap > *",.08]
];
var items=[];
groups.forEach(function(g){var list=$$(g[0]);list.forEach(function(el,i){if(el.classList.contains("fx-r")||el.closest(".hero"))return;
  el.classList.add("fx-r");if(g[2])el.classList.add(g[2]);el.style.setProperty("--fxd",Math.min(i*g[1],.6).toFixed(2)+"s");items.push(el)})});
var show=function(el){el.classList.add("fx-in");setTimeout(function(){el.style.willChange="auto"},1600)};
if("IntersectionObserver" in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){show(en.target);io.unobserve(en.target)}})},{rootMargin:"0px 0px -8% 0px",threshold:.08});
  items.forEach(function(el){io.observe(el)});
  // safety: anything still hidden after a filter change, a jump link or print gets shown
  window.addEventListener("beforeprint",function(){items.forEach(show)});
  // the last lines of the page (footer) can sit inside the bottom margin and never cross it: at the page end, show what is on screen
  var atEnd=function(){var se=d.scrollingElement||d.documentElement;if(window.innerHeight+window.pageYOffset<se.scrollHeight-4)return;
    items.forEach(function(el){if(!el.classList.contains("fx-in")&&el.getBoundingClientRect().top<window.innerHeight){show(el);io.unobserve(el)}})};
  window.addEventListener("scroll",atEnd,{passive:true});window.addEventListener("resize",atEnd,{passive:true});
}else items.forEach(show);

/* 2 · before/after: the existing 3D concept -> final slider gets one gentle "peek" when it first comes into view */
var sl=d.getElementById("slider");
if(sl&&!calm&&"IntersectionObserver" in window){
  var touched=false;["pointerdown","keydown"].forEach(function(n){sl.addEventListener(n,function(){touched=true},true)});
  var peek=function(){var t0=null,keys=[[0,50],[.35,22],[.75,78],[1,50]],dur=2400;
    var step=function(t){if(touched)return;if(t0===null)t0=t;var p=Math.min(1,(t-t0)/dur),i=1;while(i<keys.length-1&&p>keys[i][0])i++;
      var a=keys[i-1],b=keys[i],q=(p-a[0])/(b[0]-a[0]);q=q<.5?2*q*q:1-Math.pow(-2*q+2,2)/2;var v=a[1]+(b[1]-a[1])*q;
      sl.style.setProperty("--pos",v+"%");if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)};
  var so=new IntersectionObserver(function(es){if(es[0].isIntersecting){so.disconnect();setTimeout(peek,700)}},{threshold:.55});so.observe(sl);
}
})();
