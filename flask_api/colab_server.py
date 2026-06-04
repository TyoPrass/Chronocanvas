"""
=============================================================
  ChronoCanvas — Colab GPU Server
  Jalankan file ini di Google Colab untuk generate gambar
  menggunakan GPU gratis (T4 / A100).
=============================================================

CARA PAKAI:
-----------
1. Upload file ini ke Google Colab (atau copy-paste ke cell)
2. Jalankan cell install dependencies DULU (lihat di bawah)
3. Jalankan file ini

CELL 1 — Install dependencies (jalankan di cell terpisah):
    !pip install -q flask flask-cors pyngrok
    !pip install -q diffusers transformers accelerate safetensors
    !pip install -q xformers peft torch

CELL 2 — Mount Google Drive (jalankan di cell terpisah):
    from google.colab import drive
    drive.mount('/content/drive')

CELL 3 — Jalankan server:
    !python colab_server.py --ngrok-token YOUR_NGROK_TOKEN

ATAU tanpa ngrok (hanya lokal di Colab):
    !python colab_server.py

=============================================================
"""

import subprocess
import sys

# ──────────────────────────────────────────────
#  AUTO-INSTALL DEPENDENCIES (untuk Google Colab)
# ──────────────────────────────────────────────
def install_deps():
    """Install semua dependencies yang dibutuhkan."""
    packages = [
        "flask", "flask-cors", "pyngrok", "pymongo",
        "diffusers", "transformers", "accelerate",
        "safetensors", "peft", "xformers",
    ]
    print("📦 Installing dependencies...")
    for pkg in packages:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "-q", pkg],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    print("✅ Dependencies installed!\n")

install_deps()

# ──────────────────────────────────────────────


import base64
import gc
import os
from io import BytesIO

import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from flask import Flask, request, jsonify
from flask_cors import CORS


# ══════════════════════════════════════════════
#  KONFIGURASI — Sesuaikan bagian ini saja!
# ══════════════════════════════════════════════

# ngrok auth token (dari https://dashboard.ngrok.com/get-started/your-authtoken)
NGROK_TOKEN = "3EfkIDTOtF19sVzgCSfg7TxdARY_jbB6C3yEbiR1RGdV2fZ3"

# MongoDB URI (sama dengan yang di .env Express backend)
# Isi agar URL ngrok otomatis tersimpan ke database
MONGODB_URI = "mongodb+srv://sigmatop123_db_user:SigmaGuntur@capstone.w1wdhzx.mongodb.net/?appName=Capstone"

# Base model Stable Diffusion
MODEL_ID = "runwayml/stable-diffusion-v1-5"

# Path ke LoRA weights di Google Drive
LORA_PATH = "/content/drive/MyDrive/chronocanvas_lora_output/final_model"

# Port Flask server
PORT = 5000

# Inference settings
DEFAULT_STEPS = 30
DEFAULT_GUIDANCE = 7.5
DEFAULT_NEGATIVE = (
    "blurry, low quality, distorted, deformed, ugly, "
    "bad anatomy, watermark, text, oversaturated"
)


# ──────────────────────────────────────────────
#  LOAD MODEL
# ──────────────────────────────────────────────

def load_pipeline():
    """Load Stable Diffusion pipeline + LoRA weights ke GPU."""

    print("\n" + "=" * 60)
    print("  🚀 ChronoCanvas — Loading Model...")
    print("=" * 60)

    # Cek GPU
    if not torch.cuda.is_available():
        print("\n❌ GPU tidak tersedia!")
        print("   Pastikan runtime Colab menggunakan GPU:")
        print("   Runtime → Change runtime type → GPU")
        sys.exit(1)

    gpu_name = torch.cuda.get_device_name(0)
    gpu_mem = torch.cuda.get_device_properties(0).total_memory / 1e9
    print(f"\n🖥️  GPU: {gpu_name} ({gpu_mem:.1f} GB VRAM)")

    # Cek LoRA path
    if not os.path.exists(LORA_PATH):
        print(f"\n❌ LoRA weights tidak ditemukan di:")
        print(f"   {LORA_PATH}")
        print(f"\n   Pastikan Google Drive sudah di-mount dan path benar.")
        print(f"   Jalankan dulu: from google.colab import drive; drive.mount('/content/drive')")
        sys.exit(1)

    print(f"\n📂 LoRA path: {LORA_PATH}")

    # Load base pipeline
    print("\n[1/3] Loading base model (Stable Diffusion v1.5)...")
    pipe = StableDiffusionPipeline.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.float16,
        safety_checker=None,
        feature_extractor=None,
    )
    gc.collect()

    # Load LoRA
    print("[2/3] Loading LoRA weights...")
    pipe.load_lora_weights(LORA_PATH)
    gc.collect()

    # Optimasi
    print("[3/3] Mengoptimasi pipeline...")
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    pipe.to("cuda")

    # Memory optimizations
    pipe.enable_attention_slicing("auto")
    pipe.vae.enable_slicing()
    try:
        pipe.enable_xformers_memory_efficient_attention()
        print("   ✅ xFormers enabled")
    except Exception:
        print("   ⚠️  xFormers tidak tersedia, pakai attention standar")

    gc.collect()
    torch.cuda.empty_cache()

    # Print VRAM usage
    allocated = torch.cuda.memory_allocated() / 1e9
    print(f"\n💾 VRAM terpakai: {allocated:.2f} GB")
    print("✅ Model siap!\n")

    return pipe


# ──────────────────────────────────────────────
#  FLASK SERVER
# ──────────────────────────────────────────────

def create_app(pipe):
    """Buat Flask app dengan endpoint generate dan health."""

    app = Flask(__name__)
    CORS(app)

    @app.route("/generate", methods=["POST"])
    def generate_image():
        data = request.json

        if not data or "prompt" not in data:
            return jsonify({"success": False, "error": "Field 'prompt' diperlukan"}), 400

        prompt = data.get("prompt", "").strip()
        negative_prompt = data.get("negative_prompt", DEFAULT_NEGATIVE)
        steps = data.get("num_inference_steps", DEFAULT_STEPS)
        guidance = data.get("guidance_scale", DEFAULT_GUIDANCE)

        if not prompt:
            return jsonify({"success": False, "error": "Prompt tidak boleh kosong"}), 400

        print(f'\n🎨 Generating: "{prompt[:80]}..."')

        try:
            with torch.no_grad():
                result = pipe(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    num_inference_steps=int(steps),
                    guidance_scale=float(guidance),
                )

            image = result.images[0]

            # Konversi ke base64
            buffered = BytesIO()
            image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

            print("✅ Gambar berhasil dibuat!")

            return jsonify({
                "success": True,
                "message": "Gambar berhasil dibuat",
                "image_base64": img_str,
            })

        except Exception as e:
            print(f"❌ Error: {e}")
            return jsonify({"success": False, "error": str(e)}), 500

    @app.route("/health", methods=["GET"])
    def health_check():
        gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "N/A"
        return jsonify({
            "success": True,
            "status": "running",
            "device": f"cuda ({gpu_name})",
            "model": "stable-diffusion-v1-5 + LoRA (Colab)",
        })

    return app


# ──────────────────────────────────────────────
#  MONGODB — Auto-register URL ke database
# ──────────────────────────────────────────────

def register_url_to_mongodb(mongodb_uri, public_url):
    """Simpan URL ngrok ke MongoDB agar Express bisa baca otomatis."""
    try:
        from pymongo import MongoClient
        from datetime import datetime

        client = MongoClient(mongodb_uri)
        # Gunakan 'test' sebagai default fallback jika tidak ada nama DB di URI
        db = client.get_default_database("test")
        collection = db["aiconfigs"]

        # Upsert: update jika sudah ada, insert jika belum
        collection.update_one(
            {"key": "ai_api_url"},
            {
                "$set": {
                    "key": "ai_api_url",
                    "value": str(public_url),
                    "updatedAt": datetime.utcnow(),
                }
            },
            upsert=True,
        )

        print(f"  ✅ URL berhasil disimpan ke MongoDB!")
        print(f"     Express backend akan otomatis menggunakan URL ini.")
        client.close()

    except ImportError:
        print("  ⚠️  pymongo belum terinstall, URL tidak disimpan ke database")
        print("     Install: !pip install pymongo")
    except Exception as e:
        print(f"  ⚠️  Gagal menyimpan URL ke MongoDB: {e}")
        print(f"     Kamu bisa copy URL secara manual ke .env")


# ──────────────────────────────────────────────
#  NGROK TUNNEL
# ──────────────────────────────────────────────

def setup_ngrok(auth_token, port, mongodb_uri=None):
    """Setup ngrok tunnel untuk expose Flask server ke internet."""
    try:
        from pyngrok import ngrok

        ngrok.set_auth_token(auth_token)
        tunnel = ngrok.connect(port)
        public_url = tunnel.public_url  # Extract just the URL string

        print("\n" + "=" * 60)
        print("  🌐 SERVER ONLINE!")
        print("=" * 60)
        print(f"\n  Public URL : {public_url}")
        print(f"  Health     : {public_url}/health")
        print(f"  Generate   : {public_url}/generate")

        # Auto-register ke MongoDB jika URI diberikan
        if mongodb_uri:
            print(f"\n  📡 Menyimpan URL ke MongoDB...")
            register_url_to_mongodb(mongodb_uri, public_url)
        else:
            print(f"\n  📋 Copy URL di atas ke file .env Express backend kamu:")
            print(f"     AI_API_URL={public_url}")
            print(f"\n  💡 Atau tambahkan --mongodb-uri untuk auto-register!")

        print("\n" + "=" * 60 + "\n")

        return public_url

    except ImportError:
        print("\n❌ pyngrok belum terinstall!")
        print("   Jalankan: !pip install pyngrok")
        sys.exit(1)


# ──────────────────────────────────────────────
#  MAIN
# ──────────────────────────────────────────────

# ──────────────────────────────────────────────
#  START!
# ──────────────────────────────────────────────

# Load model
pipe = load_pipeline()

# Buat Flask app
app = create_app(pipe)

# Setup ngrok tunnel
if NGROK_TOKEN:
    setup_ngrok(NGROK_TOKEN, PORT, MONGODB_URI if MONGODB_URI else None)
else:
    print("\n" + "=" * 60)
    print("  ⚠️  Server berjalan TANPA ngrok tunnel")
    print("  Isi NGROK_TOKEN di bagian KONFIGURASI untuk expose ke internet")
    print("=" * 60)
    print(f"\n  Local URL: http://localhost:{PORT}")
    print(f"  Health   : http://localhost:{PORT}/health\n")

# Jalankan Flask
app.run(host="0.0.0.0", port=PORT, debug=False)
