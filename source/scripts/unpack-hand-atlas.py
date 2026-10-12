"""Unpack twelve disconnected alpha sprites without cutting diagonally authored sleeves.
No repainting, recoloring, pose synthesis, or mirroring: preserve each source sprite.
"""
from PIL import Image, ImageFilter, ImageChops
from pathlib import Path
from collections import deque
root=Path('/home/tin/.codex/generated_images/01a1113c-51cc-7f70-9117-d21831d49e22')
out=Path('public/images/hands-clay-full');out.mkdir(exist_ok=True)
for name,source in [('forward','exec-17e8d3f5-9559-4a55-ad9b-9966774f430e.png'),('backward','exec-75cfbfef-ddd5-4450-b900-fc0a5f09cc5e.png')]:
 im=Image.open(root/source).convert('RGBA');w,h=im.size;alpha=im.getchannel('A');data=alpha.tobytes();seen=bytearray(w*h);groups=[]
 for start,a in enumerate(data):
  if a<128 or seen[start]:continue
  queue=deque([start]);seen[start]=1;pts=[]
  while queue:
   i=queue.popleft();pts.append(i);x=i%w;y=i//w
   for j in ([i-1] if x else [])+([i+1] if x<w-1 else [])+([i-w] if y else [])+([i+w] if y<h-1 else []):
    if not seen[j] and data[j]>=128:seen[j]=1;queue.append(j)
  if len(pts)>10000:groups.append(pts)
 groups=sorted(groups,key=len,reverse=True)[:12]
 assert len(groups)==12,(name,len(groups))
 # Sort by the authored row then left-to-right; each sprite retains its full outline.
 groups.sort(key=lambda g:min(i//w for i in g))
 groups=[g for row in range(3) for g in sorted(groups[row*4:row*4+4],key=lambda g:min(i%w for i in g))]
 for n,pts in enumerate(groups):
  x0=max(0,min(i%w for i in pts)-3);x1=min(w,max(i%w for i in pts)+4)
  y0=max(0,min(i//w for i in pts)-3);y1=min(h,max(i//w for i in pts)+4)
  mask=Image.new('L',(w,h));maskdata=bytearray(w*h)
  for i in pts:maskdata[i]=255
  mask.frombytes(bytes(maskdata));mask=mask.filter(ImageFilter.MaxFilter(5))
  sprite=im.crop((x0,y0,x1,y1));sprite.putalpha(ImageChops.multiply(alpha,mask).crop((x0,y0,x1,y1)))
  canvas=Image.new('RGBA',(384,512));canvas.alpha_composite(sprite,((384-sprite.width)//2,12))
  canvas.save(out/f'{name}-{n+1}.webp',quality=91)
 print(name,'12 complete sprites')
