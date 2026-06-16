
f = open(r'D:\voice\script.js', 'r', encoding='utf-8')
src = f.read()
f.close()

# =========================================================
# PART A: Insert a _BACKDROP_REGISTRY right after line 376
# (after EXTRA_PRESENTATION_TEMPLATES declaration)
# =========================================================
anchor_a = 'const EXTRA_PRESENTATION_TEMPLATES    = ['
# find where EXTRA_PRESENTATION_TEMPLATES block ends (after the closing ])
idx = src.find(anchor_a)
end_bracket = src.find('];', idx)
insert_pos_a = end_bracket + 2  # after ];

# 15 new template IDs (7 existing + 8 new)
new_tpl_ids = [
    'ocean-waves', 'winter-snow', 'cherry-blossom',
    'desert-dunes', 'aurora-borealis', 'lightning-storm',
    'mountain-mist', 'rainbow-garden'
]

# Build the new template ID list extension
extra_ids_str = ',\n  '.join([f'"{ tid }"' for tid in new_tpl_ids])

registry_code = f'''
// ── NEW template IDs added
const EXTRA_PRESENTATION_TEMPLATES_V2 = [
  {extra_ids_str}
];
// Merge into EXTRA_PRESENTATION_TEMPLATES at runtime
EXTRA_PRESENTATION_TEMPLATES_V2.forEach(function(id) {{
  if (!EXTRA_PRESENTATION_TEMPLATES.includes(id)) EXTRA_PRESENTATION_TEMPLATES.push(id);
}});

// ── Backdrop registry: all animated backdrops keyed by template ID
var _BACKDROP_REGISTRY = _BACKDROP_REGISTRY || {{}};

_BACKDROP_REGISTRY['sunrise-classroom'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#1a0533');sky.addColorStop(0.25,'#6b1a3a');sky.addColorStop(0.55,'#d4572a');
  sky.addColorStop(0.80,'#f4913a');sky.addColorStop(1,'#ffd06e');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  var sunX=W*0.5,sunY=H*0.82,sunR=110+6*Math.sin(t*0.4);
  var sg=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,sunR*2.5);
  sg.addColorStop(0,'rgba(255,240,80,1)');sg.addColorStop(0.2,'rgba(255,190,40,0.9)');
  sg.addColorStop(0.5,'rgba(255,130,20,0.45)');sg.addColorStop(1,'rgba(255,80,0,0)');
  ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sunX,sunY,sunR*2.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,245,100,0.95)';ctx.beginPath();ctx.arc(sunX,sunY,sunR,0,Math.PI*2);ctx.fill();
  ctx.save();
  for(var i=0;i<16;i++){{var ang=(i/16)*Math.PI*2+t*0.15,r1=sunR+20,r2=sunR+80+30*Math.sin(t*0.7+i);ctx.strokeStyle='rgba(255,230,80,'+(0.12+0.08*Math.sin(t+i))+')';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(sunX+Math.cos(ang)*r1,sunY+Math.sin(ang)*r1);ctx.lineTo(sunX+Math.cos(ang)*r2,sunY+Math.sin(ang)*r2);ctx.stroke();}}
  ctx.restore();
  ctx.fillStyle='#1a3a1a';ctx.beginPath();ctx.moveTo(0,H);
  for(var x=0;x<=W;x+=4)ctx.lineTo(x,H*0.78+40*Math.sin(x/180+0.5)+25*Math.sin(x/80+1.8));
  ctx.lineTo(W,H);ctx.closePath();ctx.fill();
}};

_BACKDROP_REGISTRY['galaxy-night'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var base=ctx.createLinearGradient(0,0,W,H);
  base.addColorStop(0,'#020010');base.addColorStop(0.3,'#08004a');base.addColorStop(0.65,'#12006a');base.addColorStop(1,'#01001e');
  ctx.fillStyle=base;ctx.fillRect(0,0,W,H);
  var nebulas=[{{cx:0.2,cy:0.3,r:340,c1:'rgba(140,0,255,0.25)',c2:'rgba(140,0,255,0)'}},{{cx:0.75,cy:0.25,r:400,c1:'rgba(0,100,255,0.22)',c2:'rgba(0,100,255,0)'}},{{cx:0.5,cy:0.7,r:280,c1:'rgba(255,0,180,0.18)',c2:'rgba(255,0,180,0)'}}];
  for(var ni=0;ni<nebulas.length;ni++){{var n=nebulas[ni];var pulse=0.85+0.15*Math.sin(t*0.5+n.cx*8);var g=ctx.createRadialGradient(n.cx*W,n.cy*H,0,n.cx*W,n.cy*H,n.r*pulse);g.addColorStop(0,n.c1);g.addColorStop(1,n.c2);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}}
  var stars=[[0.04,0.08],[0.12,0.18],[0.23,0.05],[0.41,0.10],[0.52,0.28],[0.60,0.08],[0.69,0.19],[0.79,0.07],[0.87,0.25],[0.08,0.38],[0.38,0.52],[0.56,0.48],[0.74,0.55],[0.15,0.70],[0.45,0.60],[0.07,0.85]];
  ctx.save();
  for(var si=0;si<stars.length;si++){{ctx.globalAlpha=0.3+0.7*Math.abs(Math.sin(t*1.8+si*1.37));ctx.fillStyle=si%3===0?'#b0e0ff':'#fff';ctx.beginPath();ctx.arc(stars[si][0]*W,stars[si][1]*H,1.5,0,Math.PI*2);ctx.fill();}}
  ctx.globalAlpha=1;ctx.restore();
  var px=W*0.84,py=H*0.18,pr=55+3*Math.sin(t*0.3);
  var pGrad=ctx.createRadialGradient(px-15,py-15,5,px,py,pr);pGrad.addColorStop(0,'#7070ff');pGrad.addColorStop(0.6,'#2020aa');pGrad.addColorStop(1,'#000033');
  ctx.fillStyle=pGrad;ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(160,140,255,0.5)';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(px,py,pr*1.8,pr*0.35,-0.25,0,Math.PI*2);ctx.stroke();
}};

_BACKDROP_REGISTRY['tropical-green'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var sky=ctx.createLinearGradient(0,0,0,H*0.6);sky.addColorStop(0,'#0077cc');sky.addColorStop(0.5,'#00aaee');sky.addColorStop(1,'#55ddff');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  var ground=ctx.createLinearGradient(0,H*0.55,0,H);ground.addColorStop(0,'#1a7a2a');ground.addColorStop(1,'#0d4015');
  ctx.fillStyle=ground;ctx.fillRect(0,H*0.55,W,H);
  var drawPalm=function(tx,ty,lean){{ctx.save();ctx.strokeStyle='#5a3010';ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(tx,ty);ctx.bezierCurveTo(tx+lean*20,ty-H*0.18,tx+lean*35,ty-H*0.30,tx+lean*45,ty-H*0.38);ctx.stroke();var lx=tx+lean*45,ly=ty-H*0.38;var leafAngles=[-0.6,-0.2,0.2,0.6,1.0,-1.0];for(var la=0;la<leafAngles.length;la++){{var a=leafAngles[la],sway=0.05*Math.sin(t*0.8+la);ctx.strokeStyle=la%2===0?'#1a8a20':'#26aa28';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(lx,ly);var ex=lx+Math.cos(a+sway-0.3)*110,ey=ly+Math.sin(a+sway-0.3)*80;ctx.bezierCurveTo(lx+Math.cos(a)*60,ly+Math.sin(a)*40,ex-10,ey-20,ex,ey);ctx.stroke();}}ctx.restore();}};
  drawPalm(W*0.08,H,-1);drawPalm(W*0.92,H,1);drawPalm(W*0.18,H,-0.5);drawPalm(W*0.82,H,0.5);
}};

_BACKDROP_REGISTRY['royal-purple'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var base=ctx.createLinearGradient(0,0,W,H);base.addColorStop(0,'#1a0038');base.addColorStop(0.35,'#2d006e');base.addColorStop(0.65,'#1e0055');base.addColorStop(1,'#0d001e');
  ctx.fillStyle=base;ctx.fillRect(0,0,W,H);
  var glow=ctx.createRadialGradient(W*0.5,H*0.2,0,W*0.5,H*0.2,W*0.6);glow.addColorStop(0,'rgba(255,200,0,0.18)');glow.addColorStop(1,'rgba(255,200,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.strokeStyle='rgba(255,200,80,0.10)';ctx.lineWidth=1.5;
  for(var gx=0;gx<W;gx+=70)for(var gy=0;gy<H;gy+=70){{ctx.beginPath();ctx.moveTo(gx+35,gy);ctx.lineTo(gx+70,gy+35);ctx.lineTo(gx+35,gy+70);ctx.lineTo(gx,gy+35);ctx.closePath();ctx.stroke();}}
  ctx.restore();
  var crownX=W*0.5,crownY=H*0.14,crownW=140,crownH=70,pulse=1+0.04*Math.sin(t*1.2);
  ctx.save();ctx.scale(pulse,pulse);var cx2=crownX/pulse,cy2=crownY/pulse;
  var cg=ctx.createLinearGradient(cx2-crownW/2,cy2,cx2+crownW/2,cy2+crownH);cg.addColorStop(0,'#ffd700');cg.addColorStop(0.5,'#ffaa00');cg.addColorStop(1,'#cc8800');
  ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(cx2-crownW/2,cy2+crownH);ctx.lineTo(cx2-crownW/2,cy2+20);ctx.lineTo(cx2-crownW/3,cy2-crownH*0.4);ctx.lineTo(cx2,cy2-crownH*0.9);ctx.lineTo(cx2+crownW/3,cy2-crownH*0.4);ctx.lineTo(cx2+crownW/2,cy2+20);ctx.lineTo(cx2+crownW/2,cy2+crownH);ctx.closePath();ctx.fill();
  ctx.restore();
}};

_BACKDROP_REGISTRY['candy-pink'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var base=ctx.createLinearGradient(0,0,W,H);base.addColorStop(0,'#2d0045');base.addColorStop(0.35,'#5a0072');base.addColorStop(0.65,'#7b0099');base.addColorStop(1,'#220035');ctx.fillStyle=base;ctx.fillRect(0,0,W,H);
  var confetti=['#ff69b4','#ff99cc','#dd88ff','#ffaaff','#aaffee','#ffff88'];
  ctx.save();
  for(var ci=0;ci<30;ci++){{var cx3=((ci*79.3+t*40*(ci%3===0?1:0.7))%(W+20))-10;var cy3=((ci*57.1+t*60*(ci%5===0?1.2:0.9))%(H+20))-10;var cr=3+(ci%4);ctx.fillStyle=confetti[ci%confetti.length];ctx.globalAlpha=0.55+0.35*Math.sin(t*2+ci);ctx.beginPath();ctx.arc(cx3,cy3,cr,0,Math.PI*2);ctx.fill();}}
  ctx.globalAlpha=0.18;
  var rbow=['#ff4444','#ff9900','#ffff00','#44ff44','#4488ff','#aa44ff','#ff44ee'];
  for(var ri=0;ri<rbow.length;ri++){{ctx.strokeStyle=rbow[ri];ctx.lineWidth=16;ctx.beginPath();ctx.arc(W*0.5,-H*0.15,W*0.4+ri*28,0,Math.PI);ctx.stroke();}}
  ctx.globalAlpha=1;ctx.restore();
}};

_BACKDROP_REGISTRY['neon-cyber'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var base=ctx.createLinearGradient(0,0,0,H);base.addColorStop(0,'#020008');base.addColorStop(0.5,'#060018');base.addColorStop(1,'#0a0020');ctx.fillStyle=base;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.strokeStyle='rgba(0,220,255,0.08)';ctx.lineWidth=1;
  var vpx=W*0.5,vpy=H*0.55;
  for(var ni2=-12;ni2<=12;ni2++){{ctx.beginPath();ctx.moveTo(vpx+ni2*100,H);ctx.lineTo(vpx,vpy);ctx.stroke();}}
  for(var row=0;row<8;row++){{var prog=row/8,lx=vpx-vpx*(1-prog*prog),rx=vpx+(W-vpx)*(1-prog*prog),ly=vpy+(H-vpy)*prog*prog;ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(rx,ly);ctx.stroke();}}
  var bldgs=[{{x:0,w:80,h:0.42}},{{x:75,w:50,h:0.35}},{{x:120,w:90,h:0.50}},{{x:260,w:100,h:0.55}},{{x:355,w:70,h:0.45}},{{x:500,w:110,h:0.52}},{{x:665,w:90,h:0.44}},{{x:820,w:100,h:0.50}},{{x:975,w:80,h:0.36}}];
  for(var bi2=0;bi2<bldgs.length;bi2++){{var bd=bldgs[bi2],bh=H*bd.h;ctx.fillStyle='#0a0018';ctx.fillRect(bd.x,H-bh,bd.w,bh);}}
  var neonLines=[{{y:0.62,c:'#00ffff',w:3}},{{y:0.70,c:'#ff00ff',w:2}},{{y:0.78,c:'#00ff88',w:2.5}}];
  for(var nl=0;nl<neonLines.length;nl++){{ctx.globalAlpha=0.6*(0.7+0.3*Math.abs(Math.sin(t*4+neonLines[nl].y*10)));ctx.strokeStyle=neonLines[nl].c;ctx.lineWidth=neonLines[nl].w;ctx.beginPath();ctx.moveTo(0,neonLines[nl].y*H);ctx.lineTo(W,neonLines[nl].y*H);ctx.stroke();}}
  ctx.globalAlpha=1;ctx.restore();
}};

_BACKDROP_REGISTRY['golden-hour'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#1a0510');sky.addColorStop(0.20,'#4a0e00');sky.addColorStop(0.45,'#c44a00');sky.addColorStop(0.70,'#f5a000');sky.addColorStop(0.90,'#ffd040');sky.addColorStop(1,'#ffe880');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,240,100,0.95)';ctx.beginPath();ctx.arc(W*0.5,H*0.68,70+4*Math.sin(t*0.5),0,Math.PI*2);ctx.fill();
  ctx.save();
  for(var ri3=0;ri3<20;ri3++){{var ang3=(ri3/20)*Math.PI*2+t*0.08,r1b=80,r2b=300+80*Math.sin(t*0.4+ri3*0.8);ctx.strokeStyle='rgba(255,200,0,'+(0.06+0.04*Math.sin(t*0.7+ri3))+')';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(W*0.5+Math.cos(ang3)*r1b,H*0.68+Math.sin(ang3)*r1b);ctx.lineTo(W*0.5+Math.cos(ang3)*r2b,H*0.68+Math.sin(ang3)*r2b);ctx.stroke();}}
  ctx.restore();
  var hills=[['rgba(80,20,0,0.85)',0.72,50,0.004],['rgba(40,60,0,0.90)',0.80,35,0.007],['rgba(20,40,10,0.95)',0.88,25,0.010]];
  for(var hi=0;hi<hills.length;hi++){{ctx.fillStyle=hills[hi][0];ctx.beginPath();ctx.moveTo(0,H);for(var hx=0;hx<=W;hx+=4)ctx.lineTo(hx,H*hills[hi][1]+hills[hi][2]*Math.sin(hx*hills[hi][3]));ctx.lineTo(W,H);ctx.closePath();ctx.fill();}}
}};

_BACKDROP_REGISTRY['ocean-waves'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var sky=ctx.createLinearGradient(0,0,0,H*0.5);sky.addColorStop(0,'#001a4a');sky.addColorStop(1,'#0066aa');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H*0.5);
  var sea=ctx.createLinearGradient(0,H*0.45,0,H);sea.addColorStop(0,'#0088cc');sea.addColorStop(0.4,'#005580');sea.addColorStop(1,'#003355');
  ctx.fillStyle=sea;ctx.fillRect(0,H*0.45,W,H);
  for(var wi=0;wi<6;wi++){{var wy=H*(0.48+wi*0.09)+20*Math.sin(t*0.8+wi*1.1),amp=18-wi*2;
    var wg=ctx.createLinearGradient(0,wy-amp,0,wy+amp*2);wg.addColorStop(0,'rgba(100,200,255,0.5)');wg.addColorStop(1,'rgba(0,80,160,0)');
    ctx.fillStyle=wg;ctx.beginPath();ctx.moveTo(0,wy);
    for(var wx=0;wx<=W;wx+=8)ctx.lineTo(wx,wy+amp*Math.sin(wx/180+t*1.2+wi*0.7));
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();}}
  ctx.save();
  for(var bi3=0;bi3<8;bi3++){{var bx=((bi3*137+t*30)%(W+60))-30,by=H*0.5+bi3*12;
    ctx.fillStyle='rgba(255,255,255,'+(0.3+0.2*Math.sin(t*2+bi3))+')';
    ctx.beginPath();ctx.ellipse(bx,by,20+bi3*3,8,0,0,Math.PI*2);ctx.fill();}}
  ctx.restore();
  var sunO=ctx.createRadialGradient(W*0.5,H*0.1,0,W*0.5,H*0.1,W*0.4);sunO.addColorStop(0,'rgba(255,220,100,0.25)');sunO.addColorStop(1,'rgba(255,220,100,0)');
  ctx.fillStyle=sunO;ctx.fillRect(0,0,W,H);
}};

_BACKDROP_REGISTRY['winter-snow'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#0a1428');sky.addColorStop(0.5,'#1a2a4a');sky.addColorStop(1,'#2a3a5a');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  ctx.save();
  for(var si2=0;si2<60;si2++){{var sx=W*(((si2*83.7+t*(si2%3+0.5)*30)%(W+20))/W);var sy=H*(((si2*61.3+t*(si2%4+0.5)*15)%(H+20))/H);var sr2=1.5+si2%3;ctx.fillStyle='rgba(220,240,255,'+(0.4+0.4*Math.sin(t*1.5+si2))+')';ctx.beginPath();ctx.arc(sx,sy,sr2,0,Math.PI*2);ctx.fill();}}
  ctx.restore();
  for(var mi=0;mi<4;mi++){{ctx.fillStyle='rgba(200,220,255,'+(0.15+mi*0.05)+')';
    ctx.beginPath();ctx.moveTo(0,H);var mStart=H*(0.6+mi*0.08);
    for(var mx=0;mx<=W;mx+=6)ctx.lineTo(mx,mStart+30*Math.sin(mx/200+mi));
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();}}
  ctx.fillStyle='rgba(230,245,255,0.9)';
  ctx.beginPath();ctx.moveTo(0,H);
  for(var fx=0;fx<=W;fx+=6)ctx.lineTo(fx,H*0.88+15*Math.sin(fx/100));
  ctx.lineTo(W,H);ctx.closePath();ctx.fill();
}};

_BACKDROP_REGISTRY['cherry-blossom'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#fde8f5');sky.addColorStop(0.5,'#f9d0e8');sky.addColorStop(1,'#f5b8d8');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#5a2a1a';ctx.lineWidth=12;
  ctx.beginPath();ctx.moveTo(W*0.1,H);ctx.bezierCurveTo(W*0.12,H*0.5,W*0.25,H*0.3,W*0.3,H*0.1);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W*0.85,H);ctx.bezierCurveTo(W*0.82,H*0.5,W*0.7,H*0.28,W*0.72,H*0.12);ctx.stroke();
  ctx.save();
  var petals=[];
  for(var pi=0;pi<40;pi++)petals.push([W*0.05+W*0.9*(pi*37.3%1),(((pi*53.7+t*25*(pi%2===0?1:0.6))%(H+30))),4+pi%4]);
  for(var pi2=0;pi2<petals.length;pi2++){{var p=petals[pi2];ctx.fillStyle='rgba(255,182,193,'+(0.5+0.4*Math.abs(Math.sin(t+pi2)))+')';ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(t*0.5+pi2);ctx.beginPath();for(var pp=0;pp<5;pp++){{var pa=pp*Math.PI*2/5,pr2=p[2];ctx.ellipse(Math.cos(pa)*pr2,Math.sin(pa)*pr2,pr2,pr2*0.5,pa,0,Math.PI*2);}};ctx.fill();ctx.restore();}}
  ctx.restore();
}};

_BACKDROP_REGISTRY['desert-dunes'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#1a0800');sky.addColorStop(0.3,'#6b2800');sky.addColorStop(0.6,'#c87020');sky.addColorStop(0.85,'#f0b040');sky.addColorStop(1,'#ffe0a0');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  var dunes=[['#c8942a',0.65,60],['#b07820',0.72,45],['#a06010',0.80,35],['#7a4808',0.88,25]];
  for(var di=0;di<dunes.length;di++){{ctx.fillStyle=dunes[di][0];ctx.beginPath();ctx.moveTo(0,H);
    for(var dx=0;dx<=W;dx+=6)ctx.lineTo(dx,H*dunes[di][1]+dunes[di][2]*Math.sin(dx/300+di+t*0.05));
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();}}
  ctx.fillStyle='rgba(255,200,80,0.15)';
  ctx.beginPath();ctx.arc(W*0.78,H*0.18,80+5*Math.sin(t*0.3),0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,210,100,0.9)';ctx.beginPath();ctx.arc(W*0.78,H*0.18,60,0,Math.PI*2);ctx.fill();
}};

_BACKDROP_REGISTRY['aurora-borealis'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#010810');sky.addColorStop(0.5,'#020f1a');sky.addColorStop(1,'#030e15');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  ctx.save();
  var auroras=[{{c:'rgba(0,255,120,',y:0.25,amp:60,spd:0.4,phase:0}},{{c:'rgba(0,180,255,',y:0.35,amp:80,spd:0.3,phase:1.5}},{{c:'rgba(180,0,255,',y:0.30,amp:50,spd:0.5,phase:3}},{{c:'rgba(0,255,200,',y:0.20,amp:40,spd:0.6,phase:4.5}}];
  for(var ai=0;ai<auroras.length;ai++){{var au=auroras[ai];
    ctx.globalAlpha=0.18+0.12*Math.sin(t*0.7+ai);
    for(var ac=0;ac<4;ac++){{var alpha=(0.4-ac*0.08);
      ctx.strokeStyle=au.c+alpha+')';ctx.lineWidth=40-ac*8;
      ctx.beginPath();
      for(var ax=0;ax<=W;ax+=12){{var ay=H*au.y+au.amp*Math.sin(ax/400+t*au.spd+au.phase+ac*0.3);ax===0?ctx.moveTo(ax,ay):ctx.lineTo(ax,ay);}}
      ctx.stroke();}}
  }}
  ctx.globalAlpha=1;ctx.restore();
  ctx.save();
  for(var si3=0;si3<30;si3++){{ctx.globalAlpha=0.4+0.5*Math.abs(Math.sin(t*2+si3*1.4));ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(si3*(W/30),H*(0.05+0.45*(si3%7)/7),1.2,0,Math.PI*2);ctx.fill();}}
  ctx.globalAlpha=1;ctx.restore();
}};

_BACKDROP_REGISTRY['lightning-storm'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#080810');sky.addColorStop(0.5,'#100810');sky.addColorStop(1,'#180818');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  var cloudPositions=[[0.15,0.12,280],[0.5,0.08,350],[0.82,0.15,300],[0.3,0.22,220],[0.7,0.20,260]];
  for(var ci2=0;ci2<cloudPositions.length;ci2++){{var cp=cloudPositions[ci2];
    var cg2=ctx.createRadialGradient(cp[0]*W,cp[1]*H,20,cp[0]*W,cp[1]*H,cp[2]);
    cg2.addColorStop(0,'rgba(60,50,80,0.8)');cg2.addColorStop(1,'rgba(20,15,30,0)');
    ctx.fillStyle=cg2;ctx.fillRect(0,0,W,H);}}
  var ltPhase=Math.sin(t*3)*Math.sin(t*7);
  if(ltPhase>0.7){{ctx.save();ctx.globalAlpha=(ltPhase-0.7)*2.5;
    var lx2=W*(0.3+0.4*Math.sin(t*0.5)),lw=6;
    ctx.strokeStyle='#e8e0ff';ctx.lineWidth=lw;ctx.shadowColor='#a080ff';ctx.shadowBlur=30;
    ctx.beginPath();ctx.moveTo(lx2,0);
    var ly2=0;while(ly2<H*0.8){{ly2+=40+Math.random()*60;ctx.lineTo(lx2+(Math.random()-0.5)*80,ly2);}}
    ctx.stroke();ctx.shadowBlur=0;ctx.restore();}}
  ctx.save();
  for(var ri4=0;ri4<10;ri4++){{var rx=((ri4*127+t*80)%(W+10)),ry=0;ctx.strokeStyle='rgba(150,150,255,0.15)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx+20,H);ctx.stroke();}}
  ctx.restore();
}};

_BACKDROP_REGISTRY['mountain-mist'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#1a2040');sky.addColorStop(0.4,'#3a4a70');sky.addColorStop(0.7,'#6a7aa0');sky.addColorStop(1,'#9ab0c8');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  var mountains=[['#1a2030',0.45,180,0.003],['#253040',0.55,140,0.004],['#304050',0.63,120,0.005],['#4a5a6a',0.72,80,0.006]];
  for(var mi2=0;mi2<mountains.length;mi2++){{ctx.fillStyle=mountains[mi2][0];ctx.beginPath();ctx.moveTo(0,H);
    for(var mx2=0;mx2<=W;mx2+=6)ctx.lineTo(mx2,H*mountains[mi2][1]+mountains[mi2][2]*Math.sin(mx2*mountains[mi2][3]));
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();}}
  for(var mfi=0;mfi<3;mfi++){{var mfg=ctx.createLinearGradient(0,H*(0.55+mfi*0.1),0,H*(0.65+mfi*0.1));
    mfg.addColorStop(0,'rgba(200,220,240,'+(0.04+mfi*0.03)+')');
    mfg.addColorStop(1,'rgba(200,220,240,0)');
    ctx.fillStyle=mfg;ctx.fillRect(0,H*(0.55+mfi*0.1),W,H*0.1);}}
  var starsBright=[[0.1,0.08],[0.25,0.05],[0.4,0.12],[0.6,0.06],[0.75,0.10],[0.9,0.08]];
  ctx.save();
  for(var si4=0;si4<starsBright.length;si4++){{ctx.globalAlpha=0.5+0.4*Math.sin(t*1.5+si4*1.1);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(starsBright[si4][0]*W,starsBright[si4][1]*H,2,0,Math.PI*2);ctx.fill();}}
  ctx.globalAlpha=1;ctx.restore();
}};

_BACKDROP_REGISTRY['rainbow-garden'] = function() {{
  var W=canvas.width,H=canvas.height,t=performance.now()/1000;
  var sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#87ceeb');sky.addColorStop(0.5,'#b0e0ff');sky.addColorStop(1,'#d0f0ff');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  var rbColors=['rgba(255,0,0,0.18)','rgba(255,120,0,0.18)','rgba(255,255,0,0.18)','rgba(0,200,0,0.18)','rgba(0,100,255,0.18)','rgba(100,0,200,0.18)'];
  for(var ri5=0;ri5<rbColors.length;ri5++){{ctx.strokeStyle=rbColors[ri5];ctx.lineWidth=40;ctx.beginPath();ctx.arc(W*0.5,H*1.1,W*(0.3+ri5*0.06),Math.PI,0);ctx.stroke();}}
  var ground2=ctx.createLinearGradient(0,H*0.72,0,H);ground2.addColorStop(0,'#2d8a20');ground2.addColorStop(1,'#1a5510');
  ctx.fillStyle=ground2;ctx.fillRect(0,H*0.72,W,H);
  ctx.save();
  var flowerColors=['#ff4444','#ff9900','#ffff00','#ff69b4','#9966ff','#00ccff'];
  for(var fi=0;fi<20;fi++){{var fx2=W*0.03+W*0.94*(fi/20),fy2=H*0.78+Math.sin(t*0.8+fi)*8;
    ctx.strokeStyle='#3a8a20';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(fx2,H);ctx.lineTo(fx2,fy2);ctx.stroke();
    ctx.fillStyle=flowerColors[fi%flowerColors.length];ctx.beginPath();ctx.arc(fx2,fy2,10+fi%4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffff88';ctx.beginPath();ctx.arc(fx2,fy2,4,0,Math.PI*2);ctx.fill();}}
  ctx.restore();
}};

'''

# Insert after the EXTRA_PRESENTATION_TEMPLATES closing bracket
if '// ── Backdrop registry' in src:
    print('PART A: already inserted, skipping')
else:
    src = src[:insert_pos_a] + registry_code + src[insert_pos_a:]
    print('PART A: registry inserted at char', insert_pos_a)

# =========================================================
# PART B: Update drawTeachingStageBackdrop to use registry
# =========================================================
old_teach_fn_start = 'function drawTeachingStageBackdrop(mouthOpen = 0) {'
old_teach_body = '''  const _tpl = normalizePresentationTemplate(state.presentationTemplate);
  switch (_tpl) {
    case PRESENTATION_TEMPLATE_OUTCOMES: drawLearningOutcomesBackdrop(mouthOpen); return;
    case "sunrise-classroom":            if(window.drawSunriseClassroomBackdrop)window.drawSunriseClassroomBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    case "galaxy-night":                 if(window.drawGalaxyNightBackdrop)window.drawGalaxyNightBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    case "tropical-green":              if(window.drawTropicalGardenBackdrop)window.drawTropicalGardenBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    case "royal-purple":                if(window.drawRoyalStageBackdrop)window.drawRoyalStageBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    case "candy-pink":                   if(window.drawCandyPopBackdrop)window.drawCandyPopBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    case "neon-cyber":                   if(window.drawNeonCityBackdrop)window.drawNeonCityBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    case "golden-hour":                  if(window.drawGoldenHourBackdrop)window.drawGoldenHourBackdrop(); else drawClassicTeachingStageBackdrop(); return;
    default:                             drawClassicTeachingStageBackdrop();
  }
}'''

new_teach_body = '''  var _tpl = normalizePresentationTemplate(state.presentationTemplate);
  if (_tpl === PRESENTATION_TEMPLATE_OUTCOMES) { drawLearningOutcomesBackdrop(mouthOpen); return; }
  var _fn = _BACKDROP_REGISTRY && _BACKDROP_REGISTRY[_tpl];
  if (typeof _fn === 'function') { try { _fn(); } catch(e) { console.error('Backdrop error:', _tpl, e); drawClassicTeachingStageBackdrop(); } return; }
  drawClassicTeachingStageBackdrop();
}'''

old_teach_full = old_teach_fn_start + '\n' + old_teach_body
new_teach_full = old_teach_fn_start + '\n' + new_teach_body

if old_teach_body in src:
    src = src.replace(old_teach_body, new_teach_body.rstrip('}').rstrip() + '\n}', 1)
    print('PART B: drawTeachingStageBackdrop updated')
else:
    print('PART B: old body not found, checking what is there...')
    idx3 = src.find('function drawTeachingStageBackdrop')
    if idx3 >= 0:
        print('Current body:', repr(src[idx3:idx3+400]))

# =========================================================
# PART C: Fix setPresentationTemplate to always trigger redraw
# =========================================================
old_redraw = 'options.redraw !== false && !stagePanel.classList.contains("hidden")) {\n    try {\n      drawScene(state.mouthOpen);'
new_redraw = 'options.redraw !== false) {\n    try {\n      markSceneDirty && markSceneDirty();\n      if (!stagePanel.classList.contains("hidden")) drawScene(state.mouthOpen);'
if old_redraw in src:
    src = src.replace(old_redraw, new_redraw, 1)
    print('PART C: redraw logic updated')
else:
    # try alternate
    alt_old = '!stagePanel.classList.contains("hidden") && options.redraw !== false) {\n    try {\n      drawScene(state.mouthOpen);'
    alt_new = 'options.redraw !== false) {\n    try {\n      markSceneDirty && markSceneDirty();\n      if (!stagePanel.classList.contains("hidden")) drawScene(state.mouthOpen);'
    if alt_old in src:
        src = src.replace(alt_old, alt_new, 1)
        print('PART C (alt): redraw logic updated')
    else:
        print('PART C: redraw anchor not found')
        idx4 = src.find('stagePanel.classList.contains')
        if idx4 >= 0:
            print('Context:', repr(src[idx4-60:idx4+120]))

f = open(r'D:\voice\script.js', 'w', encoding='utf-8')
f.write(src)
f.close()
print('Done writing script.js')
