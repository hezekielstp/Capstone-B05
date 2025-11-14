import random
import json

# Random 3 mood
moods = ["Positif", "Netral", "Negatif"]
dummy = []

for i in range(3):
    mood = random.choice(moods)
    photo = f"/rekaman/dummy_{i+1}.png"
    dummy.append({"mood": mood, "photoPath": photo})

print(json.dumps(dummy))
