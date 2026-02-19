#!/usr/bin/env python3
"""
Quick script to check if .env.local is being loaded correctly
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Try multiple paths to find .env.local
possible_paths = [
    Path(__file__).parent.parent / ".env.local",  # From backend/
    Path(__file__).parent / ".env.local",  # From backend/ (if running from here)
    Path.cwd() / ".env.local",  # Current working directory
    Path.cwd().parent / ".env.local",  # Parent of current directory
]

print("Checking for .env.local file...")
env_loaded = False
for env_path in possible_paths:
    print(f"  Checking: {env_path}")
    if env_path.exists():
        try:
            load_dotenv(env_path, override=True)
            env_loaded = True
            print(f"  ✓ Found and loaded: {env_path}")
            break
        except Exception as e:
            print(f"  ✗ Error loading {env_path}: {e}")
            continue

if not env_loaded:
    print("  ⚠ No .env.local found, trying .env...")
    load_dotenv()

# Check API key
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    api_key = api_key.strip().strip('"').strip("'")
    if api_key == "your_openai_api_key_here":
        print("\n❌ ERROR: OPENAI_API_KEY is still set to placeholder value!")
        print("   Please update .env.local with your actual API key.")
    elif not api_key.startswith("sk-"):
        print(f"\n⚠ WARNING: OPENAI_API_KEY doesn't look valid (should start with 'sk-')")
        print(f"   Current value starts with: {api_key[:10]}...")
    else:
        print(f"\n✓ OPENAI_API_KEY found and looks valid")
        print(f"   Key starts with: {api_key[:7]}...{api_key[-4:]}")
else:
    print("\n❌ ERROR: OPENAI_API_KEY not found in environment variables!")
    print("   Make sure .env.local exists and contains: OPENAI_API_KEY=sk-...")
