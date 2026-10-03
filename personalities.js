module.exports = [
  { "id": "survivor", "default": true, "name": { "en": "Survivor", "ru": "Выживальщик" }, "weights": { "gather": 6, "build": 2 } },
  { "id": "warrior", "default": true, "name": { "en": "Warrior", "ru": "Воин" }, "weights": { "fight": 10 } },
  { "id": "strategist", "default": true, "name": { "en": "Strategist", "ru": "Стратег" }, "weights": { "scout": 8, "build": 4 } },
  { "id": "loner", "default": true, "name": { "en": "Loner", "ru": "Одиночка" }, "weights": { "scout": 6, "social": -7, "rest": 2 } },
  { "id": "charmer", "default": true, "name": { "en": "Charmer", "ru": "Обаяшка" }, "weights": { "social": 10 } },
  { "id": "optimist", "default": true, "name": { "en": "Optimist", "ru": "Оптимист" }, "weights": { "social": 5, "rest": -3 } },
  { "id": "paranoid", "default": true, "name": { "en": "Paranoid", "ru": "Параноик" }, "weights": { "scout": 6, "fight": 4 } },
  { "id": "caretaker", "default": true, "name": { "en": "Caretaker", "ru": "Опекун" }, "weights": { "social": 6, "gather": 4 } },
  { "id": "hunter", "default": true, "name": { "en": "Hunter", "ru": "Охотник" }, "weights": { "gather": 6, "scout": 4 } },
  { "id": "lazy", "default": true, "name": { "en": "Lazy", "ru": "Лентяй" }, "weights": { "rest": 10 } }
];
