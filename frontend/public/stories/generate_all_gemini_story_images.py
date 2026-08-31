import os
import json
import base64
import time
import urllib.request
from PIL import Image
import io

API_KEY = os.environ.get("GEMINI_API_KEY", "")
OUTPUT_DIR = r"d:\tnschools\TN-Schools\frontend\public\stories"

scenes_to_generate = [
    # ── Story 2: Thiruvalluvar ──
    {
        "filename": "thiruvalluvar_2.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. In an ancient Tamil house in Mylapore, Saint Thiruvalluvar (with white beard, hair bun, calm gentle expression) sits near a wooden silk handloom. An arrogant, wealthy young Indian man wearing a rich blue silk tunic is angrily tearing a finely woven crimson and gold silk saree in half in front of him. Thiruvalluvar remains completely calm and smiling peacefully. Rich warm colors, vibrant Indian comic artwork, detailed lighting."
    },
    {
        "filename": "thiruvalluvar_3.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. Saint Thiruvalluvar standing in a traditional Tamil loom house, holding torn silk fabric rags on a wooden table. He speaks with deep gentle wisdom to the wealthy young man, who looks surprised and ashamed. Warm golden light filtering through wooden windows, detailed comic art style."
    },
    {
        "filename": "thiruvalluvar_4.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. The wealthy young man bowing down on his knees at Saint Thiruvalluvar's feet in tears and humility, seeking forgiveness. Saint Thiruvalluvar places a gentle hand of blessing on his head. Glowing golden spiritual aura, palm leaf manuscript Thirukkural nearby, warm heartwarming scene, detailed digital painting."
    },

    # ── Story 3: CV Raman ──
    {
        "filename": "cv_raman_1.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. Young Indian schoolboy C.V. Raman sitting under a neem tree in a sunny South Indian village. He holds a glass triangular prism up to bright sunlight, watching in awe as white light refracts into a brilliant, glowing 7-color rainbow spectrum across his hands and clothes. Magical atmosphere, vibrant colors, detailed art."
    },
    {
        "filename": "cv_raman_2.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. Adult Sir C.V. Raman wearing a formal 1920s suit and white turban, standing on the deck of a grand ocean liner ship in 1921. He gazes intently at the deep sparkling blue Mediterranean sea water, holding a pocket spectroscope with curious wonder. Dramatic oceanic lighting, vintage travel aesthetic, rich digital artwork."
    },
    {
        "filename": "cv_raman_3.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. Sir C.V. Raman in a vintage science laboratory in 1928, discovering the Raman Effect. Beams of vibrant purple and blue light scattering through glass liquid flasks and prisms, sparkling light particles in background, scientific wonder, dramatic glowing lighting, high quality digital painting."
    },
    {
        "filename": "cv_raman_4.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. Triumphant Sir C.V. Raman holding his golden Nobel Prize in Physics medal on a grand stage, warm spotlights illuminating him, Indian flag colors subtly integrated in background curtain, celebrating science and national pride. Golden lighting, detailed portrait artwork."
    },

    # ── Story 4: Panchatantra ──
    {
        "filename": "panchatantra_1.jpg",
        "prompt": "High quality 16:9 Panchatantra fable illustration. A lush tropical Indian forest at dusk. Towering ancient trees, frightened animals (monkeys, deer, birds) shivering as invisible soundwaves of a loud booming sound echo. A hungry jackal creeping behind bushes with wide curious eyes. Rich vibrant fable art style, cinematic forest lighting."
    },
    {
        "filename": "panchatantra_2.jpg",
        "prompt": "High quality 16:9 Panchatantra fable illustration. The clever jackal stealthily crawling through tall forest grass and tropical foliage toward the mysterious sound, showing bravery and determination on his face under shafts of sunlight filtering through jungle leaves. Detailed animal fable digital painting."
    },
    {
        "filename": "panchatantra_3.jpg",
        "prompt": "High quality 16:9 Panchatantra fable illustration. Under a large banyan tree in the forest, heavy wind swings tree branches so they strike against an abandoned wooden war drum left by soldiers. The clever jackal watches from behind a bush, laughing with relief at discovering the secret of the noise. Colorful fable artwork."
    },
    {
        "filename": "panchatantra_4.jpg",
        "prompt": "High quality 16:9 Panchatantra fable illustration. The happy, wise jackal enjoying a delicious feast of fruits and food items left near the war drum in the sunlit forest, smiling with joy. Warm bright colors, charming Panchatantra digital storybook painting."
    },

    # ── Story 5: Kalam ──
    {
        "filename": "kalam_1.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. Young A.P.J. Abdul Kalam as a schoolboy in coastal Rameswaram after a heavy rainstorm. He walks near coconut palm trees and finds a tiny shivering injured baby sparrow lying in wet mud, looking at it with deep compassion. Coastal Tamil Nadu scenery, moody sky, emotional art."
    },
    {
        "filename": "kalam_2.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. Young Kalam gently holding the tiny baby sparrow in his hands inside his traditional South Indian home, softly wiping its wet feathers with his cotton shirt while his father helps build a cozy nest box. Warm family home environment, golden lighting, touching digital painting."
    },
    {
        "filename": "kalam_3.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. The healed baby sparrow flying high into the bright blue sky above the coastal town of Rameswaram with ocean in background. Young Kalam stands on his house veranda watching joyfully with tears of happiness. Uplifting, bright sunny atmosphere, detailed illustration."
    },
    {
        "filename": "kalam_4.jpg",
        "prompt": "High quality 16:9 digital storybook illustration. Young Kalam standing beside his wise father Jainulabdeen on a wooden porch overlooking Rameswaram beach during a beautiful golden sunset. His father places a warm guiding hand on Kalam's shoulder. Sunset golden glow, inspiring father-son moment, rich artistic painting."
    }
]

models = [
    "models/gemini-2.5-flash-image",
    "models/gemini-3-pro-image",
    "models/gemini-3.1-flash-lite-image"
]

def generate_image_with_gemini(item):
    filename = item["filename"]
    prompt = item["prompt"]
    out_path = os.path.join(OUTPUT_DIR, filename)
    print(f"\n[Generating] {filename} ...", flush=True)
    
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
                                mime = p['inlineData'].get('mimeType', 'image/png')
                                img_bytes = base64.b64decode(img_b64)
                                
                                # Convert & save as optimized JPEG
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
        print(f"FAILED to generate {filename} with all Gemini models!", flush=True)

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for item in scenes_to_generate:
        generate_image_with_gemini(item)
        time.sleep(1.5) # Gentle pause between API requests
    print("\nALL SCENE IMAGES GENERATION COMPLETE!", flush=True)
