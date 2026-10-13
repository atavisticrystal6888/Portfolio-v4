"""
Render a 3D "product plate" for one project screenshot with Blender (headless).

  blender -b --python scripts/blender/render-plate.py -- --input public/images/projects/aarchid/hero.png --output tmp/plates/aarchid-light.png --accent "#244436" --theme light [--width 1600] [--samples 96]

The plate is a rounded accent-coloured slab with the screenshot mounted as a
thin, slightly raised card. A long lens, a soft three-quarter key light and a
shadow catcher give a studio product shot on a transparent background, so the
same render sits on the light or dark page ground. One theme-neutral render per
project is enough; --theme only nudges the lighting if a dark-specific plate is
ever wanted.
"""
import argparse
import math
import os
import sys

import bpy
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--accent", default="#2137c4")
    p.add_argument("--theme", choices=["light", "dark"], default="light")
    p.add_argument("--width", type=int, default=1600)
    p.add_argument("--samples", type=int, default=96)
    p.add_argument("--tilt", type=float, default=12.0, help="X tilt of the plate, degrees (positive faces the camera)")
    p.add_argument("--turn", type=float, default=-16.0, help="Z turn of the plate, degrees")
    return p.parse_args(argv)


def hex_to_linear(h):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))

    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return (lin(r), lin(g), lin(b), 1.0)


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def rounded_box(name, size, bevel, segments=6):
    bpy.ops.mesh.primitive_cube_add(size=1)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(scale=True)
    mod = ob.modifiers.new("bevel", "BEVEL")
    mod.width = bevel
    mod.segments = segments
    mod.limit_method = "NONE"
    bpy.ops.object.shade_smooth()
    return ob


def material_solid(name, rgba, roughness=0.42, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


def material_screen(name, image, emission=0.7):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = image
    tex.extension = "EXTEND"
    tex.interpolation = "Cubic"
    coord = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    # "Generated" coordinates span the object's bounding box, so the top face
    # gets the whole image and the thin sides repeat the edge pixels.
    nt.links.new(coord.outputs["Generated"], mapping.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], tex.inputs["Vector"])
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = emission
    bsdf.inputs["Roughness"].default_value = 0.25
    bsdf.inputs["Specular IOR Level"].default_value = 0.35
    return mat


def add_light(name, kind, location, energy, size=None, color=(1, 1, 1), target=None):
    data = bpy.data.lights.new(name, kind)
    data.energy = energy
    data.color = color
    if size is not None and kind == "AREA":
        data.size = size
    ob = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(ob)
    ob.location = location
    if target is not None:
        direction = Vector(target) - Vector(location)
        ob.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return ob


def fit_camera(cam, objects, margin=0.08):
    scene = bpy.context.scene
    deps = bpy.context.evaluated_depsgraph_get()
    corners = []
    for ob in objects:
        ev = ob.evaluated_get(deps)
        for c in ev.bound_box:
            corners.append(ev.matrix_world @ Vector(c))
    direction = cam.matrix_world.to_quaternion() @ Vector((0, 0, -1))
    base = cam.location.copy()
    lo, hi = 0.5, 60.0
    for _ in range(40):
        mid = (lo + hi) / 2
        cam.location = base - direction * mid
        bpy.context.view_layer.update()
        ok = True
        for c in corners:
            v = world_to_camera_view(scene, cam, c)
            if not (margin <= v.x <= 1 - margin and margin <= v.y <= 1 - margin):
                ok = False
                break
        if ok:
            hi = mid
        else:
            lo = mid
    cam.location = base - direction * hi
    bpy.context.view_layer.update()


def main():
    a = parse_args()
    reset_scene()
    scene = bpy.context.scene

    img = bpy.data.images.load(os.path.abspath(a.input))
    iw, ih = img.size
    aspect = iw / ih

    # World units: the screen card is 3.2 wide; the slab adds an even margin.
    card_w = 3.2
    card_h = card_w / aspect
    card_t = 0.035
    margin = 0.2
    slab_t = 0.11

    slab = rounded_box("slab", (card_w + 2 * margin, card_h + 2 * margin, slab_t), 0.07)
    slab.data.materials.append(material_solid("slab", hex_to_linear(a.accent), roughness=0.5))

    card = rounded_box("card", (card_w, card_h, card_t), 0.018, segments=4)
    card.location.z = slab_t / 2 + card_t / 2 + 0.004
    card.data.materials.append(material_screen("screen", img))

    group = bpy.data.objects.new("plate", None)
    bpy.context.collection.objects.link(group)
    for ob in (slab, card):
        ob.parent = group
    group.rotation_euler = (math.radians(a.tilt), 0.0, math.radians(a.turn))
    group.location.z = slab_t / 2 + 0.06

    # Shadow catcher ground: keeps only the shadow in the alpha channel.
    bpy.ops.mesh.primitive_plane_add(size=40)
    ground = bpy.context.active_object
    ground.name = "ground"
    ground.location.z = -slab_t / 2 - 0.03 - 0.18
    ground.is_shadow_catcher = True
    gmat = material_solid("ground", (0.8, 0.8, 0.8, 1), roughness=1.0)
    ground.data.materials.append(gmat)

    # Lighting: big soft key from upper left, cool fill, warm rim for edges.
    if a.theme == "light":
        add_light("key", "AREA", (-4.5, -4.0, 6.5), 760, size=6, target=(0, 0, 0))
        add_light("fill", "AREA", (5.5, -3.0, 3.0), 240, size=5, color=(0.92, 0.95, 1.0), target=(0, 0, 0))
        add_light("rim", "AREA", (2.0, 5.5, 4.0), 420, size=3, color=(1.0, 0.97, 0.9), target=(0, 0, 0))
        bg_strength = 0.35
    else:
        add_light("key", "AREA", (-4.5, -4.0, 6.5), 700, size=6, target=(0, 0, 0))
        add_light("fill", "AREA", (5.5, -3.0, 3.0), 120, size=5, color=(0.85, 0.9, 1.0), target=(0, 0, 0))
        add_light("rim", "AREA", (2.0, 5.5, 4.0), 700, size=2.5, color=(0.85, 0.92, 1.0), target=(0, 0, 0))
        bg_strength = 0.12

    world = bpy.data.worlds.new("world")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.9, 0.92, 0.95, 1)
    bg.inputs["Strength"].default_value = bg_strength

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 85
    cam_data.sensor_width = 36
    cam = bpy.data.objects.new("cam", cam_data)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam
    cam.location = (0.0, -6.8, 8.6)
    look = Vector((0, 0, 0)) - cam.location
    cam.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()

    scene.render.resolution_x = a.width
    scene.render.resolution_y = int(round(a.width / 1.6))
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = a.samples
    scene.cycles.use_denoising = True
    scene.cycles.use_adaptive_sampling = True
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"

    fit_camera(cam, [slab, card], margin=0.04)
    scene.render.filepath = os.path.abspath(a.output)
    bpy.ops.render.render(write_still=True)
    print(f"PLATE_OK {a.output} {scene.render.resolution_x}x{scene.render.resolution_y}")


if __name__ == "__main__":
    main()
