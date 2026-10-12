"""Reproducible Blender-authored scene. Units match NotebookScene; XY desk, Z up.
Run: blender --background --python scripts/author-environment.py
"""
import bpy, math, random
from mathutils import Vector
from pathlib import Path
random.seed(81)
ROOT=Path(__file__).resolve().parent.parent
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,color,rough=.7,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 return m
wood=mat('Walnut',(0.46,.24,.10),.84);cream=mat('Speckled cream ceramic',(.89,.79,.62),.66)
blue=mat('Indigo glaze',(.07,.12,.17),.45);coffee=mat('Dark coffee',(.022,.012,.006),.18)
terra=mat('Terracotta',(.36,.14,.068),.92);soil=mat('Soil',(.062,.041,.024),1)
sage=mat('Living sage',(.14,.23,.055),.76);leaflight=mat('Leaf light',(.22,.32,.09),.74)
brass=mat('Aged brass',(.24,.22,.065),.42,.65);shade=mat('Linen lampshade',(.87,.65,.32),.96)
black=mat('Charcoal',(.019,.022,.021),.76);yellow=mat('Ochre pencil',(.63,.35,.035),.74)
cedar=mat('Pencil cedar',(.68,.45,.24),.82);metal=mat('Steel clip',(.43,.45,.44),.25,.85)
denim=mat('Dark trousers',(.025,.033,.045),1)
def finish(obj,name,m):
 obj.name=name;obj.data.materials.append(m)
 if obj.type=='MESH':
  for p in obj.data.polygons:p.use_smooth=True
 return obj
def sphere(name,loc,scale,m,segments=24,rings=12):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc);o=bpy.context.object;o.scale=scale;return finish(o,name,m)
def cube(name,loc,scale,m,bevel=.04):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('soft worn edges','BEVEL');mod.width=bevel;mod.segments=3
  bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o,name,m)
def cylinder(name,loc,radius,depth,m,vertices=32):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc);return finish(bpy.context.object,name,m)
def curve(name,pts,r,m):
 data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.resolution_u=10;data.bevel_depth=r;data.bevel_resolution=3
 sp=data.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
 for b,p in zip(sp.bezier_points,pts):b.co=p;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
 o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.data.materials.append(m)
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);return o
def vessel(name,center,profile,m,n=64):
 verts=[];faces=[]
 for j,(r,z) in enumerate(profile):
  for i in range(n):
   a=2*math.pi*i/n;w=1+.024*math.sin(a*5+j*.31)+.012*math.sin(a*9)
   verts.append((center[0]+r*math.cos(a)*w,center[1]+r*math.sin(a)*w,center[2]+z+.008*math.sin(a*4)))
 for j in range(len(profile)-1):
  for i in range(n):a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();
 uv=mesh.uv_layers.new(name='Pottery wrap')
 maxz=max(z for r,z in profile)
 for poly in mesh.polygons:
  ring=poly.index//n; col=poly.index%n
  for k,li in enumerate(poly.loop_indices):
   row=ring+(1 if k>=2 else 0); u=(col+(1 if k in [1,2] else 0))/n
   uv.data[li].uv=(u,profile[row][1]/maxz)
 o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);return finish(o,name,m)
# A solid desk with a genuinely visible front edge; material assigned by runtime.
desk=cube('Desk',(0,3.4,-.36),(25,15,.46),wood,.11)
# Long seams follow actual wood boards rather than a tiled background.
for y in [-3.25,-1.65,.03,1.67,3.31,5.0,6.7,8.4]:
 cube('DeskBoardSeam',(0,y,-.130),(25,.006,.003),soil,.001)
uv=desk.data.uv_layers.active.data
for poly in desk.data.polygons:
 for li in poly.loop_indices:
  v=desk.data.vertices[desk.data.loops[li].vertex_index].co
  uv[li].uv=(v.x/25+.5,v.y/15+.5) if abs(poly.normal.z)>.5 else (v.x/25+.5,v.z+.5)

# Cup, inner wall, thick imperfect rim and surface coffee.
cx,cy=-3.85,2.25
vessel('CoffeeCup',(cx,cy,-.12),[(0,0),(.46,0),(.51,.06),(.56,.25),(.59,.9),(.57,1.0),(.51,1.0),(.50,.91),(.46,.19),(0,.16)],cream)
cylinder('CoffeeSurface',(cx,cy,.72),.49,.008,coffee,64)
curve('CoffeeCupHandle',[(cx-.50,cy,.66),(cx-.98,cy,.66),(cx-1.01,cy,.20),(cx-.50,cy,.15)],.09,cream)
for i in range(65):
 a=random.random()*math.tau;z=random.uniform(.13,.83);r=.52+z*.06
 sphere('CeramicSpeckle',(cx+r*math.cos(a),cy+r*math.sin(a),z-.1),(.015,.012,.02),blue,8,4)
# Pot and independently shaped leaves, with stems and central veins.
px,py=4.75,3.4
vessel('PlantPot',(px,py,-.12),[(0,0),(.50,0),(.66,.83),(.70,.87),(.70,1.0),(.60,1.0),(.57,.83),(.47,.12),(0,.12)],terra)
cylinder('PlantSoil',(px,py,.77),.57,.03,soil)
for i in range(22):
 a=i*2.399;reach=random.uniform(.5,1.25);end=(px+math.cos(a)*reach,py+math.sin(a)*reach,.94+random.uniform(.15,1.1))
 curve('PlantStem',[(px,py,.78),(px+math.cos(a)*reach*.5,py+math.sin(a)*reach*.5,end[2]-.1),end],.018,sage)
 leaf=sphere('PlantLeaf',end,(.24,.42,.065),sage if i%3 else leaflight,16,8);leaf.rotation_euler=(random.uniform(-.5,.5),random.uniform(-.5,.5),-a)
# Heavy vintage green/brass lamp.
lx,ly=5.5,3.7
sphere('LampBase',(lx,ly,.04),(1.12,.84,.17),brass,40,16)
curve('LampStem',[(lx,ly,.18),(lx,ly,1.5),(lx-.3,ly,2.4)],.095,brass)
vessel('LampShade',(lx-.3,ly,1.85),[(1.0,0),(.98,.07),(.58,1.0),(.52,1.04),(.49,.98),(.90,.05),(1.0,0)],shade)
# Pencil cup. Brass pencil tips and cedar cones are actual meshes.
qx,qy=5.15,.1
vessel('PencilCup',(qx,qy,-.12),[(0,0),(.40,0),(.44,.08),(.45,.97),(.39,1.0),(.36,.92),(.35,.12),(0,.12)],cream)
for i in range(7):
 a=i*2.4;x=qx+math.cos(a)*.23;y=qy+math.sin(a)*.23;h=random.uniform(1.6,2.2)
 pencil=cylinder('PencilMesh',(x,y,h/2),.048,h,yellow if i%3==0 else black,6)
 bpy.ops.mesh.primitive_cone_add(vertices=12,radius1=.048,radius2=.006,depth=.19,location=(x,y,h+.09));finish(bpy.context.object,'PencilCedar',cedar)
 bpy.ops.mesh.primitive_cone_add(vertices=10,radius1=.018,radius2=0,depth=.075,location=(x,y,h+.205));finish(bpy.context.object,'PencilGraphite',black)
# Low dish, clips and one resting pen.
dx,dy=-5.05,-1.6
vessel('ClipDish',(dx,dy,-.12),[(0,0),(.64,0),(.76,.13),(.80,.25),(.74,.29),(.64,.13),(0,.12)],terra)
for i in range(3):
 x=dx-.25+i*.23;y=dy+random.uniform(-.2,.2)
 cube('BinderClip',(x,y,.095),(.22,.26,.15),black,.025)
 curve('ClipWire',[(x-.085,y,.18),(x-.12,y+.26,.28),(x+.12,y+.26,.28),(x+.085,y,.18)],.012,metal)
pen=cylinder('RestingPen',(-4.45,-.35,-.02),.065,1.75,black,16);pen.rotation_euler=(math.pi/2,0,-.4)
# Seated peripheral body cues exit frame with the real camera.
for x in [-1.6,1.6]:sphere('ForegroundKnee',(x,-5.05,-1.1),(.94,1.6,.65),denim,24,12)
# Subtle thumb-pressed irregularity, retained in the shipped geometry.
for obj in bpy.context.scene.objects:
 if obj.type=='MESH' and obj.name.startswith(('CoffeeCup','PlantPot','PlantLeaf','LampBase','PencilCup','ClipDish')):
  for v in obj.data.vertices:
   co=v.co; amplitude=.007 if obj.name.startswith('PlantLeaf') else .012
   displacement=amplitude*(math.sin(co.x*19+co.y*13)*math.cos(co.z*17)+.35*math.sin(co.x*47-co.z*31))
   co += v.normal*displacement
  obj.data.update()
# Consolidate static repeated details by logical role, preserving interactive nodes.
for prefix in ['CeramicSpeckle','PlantStem','PlantLeaf','PencilMesh','PencilCedar','PencilGraphite','ClipWire','BinderClip','DeskBoardSeam']:
 objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.name.startswith(prefix)]
 if len(objects)>1:
  bpy.ops.object.select_all(action='DESELECT')
  for o in objects:o.select_set(True)
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name=prefix
# Save source and a compact glTF. Named meshes remain independently addressable.
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'artifacts/visual-redesign/authoring/portfolio-environment.blend'))
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models/portfolio-environment.glb'),export_format='GLB',export_apply=True,export_yup=True,export_materials='EXPORT',export_cameras=False,export_lights=False)
print('ENVIRONMENT_EXPORTED',len(bpy.data.objects))
