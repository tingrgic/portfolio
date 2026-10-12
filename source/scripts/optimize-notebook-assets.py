"""Delivery-only resizing/encoding; retain authored originals for rollback."""
from pathlib import Path
from PIL import Image
source=Path('public/images/clay-v2'); target=Path('public/images/optimized');target.mkdir(exist_ok=True)
for name,limit,quality in [('walnut',1024,82),('leather',1024,82),('paper',1024,82),('ceramic',1024,82),('name',1100,88),('good-things',1100,88),('bulb-cloud',1100,88),('paper-plane',1100,88)]:
 p=source/(name+'.webp');im=Image.open(p);im.thumbnail((limit,limit),Image.Resampling.LANCZOS);out=target/p.name
 im.save(out,'WEBP',quality=quality,method=6)
 print(name,p.stat().st_size,out.stat().st_size,im.size)
