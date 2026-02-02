import traceback
import sys

print("Python version:", sys.version)
try:
    import torch
    print("Torch version:", torch.__version__)
except ImportError:
    print("Failed to import torch")
    traceback.print_exc()

try:
    import transformers
    print("Transformers version:", transformers.__version__)
    from transformers import pipeline
    print("Pipeline imported successfully")
except Exception:
    print("Failed to import pipeline")
    traceback.print_exc()
