import os
import json
import base64
import time
import urllib.request
from PIL import Image
import io

API_KEY = os.environ.get("GEMINI_API_KEY", "")
OUTPUT_DIR = r"d:\tnschools\TN-Schools\frontend\public\stories"

kalam_scenes = [
    {
        "filename": "kalam_1.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. A young Indian schoolboy walking near coconut palm trees in a coastal village after a rainstorm. He kneels down in wet mud and gently gazes at a tiny helpless songbird with deep care and compassion. Warm emotional digital painting, detailed lighting."
    },
    {
        "filename": "kalam_2.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. A young Indian boy gently holding a tiny songbird in his hands inside a traditional South Indian veranda home, softly drying its feathers with a cloth. Warm home setting, golden sunlight, tender heartwarming digital artwork."
    },
    {
        "filename": "kalam_3.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. A small healed bird flying happily up into a bright clear blue sky above a coastal South Indian town with ocean in background. A young boy stands on his house porch watching joyfully with tears of happiness. Uplifting, bright sunny atmosphere, detailed illustration."
    },
    {
        "filename": "kalam_4.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. A young boy standing beside his wise father on a wooden porch overlooking the ocean during a beautiful golden sunset. His father places a warm guiding hand on the boy's shoulder. Sunset golden glow, inspiring father-son moment, rich artistic painting."
    }
]

models = [
    "models/gemini-2.5-flash-image",
    "models/gemini-3-pro-image",
    "models/gemini-3.1-flash-lite-image"
]

for item in kalam_scenes:
    filename = item["filename"]
    prompt = item["prompt"]
    out_path = os.path.join(OUTPUT_DIR, filename)
    print(f"[Generating] {filename} ...", flush=True)
    
    success = False
    for model_name in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/{model_name}:generateContent?key={API_KEY}"
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        req = urllib.request.Request(
            url, 
            data=json.dumps(payload).encode('utf-8'), 
            headers={'Content-Type': 'application/json'}
        )
        
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode('utf-8'))
                    candidates = data.get('candidates', [])
                    if candidates:
                        parts = candidates[0].get('content', {}).get('parts', [])
                        for p in parts:
                            if 'inlineData' in p:
                                img_b64 = p['inlineData'].get('data', '')
                                img_bytes = base64.b64decode(img_b64)
                                img = Image.open(io.BytesIO(img_bytes))
                                if img.mode in ("RGBA", "P"):
                                    img = img.convert("RGB")
                                img.save(out_path, "JPEG", quality=92)
                                print(f"-> SUCCESS ({model_name}): Saved {filename} ({os.path.getsize(out_path)} bytes)", flush=True)
                                success = True
                                break
                    if success:
                        break
        except Exception as e:
            print(f"   Model {model_name} failed: {e}", flush=True)
            time.sleep(2)
            
    if not success:
        print(f"FAILED to generate {filename}", flush=True)
    time.sleep(1.5)

print("\nKALAM SCENES COMPLETE!", flush=True)
