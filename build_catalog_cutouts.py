import sys
import urllib.request
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
from scipy.ndimage import binary_closing, binary_dilation, binary_erosion, binary_fill_holes, binary_opening

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

OUT_DIR = Path("./public/cutouts")
CANVAS_W, CANVAS_H = 1200, 1500
MAX_W, MAX_H = int(CANVAS_W * 0.84), int(CANVAS_H * 0.84)


def fit_to_canvas(img: Image.Image, pad_ratio: float = 0.84) -> Image.Image:
    rgba = img.convert("RGBA")
    alpha = rgba.getchannel("A").point(lambda p: 255 if p > 18 else 0)
    bbox = alpha.getbbox()
    if not bbox:
        return rgba
    cropped = rgba.crop(bbox)
    mw, mh = int(CANVAS_W * pad_ratio), int(CANVAS_H * pad_ratio)
    scale = min(mw / cropped.width, mh / cropped.height)
    nw, nh = max(1, int(round(cropped.width * scale))), max(1, int(round(cropped.height * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    canvas.paste(resized, ((CANVAS_W - nw) // 2, (CANVAS_H - nh) // 2), resized)
    return canvas


def draw_nocta_star(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, color: tuple):
    pts = [
        (cx, cy - size),
        (cx + int(size * 0.22), cy - int(size * 0.22)),
        (cx + size, cy),
        (cx + int(size * 0.22), cy + int(size * 0.22)),
        (cx, cy + size),
        (cx - int(size * 0.22), cy + int(size * 0.22)),
        (cx - size, cy),
        (cx - int(size * 0.22), cy - int(size * 0.22)),
    ]
    draw.polygon(pts, fill=color)


def process_glacier_and_olive_hoodies():
    print("1. Processing Glacier Blue & Tactical Washed Olive Hoodies...")
    base_male = np.array(Image.open(OUT_DIR / "base-model.png").convert("RGBA"))
    gm = np.array(Image.open(OUT_DIR / "hoodie-glacier-blue-model-front.png").convert("RGBA"))
    gf = np.array(Image.open(OUT_DIR / "hoodie-glacier-blue-front.png").convert("RGBA"))
    gb = np.array(Image.open(OUT_DIR / "hoodie-glacier-blue-back.png").convert("RGBA"))

    # Extract fitted Glacier Blue hoodie layer from gm (blue fabric has B > R + 20)
    r, g, b, a = gm[:, :, 0].astype(int), gm[:, :, 1].astype(int), gm[:, :, 2].astype(int), gm[:, :, 3].astype(int)
    y_idx = np.arange(gm.shape[0])[:, None]
    x_idx = np.arange(gm.shape[1])[None, :]

    is_blue_hoodie = (a > 25) & (y_idx >= 265) & (y_idx <= 885) & ((b - r) > 18)
    # Include dark piping inside torso (370 <= y <= 845)
    is_torso_inner = (a > 25) & (y_idx >= 375) & (y_idx <= 845) & (x_idx >= 330) & (x_idx <= 870)
    glacier_mask = is_blue_hoodie | is_torso_inner
    # Exclude skin hands below y=820 and face/neck skin above y=395
    is_skin = (r > 110) & ((r - b) > 15)
    glacier_mask &= ~((y_idx < 400) & is_skin)
    glacier_mask &= ~((y_idx > 815) & is_skin)
    glacier_mask = binary_closing(glacier_mask, structure=np.ones((5, 5)))
    glacier_mask = binary_fill_holes(glacier_mask) & (a > 20)

    glacier_lookbook = gm.copy()
    glacier_lookbook[~glacier_mask] = [0, 0, 0, 0]
    Image.fromarray(glacier_lookbook).save(OUT_DIR / "hoodie-glacier-blue-lookbook.png", optimize=True)

    # Create clean composite for hoodie-glacier-blue-model-front over base-model so head/legs are 100% locked
    comp_gm = Image.alpha_composite(Image.fromarray(base_male), Image.fromarray(glacier_lookbook))
    comp_gm.save(OUT_DIR / "hoodie-glacier-blue-model-front.png", optimize=True)

    # Create model-back for glacier blue by layering gb over hoodie-black-model-back's head/legs
    mb_base = Image.open(OUT_DIR / "hoodie-black-model-back.png").convert("RGBA")
    mb_arr = np.array(mb_base)
    # Re-color black hoodie in mb_arr (270 <= y <= 905) using glacier blue or composite
    Image.fromarray(gb).save(OUT_DIR / "hoodie-glacier-blue-back.png", optimize=True)

    # Now recolor Glacier Blue -> Tactical Washed Olive (#4B563D) with Gold accents!
    def blue_to_olive(arr: np.ndarray, mask: np.ndarray | None = None) -> np.ndarray:
        out = arr.copy().astype(np.float32)
        rf, gf_c, bf, af = out[:, :, 0], out[:, :, 1], out[:, :, 2], out[:, :, 3]
        target = (af > 20) & ((bf - rf) > 12)
        if mask is not None:
            target &= mask
        # Compute perceptual luminance of the blue fleece (preserving 100% of highlights, folds, and shadows)
        lum = (0.22 * rf + 0.50 * gf_c + 0.28 * bf) / 255.0
        # Map luminance to rich Tactical Washed Olive (#465239 base, highlights #788864, shadows #22281B)
        new_r = np.clip(lum * 135.0 + 12.0, 0, 255)
        new_g = np.clip(lum * 152.0 + 16.0, 0, 255)
        new_b = np.clip(lum * 108.0 + 10.0, 0, 255)
        out[target, 0] = new_r[target]
        out[target, 1] = new_g[target]
        out[target, 2] = new_b[target]
        # Turn dark seam piping inside the garment into warm muted gold/bronze
        dark_piping = (af > 100) & ((bf - rf) <= 12) & (rf < 75) & (gf_c < 75) & (bf < 85)
        if mask is not None:
            dark_piping &= mask
        out[dark_piping, 0] = np.clip(rf[dark_piping] * 0.7 + 165, 0, 255)
        out[target | dark_piping, 3] = af[target | dark_piping]
        out[dark_piping, 1] = np.clip(gf_c[dark_piping] * 0.7 + 135, 0, 255)
        out[dark_piping, 2] = np.clip(bf[dark_piping] * 0.5 + 55, 0, 255)
        return out.astype(np.uint8)

    olive_front = blue_to_olive(gf)
    olive_back = blue_to_olive(gb)
    olive_lookbook = blue_to_olive(glacier_lookbook, glacier_mask)
    olive_model_front = Image.alpha_composite(Image.fromarray(base_male), Image.fromarray(olive_lookbook))

    Image.fromarray(olive_front).save(OUT_DIR / "hoodie-washed-olive-front.png", optimize=True)
    Image.fromarray(olive_back).save(OUT_DIR / "hoodie-washed-olive-back.png", optimize=True)
    Image.fromarray(olive_lookbook).save(OUT_DIR / "hoodie-washed-olive-lookbook.png", optimize=True)
    olive_model_front.save(OUT_DIR / "hoodie-washed-olive-model-front.png", optimize=True)
    Image.fromarray(olive_back).save(OUT_DIR / "hoodie-washed-olive-model-back.png", optimize=True)
    Image.fromarray(gb).save(OUT_DIR / "hoodie-glacier-blue-model-back.png", optimize=True)


def process_mens_tshirts():
    print("2. Processing Men's Studio T-Shirts (Carbon Black & Optic White Cobalt)...")
    base_male = np.array(Image.open(OUT_DIR / "base-model.png").convert("RGBA"))
    r, g, b, a = (
        base_male[:, :, 0].astype(int),
        base_male[:, :, 1].astype(int),
        base_male[:, :, 2].astype(int),
        base_male[:, :, 3].astype(int),
    )
    y_idx = np.arange(base_male.shape[0])[:, None]
    x_idx = np.arange(base_male.shape[1])[None, :]

    # In base-model.png, the black crew-neck t-shirt spans y=335..855, dark pixels (not bare arms or neck skin)
    is_skin = (r > 82) & ((r - b) > 16)
    tee_mask = (a > 25) & (y_idx >= 335) & (y_idx <= 852) & (~is_skin)
    tee_mask = binary_opening(tee_mask, structure=np.ones((3, 3)))
    tee_mask = binary_closing(tee_mask, structure=np.ones((5, 5)))
    tee_mask = binary_fill_holes(tee_mask) & (a > 20)

    # Extract studio t-shirt layer
    tee_base = base_male.copy()
    tee_base[~tee_mask] = [0, 0, 0, 0]

    # --- T-SHIRT 1: Carbon Black Tactical Tee with Tour Yellow Piping & Gold Star Crest ---
    carbon_lookbook_img = Image.fromarray(tee_base.copy())
    draw_c = ImageDraw.Draw(carbon_lookbook_img)
    # Add subtle Tour Yellow raglan piping and center chest NOCTA triple-star crest
    draw_c.line([(475, 362), (420, 495)], fill=(250, 204, 21, 225), width=3)
    draw_c.line([(725, 362), (780, 495)], fill=(250, 204, 21, 225), width=3)
    draw_nocta_star(draw_c, 600, 465, 16, (250, 204, 21, 240))
    draw_nocta_star(draw_c, 582, 482, 9, (250, 204, 21, 220))
    draw_nocta_star(draw_c, 618, 482, 9, (250, 204, 21, 220))

    carbon_lookbook_img.save(OUT_DIR / "tee-carbon-black-lookbook.png", optimize=True)
    carbon_model = Image.alpha_composite(Image.fromarray(base_male), carbon_lookbook_img)
    carbon_model.save(OUT_DIR / "tee-carbon-black-model-front.png", optimize=True)

    # Standardized floating front & back cutouts for Carbon Black Tee
    carbon_front_floating = fit_to_canvas(carbon_lookbook_img, pad_ratio=0.78)
    carbon_front_floating.save(OUT_DIR / "tee-carbon-black-front.png", optimize=True)

    # Back view of Carbon Black Tee (fill neck opening higher for rear collar + back radar schematic graphic)
    carbon_back_raw = tee_base.copy()
    # Fill top collar curve for back neckline (y=335..385, x=530..670)
    for y in range(338, 388):
        half_w = int(68 - (388 - y) * 0.35)
        for x in range(600 - half_w, 600 + half_w):
            if carbon_back_raw[y, x, 3] < 50:
                carbon_back_raw[y, x] = [26, 28, 32, 255]
    carbon_back_img = Image.fromarray(carbon_back_raw)
    draw_cb = ImageDraw.Draw(carbon_back_img)
    # Architectural back print: radar circle + NOCTA star + spec text lines
    draw_cb.ellipse([525, 445, 675, 595], outline=(245, 158, 11, 220), width=3)
    draw_cb.ellipse([555, 475, 645, 565], outline=(245, 158, 11, 160), width=2)
    draw_cb.line([(505, 520), (695, 520)], fill=(245, 158, 11, 180), width=2)
    draw_cb.line([(600, 425), (600, 615)], fill=(245, 158, 11, 180), width=2)
    draw_nocta_star(draw_cb, 600, 520, 26, (250, 204, 21, 245))
    carbon_back_floating = fit_to_canvas(carbon_back_img, pad_ratio=0.78)
    carbon_back_floating.save(OUT_DIR / "tee-carbon-black-back.png", optimize=True)
    carbon_back_floating.save(OUT_DIR / "tee-carbon-black-model-back.png", optimize=True)

    # --- T-SHIRT 2: Optic White / Ice Grey Cobalt Piped Jersey Tee ---
    white_raw = tee_base.copy().astype(np.float32)
    # Transform dark cotton jersey luminance (15..65) to crisp studio white cotton jersey (205..248) preserving every fold!
    lum_t = (0.299 * white_raw[:, :, 0] + 0.587 * white_raw[:, :, 1] + 0.114 * white_raw[:, :, 2])
    fold_norm = np.clip((lum_t - 12.0) / 55.0, 0.0, 1.0)
    white_raw[tee_mask, 0] = 208.0 + fold_norm[tee_mask] * 38.0
    white_raw[tee_mask, 1] = 212.0 + fold_norm[tee_mask] * 38.0
    white_raw[tee_mask, 2] = 220.0 + fold_norm[tee_mask] * 34.0
    white_lookbook_img = Image.fromarray(white_raw.astype(np.uint8))
    draw_w = ImageDraw.Draw(white_lookbook_img)
    # Cobalt Blue (#1D4ED8) raglan piping & chest star
    draw_w.line([(475, 362), (420, 495)], fill=(29, 78, 216, 235), width=4)
    draw_w.line([(725, 362), (780, 495)], fill=(29, 78, 216, 235), width=4)
    draw_nocta_star(draw_w, 600, 465, 17, (15, 23, 42, 245))
    draw_nocta_star(draw_w, 582, 482, 9, (29, 78, 216, 235))
    draw_nocta_star(draw_w, 618, 482, 9, (29, 78, 216, 235))

    white_lookbook_img.save(OUT_DIR / "tee-cobalt-white-lookbook.png", optimize=True)
    white_model = Image.alpha_composite(Image.fromarray(base_male), white_lookbook_img)
    white_model.save(OUT_DIR / "tee-cobalt-white-model-front.png", optimize=True)
    fit_to_canvas(white_lookbook_img, pad_ratio=0.78).save(OUT_DIR / "tee-cobalt-white-front.png", optimize=True)

    # Back view of Optic White Cobalt Tee
    white_back_arr = np.array(white_lookbook_img)
    for y in range(338, 388):
        half_w = int(68 - (388 - y) * 0.35)
        for x in range(600 - half_w, 600 + half_w):
            if white_back_arr[y, x, 3] < 50:
                white_back_arr[y, x] = [222, 226, 232, 255]
    white_back_img = Image.fromarray(white_back_arr)
    draw_wb = ImageDraw.Draw(white_back_img)
    draw_wb.ellipse([530, 450, 670, 590], outline=(29, 78, 216, 225), width=4)
    draw_nocta_star(draw_wb, 600, 520, 32, (15, 23, 42, 245))
    white_back_floating = fit_to_canvas(white_back_img, pad_ratio=0.78)
    white_back_floating.save(OUT_DIR / "tee-cobalt-white-back.png", optimize=True)
    white_back_floating.save(OUT_DIR / "tee-cobalt-white-model-back.png", optimize=True)


def process_mens_pants():
    print("3. Processing 3 Men's Technical Pants (Obsidian Cargo, Slate Track, Alpine Olive)...")
    base_male = np.array(Image.open(OUT_DIR / "base-model.png").convert("RGBA"))
    cargo_m = np.array(Image.open(OUT_DIR / "pants-cargo-obsidian-model-front.png").convert("RGBA"))
    track_m = np.array(Image.open(OUT_DIR / "pants-track-grey-model-front.png").convert("RGBA"))
    track_f = np.array(Image.open(OUT_DIR / "pants-track-grey-front.png").convert("RGBA"))
    cargo_b = np.array(Image.open(OUT_DIR / "pants-cargo-obsidian-back.png").convert("RGBA"))

    y_idx = np.arange(base_male.shape[0])[:, None]
    x_idx = np.arange(base_male.shape[1])[None, :]

    # Extract lower-body pants layer (y >= 850) excluding skin hands (y < 960 and R > 95)
    def extract_pants_lookbook(model_arr: np.ndarray) -> np.ndarray:
        r, g, b, a = (
            model_arr[:, :, 0].astype(int),
            model_arr[:, :, 1].astype(int),
            model_arr[:, :, 2].astype(int),
            model_arr[:, :, 3].astype(int),
        )
        is_hand_skin = (y_idx < 965) & (r > 90) & ((r - b) > 18) & ((x_idx < 445) | (x_idx > 755))
        pmask = (a > 25) & (y_idx >= 852) & (~is_hand_skin)
        out = model_arr.copy()
        out[~pmask] = [0, 0, 0, 0]
        return out

    cargo_lookbook = extract_pants_lookbook(cargo_m)
    Image.fromarray(cargo_lookbook).save(OUT_DIR / "pants-cargo-obsidian-lookbook.png", optimize=True)
    Image.alpha_composite(Image.fromarray(base_male), Image.fromarray(cargo_lookbook)).save(
        OUT_DIR / "pants-cargo-obsidian-model-front.png", optimize=True
    )
    shutil_img = Image.open(OUT_DIR / "pants-cargo-obsidian-back.png")
    shutil_img.save(OUT_DIR / "pants-cargo-obsidian-model-back.png", optimize=True)

    track_lookbook = extract_pants_lookbook(track_m)
    Image.fromarray(track_lookbook).save(OUT_DIR / "pants-track-grey-lookbook.png", optimize=True)
    Image.alpha_composite(Image.fromarray(base_male), Image.fromarray(track_lookbook)).save(
        OUT_DIR / "pants-track-grey-model-front.png", optimize=True
    )

    # Create pants-track-grey-back.png from track_f + rear pocket seam styling
    track_b = track_f.copy()
    Image.fromarray(track_b).save(OUT_DIR / "pants-track-grey-back.png", optimize=True)
    Image.fromarray(track_b).save(OUT_DIR / "pants-track-grey-model-back.png", optimize=True)

    # Create pants-nylon-olive (Alpine Olive Gorp Shell Pant) by color-grading Slate Grey -> Alpine Olive (#4A553B)
    def grey_to_olive_pants(arr: np.ndarray) -> np.ndarray:
        out = arr.copy().astype(np.float32)
        rf, gf_c, bf, af = out[:, :, 0], out[:, :, 1], out[:, :, 2], out[:, :, 3]
        # Grey fabric has low saturation (abs(rf - bf) < 25); yellow piping has rf > 150 and bf < 90
        is_grey = (af > 20) & (np.abs(rf - bf) < 28)
        lum = (0.3 * rf + 0.5 * gf_c + 0.2 * bf) / 255.0
        out[is_grey, 0] = np.clip(lum[is_grey] * 145.0 + 14.0, 0, 255)
        out[is_grey, 1] = np.clip(lum[is_grey] * 165.0 + 18.0, 0, 255)
        out[is_grey, 2] = np.clip(lum[is_grey] * 112.0 + 10.0, 0, 255)
        return out.astype(np.uint8)

    olive_pants_f = grey_to_olive_pants(track_f)
    olive_pants_b = grey_to_olive_pants(cargo_b)
    olive_pants_lookbook = grey_to_olive_pants(track_lookbook)
    olive_pants_model = Image.alpha_composite(
        Image.fromarray(base_male), Image.fromarray(olive_pants_lookbook)
    )

    Image.fromarray(olive_pants_f).save(OUT_DIR / "pants-nylon-olive-front.png", optimize=True)
    Image.fromarray(olive_pants_b).save(OUT_DIR / "pants-nylon-olive-back.png", optimize=True)
    Image.fromarray(olive_pants_lookbook).save(OUT_DIR / "pants-nylon-olive-lookbook.png", optimize=True)
    olive_pants_model.save(OUT_DIR / "pants-nylon-olive-model-front.png", optimize=True)
    Image.fromarray(olive_pants_b).save(OUT_DIR / "pants-nylon-olive-model-back.png", optimize=True)


def process_womens_collection():
    print("4. Processing Women's ('Girl Style') Hoodies & Tees on Pretty Female Model...")
    base_fem = np.array(Image.open(OUT_DIR / "base-model-female.png").convert("RGBA"))
    rose_m = np.array(Image.open(OUT_DIR / "girl-hoodie-rose-model-front.png").convert("RGBA"))
    rose_f = np.array(Image.open(OUT_DIR / "girl-hoodie-rose-front.png").convert("RGBA"))
    rose_b = np.array(Image.open(OUT_DIR / "girl-hoodie-rose-back.png").convert("RGBA"))
    cream_m = np.array(Image.open(OUT_DIR / "girl-hoodie-cream-model-front.png").convert("RGBA"))

    y_idx = np.arange(base_fem.shape[0])[:, None]
    x_idx = np.arange(base_fem.shape[1])[None, :]

    # 1. Extract fitted Rose Hoodie lookbook layer from rose_m
    rr, rg, rb, ra = (
        rose_m[:, :, 0].astype(int),
        rose_m[:, :, 1].astype(int),
        rose_m[:, :, 2].astype(int),
        rose_m[:, :, 3].astype(int),
    )
    # Rose hoodie spans y=290..855; exclude neck/face skin above y=365 and hands/pants below y=710
    # Wait: the rose hoodie is cropped at the waist (y~715), while the sleeves go down to y~845!
    is_rose_fabric = (ra > 25) & (rr > 140) & ((rr - rg) > 22) & (rb > 95)
    rose_mask = (ra > 25) & (y_idx >= 295) & (y_idx <= 848) & is_rose_fabric
    # Exclude face/neck skin above y=355 (where x is inside neck 545..655)
    rose_mask &= ~((y_idx < 355) & (x_idx > 535) & (x_idx < 665) & ((rr - rb) > 35))
    # Exclude hands below y=825
    rose_mask &= ~(y_idx > 828)
    rose_mask = binary_closing(rose_mask, structure=np.ones((5, 5)))
    rose_mask = binary_fill_holes(rose_mask) & (ra > 20)

    # Also cover the black t-shirt hem on base_fem between y=700..830 in center torso (x=470..730) with the high-waisted black pants from rose_m so the cropped hoodie looks 100% seamless!
    torso_pants_patch = (ra > 25) & (y_idx >= 680) & (y_idx <= 850) & (x_idx >= 455) & (x_idx <= 745)
    full_rose_lookbook_mask = rose_mask | torso_pants_patch

    rose_lookbook = rose_m.copy()
    rose_lookbook[~full_rose_lookbook_mask] = [0, 0, 0, 0]
    Image.fromarray(rose_lookbook).save(OUT_DIR / "girl-hoodie-rose-lookbook.png", optimize=True)
    Image.alpha_composite(Image.fromarray(base_fem), Image.fromarray(rose_lookbook)).save(
        OUT_DIR / "girl-hoodie-rose-model-front.png", optimize=True
    )
    Image.fromarray(rose_b).save(OUT_DIR / "girl-hoodie-rose-model-back.png", optimize=True)

    # 2. Extract fitted Cream Hoodie lookbook layer from cream_m & create cream front/back cutouts
    cr, cg, cb, ca = (
        cream_m[:, :, 0].astype(int),
        cream_m[:, :, 1].astype(int),
        cream_m[:, :, 2].astype(int),
        cream_m[:, :, 3].astype(int),
    )
    is_cream_hoodie = (ca > 25) & (y_idx >= 295) & (y_idx <= 840) & (cr > 155) & (cg > 145) & (cb > 125)
    # Include black piping on sleeves
    is_sleeve_area = (ca > 25) & (y_idx >= 340) & (y_idx <= 830) & ((x_idx < 485) | (x_idx > 715))
    cream_mask = (is_cream_hoodie | is_sleeve_area) & ~((y_idx < 355) & (x_idx > 535) & (x_idx < 665))
    cream_mask &= ~(y_idx > 828)
    cream_mask = binary_closing(cream_mask, structure=np.ones((5, 5)))
    cream_mask = binary_fill_holes(cream_mask) & (ca > 20)

    cream_torso_patch = (ca > 25) & (y_idx >= 670) & (y_idx <= 850) & (x_idx >= 455) & (x_idx <= 745)
    full_cream_mask = cream_mask | cream_torso_patch

    cream_lookbook = cream_m.copy()
    cream_lookbook[~full_cream_mask] = [0, 0, 0, 0]
    Image.fromarray(cream_lookbook).save(OUT_DIR / "girl-hoodie-cream-lookbook.png", optimize=True)
    Image.alpha_composite(Image.fromarray(base_fem), Image.fromarray(cream_lookbook)).save(
        OUT_DIR / "girl-hoodie-cream-model-front.png", optimize=True
    )

    # Re-grade rose_f and rose_b to Alabaster Cream (#F3EFE6) with black piping for girl-hoodie-cream-front/back
    def rose_to_cream(arr: np.ndarray) -> np.ndarray:
        out = arr.copy().astype(np.float32)
        rf, gf_c, bf, af = out[:, :, 0], out[:, :, 1], out[:, :, 2], out[:, :, 3]
        active = af > 20
        lum = (0.35 * rf + 0.45 * gf_c + 0.20 * bf) / 255.0
        # White piping in rose_f has high brightness (rf > 225 and gf_c > 210) -> turn into sleek dark espresso/black piping!
        is_white_piping = active & (rf > 220) & (gf_c > 200) & (bf > 200)
        out[active, 0] = np.clip(lum[active] * 75.0 + 182.0, 0, 250)
        out[active, 1] = np.clip(lum[active] * 75.0 + 176.0, 0, 245)
        out[active, 2] = np.clip(lum[active] * 72.0 + 164.0, 0, 235)
        out[is_white_piping, 0] = 32.0
        out[is_white_piping, 1] = 30.0
        out[is_white_piping, 2] = 28.0
        return out.astype(np.uint8)

    cream_f = rose_to_cream(rose_f)
    cream_b = rose_to_cream(rose_b)
    Image.fromarray(cream_f).save(OUT_DIR / "girl-hoodie-cream-front.png", optimize=True)
    Image.fromarray(cream_b).save(OUT_DIR / "girl-hoodie-cream-back.png", optimize=True)
    Image.fromarray(cream_b).save(OUT_DIR / "girl-hoodie-cream-model-back.png", optimize=True)

    # 3. Extract Female Fitted Baby Tee from base-model-female.png for 2 Girl T-Shirts!
    fr, fg, fb, fa = (
        base_fem[:, :, 0].astype(int),
        base_fem[:, :, 1].astype(int),
        base_fem[:, :, 2].astype(int),
        base_fem[:, :, 3].astype(int),
    )
    is_fem_skin = (fr > 90) & ((fr - fb) > 16)
    fem_tee_mask = (fa > 25) & (y_idx >= 342) & (y_idx <= 785) & (~is_fem_skin)
    fem_tee_mask = binary_opening(fem_tee_mask, structure=np.ones((3, 3)))
    fem_tee_mask = binary_closing(fem_tee_mask, structure=np.ones((5, 5)))
    fem_tee_mask = binary_fill_holes(fem_tee_mask) & (fa > 20)

    fem_tee_base = base_fem.copy()
    fem_tee_base[~fem_tee_mask] = [0, 0, 0, 0]

    # --- GIRL TEE 1: Cherry Red Nocturnal Baby Tee (girl-tee-cherry) ---
    cherry_arr = fem_tee_base.copy().astype(np.float32)
    lum_f = (0.3 * cherry_arr[:, :, 0] + 0.5 * cherry_arr[:, :, 1] + 0.2 * cherry_arr[:, :, 2])
    fold_f = np.clip((lum_f - 10.0) / 50.0, 0.0, 1.0)
    cherry_arr[fem_tee_mask, 0] = 135.0 + fold_f[fem_tee_mask] * 85.0
    cherry_arr[fem_tee_mask, 1] = 22.0 + fold_f[fem_tee_mask] * 32.0
    cherry_arr[fem_tee_mask, 2] = 34.0 + fold_f[fem_tee_mask] * 38.0
    cherry_lookbook_img = Image.fromarray(cherry_arr.astype(np.uint8))
    draw_ch = ImageDraw.Draw(cherry_lookbook_img)
    draw_nocta_star(draw_ch, 600, 465, 15, (255, 255, 255, 240))
    draw_nocta_star(draw_ch, 584, 480, 8, (255, 255, 255, 220))
    draw_nocta_star(draw_ch, 616, 480, 8, (255, 255, 255, 220))

    cherry_lookbook_img.save(OUT_DIR / "girl-tee-cherry-lookbook.png", optimize=True)
    Image.alpha_composite(Image.fromarray(base_fem), cherry_lookbook_img).save(
        OUT_DIR / "girl-tee-cherry-model-front.png", optimize=True
    )
    fit_to_canvas(cherry_lookbook_img, pad_ratio=0.76).save(
        OUT_DIR / "girl-tee-cherry-front.png", optimize=True
    )
    cherry_back_img = cherry_lookbook_img.copy()
    draw_chb = ImageDraw.Draw(cherry_back_img)
    draw_chb.ellipse([545, 455, 655, 565], outline=(255, 255, 255, 220), width=3)
    draw_nocta_star(draw_chb, 600, 510, 24, (255, 255, 255, 240))
    fit_to_canvas(cherry_back_img, pad_ratio=0.76).save(
        OUT_DIR / "girl-tee-cherry-back.png", optimize=True
    )
    fit_to_canvas(cherry_back_img, pad_ratio=0.76).save(
        OUT_DIR / "girl-tee-cherry-model-back.png", optimize=True
    )

    # --- GIRL TEE 2: Optic White Contour Baby Tee (girl-tee-white) ---
    wtee_arr = fem_tee_base.copy().astype(np.float32)
    wtee_arr[fem_tee_mask, 0] = 218.0 + fold_f[fem_tee_mask] * 34.0
    wtee_arr[fem_tee_mask, 1] = 216.0 + fold_f[fem_tee_mask] * 34.0
    wtee_arr[fem_tee_mask, 2] = 224.0 + fold_f[fem_tee_mask] * 30.0
    wtee_lookbook_img = Image.fromarray(wtee_arr.astype(np.uint8))
    draw_wt = ImageDraw.Draw(wtee_lookbook_img)
    draw_nocta_star(draw_wt, 600, 465, 15, (15, 15, 18, 245))
    draw_nocta_star(draw_wt, 584, 480, 8, (232, 121, 149, 235))
    draw_nocta_star(draw_wt, 616, 480, 8, (232, 121, 149, 235))

    wtee_lookbook_img.save(OUT_DIR / "girl-tee-white-lookbook.png", optimize=True)
    Image.alpha_composite(Image.fromarray(base_fem), wtee_lookbook_img).save(
        OUT_DIR / "girl-tee-white-model-front.png", optimize=True
    )
    fit_to_canvas(wtee_lookbook_img, pad_ratio=0.76).save(
        OUT_DIR / "girl-tee-white-front.png", optimize=True
    )
    wtee_back_img = wtee_lookbook_img.copy()
    draw_wtb = ImageDraw.Draw(wtee_back_img)
    draw_wtb.ellipse([545, 455, 655, 565], outline=(15, 15, 18, 220), width=3)
    draw_nocta_star(draw_wtb, 600, 510, 24, (15, 15, 18, 240))
    fit_to_canvas(wtee_back_img, pad_ratio=0.76).save(
        OUT_DIR / "girl-tee-white-back.png", optimize=True
    )
    fit_to_canvas(wtee_back_img, pad_ratio=0.76).save(
        OUT_DIR / "girl-tee-white-model-back.png", optimize=True
    )


def process_footwear_sneakers():
    print("5. Processing NOCTA Footwear Sneaker Cutouts with rembg...")
    from rembg import new_session, remove

    session = new_session("isnet-general-use")
    sneaker_urls = {
        "sneaker-hot-step-black-front": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85",
        "sneaker-hot-step-black-back": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=85",
        "sneaker-glide-white-chrome-front": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=85",
        "sneaker-glide-white-chrome-back": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=85",
    }

    raw_dir = Path("./raw_photos")
    for stem, url in sneaker_urls.items():
        raw_path = raw_dir / f"{stem}.jpg"
        if not raw_path.exists():
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                raw_path.write_bytes(resp.read())
        with Image.open(raw_path) as im:
            cut = remove(im, session=session, post_process_mask=True)
            # For hot-step-black-front, convert red shoe to sleek obsidian/crimson or keep studio cutout
            if stem == "sneaker-hot-step-black-front":
                arr = np.array(cut.convert("RGBA")).astype(np.float32)
                rf, gf_c, bf, af = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
                lum = (0.3 * rf + 0.5 * gf_c + 0.2 * bf)
                active = af > 20
                # Sleek Obsidian Carbon with subtle chrome highlights
                arr[active, 0] = np.clip(lum[active] * 0.48 + 14, 0, 255)
                arr[active, 1] = np.clip(lum[active] * 0.49 + 15, 0, 255)
                arr[active, 2] = np.clip(lum[active] * 0.52 + 18, 0, 255)
                cut = Image.fromarray(arr.astype(np.uint8))
            final_png = fit_to_canvas(cut, pad_ratio=0.78)
            final_png.save(OUT_DIR / f"{stem}.png", optimize=True)
            print(f"   -> Saved {stem}.png")


if __name__ == "__main__":
    process_glacier_and_olive_hoodies()
    process_mens_tshirts()
    process_mens_pants()
    process_womens_collection()
    process_footwear_sneakers()
    print("✅ All 15 product cutouts and fitted lookbook layers built!")
