import json
import subprocess
import os
import sys
import httpx
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.main import app

POSTMAN_API_KEY = settings.POSTMAN_API_KEY
COLLECTION_ID = settings.POSTMAN_COLLECTION_ID
API_URL = f"https://api.getpostman.com/collections/{COLLECTION_ID}"

def sync_collection():
    if not POSTMAN_API_KEY or not COLLECTION_ID:
        print("Error: POSTMAN_API_KEY and POSTMAN_COLLECTION_ID must be set.")
        return

    print("1. Generatng OpenAPI Spec from FastAPI...")
    openapi_spec = app.openapi()
    with open("openapi.json", "w") as f:
        json.dump(openapi_spec, f)

    print("2. Fetching current collection from Postman (to preserve IDs)...")
    headers = {"X-Api-Key": POSTMAN_API_KEY}
    try:
        response = httpx.get(API_URL, headers=headers)
        response.raise_for_status()
        current_collection = response.json()["collection"]
    except Exception as e:
        print(f"Error fetching collection: {e}")
        return

    with open("current_collection.json", "w") as f:
        json.dump(current_collection, f)

    print("3. Merging changes using openapi-to-postmanv2...")
    # This command uses the Node tool to sync your new spec into the existing collection
    # --sync-options syncExamples=true ensures examples are also updated
    cmd = [
        "openapi2postmanv2", 
        "-s", "openapi.json", 
        "--sync", "current_collection.json", 
        "-o", "synced_collection.json",
        "--sync-options", "syncExamples=true" 
    ]
    
    try:
        subprocess.run(cmd, check=True, shell=True)
    except subprocess.CalledProcessError:
        print("Error running openapi2postmanv2. calculating diff failed.")
        return

    print("4. Uploading synced collection to Postman...")
    with open("synced_collection.json", "r") as f:
        synced_data = json.load(f)

    # Force "Inherit auth from parent" by removing explicit auth on requests
    def enable_inherit_auth(items):
        for item in items:
            if "item" in item:
                enable_inherit_auth(item["item"])
            if "request" in item and isinstance(item["request"], dict) and "auth" in item["request"]:
                del item["request"]["auth"]

    if "item" in synced_data:
        enable_inherit_auth(synced_data["item"])

    update_payload = {"collection": synced_data}
    
    update_response = httpx.put(API_URL, headers=headers, json=update_payload)
    if update_response.status_code == 200:
        print("Success! Collection updated in Postman.")
    else:
        print(f"Error uploading: {update_response.status_code} - {update_response.text}")

    for file in ["openapi.json", "current_collection.json", "synced_collection.json"]:
        if os.path.exists(file):
            os.remove(file)

if __name__ == "__main__":
    sync_collection()