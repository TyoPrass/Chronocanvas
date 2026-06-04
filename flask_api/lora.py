#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║           CHRONOCANVAS — LoRA Training Pipeline                 ║
║      Fine-tune Stable Diffusion dengan Dataset Sejarah Indonesia║
║                                                                  ║
║  Jalankan script ini di Google Colab (GPU Runtime)               ║
║  Setiap bagian ditandai dengan "# ============ CELL X =="       ║
║  Copy-paste setiap cell ke cell terpisah di Colab Notebook       ║
╚══════════════════════════════════════════════════════════════════╝
"""

# ============================================================================
# CELL 1: INSTALL DEPENDENCIES
# ============================================================================
# Jalankan cell ini pertama kali untuk install semua library yang dibutuhkan

"""
!pip install -q accelerate transformers diffusers[torch] datasets
!pip install -q bitsandbytes peft safetensors
!pip install -q Pillow tqdm
!pip install -q xformers  # Untuk optimasi memory GPU
!pip install -U torchao   # Upgrade torchao (peft butuh >= 0.16.0)
"""

# ============================================================================
# CELL 2: MOUNT GOOGLE DRIVE & KONFIGURASI
# ============================================================================

import os
import glob
from pathlib import Path

# Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')

# ========================= KONFIGURASI UTAMA =========================
# Sesuaikan path dan parameter di bawah ini sesuai kebutuhan Anda

CONFIG = {
    # === PATH ===
    "dataset_path": "/content/drive/MyDrive/dataset_history_indonesia/images",
    "output_dir": "/content/drive/MyDrive/chronocanvas_lora_output",
    "logging_dir": "/content/lora_logs",

    # === BASE MODEL ===
    # Pilih salah satu:
    #   - "runwayml/stable-diffusion-v1-5"      (lebih ringan, cocok Colab Free T4)
    #   - "stabilityai/stable-diffusion-2-1"    (kualitas lebih baik, butuh lebih banyak VRAM)
    "base_model": "runwayml/stable-diffusion-v1-5",

    # === TRAINING PARAMETERS (Dioptimalkan untuk ~700 gambar) ===
    "resolution": 512,              # Resolusi gambar training (512 untuk SD v1.5)
    "train_batch_size": 1,          # Batch size (1 untuk Colab Free, 2-4 untuk Pro)
    "gradient_accumulation_steps": 4,  # Effective batch size = 1 x 4 = 4
    "num_train_epochs": 100,        # Jumlah epoch
    "max_train_steps": 5000,        # ~7 epoch x 700 gambar / 4 eff. batch ≈ 5000 steps (sweet spot untuk 700 gambar)
    "learning_rate": 1e-4,          # Learning rate untuk LoRA
    "lr_scheduler": "cosine",       # Scheduler: constant, cosine, linear
    "lr_warmup_steps": 200,         # Warmup steps (lebih banyak karena dataset besar)

    # === LoRA PARAMETERS ===
    "lora_rank": 64,                # Rank LoRA (64 optimal untuk 700 gambar)
    "lora_alpha": 64,               # Alpha (biasanya sama dengan rank)
    "lora_dropout": 0.1,            # Dropout sedikit lebih tinggi untuk cegah overfitting pada 700 gambar

    # === LAINNYA ===
    "seed": 42,
    "mixed_precision": "fp16",       # fp16 untuk hemat VRAM
    "save_every_n_steps": 1000,      # Simpan checkpoint setiap 1000 steps (5 checkpoint total)
    "validation_prompt": "A historical painting of Borobudur temple in ancient Java, detailed, cinematic",
    "use_8bit_adam": True,           # Hemat VRAM dengan 8-bit optimizer
    "enable_xformers": True,        # Memory-efficient attention

    # === AUTO CAPTIONING ===
    "auto_caption": True,           # Set True jika belum ada file .txt caption
    "caption_prefix": "a historical painting of ",  # Prefix untuk setiap caption
    "overwrite_captions": False,    # True = timpa caption yang sudah ada
}

# Buat output directory
os.makedirs(CONFIG["output_dir"], exist_ok=True)
os.makedirs(CONFIG["logging_dir"], exist_ok=True)

print("✅ Konfigurasi siap!")
print(f"   Dataset: {CONFIG['dataset_path']}")
print(f"   Output:  {CONFIG['output_dir']}")
print(f"   Model:   {CONFIG['base_model']}")
print(f"   LoRA Rank: {CONFIG['lora_rank']}")
print(f"   Steps:   {CONFIG['max_train_steps']}")


# ============================================================================
# CELL 3: AUTO-CAPTIONING DENGAN BLIP (OPSIONAL)
# ============================================================================
# Jalankan cell ini HANYA jika Anda belum punya file .txt caption
# Jika sudah ada caption, SKIP cell ini

if CONFIG["auto_caption"]:
    import torch
    from PIL import Image
    from transformers import BlipProcessor, BlipForConditionalGeneration
    from tqdm import tqdm

    print("🔄 Loading BLIP model untuk auto-captioning...")
    blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
    blip_model = BlipForConditionalGeneration.from_pretrained(
        "Salesforce/blip-image-captioning-large",
        torch_dtype=torch.float16
    ).to("cuda")

    # Cari semua gambar
    image_extensions = ["*.png", "*.jpg", "*.jpeg", "*.webp", "*.bmp"]
    image_files = []
    for ext in image_extensions:
        image_files.extend(glob.glob(os.path.join(CONFIG["dataset_path"], ext)))

    print(f"📸 Ditemukan {len(image_files)} gambar")

    # Generate caption untuk setiap gambar
    captioned_count = 0
    skipped_count = 0

    for img_path in tqdm(image_files, desc="Generating captions"):
        txt_path = os.path.splitext(img_path)[0] + ".txt"

        # Skip jika caption sudah ada dan tidak mau overwrite
        if os.path.exists(txt_path) and not CONFIG["overwrite_captions"]:
            skipped_count += 1
            continue

        try:
            # Load dan process gambar
            image = Image.open(img_path).convert("RGB")
            inputs = blip_processor(images=image, return_tensors="pt").to("cuda", torch.float16)

            # Generate caption
            with torch.no_grad():
                output = blip_model.generate(
                    **inputs,
                    max_new_tokens=75,
                    num_beams=5,
                    min_length=10,
                )
            caption = blip_processor.decode(output[0], skip_special_tokens=True)

            # Tambah prefix jika ada
            if CONFIG["caption_prefix"]:
                caption = CONFIG["caption_prefix"] + caption

            # Simpan caption
            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(caption)

            captioned_count += 1

        except Exception as e:
            print(f"❌ Error processing {os.path.basename(img_path)}: {e}")

    # Cleanup BLIP model dari GPU
    del blip_model, blip_processor
    torch.cuda.empty_cache()

    print(f"\n✅ Auto-captioning selesai!")
    print(f"   📝 Caption baru: {captioned_count}")
    print(f"   ⏭️  Dilewati (sudah ada): {skipped_count}")

    # Tampilkan beberapa contoh caption
    print("\n📋 Contoh caption yang dihasilkan:")
    sample_files = glob.glob(os.path.join(CONFIG["dataset_path"], "*.txt"))[:5]
    for txt_file in sample_files:
        with open(txt_file, "r", encoding="utf-8") as f:
            caption = f.read().strip()
        print(f"   {os.path.basename(txt_file)}: {caption}")
else:
    print("⏭️  Auto-captioning dilewati (CONFIG['auto_caption'] = False)")


# ============================================================================
# CELL 4: VALIDASI DATASET
# ============================================================================
# Memastikan setiap gambar punya pasangan file .txt caption

import os
import glob
from PIL import Image

dataset_path = CONFIG["dataset_path"]

# Cari semua gambar
image_extensions = ["*.png", "*.jpg", "*.jpeg", "*.webp", "*.bmp"]
image_files = []
for ext in image_extensions:
    image_files.extend(glob.glob(os.path.join(dataset_path, ext)))

print(f"📊 Validasi Dataset")
print(f"{'='*50}")
print(f"   Path: {dataset_path}")
print(f"   Total gambar ditemukan: {len(image_files)}")

# Cek setiap gambar punya caption
valid_pairs = []
missing_captions = []
invalid_images = []

for img_path in image_files:
    txt_path = os.path.splitext(img_path)[0] + ".txt"

    # Cek apakah gambar valid
    try:
        img = Image.open(img_path)
        img.verify()
    except Exception:
        invalid_images.append(img_path)
        continue

    # Cek apakah caption ada
    if os.path.exists(txt_path):
        with open(txt_path, "r", encoding="utf-8") as f:
            caption = f.read().strip()
        if len(caption) > 0:
            valid_pairs.append((img_path, txt_path))
        else:
            missing_captions.append(img_path)
    else:
        missing_captions.append(img_path)

print(f"\n   ✅ Pasangan valid (gambar + caption): {len(valid_pairs)}")

if missing_captions:
    print(f"   ⚠️  Gambar tanpa caption: {len(missing_captions)}")
    for p in missing_captions[:5]:
        print(f"      - {os.path.basename(p)}")
    if len(missing_captions) > 5:
        print(f"      ... dan {len(missing_captions)-5} lainnya")

if invalid_images:
    print(f"   ❌ Gambar rusak/invalid: {len(invalid_images)}")

# Tampilkan beberapa contoh
print(f"\n📋 Contoh pasangan dataset:")
for img_path, txt_path in valid_pairs[:3]:
    with open(txt_path, "r", encoding="utf-8") as f:
        caption = f.read().strip()
    print(f"   🖼️  {os.path.basename(img_path)}")
    print(f"   📝  \"{caption[:80]}{'...' if len(caption)>80 else ''}\"")
    print()

if len(valid_pairs) == 0:
    print("❌ TIDAK ADA pasangan valid! Jalankan Cell 3 (Auto-Captioning) terlebih dahulu.")
elif len(missing_captions) > 0:
    print("⚠️  Beberapa gambar belum punya caption. Jalankan Cell 3 atau buat caption manual.")
else:
    print(f"✅ Dataset siap untuk training! ({len(valid_pairs)} pasangan)")


# ============================================================================
# CELL 5: TRAINING LoRA
# ============================================================================
# Ini adalah cell utama — proses training LoRA

import torch
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from diffusers import (
    AutoencoderKL,
    DDPMScheduler,
    StableDiffusionPipeline,
    UNet2DConditionModel,
)
from transformers import CLIPTextModel, CLIPTokenizer
from peft import LoraConfig, get_peft_model
from PIL import Image
from torchvision import transforms
from tqdm import tqdm
import math
import gc
import json
from datetime import datetime

# ---- Cek GPU ----
if not torch.cuda.is_available():
    raise RuntimeError("❌ GPU tidak tersedia! Aktifkan GPU di Runtime > Change runtime type > GPU")

gpu_name = torch.cuda.get_device_name(0)
gpu_mem = torch.cuda.get_device_properties(0).total_memory / 1e9
print(f"🖥️  GPU: {gpu_name} ({gpu_mem:.1f} GB VRAM)")


# ---- Custom Dataset ----
class TextImageDataset(Dataset):
    """Dataset untuk pasangan gambar + caption text."""

    def __init__(self, data_dir, tokenizer, size=512):
        self.data_dir = data_dir
        self.tokenizer = tokenizer
        self.size = size

        # Cari semua pasangan gambar-caption
        self.image_paths = []
        self.captions = []

        image_extensions = ["*.png", "*.jpg", "*.jpeg", "*.webp", "*.bmp"]
        all_images = []
        for ext in image_extensions:
            all_images.extend(glob.glob(os.path.join(data_dir, ext)))

        for img_path in sorted(all_images):
            txt_path = os.path.splitext(img_path)[0] + ".txt"
            if os.path.exists(txt_path):
                with open(txt_path, "r", encoding="utf-8") as f:
                    caption = f.read().strip()
                if len(caption) > 0:
                    self.image_paths.append(img_path)
                    self.captions.append(caption)

        print(f"   📦 Dataset loaded: {len(self.image_paths)} pasangan gambar-caption")

        # Image transforms
        self.transform = transforms.Compose([
            transforms.Resize(size, interpolation=transforms.InterpolationMode.BILINEAR),
            transforms.CenterCrop(size),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.5], [0.5]),  # Normalize ke [-1, 1]
        ])

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        # Load gambar
        image = Image.open(self.image_paths[idx]).convert("RGB")
        image = self.transform(image)

        # Tokenize caption
        caption = self.captions[idx]
        tokens = self.tokenizer(
            caption,
            max_length=self.tokenizer.model_max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )

        return {
            "pixel_values": image,
            "input_ids": tokens.input_ids.squeeze(0),
        }


# ---- Load Model Components ----
print("🔄 Loading model components...")

model_id = CONFIG["base_model"]

# Tokenizer
tokenizer = CLIPTokenizer.from_pretrained(model_id, subfolder="tokenizer")
print("   ✅ Tokenizer loaded")

# Text Encoder
text_encoder = CLIPTextModel.from_pretrained(
    model_id, subfolder="text_encoder", torch_dtype=torch.float16
)
text_encoder.to("cuda")
text_encoder.requires_grad_(False)  # Freeze text encoder
print("   ✅ Text Encoder loaded (frozen)")

# VAE
vae = AutoencoderKL.from_pretrained(model_id, subfolder="vae", torch_dtype=torch.float16)
vae.to("cuda")
vae.requires_grad_(False)  # Freeze VAE
print("   ✅ VAE loaded (frozen)")

# UNet (ini yang akan kita fine-tune dengan LoRA)
unet = UNet2DConditionModel.from_pretrained(model_id, subfolder="unet", torch_dtype=torch.float32)
unet.to("cuda")
print("   ✅ UNet loaded")

# Noise Scheduler
noise_scheduler = DDPMScheduler.from_pretrained(model_id, subfolder="scheduler")
print("   ✅ Noise Scheduler loaded")

# Enable xformers jika tersedia
if CONFIG["enable_xformers"]:
    try:
        unet.enable_xformers_memory_efficient_attention()
        print("   ✅ xFormers memory-efficient attention enabled")
    except Exception:
        print("   ⚠️  xFormers tidak tersedia, menggunakan attention standar")


# ---- Setup LoRA ----
print("\n🔧 Configuring LoRA...")

lora_config = LoraConfig(
    r=CONFIG["lora_rank"],
    lora_alpha=CONFIG["lora_alpha"],
    init_lora_weights="gaussian",
    target_modules=[
        "to_k", "to_q", "to_v", "to_out.0",  # Attention layers
        "proj_in", "proj_out",                  # Projection layers
        "ff.net.0.proj", "ff.net.2",           # Feed-forward layers
    ],
    lora_dropout=CONFIG["lora_dropout"],
)

unet = get_peft_model(unet, lora_config)

# Hitung jumlah parameter yang ditraining
trainable_params = sum(p.numel() for p in unet.parameters() if p.requires_grad)
total_params = sum(p.numel() for p in unet.parameters())
print(f"   📊 Trainable parameters: {trainable_params:,} / {total_params:,} "
      f"({100 * trainable_params / total_params:.2f}%)")


# ---- Setup Dataset & DataLoader ----
print("\n📦 Preparing dataset...")

train_dataset = TextImageDataset(
    data_dir=CONFIG["dataset_path"],
    tokenizer=tokenizer,
    size=CONFIG["resolution"],
)

train_dataloader = DataLoader(
    train_dataset,
    batch_size=CONFIG["train_batch_size"],
    shuffle=True,
    num_workers=2,
    pin_memory=True,
    drop_last=True,
)


# ---- Setup Optimizer ----
if CONFIG["use_8bit_adam"]:
    try:
        import bitsandbytes as bnb
        optimizer = bnb.optim.AdamW8bit(
            unet.parameters(),
            lr=CONFIG["learning_rate"],
            weight_decay=1e-2,
        )
        print("   ✅ 8-bit AdamW optimizer (hemat VRAM)")
    except ImportError:
        optimizer = torch.optim.AdamW(
            unet.parameters(),
            lr=CONFIG["learning_rate"],
            weight_decay=1e-2,
        )
        print("   ⚠️  Fallback ke standard AdamW")
else:
    optimizer = torch.optim.AdamW(
        unet.parameters(),
        lr=CONFIG["learning_rate"],
        weight_decay=1e-2,
    )
    print("   ✅ Standard AdamW optimizer")


# ---- Learning Rate Scheduler ----
from torch.optim.lr_scheduler import CosineAnnealingLR, LambdaLR

max_steps = CONFIG["max_train_steps"]
warmup_steps = CONFIG["lr_warmup_steps"]

def lr_lambda(current_step):
    if current_step < warmup_steps:
        return float(current_step) / float(max(1, warmup_steps))
    progress = float(current_step - warmup_steps) / float(max(1, max_steps - warmup_steps))
    return max(0.0, 0.5 * (1.0 + math.cos(math.pi * progress)))

lr_scheduler = LambdaLR(optimizer, lr_lambda)


# ---- Training Loop ----
print(f"\n{'='*60}")
print(f"🚀 MEMULAI TRAINING LoRA")
print(f"{'='*60}")
print(f"   Model:          {model_id}")
print(f"   Dataset size:   {len(train_dataset)} gambar")
print(f"   Batch size:     {CONFIG['train_batch_size']} x {CONFIG['gradient_accumulation_steps']} (grad accum)")
print(f"   Effective batch: {CONFIG['train_batch_size'] * CONFIG['gradient_accumulation_steps']}")
print(f"   Max steps:      {max_steps}")
print(f"   Learning rate:  {CONFIG['learning_rate']}")
print(f"   LoRA rank:      {CONFIG['lora_rank']}")
print(f"   Resolution:     {CONFIG['resolution']}x{CONFIG['resolution']}")
print(f"{'='*60}\n")

# Tracking
global_step = 0
best_loss = float("inf")
loss_history = []

unet.train()

progress_bar = tqdm(total=max_steps, desc="Training", unit="step")

while global_step < max_steps:
    for batch in train_dataloader:
        if global_step >= max_steps:
            break

        # Move to GPU
        pixel_values = batch["pixel_values"].to("cuda", dtype=torch.float16)
        input_ids = batch["input_ids"].to("cuda")

        # 1. Encode gambar ke latent space dengan VAE
        with torch.no_grad():
            latents = vae.encode(pixel_values).latent_dist.sample()
            latents = latents * vae.config.scaling_factor
            latents = latents.to(dtype=torch.float32)

        # 2. Generate random noise
        noise = torch.randn_like(latents)

        # 3. Random timestep untuk setiap gambar
        batch_size = latents.shape[0]
        timesteps = torch.randint(
            0, noise_scheduler.config.num_train_timesteps,
            (batch_size,), device=latents.device
        ).long()

        # 4. Tambahkan noise ke latents (forward diffusion)
        noisy_latents = noise_scheduler.add_noise(latents, noise, timesteps)

        # 5. Encode text prompt
        with torch.no_grad():
            encoder_hidden_states = text_encoder(input_ids)[0]
            encoder_hidden_states = encoder_hidden_states.to(dtype=torch.float32)

        # 6. Prediksi noise dengan UNet
        noise_pred = unet(
            noisy_latents,
            timesteps,
            encoder_hidden_states=encoder_hidden_states,
        ).sample

        # 7. Hitung loss (MSE antara noise asli dan prediksi)
        loss = F.mse_loss(noise_pred.float(), noise.float(), reduction="mean")

        # 8. Backward pass dengan gradient accumulation
        loss = loss / CONFIG["gradient_accumulation_steps"]
        loss.backward()

        if (global_step + 1) % CONFIG["gradient_accumulation_steps"] == 0:
            torch.nn.utils.clip_grad_norm_(unet.parameters(), 1.0)
            optimizer.step()
            lr_scheduler.step()
            optimizer.zero_grad()

        # Logging
        current_loss = loss.item() * CONFIG["gradient_accumulation_steps"]
        loss_history.append(current_loss)

        # Update progress bar
        avg_loss = sum(loss_history[-100:]) / min(len(loss_history), 100)
        progress_bar.set_postfix({
            "loss": f"{current_loss:.4f}",
            "avg_loss": f"{avg_loss:.4f}",
            "lr": f"{lr_scheduler.get_last_lr()[0]:.2e}",
        })
        progress_bar.update(1)

        # Print log setiap 100 steps
        if global_step % 100 == 0:
            print(f"\n   Step {global_step}/{max_steps} | "
                  f"Loss: {current_loss:.4f} | "
                  f"Avg Loss: {avg_loss:.4f} | "
                  f"LR: {lr_scheduler.get_last_lr()[0]:.2e}")

        # Simpan checkpoint
        if (global_step + 1) % CONFIG["save_every_n_steps"] == 0:
            checkpoint_dir = os.path.join(CONFIG["output_dir"], f"checkpoint-{global_step+1}")
            os.makedirs(checkpoint_dir, exist_ok=True)
            unet.save_pretrained(checkpoint_dir)
            print(f"\n   💾 Checkpoint disimpan: {checkpoint_dir}")

        global_step += 1

progress_bar.close()

# ---- Simpan Model Final ----
print(f"\n{'='*60}")
print("💾 Menyimpan model final...")

final_dir = os.path.join(CONFIG["output_dir"], "final_model")
os.makedirs(final_dir, exist_ok=True)

# Simpan LoRA weights
unet.save_pretrained(final_dir)

# Simpan training config
config_save = {**CONFIG, "training_completed": str(datetime.now()), "final_loss": avg_loss}
with open(os.path.join(final_dir, "training_config.json"), "w") as f:
    json.dump(config_save, f, indent=2)

# Simpan loss history
with open(os.path.join(final_dir, "loss_history.json"), "w") as f:
    json.dump(loss_history, f)

print(f"   ✅ Model LoRA disimpan di: {final_dir}")
print(f"   📊 Final average loss: {avg_loss:.4f}")
print(f"{'='*60}")


# ============================================================================
# CELL 6: INFERENCE — TEST GENERATE GAMBAR
# ============================================================================
# Jalankan cell ini setelah training selesai untuk test generate gambar

import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from peft import PeftModel
from IPython.display import display

print("🔄 Loading model untuk inference...")

# Load base pipeline
pipe = StableDiffusionPipeline.from_pretrained(
    CONFIG["base_model"],
    torch_dtype=torch.float16,
    safety_checker=None,
)

# Load LoRA weights
final_dir = os.path.join(CONFIG["output_dir"], "final_model")
pipe.unet = PeftModel.from_pretrained(pipe.unet, final_dir)

# Gunakan DPM++ solver untuk kualitas lebih baik
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
pipe.to("cuda")

# Enable optimasi
try:
    pipe.enable_xformers_memory_efficient_attention()
except Exception:
    pass

print("✅ Model siap untuk inference!\n")

# ---- Generate Gambar ----
test_prompts = [
    "a historical painting of Borobudur temple in ancient Java, golden hour lighting, detailed architecture, cinematic",
    "a historical painting of Indonesian independence proclamation 1945, dramatic lighting, oil painting style",
    "a historical painting of ancient Majapahit kingdom, grand palace, tropical landscape, epic scene",
    "a historical painting of Diponegoro war, battle scene, dramatic, detailed",
    "a historical painting of traditional Javanese court, batik patterns, elegant, detailed illustration",
]

print("🎨 Generating test images...\n")

for i, prompt in enumerate(test_prompts):
    print(f"Prompt {i+1}: \"{prompt[:70]}...\"")

    # Generate
    with torch.no_grad():
        image = pipe(
            prompt=prompt,
            negative_prompt="blurry, low quality, distorted, deformed, ugly, bad anatomy",
            num_inference_steps=30,
            guidance_scale=7.5,
            width=CONFIG["resolution"],
            height=CONFIG["resolution"],
            generator=torch.Generator("cuda").manual_seed(CONFIG["seed"] + i),
        ).images[0]

    # Simpan gambar
    save_path = os.path.join(CONFIG["output_dir"], f"test_output_{i+1}.png")
    image.save(save_path)

    # Tampilkan di Colab
    display(image)
    print(f"   💾 Disimpan: {save_path}\n")

print("✅ Semua test images berhasil di-generate!")


# ============================================================================
# CELL 7: EXPORT MODEL UNTUK PRODUCTION
# ============================================================================
# Merge LoRA weights ke base model dan export sebagai safetensors

import torch
from diffusers import StableDiffusionPipeline
from peft import PeftModel
import shutil

print("🔄 Merging LoRA weights ke base model...")

# Load base model
pipe = StableDiffusionPipeline.from_pretrained(
    CONFIG["base_model"],
    torch_dtype=torch.float16,
    safety_checker=None,
)

# Load LoRA
final_dir = os.path.join(CONFIG["output_dir"], "final_model")
pipe.unet = PeftModel.from_pretrained(pipe.unet, final_dir)

# Merge LoRA weights ke base model
pipe.unet = pipe.unet.merge_and_unload()

print("   ✅ LoRA weights merged!")

# Simpan merged model
merged_dir = os.path.join(CONFIG["output_dir"], "merged_model")
pipe.save_pretrained(merged_dir, safe_serialization=True)

print(f"   💾 Merged model disimpan di: {merged_dir}")
print(f"\n📁 Struktur output:")
print(f"   {CONFIG['output_dir']}/")
print(f"   ├── final_model/          ← LoRA weights saja (kecil, ~50-200MB)")
print(f"   ├── merged_model/         ← Full model (besar, ~4-5GB)")
print(f"   ├── checkpoint-*/         ← Training checkpoints")
print(f"   └── test_output_*.png     ← Test generated images")

# ---- Juga simpan LoRA weights saja sebagai single file ----
print(f"\n📦 Untuk penggunaan dengan Chronocanvas backend,")
print(f"   gunakan LoRA weights di: {final_dir}")
print(f"   atau merged model di: {merged_dir}")
print(f"\n✅ Export selesai! Model siap digunakan.")


# ============================================================================
# CELL 8 (BONUS): VISUALISASI TRAINING LOSS
# ============================================================================

import json
import matplotlib.pyplot as plt

# Load loss history
loss_path = os.path.join(CONFIG["output_dir"], "final_model", "loss_history.json")
with open(loss_path, "r") as f:
    loss_history = json.load(f)

# Plot
fig, axes = plt.subplots(1, 2, figsize=(16, 5))

# Raw loss
axes[0].plot(loss_history, alpha=0.3, color="steelblue", linewidth=0.5)
# Moving average
window = min(100, len(loss_history) // 10)
if window > 1:
    moving_avg = [
        sum(loss_history[max(0, i-window):i+1]) / min(i+1, window)
        for i in range(len(loss_history))
    ]
    axes[0].plot(moving_avg, color="darkblue", linewidth=2, label=f"Moving Avg ({window})")
axes[0].set_xlabel("Step")
axes[0].set_ylabel("Loss")
axes[0].set_title("Training Loss")
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# Loss distribution
axes[1].hist(loss_history[-500:], bins=50, color="steelblue", alpha=0.7, edgecolor="white")
axes[1].set_xlabel("Loss")
axes[1].set_ylabel("Frequency")
axes[1].set_title("Loss Distribution (Last 500 Steps)")
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
save_path = os.path.join(CONFIG["output_dir"], "training_loss_plot.png")
plt.savefig(save_path, dpi=150, bbox_inches="tight")
plt.show()

print(f"📊 Loss plot disimpan: {save_path}")
