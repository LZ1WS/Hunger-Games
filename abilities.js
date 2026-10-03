module.exports = [
  {
    "id": "forager",
    "name": {
      "en": "Forager",
      "ru": "Собиратель"
    },
    "enabled": true,
    "cond": null,
    "script": null,
    "weights": {
      "gather": 6,
      "scout": 2
    },
    "scavengeChance": 0.15
  },
  {
    "id": "berserker",
    "name": {
      "en": "Berserker",
      "ru": "Берсерк"
    },
    "enabled": true,
    "cond": null,
    "script": null,
    "weights": {
      "fight": 6
    },
    "damageDealt": 1.2,
    "damageTaken": 0.9,
    "extraAction": {
      "stat": "health",
      "below": 30,
      "max": 1
    }
  },
  {
    "id": "tough",
    "name": {
      "en": "Tough",
      "ru": "Живучий"
    },
    "enabled": true,
    "cond": null,
    "script": null,
    "weights": {},
    "damageTaken": 0.85,
    "upkeep": {
      "food": -1,
      "energy": -1
    },
    "coldResist": 2
  },
  {
    "id": "elusive",
    "name": {
      "en": "Elusive",
      "ru": "Неуловимый"
    },
    "enabled": true,
    "cond": null,
    "script": null,
    "weights": {},
    "scavengeChance": 0.1,
    "targetWeight": 0.5
  },
  {
    "id": "craftsman",
    "name": {
      "en": "Craftsman",
      "ru": "Ремесленник"
    },
    "enabled": true,
    "cond": null,
    "script": null,
    "weights": {
      "build": 6
    },
    "upkeep": {
      "food": -1
    }
  },
  {
    "id": "hunter",
    "name": {
      "en": "Hunter",
      "ru": "Охотник"
    },
    "enabled": true,
    "cond": null,
    "script": null,
    "weights": {
      "scout": 4,
      "gather": 2
    },
    "damageDealt": 1.15
  },
  {
    "id": "adrenaline",
    "name": "Адреналин",
    "enabled": true,
    "cond": null,
    "script": null,
    "weights": {},
    "extraAction": {
      "stat": "health",
      "below": 50,
      "max": 1
    }
  }
];
