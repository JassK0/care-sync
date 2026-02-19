from fastapi import FastAPI

app = FastAPI(title="CareSync API")

@app.get("/api/health")
def health():
    return {"ok": True}
