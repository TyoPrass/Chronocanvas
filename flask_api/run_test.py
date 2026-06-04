import subprocess
import sys

result = subprocess.run(
    [sys.executable, "app.py"],
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="replace"
)

with open("output_full.log", "w", encoding="utf-8") as f:
    f.write("=== STDOUT ===\n")
    f.write(result.stdout)
    f.write("\n=== STDERR ===\n")
    f.write(result.stderr)
    f.write(f"\n=== EXIT CODE: {result.returncode} ===\n")

print("Log written to output_full.log")
print(f"Exit code: {result.returncode}")
