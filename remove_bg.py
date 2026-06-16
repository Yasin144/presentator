import sys
try:
    from rembg import remove
    from PIL import Image
    
    input_path = r"C:\Users\patan\.gemini\antigravity\brain\53da3188-4a03-4e5c-a0ac-285fb18eb6b3\media__1776452179459.png"
    output_path = r"d:\presentator\anjali-teacher-transparent.png"
    
    input_img = Image.open(input_path)
    output_img = remove(input_img)
    output_img.save(output_path)
    print("Used rembg successfully")
except ImportError:
    print("rembg not found, using basic Pillow masking")
    from PIL import Image
    input_path = r"C:\Users\patan\.gemini\antigravity\brain\53da3188-4a03-4e5c-a0ac-285fb18eb6b3\media__1776452179459.png"
    output_path = r"d:\presentator\anjali-teacher-transparent.png"
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r > 245 and g > 245 and b > 245:
                pixels[x, y] = (255, 255, 255, 0)
    img.save(output_path, "PNG")
