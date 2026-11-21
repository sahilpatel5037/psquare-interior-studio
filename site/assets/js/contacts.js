(function(){
"use strict";
var d=document,P=[{n:"Parth Patel",t:"+91 97231 51622",d:"919723151622"},{n:"Poonam Patel",t:"+91 95586 26743",d:"919558626743"}];
var MSG="Hello P Square Interior Studio, I'd like to know more about your interior services.";
var back=d.createElement("div");back.className="cc-back";back.setAttribute("role","dialog");back.setAttribute("aria-modal","true");
back.innerHTML='<div class="cc"><h4 id="cch"></h4><div id="ccl"></div><button type="button" class="cc-x">Cancel</button></div>';
d.body.appendChild(back);
function open(kind){var h=back.querySelector("#cch"),l=back.querySelector("#ccl");h.textContent=kind==="wa"?"Chat on WhatsApp with":"Call";l.innerHTML="";
 P.forEach(function(p){var a=d.createElement("a");a.href=kind==="wa"?"https://wa.me/"+p.d+"?text="+encodeURIComponent(MSG):"tel:+"+p.d;if(kind==="wa"){a.target="_blank";a.rel="noopener"}
  a.innerHTML="<span><b>"+p.n+"</b><small>"+p.t+"</small></span><span aria-hidden=\"true\">"+(kind==="wa"?"WhatsApp":"Call")+"</span>";a.addEventListener("click",function(){setTimeout(close,50)});l.appendChild(a)});
 back.classList.add("on")}
function close(){back.classList.remove("on")}
back.addEventListener("click",function(e){if(e.target===back||e.target.classList.contains("cc-x"))close()});
d.addEventListener("keydown",function(e){if(e.key==="Escape")close()});
d.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest("[data-call],[data-wa]");if(!t)return;e.preventDefault();e.stopImmediatePropagation();open(t.hasAttribute("data-call")?"call":"wa")},true);
[].forEach.call(d.querySelectorAll("[data-phone-text]"),function(e){e.classList.add("cc-list");e.innerHTML=P.map(function(p){return p.n+": "+p.t}).join("<br>")});

window.__psqAlso=function(msg){var old=d.getElementById("psq-also");if(old)old.remove();var u="https://wa.me/"+P[1].d+"?text="+encodeURIComponent(msg);var b=d.createElement("div");b.id="psq-also";b.className="cc-also";
 b.innerHTML="<p>Request opened for <b>"+P[0].n+"</b>. Now send it to <b>"+P[1].n+"</b> too:</p><a target=\"_blank\" rel=\"noopener\" href=\""+u+"\">Open chat with <b>"+P[1].n+"</b></a><button type=\"button\" aria-label=\"Close\">&times;</button>";
 b.querySelector("button").addEventListener("click",function(){b.remove()});b.querySelector("a").addEventListener("click",function(){setTimeout(function(){b.remove()},300)});d.body.appendChild(b);
 try{window.open(u,"_blank","noopener")}catch(e){}
 setTimeout(function(){if(b.parentNode)b.remove()},45000)};
})();
