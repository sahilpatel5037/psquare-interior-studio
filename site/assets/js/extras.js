(function(){
"use strict";
var d=document;
/* walkthrough */
var v=d.getElementById("wvid"),tag=d.getElementById("wtag"),steps=[].slice.call(d.querySelectorAll(".walk__step"));
if(v&&steps.length&&"IntersectionObserver" in window){
 var cur="";
 function show(s){steps.forEach(function(x){x.classList.toggle("on",x===s)});var src=s.getAttribute("data-src");if(src!==cur){cur=src;v.src=src;v.load();var p=v.play();if(p&&p.catch)p.catch(function(){})}tag.textContent=s.getAttribute("data-tag")}
 var vis=false;
 new IntersectionObserver(function(es){es.forEach(function(en){vis=en.isIntersecting;if(vis){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{threshold:.1}).observe(d.querySelector(".walk__grid"));
 var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting)show(en.target)})},{rootMargin:"-45% 0px -45% 0px"});
 steps.forEach(function(s){io.observe(s)});
 show(steps[0]);
}
/* style finder */
var box=d.querySelector(".sf__box");if(!box)return;
var ans={},desc="",res=d.getElementById("sfres"),line=d.getElementById("sfline"),go=d.getElementById("sfgo");
function msg(){return "Hello P Square Interior Studio, I tried Find your style on your website.\n\nSpace: "+ans.space+"\nLook: "+ans.style+"\nMost important: "+ans.focus+"\n\nI'd like a free consultation."}
function upd(){if(!(ans.space&&ans.style&&ans.focus)){res.hidden=true;return}
 line.textContent="You like "+ans.style.toLowerCase()+" for your "+ans.space.toLowerCase()+". "+desc;res.hidden=false}
[].forEach.call(box.querySelectorAll(".sf__q"),function(q){var k=q.getAttribute("data-q");
 [].forEach.call(q.querySelectorAll("button"),function(b){b.addEventListener("click",function(){[].forEach.call(q.querySelectorAll("button"),function(x){x.classList.remove("on")});b.classList.add("on");ans[k]=b.textContent;if(k==="style")desc=b.getAttribute("data-d")||"";upd()})})});
go.addEventListener("click",function(){var m=msg();window.open("https://wa.me/919723151622?text="+encodeURIComponent(m),"_blank","noopener");if(window.__psqAlso)window.__psqAlso(m)});
})();

(function(){var k=document.querySelector(".dock");if(!k)return;function f(){var y=window.scrollY||0,h=document.documentElement.scrollHeight-innerHeight;var bk=document.getElementById("book"),r=bk?bk.getBoundingClientRect():null;var inBook=r&&r.top<innerHeight*.7&&r.bottom>0;k.classList.toggle("show",y>innerHeight*.6&&!inBook)}addEventListener("scroll",f,{passive:true});f()})();
