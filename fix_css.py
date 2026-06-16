# -*- coding: utf-8 -*-
css = '''
/* 8 new template card preview styles */
.tpl3d-preview-ocean   { background: linear-gradient(180deg, #001a4a 0%, #0066aa 45%, #0088cc 46%, #003355 100%); position:relative; overflow:hidden; display:flex; align-items:flex-end; justify-content:center; }
.tpl3d-preview-winter  { background: linear-gradient(180deg, #0a1428 0%, #1a2a4a 50%, #2a3a5a 100%); position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
.tpl3d-preview-cherry  { background: linear-gradient(180deg, #fde8f5 0%, #f9d0e8 50%, #f5b8d8 100%); position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
.tpl3d-preview-desert  { background: linear-gradient(180deg, #1a0800 0%, #6b2800 30%, #c87020 60%, #f0b040 85%, #ffe0a0 100%); position:relative; overflow:hidden; display:flex; align-items:flex-end; justify-content:center; }
.tpl3d-preview-aurora  { background: radial-gradient(ellipse at 30% 40%, rgba(0,255,120,0.3) 0%, transparent 55%), radial-gradient(ellipse at 70% 30%, rgba(0,180,255,0.25) 0%, transparent 50%), linear-gradient(180deg,#010810,#020f1a); position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
.tpl3d-preview-lightning{ background: linear-gradient(180deg, #080810 0%, #100810 50%, #180818 100%); position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; }
.tpl3d-preview-mountain { background: linear-gradient(180deg, #1a2040 0%, #3a4a70 40%, #6a7aa0 70%, #9ab0c8 100%); position:relative; overflow:hidden; display:flex; align-items:flex-end; justify-content:center; }
.tpl3d-preview-rainbow  { background: linear-gradient(180deg, #87ceeb 0%, #b0e0ff 50%, #d0f0ff 100%); position:relative; overflow:hidden; display:flex; align-items:flex-end; justify-content:center; }

/* New decorative elements */
.tpl3d-preview .tpl-wave  { position:absolute; bottom:20%; left:0; right:0; height:18%; background:rgba(100,200,255,0.4); clip-path:ellipse(55% 60% at 50% 100%); display:block; }
.tpl3d-preview .tpl-wave2 { position:absolute; bottom:8%; left:0; right:0; height:14%; background:rgba(0,100,200,0.5); clip-path:ellipse(60% 70% at 50% 100%); display:block; }
.tpl3d-preview .tpl-snowflake { font-size:24px; position:relative; z-index:1; filter:drop-shadow(0 0 8px rgba(180,220,255,0.9)); display:block; }
.tpl3d-preview .tpl-snowfall { position:absolute; inset:0; background:radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 2px, transparent 3px), radial-gradient(circle at 60% 40%, rgba(255,255,255,0.3) 2px, transparent 3px), radial-gradient(circle at 80% 15%, rgba(255,255,255,0.35) 2px, transparent 3px), radial-gradient(circle at 20% 60%, rgba(255,255,255,0.3) 2px, transparent 3px); display:block; }
.tpl3d-preview .tpl-petal  { font-size:22px; position:relative; z-index:1; display:block; }
.tpl3d-preview .tpl-branch { position:absolute; bottom:0; left:8%; width:4px; height:65%; background:#5a2a1a; border-radius:2px; display:block; }
.tpl3d-preview .tpl-desert-sun { position:absolute; top:12%; right:15%; width:24px; height:24px; border-radius:50%; background:radial-gradient(circle, #ffee44 40%, #ffaa00 80%, transparent 100%); box-shadow:0 0 16px 8px rgba(255,200,50,0.4); display:block; }
.tpl3d-preview .tpl-dune { position:absolute; bottom:0; left:0; right:0; height:38%; background:#c8942a; clip-path:ellipse(60% 65% at 50% 100%); display:block; }
.tpl3d-preview .tpl-aurora-band  { position:absolute; top:25%; left:0; right:0; height:14%; background:rgba(0,255,120,0.3); border-radius:50%; filter:blur(8px); display:block; }
.tpl3d-preview .tpl-aurora-band2 { position:absolute; top:38%; left:0; right:0; height:10%; background:rgba(0,180,255,0.25); border-radius:50%; filter:blur(6px); display:block; }
.tpl3d-preview .tpl-lightning { font-size:26px; filter:drop-shadow(0 0 14px rgba(180,160,255,1)) drop-shadow(0 0 30px rgba(140,120,255,0.7)); position:relative; z-index:1; display:block; }
.tpl3d-preview .tpl-stormcloud { position:absolute; top:0; left:0; right:0; height:40%; background:radial-gradient(ellipse at 50% 50%, rgba(60,40,80,0.9) 40%, transparent 100%); display:block; }
.tpl3d-preview .tpl-peak { position:absolute; bottom:0; left:0; right:0; height:55%; background:#253040; clip-path:polygon(0% 100%, 15% 40%, 30% 65%, 50% 15%, 70% 55%, 85% 35%, 100% 100%); display:block; }
.tpl3d-preview .tpl-mist { position:absolute; bottom:30%; left:0; right:0; height:18%; background:linear-gradient(transparent, rgba(180,200,220,0.25), transparent); display:block; }
.tpl3d-preview .tpl-rainbow2 { position:absolute; top:-30%; left:50%; transform:translateX(-50%); width:120px; height:70px; border-radius:50%; border:5px solid transparent; border-top-color:rgba(255,100,100,0.45); border-right-color:rgba(255,200,0,0.3); display:block; }
.tpl3d-preview .tpl-flower { font-size:20px; position:relative; z-index:1; display:block; padding-bottom:4px; }
'''
with open(r'D:\voice\src\index.css', 'a', encoding='utf-8') as f:
    f.write(css)
print('CSS appended OK')
