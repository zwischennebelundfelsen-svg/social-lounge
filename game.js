(()=>{"use strict";
const C=document.querySelector("#game"),x=C.getContext("2d"),menu=document.querySelector("#menu"),stage=document.querySelector("#stage"),over=document.querySelector("#over");
const ui={hp:document.querySelector("#hp"),coins:document.querySelector("#coins"),mult:document.querySelector("#mult"),quest:document.querySelector("#quest"),name:document.querySelector("#heroName"),bank:document.querySelector("#bank"),toast:document.querySelector("#toast")};
let chosen="bacon",D=1.35,raf=0,last=0,G=null,bank=Number(localStorage.getItem("arcaneBank")||0);
let AC=null,master=null,musicTimer=0,lastBiome=-1;
function startAudio(){try{if(AC){if(AC.state==="suspended")AC.resume();return}const AudioCtor=window.AudioContext||window.webkitAudioContext;if(!AudioCtor)return;AC=new AudioCtor();master=AC.createGain();master.gain.value=.18;master.connect(AC.destination)}catch(e){AC=null;master=null}}
function tone(freq,dur,vol=.05,type="sine",when=0){if(!AC)return;let o=AC.createOscillator(),v=AC.createGain(),t=AC.currentTime+when;o.type=type;o.frequency.value=freq;v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(vol,t+.02);v.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(v);v.connect(master);o.start(t);o.stop(t+dur+.03)}
function noise(dur=.08,vol=.025,when=0){if(!AC)return;let n=AC.createBufferSource(),b=AC.createBuffer(1,AC.sampleRate*dur,AC.sampleRate);let d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);let v=AC.createGain();v.gain.value=vol;n.buffer=b;n.connect(v);v.connect(master);n.start(AC.currentTime+when)}
function ambience(g){if(!AC)return;let biome=g.player.x<2000?0:g.player.x<4000?1:2;if(biome!==lastBiome){lastBiome=biome;toast(["Dschungel-Lo-Fi","Wuesten-Lo-Fi","Berg-Lo-Fi"][biome])}if(g.t<musicTimer)return;musicTimer=g.t+2.4;let roots=[[110,165,220],[98,147,196],[82.4,123.5,164.8]][biome],r=roots[(Math.floor(g.t/2.4))%3];tone(r,2.2,.035,"sine");tone(r*2,1.5,.018,"triangle",.12);tone(r*1.5,.7,.014,"sine",1.15);noise(.055,.018,.02);noise(.045,.012,1.2);if(biome===0){tone(880,0.12,.008,"sine",.7)}else if(biome===1){noise(.32,.006,.55)}else{tone(329.6,.9,.008,"sine",.65)}}
ui.bank.textContent="Tresor: "+bank+" ⬡";
document.querySelectorAll(".hero").forEach(b=>b.onclick=()=>{document.querySelectorAll(".hero").forEach(q=>q.classList.remove("selected"));b.classList.add("selected");chosen=b.dataset.hero});
const H={
 bacon:{name:"BACON",hp:180,speed:260,jump:720,rate:420,damage:34,pellets:5,spread:.18,color:"#e09b55",skill:"Berserker"},
 nexify:{name:"NexifyGG",hp:115,speed:340,jump:760,rate:145,damage:19,pellets:1,spread:.035,color:"#65c7e8",skill:"Dash"},
 sinep:{name:"SINEP",hp:100,speed:285,jump:740,rate:360,damage:42,pellets:1,spread:.02,color:"#b98cff",skill:"Blink"}
};
const keys={},pointer={x:900,y:350,down:false};let interactPressed=false; addEventListener("keydown",e=>{let k=e.key.toLowerCase();if(k==="e"&&!keys.e)interactPressed=true;keys[k]=true;if([" ","arrowup","arrowdown"].includes(e.key.toLowerCase()))e.preventDefault()});addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
C.addEventListener("pointermove",e=>{const r=C.getBoundingClientRect();pointer.x=(e.clientX-r.left)*C.width/r.width;pointer.y=(e.clientY-r.top)*C.height/r.height});C.addEventListener("pointerdown",()=>{pointer.down=true;C.focus()});addEventListener("pointerup",()=>pointer.down=false);
document.querySelectorAll("#touch button").forEach(b=>{const k=b.dataset.k,map={left:"a",right:"d",jump:" ",shoot:"f",skill:"shift"};for(const ev of ["pointerdown","pointerup","pointercancel"])b.addEventListener(ev,e=>{e.preventDefault();keys[map[k]]=ev==="pointerdown"})});
function rnd(a,b){return a+Math.random()*(b-a)} function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function toast(s){ui.toast.textContent=s;ui.toast.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>ui.toast.style.opacity=0,1500)}
function recthit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function init(){
 menu.hidden=true;over.hidden=true;stage.hidden=false;startAudio();musicTimer=0;lastBiome=-1;
 D=+document.querySelector("#difficulty").value;const h=H[chosen];
 G={t:0,cam:0,coins:0,kills:0,crystals:0,quest:0,done:false,extraction:false,shots:[],enemies:[],parts:[],pickups:[],platforms:[],traps:[],chests:[],npcs:[],doors:[],keysFound:0,boss:null,riddle:null,riddlesDone:0,level:1,levelBanner:null,levelSeen:[false,false,false],player:{x:90,y:400,w:34,h:52,vx:0,vy:0,on:false,hp:h.hp,max:h.hp,lastShot:0,lastSkill:-9,inv:0,face:1},hero:h};
 const p=G.platforms;p.push({x:-200,y:610,w:900,h:120},{x:760,y:565,w:360,h:165},{x:1190,y:620,w:520,h:110},{x:1800,y:535,w:430,h:195},{x:2320,y:610,w:620,h:120},{x:3040,y:550,w:390,h:180},{x:3510,y:620,w:850,h:110},{x:4460,y:545,w:430,h:185},{x:4990,y:610,w:1100,h:120});
 [[390,480,180,20],[650,520,105,18],[880,420,170,20],[1135,515,105,18],[1370,455,170,20],[1710,500,110,18],[1930,385,180,20],[2480,450,180,20],[3180,390,160,20],[3710,460,190,20],[4100,360,160,20],[4580,410,170,20],[5290,430,180,20]].forEach(a=>p.push({x:a[0],y:a[1],w:a[2],h:a[3]}));
 [710,1135,1720,2250,2960,3440,4380,4910].forEach(v=>G.traps.push({x:v,y:600,w:55,h:25}));
 // Continuous themed regions: jungle -> desert -> mountains
 G.npcs.push({x:210,y:555,name:"Milo",text:"Der Dschungel verschluckt jeden unvorsichtigen Jäger."},{x:2180,y:480,name:"Rashid",text:"Hinter den Dünen liegen alte Kammern."},{x:4240,y:565,name:"Eira",text:"Im Gebirge wartet etwas in der Höhle."});
 G.chests.push({x:560,y:440,open:false},{x:1540,y:580,open:false},{x:2700,y:410,open:false},{x:3380,y:510,open:false},{x:4720,y:505,open:false},{x:5480,y:390,open:false});
 G.doors.push({x:1960,y:475,w:55,h:60,kind:"temple",locked:true},{x:4620,y:485,w:70,h:60,kind:"cave",locked:true});
 G.riddleStations=[
 {x:1830,done:false,q:"Drei Runen leuchten in dieser Reihenfolge: Mond, Sonne, Mond, Sonne, Mond. Welche Rune muss als Nächstes aktiviert werden?",a:["Mond","Sonne","Stern"],correct:2},
 {x:3650,done:false,q:"Ein Wächter sagt: Nur eine Aussage ist wahr. A: Der Schlüssel liegt links. B: Der Schlüssel liegt nicht links. C: Aussage B ist falsch. Welche Antwort kann allein wahr sein?",a:["A","B","C"],correct:2},
 {x:4510,done:false,q:"Eine Fackel brennt 60 Minuten. Zwei identische Fackeln werden gleichzeitig entzündet. Wie lange leuchtet mindestens eine von ihnen?",a:["30 Minuten","60 Minuten","120 Minuten"],correct:2}
 ];
 G.pickups.push({x:980,y:380,r:11,type:"key",alive:true},{x:1680,y:560,r:11,type:"key",alive:true});
 [[4080,500,130,18],[4300,410,145,18],[4520,330,125,18],[4770,405,160,18],[5050,325,135,18],[5320,470,150,18]].forEach(a=>p.push({x:a[0],y:a[1],w:a[2],h:a[3]}));
 for(let i=0;i<16;i++)spawnEnemy(520+i*320,rnd(320,510),i%5===0?"wraith":"hound");
 for(let i=0;i<7;i++)spawnEnemy(4070+i*235,rnd(350,520),"skeleton");
 G.boss={x:5630,y:455,w:92,h:110,hp:850*D,max:850*D,cd:1,alive:true,awake:false};
 for(let i=0;i<18;i++)G.pickups.push({x:300+i*310,y:rnd(280,470),r:9,type:i%4===0?"crystal":"coin",alive:true});
 last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);toast("Auftrag: 10 Kreaturen jagen + 3 Runenkristalle");
}
function spawnEnemy(px,py,type){G.enemies.push({x:px,y:py,w:type==="wraith"?38:45,h:type==="wraith"?46:34,vx:0,vy:0,hp:(type==="wraith"?75:type==="skeleton"?125:95)*D,max:(type==="wraith"?75:type==="skeleton"?125:95)*D,type,cd:rnd(0,1),alive:true})}
function shoot(){
 const g=G,p=g.player,h=g.hero,now=g.t;if(now-p.lastShot<h.rate/1000)return;p.lastShot=now;startAudio();noise(.045,chosen==="bacon"?.045:.022);tone(chosen==="sinep"?520:chosen==="nexify"?180:105,.08,.018,chosen==="sinep"?"sine":"square");
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
 const g=G,p=g.player,h=g.hero;g.t+=dt;ambience(g);
 let currentLevel=p.x<2000?1:p.x<4000?2:3;
 // A world only counts as completed after its objective has actually been solved.
 let canAdvance=g.level===1?g.riddlesDone>=1:g.level===2?g.riddlesDone>=2:true;
 let boundary=g.level===1?1960:3960;
 if(!canAdvance&&p.x>boundary){p.x=boundary-38;p.vx=0;toast(g.level===1?"Der Dschungeltempel ist noch nicht gelöst. Finde und löse das Rätsel.":"Die Sonnenwüste gibt den Weg noch nicht frei. Löse das Ruinenrätsel.")}
 if(currentLevel>g.level&&canAdvance){let old=g.level;g.level=currentLevel;g.levelBanner={until:g.t+4,title:"LEVEL "+old+" ERFOLGREICH BEENDET!",sub:old===1?"Jawohl, du Sinep! Der Dschungeltempel ist geschafft. Weiter geht's in die Sonnenwüste!":"Chaka, du schaffst das! Die Wüstenruine ist bezwungen. Auf ins Frostgebirge!"};tone(523,.18,.035,"sine");tone(659,.18,.03,"sine",.16);tone(784,.3,.03,"sine",.32)}
 // Giana-Sisters-inspired progression: movement challenges lead into self-contained puzzle gates.
 if(!g.riddle){for(const r of g.riddleStations||[])if(!r.done&&Math.abs(p.x-r.x)<70){g.riddle=r;toast("Rätsel entdeckt – antworte mit 1, 2 oder 3.");break}}
 if(g.riddle){let pick=keys["1"]?1:keys["2"]?2:keys["3"]?3:0;if(pick){keys[String(pick)]=false;if(pick===g.riddle.correct){g.riddle.done=true;g.riddlesDone++;g.coins+=20;toast("Richtig! Der Weg reagiert auf deine Lösung.");g.riddle=null;if(g.riddlesDone>=1){let d=g.doors.find(v=>v.kind==="temple");if(d)d.locked=false}if(g.riddlesDone>=3){let d=g.doors.find(v=>v.kind==="cave");if(d)d.locked=false}}else{toast("Falsch. Beobachte die Hinweise und versuche es erneut.");p.hp=Math.max(1,p.hp-12);}}}p.inv=Math.max(0,p.inv-dt);if(G.rage)G.rage=Math.max(0,G.rage-dt);
 let dir=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);p.vx+=(dir*h.speed-p.vx)*Math.min(1,dt*10);if(dir)p.face=dir;
 if((keys.w||keys.arrowup||keys[" "])&&p.on){p.vy=-h.jump;p.on=false} if(keys.shift)skill();if(pointer.down||keys.f)shoot();
 p.vy+=1320*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.on=false;
 for(const q of g.platforms)if(p.vy>=0&&p.x+p.w>q.x&&p.x<q.x+q.w&&p.y+p.h>=q.y&&p.y+p.h-p.vy*dt<=q.y+7){p.y=q.y-p.h;p.vy=0;p.on=true}
 for(const t of g.traps)if(recthit(p,t))hurt(22*D);
 if(p.y>760){p.hp-=35;p.x=Math.max(30,p.x-260);p.y=300;p.vy=0}
 p.x=clamp(p.x,0,6000);
 g.cam+=(clamp(p.x-C.width*.42,0,4800)-g.cam)*Math.min(1,dt*5);
 for(const s of g.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.enemy&&recthit({x:s.x-s.r,y:s.y-s.r,w:s.r*2,h:s.r*2},p)){s.life=0;hurt(s.d)}
  if(!s.enemy)for(const e of g.enemies)if(e.alive&&s.life>0&&recthit({x:s.x-s.r,y:s.y-s.r,w:s.r*2,h:s.r*2},e)){e.hp-=s.d*(G.rage?1.55:1);s.life=0;burst(s.x,s.y,h.color);if(s.magic)for(const z of g.enemies)if(z!==e&&z.alive&&Math.hypot(z.x-e.x,z.y-e.y)<100)z.hp-=s.d*.55;if(e.hp<=0){e.alive=false;g.kills++;g.coins+=3;burst(e.x,e.y,"#d4b66e")}}}
 g.shots=g.shots.filter(s=>s.life>0&&s.x>-100&&s.x<6300);
 for(const e of g.enemies){if(!e.alive)continue;let dx=p.x-e.x,dy=p.y-e.y;if(e.type==="hound"||e.type==="skeleton"){e.vx=Math.sign(dx)*(e.type==="skeleton"?62:90)*D;e.x+=e.vx*dt;if(Math.abs(dx)<50&&Math.abs(dy)<70&&e.cd<=0){hurt(13*D);e.cd=1.05}}else{e.y+=Math.sin(g.t*2+e.x)*20*dt;e.x+=Math.sign(dx)*45*dt;if(Math.abs(dx)<520&&e.cd<=0){let a=Math.atan2(p.y-e.y,p.x-e.x);g.shots.push({x:e.x,y:e.y,vx:Math.cos(a)*330,vy:Math.sin(a)*330,r:5,d:12*D,life:2,enemy:true});e.cd=1.7/D}}e.cd-=dt}
 for(const c of g.pickups)if(c.alive&&Math.hypot(p.x-c.x,p.y-c.y)<48){c.alive=false;if(c.type==="coin")g.coins+=5;else if(c.type==="key"){g.keysFound++;toast("Tempelschluessel "+g.keysFound+"/2");if(g.keysFound>=2){let d=g.doors.find(v=>v.kind==="temple");if(d)d.locked=false;}}else{g.crystals++;toast("Runenkristall "+g.crystals+"/3")}}
 for(const z of g.parts){z.x+=z.vx*dt;z.y+=z.vy*dt;z.vy+=300*dt;z.life-=dt}g.parts=g.parts.filter(z=>z.life>0);
 let gate=g.doors.find(v=>v.kind==="temple");if(gate&&gate.locked&&p.x>gate.x-35&&p.x<gate.x+70){p.x=gate.x-38;p.vx=0;}
 let boss=g.boss;if(boss&&boss.alive&&p.x>5250){boss.awake=true;boss.cd-=dt;let dx=p.x-boss.x;boss.x+=Math.sign(dx)*30*dt;if(boss.cd<=0){let a=Math.atan2(p.y-boss.y,p.x-boss.x);g.shots.push({x:boss.x,y:boss.y+35,vx:Math.cos(a)*390,vy:Math.sin(a)*390,r:9,d:22*D,life:2.2,enemy:true});boss.cd=1.1/D}for(const sh of g.shots)if(!sh.enemy&&sh.life>0&&recthit({x:sh.x-sh.r,y:sh.y-sh.r,w:sh.r*2,h:sh.r*2},boss)){boss.hp-=sh.d;sh.life=0;if(boss.hp<=0){boss.alive=false;g.coins+=80;g.extraction=true;toast("BERGKOENIG BESIEGT! +80")}}}
 if(!g.done&&g.kills>=10&&g.crystals>=3){g.done=true;g.extraction=true;toast("HAUPTZIEL ERFÜLLT – Portal am Ende geöffnet!")}
 if(g.extraction&&p.x>5800)finish(true);if(p.hp<=0)finish(false);interactPressed=false;
}
function hurt(n){noise(.12,.035);tone(72,.14,.025,"sawtooth");const p=G.player;if(p.inv>0)return;p.hp-=n;p.inv=.7;burst(p.x,p.y,"#ff665c")}
function burst(px,py,c){for(let i=0;i<8;i++)G.parts.push({x:px,y:py,vx:rnd(-140,140),vy:rnd(-180,30),life:rnd(.25,.7),c})}
function draw(){
 const g=G,p=g.player,W=C.width,Hh=C.height;x.clearRect(0,0,W,Hh);
 let grd=x.createLinearGradient(0,0,0,Hh);grd.addColorStop(0,"#111827");grd.addColorStop(.55,"#202735");grd.addColorStop(1,"#090b0f");x.fillStyle=grd;x.fillRect(0,0,W,Hh);
 // layered side-scroller depth: distant silhouettes, midground and foreground
 let biome=p.x<2000?0:p.x<4000?1:2;
 x.save();x.globalAlpha=.22;
 for(let i=0;i<12;i++){let px=((i*240-g.cam*.12)%1800+1800)%1800;if(biome===0){x.fillStyle="#173a34";x.beginPath();x.arc(px,260,95,0,7);x.arc(px+55,285,70,0,7);x.fill()}else if(biome===1){x.fillStyle="#806a4d";x.beginPath();x.moveTo(px-130,520);x.quadraticCurveTo(px,390,px+150,520);x.fill()}else{x.fillStyle="#66717e";x.beginPath();x.moveTo(px-150,520);x.lineTo(px,180+(i%3)*45);x.lineTo(px+170,520);x.fill()}}x.restore();
 x.save();x.globalAlpha=.13;for(let i=0;i<22;i++){let px=((i*137-g.cam*.28)%1500+1500)%1500;x.fillStyle="#d7e0e7";x.beginPath();x.arc(px,120+(i%6)*58,45+i%4*18,0,7);x.fill()}x.restore();
 // subtle vignette for a more cinematic, less flat presentation
 let vg=x.createRadialGradient(W*.5,Hh*.45,180,W*.5,Hh*.45,760);vg.addColorStop(.55,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(0,0,0,.34)");x.fillStyle=vg;x.fillRect(0,0,W,Hh);
 // polished level-complete transition card
 if(g.levelBanner&&g.t<g.levelBanner.until){let b=g.levelBanner,fade=Math.min(1,(b.until-g.t)*1.8);x.save();x.globalAlpha=fade*.96;let bw=Math.min(760,W-100),bx=(W-bw)/2,by=205;let lg=x.createLinearGradient(bx,by,bx+bw,by+125);lg.addColorStop(0,"rgba(14,22,30,.96)");lg.addColorStop(1,"rgba(35,30,45,.96)");x.fillStyle=lg;x.beginPath();x.roundRect(bx,by,bw,125,26);x.fill();x.strokeStyle="rgba(239,211,137,.65)";x.lineWidth=2;x.stroke();x.textAlign="center";x.fillStyle="#f4d98c";x.font="800 24px system-ui";x.fillText(b.title,W/2,by+43);x.fillStyle="#f4f6f8";x.font="600 16px system-ui";x.fillText(b.sub,W/2,by+78);x.fillStyle="#aeb8c4";x.font="12px system-ui";x.fillText("Neue Welt freigeschaltet",W/2,by+104);x.textAlign="start";x.restore()}
 // full-width readable riddle panel
 if(g.riddle){let r=g.riddle;x.save();x.fillStyle="rgba(9,13,20,.94)";x.beginPath();x.roundRect(70,28,W-140,150,22);x.fill();x.strokeStyle="rgba(210,190,130,.55)";x.lineWidth=2;x.stroke();x.fillStyle="#f5f1e8";x.font="700 17px system-ui";let words=r.q.split(" "),lines=[""];for(const w of words){let i=lines.length-1,t=(lines[i]+" "+w).trim();if(x.measureText(t).width>W-200)lines.push(w);else lines[i]=t}lines.forEach((v,i)=>x.fillText(v,95,62+i*23));x.font="600 15px system-ui";r.a.forEach((v,i)=>x.fillText((i+1)+": "+v,105+i*((W-210)/3),142));x.fillStyle="#b8c1cc";x.font="12px system-ui";x.fillText("Drücke 1, 2 oder 3 für deine Antwort.",95,166);x.restore()}
 x.save();x.translate(-g.cam,0);
 // organic illustrated scenery: soft silhouettes, curved terrain and layered detail
 for(let wx=0;wx<6000;wx+=180){
  if(wx<2000){
   let trunk=x.createLinearGradient(wx+40,0,wx+95,0);trunk.addColorStop(0,"#142f28");trunk.addColorStop(.5,"#315744");trunk.addColorStop(1,"#17382f");x.fillStyle=trunk;x.beginPath();x.moveTo(wx+48,610);x.bezierCurveTo(wx+42,490,wx+70,390,wx+58,270);x.bezierCurveTo(wx+72,245,wx+91,255,wx+84,285);x.bezierCurveTo(wx+96,410,wx+78,505,wx+103,610);x.closePath();x.fill();
   let leaf=x.createRadialGradient(wx+75,245,8,wx+75,245,95);leaf.addColorStop(0,"#4d8a61");leaf.addColorStop(1,"#173f34");x.fillStyle=leaf;for(let j=0;j<5;j++){x.beginPath();x.ellipse(wx+35+j*24,235+(j%2)*28,62,38,j*.18,0,7);x.fill()}x.strokeStyle="rgba(92,150,108,.7)";x.lineWidth=4;x.beginPath();x.moveTo(wx+142,120);x.bezierCurveTo(wx+80,240,wx+170,345,wx+112,455);x.stroke();
  }else if(wx<4000){
   let sand=x.createLinearGradient(wx,460,wx,610);sand.addColorStop(0,"#d5b270");sand.addColorStop(1,"#806143");x.fillStyle=sand;x.beginPath();x.moveTo(wx-20,610);x.quadraticCurveTo(wx+70,475,wx+205,585);x.lineTo(wx+205,620);x.lineTo(wx-20,620);x.fill();
   if(wx%360===0){x.fillStyle="#8f704e";x.beginPath();x.roundRect(wx+76,425,62,150,14);x.fill();x.fillStyle="#d4b47b";x.beginPath();x.roundRect(wx+64,420,86,18,8);x.fill();x.strokeStyle="rgba(80,55,36,.35)";x.lineWidth=3;for(let j=0;j<3;j++){x.beginPath();x.moveTo(wx+85,460+j*34);x.lineTo(wx+128,452+j*34);x.stroke()}}
  }else{
   let rock=x.createLinearGradient(wx,260,wx+180,570);rock.addColorStop(0,"#8793a0");rock.addColorStop(.55,"#465260");rock.addColorStop(1,"#222c36");x.fillStyle=rock;x.beginPath();x.moveTo(wx-15,590);x.quadraticCurveTo(wx+30,410,wx+85,255);x.quadraticCurveTo(wx+128,390,wx+200,590);x.closePath();x.fill();x.fillStyle="rgba(226,238,247,.9)";x.beginPath();x.moveTo(wx+58,340);x.quadraticCurveTo(wx+82,278,wx+85,255);x.quadraticCurveTo(wx+103,300,wx+120,354);x.quadraticCurveTo(wx+88,336,wx+58,340);x.fill();
  }
 }
// decorative foreground silhouettes add readable platformer structure
 for(let fx=Math.floor(g.cam/260)*260;fx<g.cam+W+300;fx+=260){if(fx<2000){x.fillStyle="rgba(10,35,29,.38)";x.beginPath();x.ellipse(fx+35,605,75,22,-.2,0,7);x.fill()}else if(fx<4000){x.fillStyle="rgba(78,54,35,.3)";x.beginPath();x.ellipse(fx+50,610,95,18,.1,0,7);x.fill()}else{x.fillStyle="rgba(20,28,38,.4)";x.beginPath();x.moveTo(fx,610);x.lineTo(fx+45,545);x.lineTo(fx+105,610);x.fill()}}
 // region title signs
 x.font="700 22px system-ui";x.fillStyle="#dff7df";x.fillText("I  SMARAGD-DSCHUNGEL",120,95);x.fillStyle="#ffe1a1";x.fillText("II  SONNENWÜSTE",2140,95);x.fillStyle="#e2e9f2";x.fillText("III  FROSTGEBIRGE",4140,95);
 // NPCs
 for(const n of g.npcs){x.fillStyle="#d2a084";x.beginPath();x.arc(n.x,n.y-36,9,0,7);x.fill();x.fillStyle="#384657";x.beginPath();x.roundRect(n.x-13,n.y-28,26,35,8);x.fill();x.fillStyle="#fff";x.font="13px system-ui";x.fillText(n.name,n.x-18,n.y-52);if(Math.abs(p.x-n.x)<125){let words=n.text.split(" "),lines=[""];for(const w of words){let i=lines.length-1,t=(lines[i]+" "+w).trim();if(x.measureText(t).width>230)lines.push(w);else lines[i]=t}let bh=28+lines.length*17;x.fillStyle="#111e";x.beginPath();x.roundRect(n.x-125,n.y-92-bh,250,bh,10);x.fill();x.fillStyle="#fff";x.font="12px system-ui";lines.forEach((line,i)=>x.fillText(line,n.x-115,n.y-104-bh+(i+1)*17))}}
 // treasure chests: proximity opens and loots
 for(const c of g.chests){let near=Math.abs(p.x-c.x)<72&&Math.abs(p.y-c.y)<100;if(!c.open&&near&&interactPressed){c.open=true;g.coins+=18;toast("Schatztruhe geöffnet: +18 ⬡");tone(659,.12,.03,"sine");tone(988,.2,.025,"sine",.1)}x.fillStyle=c.open?"#7a5a32":"#b57b32";x.beginPath();x.roundRect(c.x,c.y,42,28,5);x.fill();x.strokeStyle="#e8bd61";x.lineWidth=3;x.strokeRect(c.x+4,c.y+5,34,20);if(c.open){x.fillStyle="#e8bd61";x.fillRect(c.x+4,c.y-8,34,8)}else if(near){x.fillStyle="#fff";x.font="700 12px system-ui";x.fillText("[E] Truhe öffnen",c.x-28,c.y-14)}}
 // temple door and cave mouth
 for(const d of g.doors){x.fillStyle=d.kind==="cave"?"#080b10":"#584936";x.beginPath();x.roundRect(d.x,d.y,d.w,d.h,18,18);x.fill();x.strokeStyle=d.kind==="cave"?"#737f8e":"#c39b58";x.lineWidth=4;x.stroke()}

 for(const q of g.platforms){let b=q.x<2000?0:q.x<4000?1:2,pg=x.createLinearGradient(q.x,q.y,q.x,q.y+q.h);if(b===0){pg.addColorStop(0,"#456b4d");pg.addColorStop(.2,"#33483a");pg.addColorStop(1,"#17251f")}else if(b===1){pg.addColorStop(0,"#c7a269");pg.addColorStop(.2,"#8d6c49");pg.addColorStop(1,"#463a32")}else{pg.addColorStop(0,"#8794a1");pg.addColorStop(.2,"#4e5a67");pg.addColorStop(1,"#202832")}x.fillStyle=pg;x.beginPath();x.roundRect(q.x,q.y,q.w,q.h,Math.min(24,q.h/2));x.fill();x.fillStyle=b===0?"rgba(111,166,104,.75)":b===1?"rgba(231,196,127,.55)":"rgba(210,226,238,.62)";x.beginPath();x.roundRect(q.x+4,q.y+2,q.w-8,10,7);x.fill();x.globalAlpha=.18;for(let k=q.x+22;k<q.x+q.w;k+=62){x.beginPath();x.ellipse(k,q.y+28+(k%4)*7,13,8,.2,0,7);x.fill()}x.globalAlpha=1}
 for(const t of g.traps){x.fillStyle="#a54d45";for(let k=0;k<4;k++){x.beginPath();x.moveTo(t.x+k*14,t.y+t.h);x.lineTo(t.x+7+k*14,t.y);x.lineTo(t.x+14+k*14,t.y+t.h);x.fill()}}
 for(const c of g.pickups)if(c.alive){x.fillStyle=c.type==="coin"?"#e2bd5b":"#8c6be8";x.beginPath();x.arc(c.x,c.y,c.r+Math.sin(g.t*4+c.x)*2,0,7);x.fill()}
 for(const e of g.enemies)if(e.alive){if(e.type==="skeleton"){x.strokeStyle="#ded9c8";x.lineWidth=6;x.lineCap="round";x.beginPath();x.arc(e.x+20,e.y+9,9,0,7);x.moveTo(e.x+20,e.y+18);x.lineTo(e.x+20,e.y+32);x.moveTo(e.x+20,e.y+23);x.lineTo(e.x+7,e.y+31);x.moveTo(e.x+20,e.y+23);x.lineTo(e.x+34,e.y+31);x.moveTo(e.x+20,e.y+32);x.lineTo(e.x+10,e.y+45);x.moveTo(e.x+20,e.y+32);x.lineTo(e.x+31,e.y+45);x.stroke()}else{x.fillStyle=e.type==="hound"?"#7e3940":"#5b4b77";x.beginPath();x.roundRect(e.x,e.y,e.w,e.h,11);x.fill();}x.fillStyle="#f25d57";x.fillRect(e.x+8,e.y+8,5,4);x.fillRect(e.x+e.w-13,e.y+8,5,4);x.fillStyle="#101319";x.fillRect(e.x,e.y-8,e.w,4);x.fillStyle="#b64f50";x.fillRect(e.x,e.y-8,e.w*(e.hp/e.max),4)}
 if(g.extraction){x.strokeStyle="#77e1bd";x.lineWidth=8;x.beginPath();x.ellipse(5890,500,45,90,0,0,7);x.stroke();x.fillStyle="#77e1bd22";x.fillRect(5845,410,90,180)}
 if(g.boss&&g.boss.alive&&g.boss.awake){let b=g.boss;x.save();x.shadowBlur=24;x.shadowColor="#9d68d8";x.fillStyle="#2d2439";x.beginPath();x.roundRect(b.x,b.y,b.w,b.h,24);x.fill();x.shadowBlur=0;x.fillStyle="#ff667b";x.beginPath();x.arc(b.x+29,b.y+35,5,0,7);x.arc(b.x+63,b.y+35,5,0,7);x.fill();x.fillStyle="#111";x.fillRect(b.x,b.y-15,b.w,7);x.fillStyle="#b98cff";x.fillRect(b.x,b.y-15,b.w*b.hp/b.max,7);x.restore();}
 for(const s of g.shots){x.fillStyle=s.enemy?"#ef6259":s.magic?"#c391ff":"#ffd778";x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill()}
 for(const z of g.parts){x.globalAlpha=clamp(z.life*2,0,1);x.fillStyle=z.c;x.fillRect(z.x,z.y,4,4)}x.globalAlpha=1;
 // Distinct human 2.5D character silhouettes
 x.save();x.translate(p.x+p.w/2,p.y+p.h);if(p.face<0)x.scale(-1,1);
 const moving=Math.abs(p.vx)>35, airborne=!p.on, phase=moving?Math.sin(g.t*(8+Math.abs(p.vx)/70)):0;
 const bob=airborne?-3:Math.abs(phase)*1.8, legSwing=airborne?5:phase*7, armSwing=airborne?-4:phase*3;
 const recoil=Math.max(0,1-(g.t-p.lastShot)*9)*7, aimY=pointer.y-(p.y+p.h/2),aimX=Math.max(40,Math.abs(pointer.x-(p.x-g.cam+p.w/2))),aimAngle=clamp(Math.atan2(aimY,aimX),-.75,.75);
 x.translate(0,bob);
 x.globalAlpha=.3;x.fillStyle="#000";x.beginPath();x.ellipse(0,4,24,7,0,0,Math.PI*2);x.fill();x.globalAlpha=1;
 const flash=p.inv>0&&Math.floor(g.t*16)%2, body=flash?"#fff":g.hero.color;
 const isB=chosen==="bacon",isN=chosen==="nexify",isS=chosen==="sinep";
 // legs
 x.lineCap="round";x.strokeStyle="#171b22";x.lineWidth=isB?11:8;x.beginPath();x.moveTo(-7,-21);x.lineTo(-10-legSwing*.35,-5);x.lineTo(-17-legSwing,1);x.stroke();
 x.strokeStyle="#303641";x.beginPath();x.moveTo(7,-21);x.lineTo(11+legSwing*.35,-5);x.lineTo(18+legSwing,0);x.stroke();
 // torso: Bacon broad/muscular, Nexify athletic, SINEP feminine silhouette
 let shoulder=isB?20:isS?13:15, waist=isB?14:isS?9:11;
 let bg=x.createLinearGradient(-20,-47,20,-17);bg.addColorStop(0,body);bg.addColorStop(1,"#222832");x.fillStyle=bg;
 x.beginPath();x.moveTo(-shoulder,-43);x.quadraticCurveTo(0,-50,shoulder,-43);x.lineTo(waist,-18);x.quadraticCurveTo(0,-13,-waist,-18);x.closePath();x.fill();
 // Bacon muscular arms / others slimmer\n x.save();x.translate(shoulder-3,-39);x.rotate(aimAngle);x.translate(-(shoulder-3),39);\n x.strokeStyle=isS?"#c9967d":"#b98567";x.lineWidth=isB?11:7;x.beginPath();x.moveTo(shoulder-3,-39);x.lineTo(22+armSwing-recoil,-30);x.stroke();
 if(isB){x.beginPath();x.arc(-18,-36,6,0,Math.PI*2);x.fillStyle="#b98567";x.fill()}
 // head
 x.fillStyle=isS?"#d2a084":"#c58f70";x.beginPath();x.arc(0,-54,isB?11:10,0,Math.PI*2);x.fill();
 // hair / cap
 if(isN){x.fillStyle="#10141a";x.beginPath();x.arc(0,-57,11,Math.PI,Math.PI*2);x.fill();x.beginPath();x.roundRect(6,-59,14,4,2);x.fill()} 
 else if(isB){x.fillStyle="#38271f";x.beginPath();x.arc(0,-58,10,Math.PI,Math.PI*2);x.fill();x.fillStyle="#4a3025";x.beginPath();x.arc(1,-50,8,0,.95*Math.PI);x.fill()}
 else{x.fillStyle="#241b2d";x.beginPath();x.arc(-1,-57,11,Math.PI,Math.PI*2);x.fill();x.beginPath();x.roundRect(-10,-56,6,25,3);x.fill()}
 // weapon: shotgun / dual revolver impression / arcane rifle
 let wg=x.createLinearGradient(14,-36,55,-28);wg.addColorStop(0,"#20252d");wg.addColorStop(.55,"#7a8490");wg.addColorStop(1,"#11151b");x.fillStyle=wg;
 x.save();x.translate(-recoil,0);x.beginPath();x.roundRect(15,-35,isB?45:isN?31:40,isB?9:7,3);x.fill();
 if(isN){x.fillRect(12,-25,29,6);x.fillStyle="#b78a42";x.fillRect(18,-29,6,8);x.fillRect(16,-19,6,7)}
 else if(isS){x.fillStyle="#b98cff";x.beginPath();x.arc(54,-31,6,0,Math.PI*2);x.fill()}
 else{x.fillStyle="#9c6a35";x.fillRect(21,-27,12,7)}x.restore();
 // muzzle flash and movement dust
 if(recoil>1){x.fillStyle="#ffd77a";x.globalAlpha=.8;x.beginPath();x.moveTo(isB?58:48,-32);x.lineTo(isB?75:62,-39);x.lineTo(isB?68:57,-30);x.lineTo(isB?76:63,-24);x.closePath();x.fill();x.globalAlpha=1}
 if(p.on&&moving&&Math.abs(phase)>.82){x.fillStyle="#b9b0a255";x.beginPath();x.arc(-18,2,5,0,7);x.arc(-27,1,3,0,7);x.fill()}
 x.restore();\n // face highlight + rim
 x.fillStyle="#1b1513";x.beginPath();x.arc(5,-54,1.4,0,7);x.fill();x.strokeStyle=body;x.globalAlpha=.55;x.lineWidth=2;x.beginPath();x.arc(-1,-54,13,2.5,5.4);x.stroke();x.globalAlpha=1;x.restore();
 x.restore();
 let m=1+Math.floor(g.t/45)*.25+(D-1)*.5;ui.name.textContent=g.hero.name+" · "+g.hero.skill;ui.hp.textContent="HP "+Math.ceil(p.hp)+"/"+p.max;ui.coins.textContent="Beute "+g.coins+" ⬡";ui.mult.textContent="Risiko ×"+m.toFixed(2);let worldName=g.level===1?"Smaragd-Dschungel":g.level===2?"Sonnenwüste":"Frostgebirge";ui.quest.textContent=(g.done?"✓ Extrahiere am Portal":"Welt "+g.level+"/3 · "+worldName+" · Jagd "+g.kills+"/10 · Kristalle "+g.crystals+"/3");
}
function finish(ok){cancelAnimationFrame(raf);if(!G)return;let mult=1+Math.floor(G.t/45)*.25+(D-1)*.5,earned=ok?Math.floor(G.coins*mult):Math.floor(G.coins*.2);bank+=earned;localStorage.setItem("arcaneBank",bank);ui.bank.textContent="Tresor: "+bank+" ⬡";stage.hidden=true;over.hidden=false;document.querySelector("#overTitle").textContent=ok?"EXTRAKTION ERFOLGREICH":"RUN VERLOREN";document.querySelector("#summary").textContent=G.hero.name+" · "+G.kills+" Kills · "+Math.floor(G.t)+" Sek. · "+earned+" ⬡ gesichert.";G=null}
function loop(t){if(!G)return;let dt=Math.min(.033,(t-last)/1000);last=t;update(dt);draw();raf=requestAnimationFrame(loop)}
document.querySelector("#start").addEventListener("click",()=>{try{init()}catch(err){console.error(err);menu.hidden=false;stage.hidden=true;ui.toast.textContent="Startfehler: Bitte Seite neu laden.";ui.toast.style.opacity=1}});document.querySelector("#again").onclick=()=>{over.hidden=true;menu.hidden=false};})();