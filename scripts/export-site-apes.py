"""Export the existing Blender frame sequence into compact web assets."""
from pathlib import Path
from PIL import Image

root=Path(__file__).resolve().parents[1]
dest=root/'public'/'mascots'/'studio'
dest.mkdir(parents=True,exist_ok=True)
for kind in ('creative','builder','business'):
    frames=[Image.open(p).convert('RGBA') for p in sorted((root/'output'/'blender'/'frames'/kind).glob('*.png'))]
    assert len(frames)==60
    boxes=[im.getchannel('A').getbbox() for im in frames]
    box=(max(0,min(b[0] for b in boxes)-12),max(0,min(b[1] for b in boxes)-12),min(480,max(b[2] for b in boxes)+12),min(560,max(b[3] for b in boxes)+12))
    frames=[im.crop(box) for im in frames]
    frames[0].save(dest/f'{kind}-still.webp',quality=90,method=6)
    frames[0].save(dest/f'{kind}-motion.webp',save_all=True,append_images=frames[1:],duration=[80]*60,loop=1,quality=85,method=6)
    print(kind,frames[0].size,flush=True)
