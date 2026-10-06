"""Prepare the editable Blender source for review and verify scene structure."""
import bpy
from pathlib import Path

out=Path(__file__).resolve().parents[1]/'output'/'blender'
bpy.ops.wm.open_mainfile(filepath=str(out/'apes-studio.blend'))
bpy.context.window.scene=bpy.data.scenes['APE / CREATIVE']
for scene in bpy.data.scenes:
    scene.frame_set(1)
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.region_3d.view_perspective='CAMERA'
            area.spaces.active.shading.color_type='MATERIAL'
guide=bpy.data.texts.get('START HERE') or bpy.data.texts.new('START HERE')
guide.clear()
guide.write((out/'README.md').read_text(encoding='utf-8'))
for scene in bpy.data.scenes:
    if scene.name.startswith('APE / '):
        meshes=[obj for obj in scene.objects if obj.type=='MESH']
        animated=[obj for obj in scene.objects if obj.animation_data]
        shapes=[obj for obj in meshes if obj.data.shape_keys]
        print('VERIFIED',scene.name,'meshes',len(meshes),'animated objects',len(animated),'shape-key meshes',len(shapes))
        assert meshes and animated and shapes
bpy.ops.wm.save_as_mainfile(filepath=str(out/'apes-studio.blend'))
