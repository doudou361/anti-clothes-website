import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

# Ensure UTF-8 console output on Windows PowerShell
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# 1. Folders: Drop raw JPG/PNG/WebP photos into 'raw_photos'
INPUT_DIR = Path("./raw_photos")
OUTPUT_DIR = Path("./public/cutouts")

# 2. Target 4:5 canvas size (matches the website's aspect-[4/5] product stage)
CANVAS_WIDTH = 1200
CANVAS_HEIGHT = 1500
PADDING_RATIO = 0.84  # Garment fills 84% of canvas height so every piece matches in scale

# 3. Load high-precision segmentation model once for the whole batch
# Options: "birefnet-general" (sharpest edges) or "isnet-general-use" (fast & clean)
MODEL_NAME = "isnet-general-use"


def remove_stray_head_on_floating_orange_back(cutout_img: Image.Image) -> Image.Image:
    """
    In puffer-orange-back.jpg, the raw studio shot has the model's head above the orange collar
    even though it is a floating garment cutout. Detect the top of the orange collar and mask out
    non-orange pixels above the collar so the back cutout is a pure floating jacket.
    """
    rgba = cutout_img.convert("RGBA")
    w, h = rgba.size
    pixels = rgba.load()

    collar_top_y = None
    for y in range(h):
        orange_count = 0
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a > 100 and r > 175 and g > 45 and b < 95 and (r - b) > 100:
                orange_count += 1
        if orange_count > 15:
            collar_top_y = y
            break

    if collar_top_y is not None and collar_top_y > 20:
        for y in range(collar_top_y):
            for x in range(w):
                pixels[x, y] = (0, 0, 0, 0)

    return rgba


def standardize_on_canvas(cutout_img: Image.Image) -> Image.Image:
    """Crops transparent dead space and centers the garment on a uniform 4:5 PNG canvas."""
    cutout_img = cutout_img.convert("RGBA")

    # Find tight bounding box around non-transparent pixels (ignoring faint alpha noise <= 18)
    alpha = cutout_img.getchannel("A")
    thresh_alpha = alpha.point(lambda p: 255 if p > 18 else 0)
    bbox = thresh_alpha.getbbox()
    if not bbox:
        return cutout_img

    cropped = cutout_img.crop(bbox)

    # Scale garment proportionally to fit nicely inside the 1200x1500 frame
    max_w = int(CANVAS_WIDTH * PADDING_RATIO)
    max_h = int(CANVAS_HEIGHT * PADDING_RATIO)
    cropped.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)

    # Create clean transparent 4:5 canvas and center the garment
    canvas = Image.new("RGBA", (CANVAS_WIDTH, CANVAS_HEIGHT), (0, 0, 0, 0))
    offset_x = (CANVAS_WIDTH - cropped.width) // 2
    offset_y = (CANVAS_HEIGHT - cropped.height) // 2
    canvas.paste(cropped, (offset_x, offset_y), cropped)

    return canvas


def process_all_garments():
    INPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    valid_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    image_files = sorted([
        f for f in INPUT_DIR.iterdir()
        if f.is_file() and f.suffix.lower() in valid_extensions
    ])

    if not image_files:
        print(f"⚠️ No images found in '{INPUT_DIR}'. Drop your clothing photos there and re-run!")
        return

    from rembg import remove, new_session
    print(f"🚀 Loading '{MODEL_NAME}' model (downloads automatically on first run)...")
    session = new_session(MODEL_NAME)

    for index, img_path in enumerate(image_files, start=1):
        output_path = OUTPUT_DIR / f"{img_path.stem}.png"
        print(f"[{index}/{len(image_files)}] Stripping background: {img_path.name} -> {output_path.name}")

        with Image.open(img_path) as img:
            # Strip background with alpha matting post-processing for clean fabric edges
            raw_cutout = remove(
                img,
                session=session,
                post_process_mask=True
            )

            # Remove stray head on floating puffer-orange-back cutout
            if img_path.stem == "puffer-orange-back":
                raw_cutout = remove_stray_head_on_floating_orange_back(raw_cutout)

            # Auto-trim and center on a 1200x1500 transparent canvas
            final_png = standardize_on_canvas(raw_cutout)
            final_png.save(output_path, format="PNG", optimize=True)

    # Generate fitted Lookbook torso cutouts from the on-model front renders
    generate_lookbook_torso_cutouts()

    print(f"\n✅ Done! {len(image_files)} transparent PNGs (+ fitted lookbook layers) saved to '{OUTPUT_DIR}'.")


def generate_lookbook_torso_cutouts():
    """
    Extracts fitted on-model garment cutouts (without head, hands, or pants)
    from puffer-orange-model-front.png and hoodie-black-model-front.png so they
    layer at 1:1 pixel registration (x=0, y=0, scale=1.0) over base-model.png.
    """
    import numpy as np
    from scipy.ndimage import binary_closing, binary_fill_holes, binary_opening

    puffer_model_path = OUTPUT_DIR / "puffer-orange-model-front.png"
    if puffer_model_path.exists():
        pm = np.array(Image.open(puffer_model_path).convert("RGBA"))
        r, g, b, a = (
            pm[:, :, 0].astype(int),
            pm[:, :, 1].astype(int),
            pm[:, :, 2].astype(int),
            pm[:, :, 3].astype(int),
        )
        y_idx = np.arange(pm.shape[0])[:, None]
        x_idx = np.arange(pm.shape[1])[None, :]

        is_orange_core = (a > 25) & (r > 135) & ((r - b) > 105) & ((r - g) > 65)
        is_torso = (a > 25) & (y_idx >= 375) & (y_idx <= 875)
        is_collar = (y_idx >= 290) & (y_idx < 375) & is_orange_core
        is_cuff_or_hem = (
            (y_idx > 875)
            & (y_idx <= 919)
            & is_orange_core
            & (((x_idx >= 430) & (x_idx <= 770)) | (y_idx <= 896))
        )

        puffer_mask = is_collar | is_torso | is_cuff_or_hem
        puffer_mask = binary_closing(puffer_mask, structure=np.ones((5, 5)))
        puffer_mask = binary_fill_holes(puffer_mask)
        puffer_mask &= a > 20

        puffer_cut = pm.copy()
        puffer_cut[~puffer_mask] = [0, 0, 0, 0]
        Image.fromarray(puffer_cut).save(
            OUTPUT_DIR / "puffer-orange-lookbook.png", format="PNG", optimize=True
        )
        print("   -> Saved fitted torso cutout: puffer-orange-lookbook.png")

    hoodie_model_path = OUTPUT_DIR / "hoodie-black-model-front.png"
    if hoodie_model_path.exists():
        hm = np.array(Image.open(hoodie_model_path).convert("RGBA"))
        hr, hg, hb, ha = (
            hm[:, :, 0].astype(int),
            hm[:, :, 1].astype(int),
            hm[:, :, 2].astype(int),
            hm[:, :, 3].astype(int),
        )
        y_idx = np.arange(hm.shape[0])[:, None]
        x_idx = np.arange(hm.shape[1])[None, :]

        is_skin_hm = (
            (hr > 78)
            & ((hr - hb) > 20)
            & ~((hr > 160) & (hg > 130) & (hb < 90))
        )
        hoodie_mask = (ha > 25) & (y_idx >= 278) & (y_idx <= 905)
        hoodie_mask &= ~((y_idx < 405) & is_skin_hm)
        hoodie_mask &= ~((y_idx > 860) & is_skin_hm)
        hoodie_mask &= ~((y_idx > 892) & (x_idx > 430) & (x_idx < 770))
        hoodie_mask = binary_opening(hoodie_mask, structure=np.ones((3, 3)))
        hoodie_mask = binary_closing(hoodie_mask, structure=np.ones((5, 5)))
        hoodie_mask = binary_fill_holes(hoodie_mask)
        hoodie_mask &= ha > 20

        hoodie_cut = hm.copy()
        hoodie_cut[~hoodie_mask] = [0, 0, 0, 0]
        Image.fromarray(hoodie_cut).save(
            OUTPUT_DIR / "hoodie-black-lookbook.png", format="PNG", optimize=True
        )
        print("   -> Saved fitted torso cutout: hoodie-black-lookbook.png")



if __name__ == "__main__":
    process_all_garments()
