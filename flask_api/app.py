from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler, AutoencoderKL, UNet2DConditionModel
from diffusers.schedulers import PNDMScheduler
from transformers import CLIPTextModel, CLIPTokenizer
import base64
from io import BytesIO
import os
import sys
import gc

app = Flask(__name__)
CORS(app)  # Izinkan request dari Express

# Cek ketersediaan GPU
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Menggunakan device: {device}")

# Path ke LoRA
LORA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "AI"))

# Cek apakah file adapter_model.safetensors ada
adapter_file = os.path.join(LORA_PATH, "adapter_model.safetensors")
if not os.path.exists(adapter_file):
    print(f"[ERROR] File LoRA tidak ditemukan di: {adapter_file}")
    print("   Pastikan folder 'AI' berisi file 'adapter_model.safetensors'")
    sys.exit(1)

MODEL_ID = "runwayml/stable-diffusion-v1-5"

print("[LOADING] Memuat komponen model satu per satu (hemat RAM)...")

# ---- Load setiap komponen secara terpisah agar RAM tidak overload ----

# 1. UNet (~1.7 GB fp16) — komponen terbesar, load pertama
print("  [1/5] Loading UNet...")
unet = UNet2DConditionModel.from_pretrained(
    MODEL_ID, subfolder="unet",
    torch_dtype=torch.float16,
    low_cpu_mem_usage=True,
    variant="fp16",
    use_safetensors=True,
)
gc.collect()

# 2. Text Encoder (~500 MB fp16)
print("  [2/5] Loading text encoder...")
text_encoder = CLIPTextModel.from_pretrained(
    MODEL_ID, subfolder="text_encoder",
    torch_dtype=torch.float16,
    low_cpu_mem_usage=True,
    use_safetensors=True,
)
gc.collect()

# 3. VAE (~160 MB fp16)
print("  [3/5] Loading VAE...")
vae = AutoencoderKL.from_pretrained(
    MODEL_ID, subfolder="vae",
    torch_dtype=torch.float16,
    low_cpu_mem_usage=True,
    use_safetensors=True,
)
gc.collect()

# 4. Tokenizer (sangat kecil, ~1 MB)
print("  [4/5] Loading tokenizer...")
tokenizer = CLIPTokenizer.from_pretrained(MODEL_ID, subfolder="tokenizer")
gc.collect()

# 5. Scheduler (sangat kecil)
print("  [5/5] Loading scheduler...")
scheduler = DPMSolverMultistepScheduler.from_pretrained(MODEL_ID, subfolder="scheduler")
gc.collect()

# ---- Bangun pipeline dari komponen ----
print("[LOADING] Merakit pipeline...")
pipe = StableDiffusionPipeline(
    text_encoder=text_encoder,
    tokenizer=tokenizer,
    unet=unet,
    vae=vae,
    scheduler=scheduler,
    safety_checker=None,
    feature_extractor=None,
)

# Hapus referensi individual untuk hemat RAM
del text_encoder, tokenizer, unet, vae, scheduler
gc.collect()

print(f"[LOADING] Menambahkan LoRA weights dari: {LORA_PATH}")
pipe.load_lora_weights(LORA_PATH)
print("[OK] LoRA berhasil dimuat!")
gc.collect()

# Aktifkan attention slicing untuk mengurangi penggunaan memori
pipe.enable_attention_slicing("auto")
pipe.enable_vae_slicing()
pipe.to(device)

# Optimasi tambahan jika pakai GPU
if device == "cuda":
    try:
        pipe.enable_xformers_memory_efficient_attention()
        print("[OK] xFormers memory-efficient attention enabled")
    except Exception:
        print("[WARN] xFormers tidak tersedia, menggunakan attention standar")

print("[READY] Server AI siap menerima request!\n")


@app.route('/generate', methods=['POST'])
def generate_image():
    data = request.json

    if not data or 'prompt' not in data:
        return jsonify({"success": False, "error": "Field 'prompt' diperlukan"}), 400

    prompt = data.get("prompt", "").strip()
    negative_prompt = data.get(
        "negative_prompt",
        "blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, text"
    )

    if not prompt:
        return jsonify({"success": False, "error": "Prompt tidak boleh kosong"}), 400

    print(f"[GEN] Membuat gambar untuk prompt: \"{prompt}\"")

    try:
        # Generate gambar
        with torch.no_grad():
            result = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=30,
                guidance_scale=7.5,
            )

        image = result.images[0]

        # Konversi gambar PIL ke format Base64
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        print("[OK] Gambar berhasil dibuat!")

        return jsonify({
            "success": True,
            "message": "Gambar berhasil dibuat",
            "image_base64": img_str
        })

    except Exception as e:
        print(f"[ERROR] Error generating image: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint untuk mengecek apakah server AI aktif."""
    return jsonify({
        "success": True,
        "status": "running",
        "device": device,
        "model": "stable-diffusion-v1-5 + LoRA"
    })


if __name__ == '__main__':
    # Jalankan server Flask di port 5000
    app.run(host='0.0.0.0', port=5000, debug=False)
