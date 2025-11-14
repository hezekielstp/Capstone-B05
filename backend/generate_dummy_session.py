import sys
import os
import random
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load .env
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL") or os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")

if not MONGO_URL:
    print("ERROR: MONGO_URL tidak ditemukan di file .env")
    sys.exit(1)

# Ambil userId dari argumen Node.js
if len(sys.argv) < 2:
    print("ERROR: Tidak ada userId yang dikirim dari backend.")
    sys.exit(1)

user_id = sys.argv[1]
print(f"RUNNING: Script dijalankan untuk userId: {user_id}")

# Koneksi ke MongoDB
try:
    client = MongoClient(MONGO_URL)
    db = client.get_database()
    collection = db["eegsessions"]
    print("SUCCESS: Koneksi MongoDB berhasil.")
except Exception as e:
    print("ERROR: Gagal konek ke MongoDB:", e)
    sys.exit(1)

# Generate 3 dummy data
moods = ["Positif", "Netral", "Negatif"]

dummy_data = []
for i in range(3):
    mood = random.choice(moods)
    photo_path = f"/rekaman/sesi_dummy_{i+1}.png"
    created_at = datetime.utcnow()
    data = {
        "userId": ObjectId(user_id),
        "mood": mood,
        "note": "",
        "photoPath": photo_path,
        "createdAt": created_at,
        "updatedAt": created_at,
    }
    dummy_data.append(data)

# Simpan ke MongoDB
try:
    result = collection.insert_many(dummy_data)
    print(f"SUCCESS: {len(result.inserted_ids)} data dummy berhasil dimasukkan untuk user {user_id}")
except Exception as e:
    print("ERROR: Gagal menyimpan data dummy:", e)
    sys.exit(1)

client.close()
print("DONE: Proses selesai.")
