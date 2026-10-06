"""Render true 3D animation frames from the saved Blender source."""
import bpy
from pathlib import Path

OUT=Path(__file__).resolve().parents[1]/'output'/'blender'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'apes-studio.blend'))
prefs=bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type='OPTIX';prefs.get_devices()
for device in prefs.devices:device.use=device.type=='OPTIX'
for scene in [s for s in bpy.data.scenes if s.name.startswith('APE / ')]:
    kind=scene.name.split(' / ')[1].lower()
    folder=OUT/'frames'/kind;folder.mkdir(parents=True,exist_ok=True)
    bpy.context.window.scene=scene
    scene.cycles.device='GPU';scene.cycles.samples=24
    scene.render.resolution_x=480;scene.render.resolution_y=560
    scene.render.use_persistent_data=True
    for frame in range(1,121,2):
        target=folder/f'{frame:04}.png'
        if target.exists() and target.stat().st_size > 0:
            continue
        scene.frame_set(frame)
        scene.render.filepath=str(target)
        bpy.ops.render.render(write_still=True)
    print('LOOP_RENDERED',kind,flush=True)
