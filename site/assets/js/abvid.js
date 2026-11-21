(function(){
"use strict";
var v=document.querySelector(".abvid"),b=document.querySelector(".abmute");if(!v||!b)return;
function paint(){b.innerHTML=v.muted?"&#128263;":"&#128266;";b.setAttribute("aria-label",v.muted?"Turn sound on":"Turn sound off")}
b.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();v.muted=!v.muted;if(!v.muted){v.volume=1;var p=v.play();if(p&&p.catch)p.catch(function(){v.muted=true;paint()})}paint()});
v.addEventListener("click",function(){b.click()});
if("IntersectionObserver" in window){new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){})}else{v.pause();if(!v.muted){v.muted=true;paint()}}})},{threshold:.25}).observe(v)}
paint();
})();
