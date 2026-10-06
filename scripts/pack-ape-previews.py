"""Package Blender's rendered RGBA frames for the local review page."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import shutil

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output'/'blender'
for kind in ('creative','business','builder'):
    frames=[Image.open(p).convert('RGBA') for p in sorted((OUT/'frames'/kind).glob('*.png'))]
    if len(frames)!=60:raise RuntimeError(f'{kind}: expected 60 frames, got {len(frames)}')
    frames[0].save(OUT/f'{kind}-loop.webp',save_all=True,append_images=frames[1:],duration=[83,83,84]*20,loop=0,quality=85,method=6)
    shutil.copy2(ROOT/'public'/'mascots'/f'ape-{kind}.webp',OUT/f'{kind}-reference.webp')
canvas=Image.new('RGB',(1536,690),'#111613')
draw=ImageDraw.Draw(canvas)
try:font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',24)
except OSError:font=ImageFont.load_default()
for index,kind in enumerate(('creative','business','builder')):
    img=Image.open(OUT/f'{kind}-portrait.png').convert('RGBA')
    img.thumbnail((480,600),Image.Resampling.LANCZOS)
    canvas.paste(img,(index*512+(512-img.width)//2,30),img)
    draw.text((index*512+40,638),kind.upper(),font=font,fill='#9ed9bf')
canvas.save(OUT/'lineup.jpg',quality=94)
for p in OUT.glob('*-loop.webp'):print(p.name,p.stat().st_size)
