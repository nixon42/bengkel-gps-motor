#!/usr/bin/env python3
"""
Generate crisp, professional 1200x630 Open Graph images for WhatsApp sharing:
1. og-landing.jpg (Landing Page BengkelOS)
2. og-tracking.jpg (Cek Status Servis Bengkel GPS Motor)
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

FONT_BOLD = "/usr/share/fonts/TTF/FiraSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/TTF/FiraSans-Regular.ttf"
OUTPUT_DIR = "public/images/og"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def get_fonts():
    try:
        title_font = ImageFont.truetype(FONT_BOLD, 52)
        subtitle_font = ImageFont.truetype(FONT_REGULAR, 26)
        badge_font = ImageFont.truetype(FONT_BOLD, 20)
        pill_font = ImageFont.truetype(FONT_BOLD, 22)
        small_font = ImageFont.truetype(FONT_REGULAR, 18)
    except Exception:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        badge_font = ImageFont.load_default()
        pill_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    return title_font, subtitle_font, badge_font, pill_font, small_font

def draw_landing_og():
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), (12, 43, 94)) # Deep Royal Blue
    
    # Load background workshop image if exists
    bg_path = "public/images/mockup/facility_lift_bay_clean.jpg"
    if os.path.exists(bg_path):
        bg = Image.open(bg_path).convert("RGB")
        # Crop & resize to 1200x630
        bg_w, bg_h = bg.size
        target_ratio = w / h
        bg_ratio = bg_w / bg_h
        if bg_ratio > target_ratio:
            new_w = int(bg_h * target_ratio)
            bg = bg.crop(((bg_w - new_w) // 2, 0, (bg_w + new_w) // 2, bg_h))
        else:
            new_h = int(bg_w / target_ratio)
            bg = bg.crop((0, (bg_h - new_h) // 2, bg_w, (bg_h + new_h) // 2))
        bg = bg.resize((w, h), Image.Resampling.LANCZOS)
        
        # Darken and tint royal blue
        enhancer = ImageEnhance.Brightness(bg)
        bg = enhancer.enhance(0.28)
        img.paste(bg, (0, 0))
    
    draw = ImageDraw.Draw(img)
    title_font, subtitle_font, badge_font, pill_font, small_font = get_fonts()
    
    # Gradient overlay on bottom and left for text contrast
    gradient = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(gradient)
    for x in range(w):
        alpha = int(220 * (1.0 - (x / w) * 0.7))
        gdraw.line([(x, 0), (x, h)], fill=(10, 25, 47, min(255, alpha)))
    img = Image.alpha_composite(img.convert("RGBA"), gradient).convert("RGB")
    draw = ImageDraw.Draw(img)
    
    # 1. Badge Top
    badge_bg = (16, 185, 129) # Emerald
    draw.rounded_rectangle([70, 65, 470, 105], radius=8, fill=(15, 23, 42, 230), outline=(52, 211, 153), width=2)
    # Green pulse dot
    draw.ellipse([85, 79, 97, 91], fill=(52, 211, 153))
    draw.text((110, 75), "BENGKELOS · PLATFORM CLOUD", font=badge_font, fill=(240, 253, 244))
    
    # 2. Main Title (Two lines)
    draw.text((70, 135), "Sistem Manajemen & Tracking", font=title_font, fill=(255, 255, 255))
    draw.text((70, 195), "Servis Bengkel Mobil Modern", font=title_font, fill=(52, 211, 153))
    
    # 3. Subtitle / Description
    draw.text(
        (70, 280),
        "SPK Digital · Pelacakan Progres Real-Time WhatsApp Tanpa Login",
        font=subtitle_font,
        fill=(226, 232, 240)
    )
    draw.text(
        (70, 320),
        "Katalog Suku Cadang FIFO · Kasir Transparan · Terpercaya",
        font=subtitle_font,
        fill=(148, 163, 184)
    )
    
    # 4. Feature Pills
    pills = [
        ("✓ 3.850+ SPK Terproses", (30, 41, 59), (52, 211, 153)),
        ("✓ Link Tracking via WA", (30, 41, 59), (56, 189, 248)),
        ("✓ Bukti Foto Suku Cadang", (30, 41, 59), (251, 191, 36)),
    ]
    px = 70
    py = 400
    for text, bg_c, text_c in pills:
        pill_w = len(text) * 14 + 30
        draw.rounded_rectangle([px, py, px + pill_w, py + 52], radius=10, fill=bg_c, outline=text_c, width=2)
        draw.text((px + 16, py + 12), text, font=pill_font, fill=text_c)
        px += pill_w + 20
        
    # 5. Footer URL Strip
    draw.line([(70, 530), (1130, 530)], fill=(71, 85, 105), width=1)
    draw.text((70, 555), "🌐 bengkel.ueeee.my.id", font=pill_font, fill=(255, 255, 255))
    draw.text((820, 558), "Multi-Tenant Workshop System", font=small_font, fill=(148, 163, 184))
    
    out_path = os.path.join(OUTPUT_DIR, "og-landing.jpg")
    img.save(out_path, "JPEG", quality=88, optimize=True)
    print(f"Saved: {out_path} ({os.path.getsize(out_path)/1024:.1f} KB)")

def draw_tracking_og():
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), (15, 23, 42)) # Slate 900
    
    # Add preview mockup of tracking screenshot on right side
    track_shot = "public/images/docs/docs_public_tracking.png"
    if os.path.exists(track_shot):
        shot = Image.open(track_shot).convert("RGB")
        # Resize to fit right side ~560px wide, ~480px tall
        shot = shot.resize((540, 360), Image.Resampling.LANCZOS)
        # Create framed card
        card = Image.new("RGB", (560, 380), (30, 41, 59))
        card.paste(shot, (10, 10))
        # Add shadow
        img.paste(card, (590, 130))
    
    draw = ImageDraw.Draw(img)
    title_font, subtitle_font, badge_font, pill_font, small_font = get_fonts()
    
    # 1. Badge Top
    draw.rounded_rectangle([70, 65, 490, 105], radius=8, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
    # Green pulse dot
    draw.ellipse([85, 79, 97, 91], fill=(16, 185, 129))
    draw.text((110, 75), "CEK STATUS SERVIS · REAL-TIME", font=badge_font, fill=(167, 243, 208))
    
    # 2. Main Title (Left Column)
    draw.text((70, 135), "Cek Status Servis", font=title_font, fill=(255, 255, 255))
    draw.text((70, 195), "Kendaraan Online", font=title_font, fill=(56, 189, 248)) # Sky blue
    
    # 3. Subtitle / Workshop Name
    draw.text(
        (70, 275),
        "Bengkel Mobil GPS Motor Kediri",
        font=subtitle_font,
        fill=(52, 211, 153) # Emerald
    )
    draw.text(
        (70, 315),
        "Pantau progres pengerjaan mobil Anda,",
        font=subtitle_font,
        fill=(226, 232, 240)
    )
    draw.text(
        (70, 350),
        "status stall lift, & rincian estimasi biaya.",
        font=subtitle_font,
        fill=(148, 163, 184)
    )
    
    # 4. Feature Pills Left
    pills = [
        ("✓ Tanpa Perlu Login", (30, 41, 59), (52, 211, 153)),
        ("✓ Foto Dokumentasi Part", (30, 41, 59), (56, 189, 248)),
    ]
    px = 70
    py = 410
    for text, bg_c, text_c in pills:
        pill_w = len(text) * 14 + 30
        draw.rounded_rectangle([px, py, px + pill_w, py + 48], radius=8, fill=bg_c, outline=text_c, width=1)
        draw.text((px + 14, py + 12), text, font=pill_font, fill=text_c)
        px += pill_w + 16
        
    # 5. Footer URL Strip
    draw.line([(70, 530), (1130, 530)], fill=(51, 65, 85), width=1)
    draw.text((70, 555), "🔍 bengkel.ueeee.my.id/cek-status", font=pill_font, fill=(255, 255, 255))
    draw.text((780, 558), "Transparansi Pengerjaan & Suku Cadang", font=small_font, fill=(148, 163, 184))
    
    out_path = os.path.join(OUTPUT_DIR, "og-tracking.jpg")
    img.save(out_path, "JPEG", quality=88, optimize=True)
    print(f"Saved: {out_path} ({os.path.getsize(out_path)/1024:.1f} KB)")

if __name__ == "__main__":
    draw_landing_og()
    draw_tracking_og()
