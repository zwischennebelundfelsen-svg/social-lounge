(()=>{"use strict";
const C=document.querySelector("#game"),x=C.getContext("2d"),menu=document.querySelector("#menu"),stage=document.querySelector("#stage"),over=document.querySelector("#over");
const ui={hp:document.querySelector("#hp"),coins:document.querySelector("#coins"),mult:document.querySelector("#mult"),quest:document.querySelector("#quest"),name:document.querySelector("#heroName"),bank:document.querySelector("#bank"),toast:document.querySelector("#toast")};
let chosen="bacon",D=1.35,raf=0,last=0,G=null,bank=Number(localStorage.getItem("arcaneBank")||0);ui.bank.textContent="Tresor: "+bank+" ⬡";
document.querySelectorAll(".hero").forEach(b=>b.onclick=()=>{document.querySelectorAll(".hero").forEach(q=>q.classList.remove("selected"));b.classList.add("selected");chosen=b.dataset.hero});
const H={
 bacon:{name:"BACON",hp:180,speed:260,jump:570,rate:420,damage:34,pellets:5,spread:.18,color:"#e09b55",skill:"Berserker"},
 nexify:{name:"NexifyGG",hp:115,speed:340,jump:620,rate:145,damage:19,pellets:1,spread:.035,color:"#65c7e8",skill:"Dash"},
 sinep:{name:"SINEP",hp:100,speed:285,jump:590,rate:360,damage:42,pellets:1,spread:.02,color:"#b98cff",skill:"Blink"}
};
const keys={},pointer={x:900,y:350,down:false}; addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if([" ","arrowup","arrowdown"].includes(e.key.toLowerCase()))e.preventDefault()});addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
C.addEventListener("pointermove",e=>{const r=C.getBoundingClientRect();pointer.x=(e.clientX-r.left)*C.width/r.width;pointer.y=(e.clientY-r.top)*C.height/r.height});C.addEventListener("pointerdown",()=>{pointer.down=true;C.focus()});addEventListener("pointerup",()=>pointer.down=false);
document.querySelectorAll("#touch button").forEach(b=>{const k=b.dataset.k,map={left:"a",right:"d",jump:" ",shoot:"f",skill:"shift"};for(const ev of ["pointerdown","pointerup","pointercancel"])b.addEventListener(ev,e=>{e.preventDefault();keys[map[k]]=ev==="pointerdown"})});
function rnd(a,b){return a+Math.random()*(b-a)} function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function toast(s){ui.toast.textContent=s;ui.toast.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>ui.toast.style.opacity=0,1500)}
function recthit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function init(){
 D=+document.querySelector("#difficulty").value;const h=H[chosen];
 G={t:0,cam:0,coins:0,kills:0,crystals:0,quest:0,done:false,extraction:false,shots:[],enemies:[],parts:[],pickups:[],platforms:[],traps:[],player:{x:90,y:400,w:34,h:52,vx:0,vy:0,on:false,hp:h.hp,max:h.hp,lastShot:0,lastSkill:-9,inv:0,face:1},hero:h};
 const p=G.platforms;p.push({x:-200,y:610,w:900,h:120},{x:760,y:565,w:360,h:165},{x:1190,y:620,w:520,h:110},{x:1800,y:535,w:430,h:195},{x:2320,y:610,w:620,h:120},{x:3040,y:550,w:390,h:180},{x:3510,y:620,w:850,h:110},{x:4460,y:545,w:430,h:185},{x:4990,y:610,w:1100,h:120});
 [[390,480,180,20],[880,420,170,20],[1370,455,170,20],[1930,385,180,20],[2480,450,180,20],[3180,390,160,20],[3710,460,190,20],[4100,360,160,20],[4580,410,170,20],[5290,430,180,20]].forEach(a=>p.push({x:a[0],y:a[1],w:a[2],h:a[3]}));
 [710,1135,1720,2250,2960,3440,4380,4910].forEach(v=>G.traps.push({x:v,y:600,w:55,h:25}));
 for(let i=0;i<16;i++)spawnEnemy(520+i*320,rnd(320,510),i%5===0?"wraith":"hound");
 for(let i=0;i<18;i++)G.pickups.push({x:300+i*310,y:rnd(280,470),r:9,type:i%4===0?"crystal":"coin",alive:true});
 menu.hidden=true;over.hidden=true;stage.hidden=false;last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);toast("Auftrag: 10 Kreaturen jagen + 3 Runenkristalle");
}
function spawnEnemy(px,py,type){G.enemies.push({x:px,y:py,w:type==="wraith"?38:45,h:type==="wraith"?46:34,vx:0,vy:0,hp:(type==="wraith"?75:95)*D,max:(type==="wraith"?75:95)*D,type,cd:rnd(0,1),alive:true})}
function shoot(){
 const g=G,p=g.player,h=g.hero,now=g.t;if(now-p.lastShot<h.rate/1000)return;p.lastShot=now;
 let ax=(pointer.x-(p.x-g.cam+p.w/2)),ay=(pointer.y-(p.y+p.h/2)),ang=Math.atan2(ay,ax);if(Math.abs(ax)>10)p.face=Math.sign(ax);
 for(let i=0;i<h.pellets;i++){let a=ang+rnd(-h.spread,h.spread);g.shots.push({x:p.x+p.w/2,y:p.y+22,vx:Math.cos(a)*850,vy:Math.sin(a)*850,r:chosen==="sinep"?7:3,d:h.damage,life:1.1,enemy:false,magic:chosen==="sinep"})}
}
function skill(){
 const p=G.player;if(G.t-p.lastSkill<4)return;p.lastSkill=G.t;
 if(chosen==="nexify"){p.vx=p.face*850;p.inv=.45;toast("PHASE DASH")}
 else if(chosen==="sinep"){p.x=clamp(p.x+p.face*240,0,5850);p.inv=.5;toast("ARCANE BLINK")}
 else{p.inv=1.2;p.hp=Math.min(p.max,p.hp+30);G.rage=2.8;toast("BERSERKER")}
}
function update(dt){
 const g=G,p=g.player,h=g.hero;g.t+=dt;p.inv=Math.max(0,p.inv-dt);if(G.rage)G.rage=Math.max(0,G.rage-dt);
 let dir=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);p.vx+=(dir*h.speed-p.vx)*Math.min(1,dt*10);if(dir)p.face=dir;
 if((keys.w||keys.arrowup||keys[" "])&&p.on){p.vy=-h.jump;p.on=false} if(keys.shift)skill();if(pointer.down||keys.f)shoot();
 p.vy+=1500*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.on=false;
 for(const q of g.platforms)if(p.vy>=0&&p.x+p.w>q.x&&p.x<q.x+q.w&&p.y+p.h>=q.y&&p.y+p.h-p.vy*dt<=q.y+7){p.y=q.y-p.h;p.vy=0;p.on=true}
 for(const t of g.traps)if(recthit(p,t))hurt(22*D);
 if(p.y>760){p.hp-=35;p.x=Math.max(30,p.x-260);p.y=300;p.vy=0}
 p.x=clamp(p.x,0,6000);
 g.cam+=(clamp(p.x-C.width*.42,0,4800)-g.cam)*Math.min(1,dt*5);
 for(const s of g.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.enemy&&recthit({x:s.x-s.r,y:s.y-s.r,w:s.r*2,h:s.r*2},p)){s.life=0;hurt(s.d)}
  if(!s.enemy)for(const e of g.enemies)if(e.alive&&s.life>0&&recthit({x:s.x-s.r,y:s.y-s.r,w:s.r*2,h:s.r*2},e)){e.hp-=s.d*(G.rage?1.55:1);s.life=0;burst(s.x,s.y,h.color);if(s.magic)for(const z of g.enemies)if(z!==e&&z.alive&&Math.hypot(z.x-e.x,z.y-e.y)<100)z.hp-=s.d*.55;if(e.hp<=0){e.alive=false;g.kills++;g.coins+=3;burst(e.x,e.y,"#d4b66e")}}}
 g.shots=g.shots.filter(s=>s.life>0&&s.x>-100&&s.x<6300);
 for(const e of g.enemies){if(!e.alive)continue;let dx=p.x-e.x,dy=p.y-e.y;if(e.type==="hound"){e.vx=Math.sign(dx)*90*D;e.x+=e.vx*dt;if(Math.abs(dx)<50&&Math.abs(dy)<70&&e.cd<=0){hurt(13*D);e.cd=1.05}}else{e.y+=Math.sin(g.t*2+e.x)*20*dt;e.x+=Math.sign(dx)*45*dt;if(Math.abs(dx)<520&&e.cd<=0){let a=Math.atan2(p.y-e.y,p.x-e.x);g.shots.push({x:e.x,y:e.y,vx:Math.cos(a)*330,vy:Math.sin(a)*330,r:5,d:12*D,life:2,enemy:true});e.cd=1.7/D}}e.cd-=dt}
 for(const c of g.pickups)if(c.alive&&Math.hypot(p.x-c.x,p.y-c.y)<48){c.alive=false;if(c.type==="coin")g.coins+=5;else{g.crystals++;toast("Runenkristall "+g.crystals+"/3")}}
 for(const z of g.parts){z.x+=z.vx*dt;z.y+=z.vy*dt;z.vy+=300*dt;z.life-=dt}g.parts=g.parts.filter(z=>z.life>0);
 if(!g.done&&g.kills>=10&&g.crystals>=3){g.done=true;g.extraction=true;toast("HAUPTZIEL ERFÜLLT – Portal am Ende geöffnet!")}
 if(g.extraction&&p.x>5800)finish(true);if(p.hp<=0)finish(false);
}
function hurt(n){const p=G.player;if(p.inv>0)return;p.hp-=n;p.inv=.7;burst(p.x,p.y,"#ff665c")}
function burst(px,py,c){for(let i=0;i<8;i++)G.parts.push({x:px,y:py,vx:rnd(-140,140),vy:rnd(-180,30),life:rnd(.25,.7),c})}
function draw(){
 const g=G,p=g.player,W=C.width,Hh=C.height;x.clearRect(0,0,W,Hh);
 let grd=x.createLinearGradient(0,0,0,Hh);grd.addColorStop(0,"#111827");grd.addColorStop(.55,"#202735");grd.addColorStop(1,"#090b0f");x.fillStyle=grd;x.fillRect(0,0,W,Hh);
 x.globalAlpha=.18;for(let i=0;i<18;i++){let px=((i*173-g.cam*.18)%1500+1500)%1500;x.fillStyle="#9fa9ba";x.beginPath();x.arc(px,140+(i%5)*54,80+i%3*35,0,7);x.fill()}x.globalAlpha=1;
 x.save();x.translate(-g.cam,0);
 for(const q of g.platforms){x.fillStyle="#252b31";x.fillRect(q.x,q.y,q.w,q.h);x.fillStyle="#3e493f";x.fillRect(q.x,q.y,q.w,8);x.fillStyle="#171b20";for(let k=q.x+20;k<q.x+q.w;k+=70)x.fillRect(k,q.y+22,3,45)}
 for(const t of g.traps){x.fillStyle="#a54d45";for(let k=0;k<4;k++){x.beginPath();x.moveTo(t.x+k*14,t.y+t.h);x.lineTo(t.x+7+k*14,t.y);x.lineTo(t.x+14+k*14,t.y+t.h);x.fill()}}
 for(const c of g.pickups)if(c.alive){x.fillStyle=c.type==="coin"?"#e2bd5b":"#8c6be8";x.beginPath();x.arc(c.x,c.y,c.r+Math.sin(g.t*4+c.x)*2,0,7);x.fill()}
 for(const e of g.enemies)if(e.alive){x.fillStyle=e.type==="hound"?"#7e3940":"#5b4b77";x.fillRect(e.x,e.y,e.w,e.h);x.fillStyle="#f25d57";x.fillRect(e.x+8,e.y+8,5,4);x.fillRect(e.x+e.w-13,e.y+8,5,4);x.fillStyle="#101319";x.fillRect(e.x,e.y-8,e.w,4);x.fillStyle="#b64f50";x.fillRect(e.x,e.y-8,e.w*(e.hp/e.max),4)}
 if(g.extraction){x.strokeStyle="#77e1bd";x.lineWidth=8;x.beginPath();x.ellipse(5890,500,45,90,0,0,7);x.stroke();x.fillStyle="#77e1bd22";x.fillRect(5845,410,90,180)}
 for(const s of g.shots){x.fillStyle=s.enemy?"#ef6259":s.magic?"#c391ff":"#ffd778";x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill()}
 for(const z of g.parts){x.globalAlpha=clamp(z.life*2,0,1);x.fillStyle=z.c;x.fillRect(z.x,z.y,4,4)}x.globalAlpha=1;
 x.fillStyle=p.inv>0&&Math.floor(g.t*16)%2?"#fff":g.hero.color;x.fillRect(p.x,p.y,p.w,p.h);x.fillStyle="#11151b";x.fillRect(p.x+(p.face>0?24:2),p.y+16,20*p.face,6);x.fillStyle="#090b0e";x.fillRect(p.x+7,p.y+8,20,8);
 x.restore();
 let m=1+Math.floor(g.t/45)*.25+(D-1)*.5;ui.name.textContent=g.hero.name+" · "+g.hero.skill;ui.hp.textContent="HP "+Math.ceil(p.hp)+"/"+p.max;ui.coins.textContent="Beute "+g.coins+" ⬡";ui.mult.textContent="Risiko ×"+m.toFixed(2);ui.quest.textContent=g.done?"✓ Extrahiere am Portal":"Jagd "+g.kills+"/10 · Kristalle "+g.crystals+"/3";
}
function finish(ok){cancelAnimationFrame(raf);if(!G)return;let mult=1+Math.floor(G.t/45)*.25+(D-1)*.5,earned=ok?Math.floor(G.coins*mult):Math.floor(G.coins*.2);bank+=earned;localStorage.setItem("arcaneBank",bank);ui.bank.textContent="Tresor: "+bank+" ⬡";stage.hidden=true;over.hidden=false;document.querySelector("#overTitle").textContent=ok?"EXTRAKTION ERFOLGREICH":"RUN VERLOREN";document.querySelector("#summary").textContent=G.hero.name+" · "+G.kills+" Kills · "+Math.floor(G.t)+" Sek. · "+earned+" ⬡ gesichert.";G=null}
function loop(t){if(!G)return;let dt=Math.min(.033,(t-last)/1000);last=t;update(dt);draw();raf=requestAnimationFrame(loop)}
document.querySelector("#start").onclick=init;document.querySelector("#again").onclick=()=>{over.hidden=true;menu.hidden=false};})();