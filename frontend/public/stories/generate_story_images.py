import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = r"d:\tnschools\TN-Schools\frontend\public\stories"
os.makedirs(OUTPUT_DIR, exist_ok=True)

W, H = 1920, 1080

def create_base_canvas(color1, color2):
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        r = int(color1[0] + (color2[0] - color1[0]) * (y / H))
        g = int(color1[1] + (color2[1] - color1[1]) * (y / H))
        b = int(color1[2] + (color2[2] - color1[2]) * (y / H))
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    return img, draw

def add_radial_light(img, cx, cy, radius, color, max_alpha=180):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    for r in range(radius, 0, -5):
        alpha = int(max_alpha * (1 - r / radius))
        odraw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(color[0], color[1], color[2], alpha))
    img.paste(overlay, (0, 0), overlay)

def draw_vignette(img):
    vignette = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    vdraw.rectangle([0, 0, W, H], outline=None)
    for i in range(120):
        alpha = int(220 * (1 - i / 120))
        vdraw.rectangle([i, i, W - i, H - i], outline=(0, 0, 0, alpha), width=3)
    img.paste(vignette, (0, 0), vignette)

# ------------------------------------------------------------------------------
# 1. THIRUVALLUVAR SCENE 2: The Arrogant Test
# ------------------------------------------------------------------------------
def generate_thiruvalluvar_2():
    img, draw = create_base_canvas((42, 10, 20), (12, 4, 8))
    add_radial_light(img, 350, 500, 450, (245, 158, 11), 140)
    
    draw.rectangle([100, 0, 200, 1080], fill=(25, 10, 15))
    draw.rectangle([1720, 0, 1820, 1080], fill=(25, 10, 15))
    
    draw.ellipse([300, 320, 440, 460], fill=(217, 119, 6))
    draw.ellipse([345, 260, 395, 310], fill=(248, 250, 252))
    draw.polygon([(260, 420), (480, 420), (520, 780), (220, 780)], fill=(255, 255, 255))
    draw.polygon([(300, 400), (440, 400), (370, 560)], fill=(248, 250, 252))

    draw.ellipse([1350, 280, 1490, 420], fill=(180, 83, 9))
    draw.polygon([(1280, 400), (1560, 400), (1600, 800), (1240, 800)], fill=(2, 132, 199))
    
    draw.polygon([(650, 450), (900, 400), (880, 750), (600, 780)], fill=(225, 29, 72))
    draw.line([(650, 450), (900, 400)], fill=(251, 191, 36), width=16)
    draw.polygon([(960, 410), (1200, 460), (1250, 790), (980, 740)], fill=(225, 29, 72))
    draw.line([(960, 410), (1200, 460)], fill=(251, 191, 36), width=16)

    for y in range(400, 760, 30):
        draw.line([(900, y), (960, y + 15)], fill=(239, 68, 68), width=6)

    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "thiruvalluvar_2.jpg"), quality=92)

# ------------------------------------------------------------------------------
# 2. THIRUVALLUVAR SCENE 3: Rags and Wisdom
# ------------------------------------------------------------------------------
def generate_thiruvalluvar_3():
    img, draw = create_base_canvas((30, 27, 75), (15, 23, 42))
    add_radial_light(img, 960, 350, 500, (251, 191, 36), 160)

    draw.rectangle([350, 600, 1570, 920], fill=(69, 26, 3), outline=(120, 53, 15), width=10)

    for offset in [-400, -150, 100, 350]:
        x = 960 + offset
        draw.ellipse([x - 80, 630, x + 80, 730], fill=(225, 29, 72))
        draw.ellipse([x - 50, 650, x + 50, 710], fill=(245, 158, 11))
        draw.ellipse([x - 20, 670, x + 20, 690], fill=(2, 132, 199))

    draw.ellipse([890, 180, 1030, 320], fill=(217, 119, 6))
    draw.ellipse([935, 120, 985, 170], fill=(248, 250, 252))
    draw.polygon([(820, 300), (1100, 300), (1140, 580), (780, 580)], fill=(255, 255, 255))
    draw.polygon([(860, 290), (1060, 290), (960, 450)], fill=(248, 250, 252))

    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "thiruvalluvar_3.jpg"), quality=92)

# ------------------------------------------------------------------------------
# 3. THIRUVALLUVAR SCENE 4: Transformation of Heart
# ------------------------------------------------------------------------------
def generate_thiruvalluvar_4():
    img, draw = create_base_canvas((6, 78, 59), (2, 44, 34))
    add_radial_light(img, 960, 350, 550, (245, 158, 11), 180)

    draw.rectangle([760, 220, 1160, 340], fill=(245, 158, 11), outline=(254, 240, 138), width=6)
    for y in [250, 280, 310]:
        draw.line([(800, y), (1120, y)], fill=(120, 53, 15), width=4)

    draw.ellipse([880, 520, 980, 620], fill=(180, 83, 9))
    draw.polygon([(780, 600), (1080, 600), (1140, 860), (720, 860)], fill=(3, 105, 161))

    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "thiruvalluvar_4.jpg"), quality=92)

# ------------------------------------------------------------------------------
# 4. CV RAMAN SCENE 1: Prism & Rainbow Light
# ------------------------------------------------------------------------------
def generate_cv_raman_1():
    img, draw = create_base_canvas((15, 23, 42), (30, 27, 75))
    
    draw.polygon([(0, 0), (500, 0), (950, 540), (750, 540)], fill=(255, 255, 255))
    draw.polygon([(960, 350), (1100, 600), (820, 600)], fill=(255, 255, 255))
    
    colors = [(124, 58, 237), (79, 70, 229), (2, 132, 199), (16, 185, 129), (234, 179, 8), (249, 115, 22), (239, 68, 68)]
    for i, c in enumerate(colors):
        draw.polygon([(960, 480), (1920, 500 + i * 50), (1920, 540 + i * 50)], fill=c)

    draw.ellipse([450, 400, 570, 520], fill=(245, 158, 11))
    draw.polygon([(380, 500), (640, 500), (680, 900), (340, 900)], fill=(255, 255, 255))

    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "cv_raman_1.jpg"), quality=92)

# ------------------------------------------------------------------------------
# 5. CV RAMAN SCENE 2: Voyage Across the Ocean
# ------------------------------------------------------------------------------
def generate_cv_raman_2():
    img, draw = create_base_canvas((2, 6, 23), (3, 105, 161))
    
    draw.rectangle([0, 650, 1920, 1080], fill=(2, 132, 199))
    draw.rectangle([0, 720, 1920, 1080], fill=(3, 105, 161))

    draw.rectangle([0, 600, 1920, 630], fill=(51, 65, 85))
    for x in range(200, 1920, 350):
        draw.rectangle([x, 600, x + 25, 850], fill=(71, 85, 105))

    draw.ellipse([860, 320, 980, 440], fill=(245, 158, 11))
    draw.polygon([(810, 300), (1030, 300), (970, 340), (870, 340)], fill=(255, 255, 255))
    draw.polygon([(800, 420), (1040, 420), (1080, 800), (760, 800)], fill=(15, 23, 42))

    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "cv_raman_2.jpg"), quality=92)

# ------------------------------------------------------------------------------
# 6. CV RAMAN SCENE 3: The Raman Effect (1928)
# ------------------------------------------------------------------------------
def generate_cv_raman_3():
    img, draw = create_base_canvas((49, 16, 63), (15, 23, 42))
    add_radial_light(img, 960, 540, 450, (168, 85, 247), 160)

    draw.ellipse([840, 420, 1080, 660], fill=(2, 132, 199), outline=(56, 189, 248), width=10)
    draw.ellipse([700, 320, 840, 460], fill=(224, 242, 254))
    draw.ellipse([1080, 320, 1220, 460], fill=(224, 242, 254))

    draw.line([(0, 200), (840, 460)], fill=(245, 158, 11), width=16)
    draw.line([(1080, 460), (1920, 200)], fill=(168, 85, 247), width=16)
    draw.line([(1080, 540), (1920, 540)], fill=(56, 189, 248), width=14)
    draw.line([(1080, 620), (1920, 880)], fill=(236, 72, 153), width=16)

    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "cv_raman_3.jpg"), quality=92)

# ------------------------------------------------------------------------------
# 7. CV RAMAN SCENE 4: Nobel Glory
# ------------------------------------------------------------------------------
def generate_cv_raman_4():
    img, draw = create_base_canvas((69, 26, 3), (15, 23, 42))
    add_radial_light(img, 960, 500, 550, (245, 158, 11), 200)

    draw.ellipse([740, 280, 1180, 720], fill=(245, 158, 11), outline=(254, 240, 138), width=16)
    draw.ellipse([780, 320, 1140, 680], fill=(180, 83, 9), outline=(120, 53, 15), width=8)

    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "cv_raman_4.jpg"), quality=92)

# ------------------------------------------------------------------------------
# 8. PANCHATANTRA SCENES 1-4
# ------------------------------------------------------------------------------
def generate_panchatantra_scenes():
    img, draw = create_base_canvas((2, 44, 34), (15, 23, 42))
    add_radial_light(img, 960, 540, 500, (245, 158, 11), 150)
    for r in [200, 350, 500]:
        draw.ellipse([960 - r, 540 - r, 960 + r, 540 + r], outline=(245, 158, 11), width=8)
    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "panchatantra_1.jpg"), quality=92)

    img, draw = create_base_canvas((20, 83, 45), (15, 23, 42))
    draw.ellipse([1400, 100, 1600, 300], fill=(254, 240, 138))
    draw.ellipse([800, 500, 960, 620], fill=(217, 119, 6))
    draw.polygon([(920, 520), (1020, 550), (920, 580)], fill=(217, 119, 6))
    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "panchatantra_2.jpg"), quality=92)

    img, draw = create_base_canvas((69, 26, 3), (15, 23, 42))
    draw.rectangle([400, 0, 600, 1080], fill=(41, 18, 6))
    draw.ellipse([800, 500, 1200, 800], fill=(180, 83, 9), outline=(245, 158, 11), width=16)
    draw.ellipse([840, 530, 1160, 770], fill=(254, 240, 138))
    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "panchatantra_3.jpg"), quality=92)

    img, draw = create_base_canvas((6, 95, 70), (15, 23, 42))
    add_radial_light(img, 960, 540, 500, (245, 158, 11), 160)
    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "panchatantra_4.jpg"), quality=92)

# ------------------------------------------------------------------------------
# 9. KALAM SCENES 1-4
# ------------------------------------------------------------------------------
def generate_kalam_scenes():
    img, draw = create_base_canvas((15, 23, 42), (19, 78, 74))
    for x in range(100, 1920, 150):
        draw.line([(x, 50), (x - 80, 450)], fill=(56, 189, 248), width=4)
    draw.ellipse([860, 680, 1060, 780], fill=(180, 83, 9))
    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "kalam_1.jpg"), quality=92)

    img, draw = create_base_canvas((6, 78, 59), (15, 23, 42))
    add_radial_light(img, 960, 540, 450, (244, 63, 94), 160)
    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "kalam_2.jpg"), quality=92)

    img, draw = create_base_canvas((3, 105, 161), (56, 189, 248))
    draw.ellipse([800, 100, 1120, 420], fill=(254, 240, 138))
    draw.polygon([(800, 300), (960, 180), (1120, 300), (960, 260)], fill=(255, 255, 255))
    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "kalam_3.jpg"), quality=92)

    img, draw = create_base_canvas((69, 26, 3), (180, 83, 9))
    draw.ellipse([760, 300, 1160, 700], fill=(254, 240, 138))
    draw.ellipse([700, 500, 780, 580], fill=(9, 9, 11))
    draw.rectangle([660, 580, 820, 950], fill=(9, 9, 11))
    draw.ellipse([900, 580, 960, 640], fill=(9, 9, 11))
    draw.rectangle([870, 640, 990, 950], fill=(9, 9, 11))
    draw_vignette(img)
    img.save(os.path.join(OUTPUT_DIR, "kalam_4.jpg"), quality=92)

if __name__ == "__main__":
    generate_thiruvalluvar_2()
    generate_thiruvalluvar_3()
    generate_thiruvalluvar_4()
    generate_cv_raman_1()
    generate_cv_raman_2()
    generate_cv_raman_3()
    generate_cv_raman_4()
    generate_panchatantra_scenes()
    generate_kalam_scenes()
    print("All story JPEG illustration images generated successfully in:", OUTPUT_DIR)
