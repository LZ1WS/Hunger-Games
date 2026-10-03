[
  {
    "id": "forager",
    "name": { "en": "Forager", "ru": "Собиратель" },
    "enabled": true,
    "weights": { "gather": 6, "scout": 2 },
    "scavengeChance": 0.15
  },
  {
    "id": "berserker",
    "name": { "en": "Berserker", "ru": "Берсерк" },
    "enabled": true,
    "weights": { "fight": 6 },
    "damageDealt": 1.2,
    "damageTaken": 0.9,
    "extraAction": { "stat": "health", "below": 30, "max": 1 }
  },
  {
    "id": "tough",
    "name": { "en": "Tough", "ru": "Живучий" },
    "enabled": true,
    "damageTaken": 0.85,
    "upkeep": { "food": -1, "energy": -1 },
    "coldResist": 2
  },
  {
    "id": "elusive",
    "name": { "en": "Elusive", "ru": "Неуловимый" },
    "enabled": true,
    "targetWeight": 0.5,
    "scavengeChance": 0.1
  },
  {
    "id": "craftsman",
    "name": { "en": "Craftsman", "ru": "Ремесленник" },
    "enabled": true,
    "weights": { "build": 6 },
    "upkeep": { "food": -1 }
  },
  {
    "id": "hunter",
    "name": { "en": "Hunter", "ru": "Охотник" },
    "enabled": true,
    "weights": { "scout": 4, "gather": 2 },
    "damageDealt": 1.15
  }
]