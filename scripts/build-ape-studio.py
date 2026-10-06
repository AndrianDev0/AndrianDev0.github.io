"""Editable, hand-constructed ape busts. Run with Blender 4.5 --background --python.

No image-to-mesh claim: reference images remain reference planes only.
All rendered surfaces are native Blender meshes and curves.
"""
import bpy
import math
import os
from mathutils import Vector
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "blender"
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)

def material(name, color, roughness=.7, metal=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = roughness
    p.inputs["Metallic"].default_value = metal
    p.inputs["Specular IOR Level"].default_value = .22
    return m

def finish(obj, name, mat, parent=None, smooth=True):
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    if obj.type == "MESH" and smooth:
        for p in obj.data.polygons: p.use_smooth = True
    if parent:
        obj.parent = parent
        obj.matrix_parent_inverse = parent.matrix_world.inverted()
    return obj

def ellipsoid(name, loc, scale, mat, parent=None, segments=48):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=24, location=loc)
    obj = bpy.context.object
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, name, mat, parent)

def rounded(name, loc, scale, mat, parent=None, exponent=.7):
    # A superellipsoid gives the muzzle and jaw broad, deliberate planes.
    def sp(v, p): return math.copysign(abs(v)**p, v)
    vertices, faces = [], []
    rows, cols = 28, 64
    for j in range(rows+1):
        v=-math.pi/2+math.pi*j/rows
        for i in range(cols):
            u=2*math.pi*i/cols
            vertices.append((loc[0]+scale[0]*sp(math.cos(v),exponent)*sp(math.cos(u),exponent),
                             loc[1]+scale[1]*sp(math.cos(v),exponent)*sp(math.sin(u),exponent),
                             loc[2]+scale[2]*sp(math.sin(v),exponent)))
    for j in range(rows):
        for i in range(cols):
            a=j*cols+i; b=j*cols+(i+1)%cols
            faces.append((a,b,b+cols,a+cols))
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(vertices,[],faces); mesh.update()
    obj=bpy.data.objects.new(name,mesh); bpy.context.scene.collection.objects.link(obj)
    return finish(obj,name,mat,parent)

def tube(name, points, radius, mat, parent=None, cyclic=False):
    curve=bpy.data.curves.new(name,'CURVE'); curve.dimensions='3D'
    curve.resolution_u=18; curve.bevel_depth=radius; curve.bevel_resolution=4
    spline=curve.splines.new('BEZIER'); spline.bezier_points.add(len(points)-1)
    for p,co in zip(spline.bezier_points,points):
        p.co=co; p.handle_left_type='AUTO'; p.handle_right_type='AUTO'
    spline.use_cyclic_u=cyclic
    obj=bpy.data.objects.new(name,curve); bpy.context.scene.collection.objects.link(obj)
    return finish(obj,name,mat,parent)

def panel(name, points, mat, parent=None, thickness=.055, bevel=.025):
    if parent and parent.name.startswith('BODY'):
        points=[(x,cloth_y(x,z)-0.025,z) for x,y,z in points]
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(points,[],[tuple(range(len(points)))]); mesh.update()
    obj=bpy.data.objects.new(name,mesh); bpy.context.scene.collection.objects.link(obj)
    finish(obj,name,mat,parent)
    s=obj.modifiers.new('Tailored thickness','SOLIDIFY'); s.thickness=thickness
    b=obj.modifiers.new('Soft edge','BEVEL'); b.width=bevel; b.segments=3
    obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return obj

def cloth_y(x,z):
    rows=[(0.22,1.23,0.43),(0.42,1.29,0.49),(0.9,1.28,0.53),(1.30,1.11,0.48),(1.62,0.76,0.37),(1.91,0.41,0.31)]
    a,b=rows[0],rows[1]
    for low,high in zip(rows,rows[1:]):
        if z>=low[0]:a,b=low,high
    t=max(0,min(1,(z-a[0])/(b[0]-a[0])))
    wx=a[1]+(b[1]-a[1])*t;wy=a[2]+(b[2]-a[2])*t
    return 0.08-wy*math.sqrt(max(0.015,1-(x/wx)**2))

def unified_sculpt(name, objects, voxel=.025):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects: obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.join()
    obj=bpy.context.object;obj.name=name
    remesh=obj.modifiers.new('Continuous sculpt surface','REMESH')
    remesh.mode='VOXEL';remesh.voxel_size=voxel;remesh.use_smooth_shade=True
    bpy.ops.object.modifier_apply(modifier=remesh.name)
    smooth=obj.modifiers.new('Relax sculpt','SMOOTH');smooth.factor=1;smooth.iterations=5
    bpy.ops.object.modifier_apply(modifier=smooth.name)
    for p in obj.data.polygons:p.use_smooth=True
    return obj

def tailored_torso(mat, parent):
    rows=[(.22,1.23,.43),(.25,1.24,.44),(.42,1.29,.49),(.9,1.28,.53),(1.30,1.11,.48),(1.62,.76,.37),(1.86,.44,.32),(1.91,.41,.31),(1.93,.40,.31)]
    verts=[];faces=[];n=64
    for z,wx,wy in rows:
        for i in range(n):
            a=2*math.pi*i/n
            verts.append((wx*math.cos(a),.08+wy*math.sin(a),z))
    for j in range(len(rows)-1):
        for i in range(n):
            a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
    faces.extend([tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))])
    mesh=bpy.data.meshes.new('Tailored bust');mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new('Tailored bust',mesh);bpy.context.scene.collection.objects.link(obj)
    finish(obj,'Tailored bust',mat,parent)
    sub=obj.modifiers.new('Tailoring','SUBSURF');sub.levels=2
    return obj

def muzzle_sculpt(mat,parent):
    rows=[(2.52,.35,.17,-.83),(2.59,.48,.26,-.87),(2.72,.57,.32,-.90),(3.05,.56,.38,-.80),(3.32,.36,.30,-.77),(3.51,.19,.21,-.77)]
    verts=[];faces=[];n=48
    for z,wx,wy,y in rows:
        for i in range(n):
            a=2*math.pi*i/n;verts.append((wx*math.cos(a),y+wy*math.sin(a),z))
    for j in range(len(rows)-1):
        for i in range(n):
            a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
    faces.extend([tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))])
    mesh=bpy.data.meshes.new('Muzzle');mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new('Muzzle',mesh);bpy.context.scene.collection.objects.link(obj)
    finish(obj,'Muzzle',mat,parent)
    sub=obj.modifiers.new('Facial planes','SUBSURF');sub.levels=2
    return obj

def tuft(name, centers, radii, mat, parent):
    verts=[]; faces=[]; n=12
    for center,(rx,ry) in zip(centers,radii):
        for i in range(n):
            a=2*math.pi*i/n
            verts.append((center[0]+rx*math.cos(a), center[1]+ry*math.sin(a),center[2]))
    for j in range(len(centers)-1):
        for i in range(n):
            a=j*n+i; b=j*n+(i+1)%n; faces.append((a,b,b+n,a+n))
    faces.extend([tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))])
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
    obj=bpy.data.objects.new(name,mesh); bpy.context.scene.collection.objects.link(obj)
    finish(obj,name,mat,parent)
    sub=obj.modifiers.new('Sculpted locks','SUBSURF'); sub.levels=2
    return obj

def lid(name, center, radius, mat, parent, upper=True):
    # Upper lids have an actual blink shape key, not a scaling billboard.
    n,m=48,12
    def geometry(limit):
        verts=[]
        for j in range(m+1):
            theta=(limit*j/m) if upper else (limit+(math.pi-limit)*j/m)
            for i in range(n):
                phi=2*math.pi*i/n
                verts.append((center[0]+radius*math.sin(theta)*math.cos(phi),
                              center[1]+radius*math.sin(theta)*math.sin(phi),
                              center[2]+radius*math.cos(theta)))
        return verts
    verts=geometry(1.67 if upper else 2.3); faces=[]
    for j in range(m):
        for i in range(n):
            a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.scene.collection.objects.link(obj)
    finish(obj,name,mat,parent)
    solid=obj.modifiers.new('Lid thickness','SOLIDIFY');solid.thickness=.012
    if upper:
        obj.shape_key_add(name='Relaxed')
        blink=obj.shape_key_add(name='Blink')
        for v,co in zip(blink.data,geometry(2.55)):v.co=co
        for frame,value in [(1,0),(40,0),(43,1),(46,0),(90,0),(93,1),(96,0),(120,0)]:
            blink.value=value;blink.keyframe_insert(data_path='value',frame=frame)
    return obj

def look_at(obj, target):
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()

def studio(scene):
    world=bpy.data.worlds.new(scene.name+' / studio');world.use_nodes=True
    world.node_tree.nodes['Background'].inputs[0].default_value=(.38,.43,.47,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.35
    scene.world=world
    for name,loc,power,size,color in [
        ('Key / large softbox',(-4,-6,8),650,5,(1,.91,.81)),
        ('Fill / neutral',(4,-4,5),320,4,(.85,.92,1)),
        ('Edge / soft',(1,3,6),500,3,(.85,1,.94))]:
        data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
        light=bpy.data.objects.new(name,data);scene.collection.objects.link(light);light.location=loc;look_at(light,(0,0,2.8))
    camera_data=bpy.data.cameras.new('Portrait camera');camera=bpy.data.objects.new('Portrait camera',camera_data)
    scene.collection.objects.link(camera);camera.location=(5.1,-11,5.0);look_at(camera,(0,-.1,2.55))
    camera_data.type='ORTHO';camera_data.ortho_scale=5.55;scene.camera=camera
    scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.use_denoising=True
    scene.render.resolution_x=768;scene.render.resolution_y=896;scene.render.resolution_percentage=100
    scene.render.film_transparent=True
    scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
    scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
    scene.render.fps=24;scene.frame_start=1;scene.frame_end=120
    scene.render.image_settings.color_depth='8'
    try:
        pref=bpy.context.preferences.addons['cycles'].preferences
        pref.compute_device_type='OPTIX';pref.get_devices()
        for device in pref.devices:device.use=device.type=='OPTIX'
        scene.cycles.device='GPU'
    except Exception as e:print('CPU fallback',e)

def build(kind):
    scene=bpy.data.scenes.new('APE / '+kind.upper());bpy.context.window.scene=scene
    colors={'creative':(.19,.064,.095),'business':(.14,.060,.024),'builder':(.105,.100,.087)}
    fur=material(kind+' / matte sculpt',colors[kind],.87)
    skin=material(kind+' / warm clay',(.36,.255,.15),.84)
    lidmat=material(kind+' / eyelid',(.27,.172,.094),.88)
    dark=material(kind+' / crease',(.033,.024,.017),.95)
    eye=material(kind+' / ivory eye',(.42,.38,.27),.6)
    iris=material(kind+' / iris',(.14,.075,.024),.62)
    pupil=material(kind+' / pupil',(.008,.009,.007),.55)
    jacket=material(kind+' / washed charcoal',(.025,.032,.033),.77)
    lapel=material(kind+' / lapel',(.042,.048,.048),.78)
    shirt=material(kind+' / shirt',(.018,.024,.026),.88)
    mint=material(kind+' / mint',(.27,.58,.45),.63)
    steel=material(kind+' / brushed steel',(.27,.30,.30),.4,.55)
    cream=material(kind+' / shirt cotton',(.70,.69,.60),.92)

    body=bpy.data.objects.new('BODY / tailored bust',None);scene.collection.objects.link(body)
    head=bpy.data.objects.new('HEAD / animated pivot',None);scene.collection.objects.link(head);head.location=(0,0,2.45)
    bpy.context.view_layer.update()

    tailored_torso(jacket,body)
    rounded('Neck',(0,.03,2.24),(.42,.40,.79),fur,head,exponent=.9)
    ellipsoid('Cranium',(0,.05,3.52),(.82,.63,.97),fur,head)
    ellipsoid('Lower cheeks',(0,-.10,3.08),(.70,.52,.63),fur,head)
    # Broad ears with a recessed bowl and a simple inner antihelix.
    for side in [-1,1]:
        x=side*.92
        ellipsoid('Ear shell '+str(side),(x,.015,3.64),(.38,.19,.48),fur,head)
        ellipsoid('Ear bowl '+str(side),(x,-.16,3.65),(.278,.085,.36),skin,head)
        tube('Ear fold '+str(side),[(x+side*.10,-.242,3.90),(x-side*.08,-.255,3.84),(x-side*.10,-.252,3.58),(x+side*.015,-.245,3.50)],.036,lidmat,head)
    # Face eye mask, cheek planes and protruding muzzle.
    rounded('Orbital mask',(0,-0.52,3.79),(0.69,0.25,0.37),skin,head,exponent=0.9)
    for side in [-1,1]:
        x=side*.335
        center=(x,-.65,3.77)
        ellipsoid('Eyeball '+str(side),center,(.20,.20,.20),eye,head)
        ellipsoid('Iris '+str(side),(x+0.018,-0.838,3.70),(0.058,0.020,0.058),iris,head)
        ellipsoid('Pupil '+str(side),(x+.018,-.857,3.70),(.024,.006,.03),pupil,head)
        lid('Upper eyelid '+str(side),center,.207,lidmat,head)
        lid('Lower eyelid '+str(side),center,.207,skin,head,False)
        tube('Heavy brow '+str(side),[(x-side*.23,-.73,3.98),(x-side*.04,-.84,4.035),(x+side*.22,-.75,4.00)],.060,skin,head)
    muzzle_sculpt(skin,head)
    ellipsoid('Nose bridge',(0,-.84,3.46),(.255,.30,.24),skin,head)
    for side in [-1,1]:
        ellipsoid('Nose wing '+str(side),(side*.21,-1.044,3.48),(.215,.183,.115),skin,head)
    tube('Philtrum',[(0,-1.23,3.38),(0,-1.25,3.27),(0,-1.252,3.20)],.009,lidmat,head)
    tube('Mouth / asymmetric resting line',[(-0.48,-1.06,2.70),(-0.30,-1.16,2.70),(0,-1.215,2.71),(0.30,-1.16,2.73),(0.48,-1.06,2.74)],0.009,dark,head)

    # A small number of sculpted locks, never procedural hair/noise.
    for i in range(6):
        x=(i-2.5)*.19
        z=4.26+.06*(1-abs(x))
        tuft('Crown lock %02d'%i,[(x,-.12,z-.17),(x+.015,.00,z-.01),(x+.06,.19,z+.10),(x+.09,.35,z+.14)],[(.19,.23),(.14,.18),(.07,.10),(.006,.006)],fur,head)
    for side in [-1,1]:
        for i in range(3):
            tuft('Temple lock '+str((side,i)),[(side*.64,.02,3.53-i*.2),(side*.78,.035,3.44-i*.2),(side*.83,.10,3.36-i*.2)],[(.15,.20),(.1,.16),(.004,.004)],fur,head)

    face_prefixes=('Orbital mask','Heavy brow','Muzzle','Nose bridge','Nose wing','Lower lip')
    face=unified_sculpt('FACE / unified sculpt',[o for o in scene.objects if o.name.startswith(face_prefixes)],.018)
    for side in [-1,1]:
        cutter=ellipsoid('Eye socket cutter',(side*0.335,-0.80,3.77),(0.219,0.23,0.222),None)
        bpy.context.view_layer.objects.active=face
        boolean=face.modifiers.new('Recessed orbital socket','BOOLEAN');boolean.operation='DIFFERENCE';boolean.object=cutter
        bpy.ops.object.modifier_apply(modifier=boolean.name)
        bpy.data.objects.remove(cutter,do_unlink=True)
    for side in [-1,1]:
        cutter=ellipsoid('Nostril cutter',(side*.21,-1.192,3.46),(.118,.108,.052),None)
        bpy.context.view_layer.objects.active=face
        boolean=face.modifiers.new('Recessed nostril','BOOLEAN');boolean.operation='DIFFERENCE';boolean.object=cutter
        bpy.ops.object.modifier_apply(modifier=boolean.name)
        bpy.data.objects.remove(cutter,do_unlink=True)
    fur_prefixes=('Cranium','Lower cheeks','Neck','Ear shell','Crown lock','Temple lock')
    unified_sculpt('HEAD / unified sculpt',[o for o in scene.objects if o.name.startswith(fur_prefixes)],.023)
    for side in [-1,1]:
        x=side*0.335
        tube('Brow expression '+str(side),[(x-side*0.21,-0.79,3.99),(x-side*0.06,-0.87,4.035),(x+side*0.22,-0.78,3.985)],0.055,skin,head)

    # Clothes: actual panel geometry with thickness, seams and collar pieces.
    if kind=='business':
        panel('Shirt front',[(-.48,-.47,1.79),(0,-.625,.73),(.48,-.47,1.79)],cream,body)
        for side in [-1,1]:
            panel('Collar '+str(side),[(side*.42,-.48,1.86),(side*.07,-.64,1.63),(side*.22,-.67,1.29),(side*.49,-.56,1.52)],cream,body)
            panel('Suit lapel '+str(side),[(side*.52,-.37,1.87),(side*.84,-.40,1.48),(side*.58,-.56,1.21),(side*.70,-.56,1.05),(0,-.61,.29)],lapel,body)
        rounded('Tie knot',(0,-.68,1.46),(.108,.065,.12),jacket,body)
        panel('Tie',[(0,-.70,1.4),(-.12,-.68,.90),(0,-.69,.73),(.12,-.68,.90)],jacket,body)
        panel('Pocket square',[(.76,-.54,1.05),(.93,-.50,1.25),(1.0,-.47,1.02)],mint,body)
    else:
        for side in [-1,1]:
            panel('Jacket collar '+str(side),[(side*.42,-.33,1.98),(side*.72,-.38,1.68),(side*.91,-.48,1.28),(side*.50,-.63,1.45),(side*.31,-.62,1.13)],lapel,body)
        tube('Zip',[(x,cloth_y(x,z)-0.025,z) for x,z in [(-0.26,1.29),(-0.20,0.7),(-0.14,0.3)]],0.012,steel,body)
        if kind=='creative':
            for side in [-1,1]:tube('Mint piping '+str(side),[(side*x,cloth_y(side*x,z)-0.015,z) for x,z in [(0.86,1.30),(1.04,1.02),(1.10,0.50)]],0.012,mint,body)
        else:
            for x,z in [(-.62,1.44),(.65,1.44),(-.53,1.24)]:
                ellipsoid('Jacket snap',(x,cloth_y(x,z)-0.06,z),(.025,.012,.025),steel,body,24)
    # Rectangular optical frames echo the references without neon glass.
    if kind in ['creative','builder']:
        frame=mint if kind=='creative' else jacket
        for side in [-1,1]:
            x=side*.35
            pts=[(x-0.23,-0.94,4.00),(x+0.21,-0.94,4.00),(x+0.26,-0.94,3.96),(x+0.24,-0.96,3.72),(x+0.20,-0.96,3.68),(x-0.20,-0.96,3.68),(x-0.24,-0.96,3.72),(x-0.26,-0.94,3.96)]
            tube('Frame '+str(side),pts,.032 if kind=='creative' else .040,frame,head,True)
            tube('Temple arm '+str(side),[(side*0.60,-0.94,3.95),(side*0.78,-0.47,3.90),(side*0.83,-0.01,3.82)],0.023,frame,head)
        tube('Bridge',[(-0.09,-0.94,3.87),(0,-0.96,3.90),(0.09,-0.94,3.87)],0.025,frame,head)
    if kind=='creative':
        bpy.ops.mesh.primitive_torus_add(major_radius=.092,minor_radius=.021,major_segments=36,minor_segments=12,location=(-1.04,-.16,3.30),rotation=(math.pi/2,0,0))
        finish(bpy.context.object,'Earring',steel,head)
        gum_mat=material('creative / satin gum',(0.54,0.11,0.26),0.48)
        gum=ellipsoid('GUM / animated bubble',(0.59,-1.20,2.82),(0.25,0.25,0.25),gum_mat,head)
        for frame,size in [(1,0.001),(13,0.001),(29,0.55),(48,1),(61,1.18),(64,0.001),(120,0.001)]:
            gum.scale=(size,size,size);gum.keyframe_insert('scale',frame=frame)

    head.location.z-=0.23
    # A restrained six-degree head gesture and sparse blinks.
    gestures={
        'creative':[(1,0,0),(31,-0.025,-0.035),(61,0.02,0.025),(91,-0.015,0.045),(120,0,0)],
        'business':[(1,0,0),(31,0,0),(49,0.055,-0.012),(65,-0.01,0),(91,0,0),(120,0,0)],
        'builder':[(1,0,0),(31,-0.015,-0.08),(61,0,-0.03),(91,0.01,0.055),(120,0,0)],
    }
    for f,rx,rz in gestures[kind]:
        head.rotation_euler=(rx,0,rz);head.keyframe_insert('rotation_euler',frame=f)
    studio(scene)
    ref_path=ROOT/'public'/'mascots'/('ape-'+kind+'.webp')
    ref=bpy.data.objects.new('REFERENCE / original 2D artwork (not rendered)',None)
    ref.empty_display_type='IMAGE';ref.data=bpy.data.images.load(str(ref_path));ref.data.pack()
    ref.location=(4,1,2.5);ref.rotation_euler=(math.pi/2,0,0);ref.empty_display_size=4;ref.hide_render=True
    scene.collection.objects.link(ref)
    scene['ART_DIRECTION']='Matte sculpted vinyl; broad planes; limited palette; sleepy ape anatomy. No AI mesh or image used as rendered geometry.'
    scene.frame_set(1)
    return scene

scenes=[build(k) for k in ('business','creative','builder')]
for scene in scenes:
    bpy.context.window.scene=scene
    scene.render.filepath=str(OUT/(scene.name.split(' / ')[1].lower()+'-portrait.png'))
    bpy.ops.render.render(write_still=True)
bpy.context.window.scene=scenes[0]
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'apes-studio.blend'))
print('APE_STUDIO_COMPLETE',OUT)
