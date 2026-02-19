# Installation Troubleshooting

## Xcode License Agreement Issue

If you see an error like:
```
You have not agreed to the Xcode license agreements. Please run 'sudo xcodebuild -license'
```

**Solution**: Accept the Xcode license agreement:

```bash
sudo xcodebuild -license
```

Then type `agree` when prompted.

## Alternative: Use Pre-built Wheels

If you continue to have issues with building from source, try installing with pre-built wheels:

```bash
pip3 install --only-binary :all: -r requirements.txt
```

## Using a Virtual Environment (Recommended)

To avoid system-wide Python conflicts, use a virtual environment:

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Then run the backend:
```bash
source venv/bin/activate
npm run dev:backend
```

## Python Version Issues

If you're using Python 3.13 and having issues, you can try:

1. **Use Python 3.11 or 3.12** (more stable with current packages):
   ```bash
   # Install Python 3.12 via Homebrew
   brew install python@3.12
   
   # Use it for the project
   python3.12 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Or update to latest package versions** that support Python 3.13:
   ```bash
   pip3 install --upgrade fastapi uvicorn pydantic openai python-dotenv python-multipart httpx
   ```

## Quick Fix: Install Without Building

If you just need to get running quickly:

```bash
# Install without building from source (use pre-built wheels only)
pip3 install --only-binary :all: fastapi uvicorn[standard] "pydantic>=2.8.0" openai python-dotenv python-multipart httpx
```
