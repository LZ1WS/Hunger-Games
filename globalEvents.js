module.exports = { GLOBAL_EVENTS: [
  {
    "id": "the_flood",
    "mode": "replace",
    "chance": 0.1,
    "weight": 10,
    "duration": {
      "type": "full_days",
      "value": 2
    },
    "tpl": {
      "en": "Torrential rain swells the rivers. The arena begins to flood.",
      "ru": "Проливной дождь вздувает реки. Арена начинает тонуть."
    },
    "endTpl": {
      "en": "The waters recede. The arena is left muddy and forever changed.",
      "ru": "Вода отступает. Арена остаётся грязной и навсегда изменившейся."
    },
    "replace": {
      "day": [
        {
          "tpl": {
            "en": "{self} scrambles to high ground as the water climbs.",
            "ru": "{self} карабкается на возвышенность, пока вода поднимается."
          },
          "fxSelf": {
            "energy": -10,
            "health": -4,
            "morale": -4
          },
          "weight": 5
        },
        {
          "tpl": {
            "en": "{self} snatches drifting supplies from the brown floodwater.",
            "ru": "{self} выхватывает плывущие припасы из мутной воды."
          },
          "fxSelf": {
            "energy": -8,
            "supplies": 8
          },
          "loot": [
            "water",
            "rations",
            "rope",
            "firewood"
          ],
          "weight": 4
        },
        {
          "tpl": {
            "en": "{self} and {other} cling to the same fallen tree to stay afloat.",
            "ru": "{self} и {other} держатся за одно упавшее дерево, чтобы не утонуть."
          },
          "targets": 2,
          "fxSelf": {
            "energy": -8
          },
          "fxOther": {
            "energy": -8
          },
          "rel": 8,
          "relRev": 8,
          "weight": 3
        },
        {
          "tpl": {
            "en": "The current drags {self} under. They surface gasping.",
            "ru": "Течение утягивает {self} на дно. Он(а) выныривает, жадно глотая воздух."
          },
          "fxSelf": {
            "health": -12,
            "energy": -14,
            "morale": -8
          },
          "weight": 4
        }
      ],
      "night": [
        {
          "tpl": {
            "en": "{self} shivers on a cramped ledge above the black water.",
            "ru": "{self} дрожит на тесном уступе над чёрной водой."
          },
          "fxSelf": {
            "health": -4,
            "energy": -6,
            "morale": -6
          },
          "weight": 4
        },
        {
          "tpl": {
            "en": "{self} finds a dry hollow and sleeps fitfully between storms.",
            "ru": "{self} находит сухую нишу и тревожно дремлет между штормами."
          },
          "fxSelf": {
            "energy": 8,
            "health": -2,
            "morale": -4
          },
          "weight": 3
        },
        {
          "tpl": {
            "en": "In the dark, the water rises again. {self} is forced to move.",
            "ru": "В темноте вода снова поднимается. {self} вынужден(а) идти дальше."
          },
          "fxSelf": {
            "health": -6,
            "energy": -10,
            "morale": -4
          },
          "weight": 4
        }
      ]
    },
    "enabled": true
  },
  {
    "id": "volcanic_eruption",
    "mode": "mixed",
    "chance": 0.08,
    "weight": 8,
    "duration": {
      "type": "days",
      "value": 3
    },
    "tpl": {
      "en": "The mountain erupts with a deafening roar. Ash begins to fall over the arena.",
      "ru": "Гора извергается с оглушительным рёвом. На арену начинает сыпаться пепел."
    },
    "endTpl": {
      "en": "The ash finally settles. The air clears, grey and thick.",
      "ru": "Пепел наконец оседает. Воздух проясняется, серый и густой."
    },
    "mods": {
      "nerf": {
        "health": 2,
        "energy": 3
      }
    },
    "disable": [
      "gather_hunt_ok",
      "scout_ridge",
      "build_fire"
    ],
    "addon": {
      "day": [
        {
          "tpl": {
            "en": "Ash chokes {self}'s lungs and stings their eyes.",
            "ru": "Пепел душит лёгкие {self} и щиплет глаза."
          },
          "fx": {
            "health": -4,
            "morale": -3
          },
          "weight": 5
        },
        {
          "tpl": {
            "en": "{self} wraps a cloth over their face and keeps moving.",
            "ru": "{self} закрывает лицо тканью и продолжает идти."
          },
          "fx": {
            "health": -2,
            "energy": -4
          },
          "weight": 4
        }
      ],
      "night": [
        {
          "tpl": {
            "en": "Grit coats {self}'s sleeping place. Sleep is thin.",
            "ru": "Пыль покрывает место {self}. Сон поверхностный."
          },
          "fx": {
            "health": -3,
            "energy": -4,
            "morale": -2
          },
          "weight": 5
        }
      ]
    },
    "enabled": true
  },
  {
    "id": "heat_wave",
    "mode": "influence",
    "chance": 0.12,
    "weight": 10,
    "duration": {
      "type": "days",
      "value": 2
    },
    "tpl": {
      "en": "A punishing heat wave settles over the arena.",
      "ru": "Над ареной повисает изнуряющая жара."
    },
    "endTpl": {
      "en": "A cool breeze finally breaks the heat.",
      "ru": "Наконец прохладный ветерок разбивает жару."
    },
    "mods": {
      "nerf": {
        "health": 3,
        "energy": 4,
        "food": 2
      }
    },
    "disable": [
      "build_fire",
      "night_cold",
      "gather_hunt_ok"
    ],
    "enabled": true
  },
  {
    "id": "sponsor_bounty",
    "mode": "addon",
    "chance": 0.1,
    "weight": 9,
    "duration": {
      "type": "nights",
      "value": 2
    },
    "tpl": {
      "en": "The sponsors are feeling generous. Parachutes dot the night sky.",
      "ru": "Спонсоры сегодня щедры. Ночное небо усеивают парашюты."
    },
    "endTpl": {
      "en": "The last sponsor parachute drifts down, and the generosity ends.",
      "ru": "Последний парашют спонсора опускается, и щедрость заканчивается."
    },
    "addon": {
      "night": [
        {
          "tpl": {
            "en": "A parachute drops a care package right to {self}.",
            "ru": "Парашют приносит {self} набор припасов прямо в руки."
          },
          "fx": {
            "morale": 5
          },
          "loot": [
            "rations",
            "water",
            "bandage",
            "knife",
            "medkit"
          ],
          "weight": 5
        },
        {
          "tpl": {
            "en": "{self} finds a sponsor package a few steps from their camp.",
            "ru": "{self} находит посылку спонсора в нескольких шагах от лагеря."
          },
          "fx": {
            "morale": 3
          },
          "loot": [
            "water",
            "berries",
            "bandage",
            "firewood"
          ],
          "weight": 5
        }
      ]
    },
    "enabled": true
  },
  {
    "id": "blood_moon",
    "mode": "influence",
    "chance": 0.08,
    "weight": 8,
    "duration": {
      "type": "nights",
      "value": 3
    },
    "tpl": {
      "en": "A blood-red moon rises. Violence hangs in the air.",
      "ru": "Восходит кроваво-красная луна. В воздухе висит насилие."
    },
    "endTpl": {
      "en": "The blood moon sets, and calm returns to the arena.",
      "ru": "Кровавая луна заходит, и на арену возвращается спокойствие."
    },
    "mods": {
      "nerf": {
        "health": 2,
        "morale": 2
      }
    },
    "disable": [
      "night_sleep_ok",
      "night_stars",
      "night_dew",
      "night_watch_friend"
    ],
    "addon": {
      "night": [
        {
          "tpl": {
            "en": "Under the blood moon, {self} and {other} nearly come to blows.",
            "ru": "Под кровавой луной {self} и {other} едва не сходятся в драке."
          },
          "targets": 2,
          "rel": -10,
          "relRev": -10,
          "fxSelf": {
            "morale": -4
          },
          "fxOther": {
            "morale": -4
          },
          "weight": 5
        },
        {
          "tpl": {
            "en": "{self} sharpens their weapon and stares at the moon.",
            "ru": "{self} точит оружие, не сводя глаз с луны."
          },
          "fx": {
            "morale": -3
          },
          "weight": 4
        }
      ]
    },
    "enabled": true
  },
  {
    "id": "famine",
    "mode": "influence",
    "chance": 0.08,
    "weight": 8,
    "duration": {
      "type": "full_days",
      "value": 3
    },
    "tpl": {
      "en": "Crops wither and game vanishes. Famine grips the arena.",
      "ru": "Урожаи чахнут, дичь исчезает. Арену сковывает голод."
    },
    "endTpl": {
      "en": "The first rains return, and life slowly creeps back.",
      "ru": "Возвращаются первые дожди, и жизнь медленно возвращается."
    },
    "mods": {
      "nerf": {
        "food": 5,
        "energy": 3
      }
    },
    "disable": [
      "gather_hunt_ok",
      "gather_fish",
      "gather_trap"
    ],
    "addon": {
      "day": [
        {
          "tpl": {
            "en": "{self} hunts for hours and finds nothing but dust.",
            "ru": "{self} часами охотится и находит лишь пыль."
          },
          "fx": {
            "food": -4,
            "energy": -6,
            "morale": -4
          },
          "weight": 5
        }
      ]
    },
    "enabled": true
  },
  {
    "id": "bounty",
    "mode": "script",
    "chance": 0.1,
    "weight": 8,
    "duration": {
      "type": "days",
      "value": 1
    },
    "tpl": {
      "en": "A bounty has been placed on a tribute. Whoever kills them will be rewarded.",
      "ru": "На трибута назначена награда. Тот, кто убьёт его, получит награду."
    },
    "script": {
      "lang": "mini",
      "onStart": "set target to random\nlog \"A bounty is placed on {target}! Kill them today for a reward.\"",
      "onDeath": "if victim is target\n  set claimed to true\n  if killer is not none\n    reward killer medkit,grenade,rations,shield\n    log \"{killer} claimed the bounty on {victim}!\"\n  end\n  if killer is none\n    log \"The bounty target has died, but no one collected the reward.\"\n  end\nend",
      "onEnd": "if claimed is not true\n  log \"The bounty on {target} has expired. No reward was paid.\"\nend"
    },
    "enabled": true
  },
  {
    "id": "boss_test",
    "mode": "influence",
    "chance": 0.12,
    "weight": 8,
    "duration": {
      "type": "full_days",
      "value": 3
    },
    "tpl": {
      "en": "A monstrous Beast has entered the arena! It hunts the tributes.",
      "ru": "На арену вышел чудовищный Зверь! Он охотится на трибутов."
    },
    "endTpl": {
      "en": "The Beast retreats from the arena.",
      "ru": "Зверь отступает с арены."
    },
    "boss": {
      "name": "Зверь",
      "emoji": "👹",
      "count": 1,
      "attributes": {
        "health": 120,
        "morale": 80,
        "combat": 70,
        "stealth": 50,
        "defense": 0
      },
      "behaviors": [
        "patrol",
        "drain"
      ],
      "weapon": {
        "cat": "melee",
        "dmg": 20
      }
    },
    "enabled": true
  },
  {
    "id": "green_dawn",
    "mode": "influence",
    "chance": 0.25,
    "weight": 10,
    "duration": {
      "type": "endless",
      "value": 1
    },
    "tpl": "Однажды мы всем задаём этот вопрос. Откуда мы взялись? Получившие от кого-то жизнь и безответственно оставленные без присмотра.",
    "endTpl": "Жизнь есть страдание.",
    "boss": {
      "name": "Сомнение",
      "emoji": "🤖",
      "count": 5,
      "attributes": {
        "health": 150,
        "morale": 100,
        "combat": 30,
        "stealth": 30,
        "defense": 0
      },
      "behaviors": [
        "patrol"
      ],
      "weapons": [
        {
          "cat": "melee",
          "dmg": [
            3,
            5
          ],
          "spd": 1
        }
      ]
    },
    "enabled": true,
    "script": {
      "onDamage": "const target = damage.target\n\nif (target && !target.maxHealth && damage.cause === \"boss\") {\n    const health = target.attributes.health;\n\n    if (health === 0) {\n        for (const id of Object.keys(g.boss.participants || {})) {\n            const t = byId(id);\n            if (t && isAlive(t) && t.id !== target.id) { add(t, \"morale\", -6); log(t.name + \" замечает как робот потрошит труп \" + target.name + \"!\"); }\n        }\n    }\n}"
    }
  },
  {
    "id": "amber_dawn",
    "mode": "influence",
    "chance": 0.25,
    "weight": 10,
    "duration": {
      "type": "endless",
      "value": 1
    },
    "tpl": "Переваренная пища, абсолютно взаимозаменяема.",
    "endTpl": "Чтобы жить, мы ели без конца. Неизбежное истощение, мусор...",
    "boss": {
      "name": "Переваренная пища",
      "emoji": "🪱",
      "count": 16,
      "attributes": {
        "health": 35,
        "morale": 100,
        "combat": 10,
        "stealth": 30,
        "defense": 0
      },
      "behaviors": [
        "patrol"
      ],
      "weapons": [
        {
          "cat": "melee",
          "dmg": [
            1,
            3
          ],
          "spd": 1
        }
      ]
    },
    "enabled": true
  },
  {
    "id": "crimson_dawn",
    "mode": "influence",
    "chance": 0.25,
    "weight": 10,
    "duration": {
      "type": "full_days",
      "value": 3
    },
    "tpl": "Давайте зажжём в жизни яркое пламя, словно свечу, что однажды погаснет.",
    "endTpl": "Жизнь означает желание.",
    "boss": {
      "name": "Аплодисменты",
      "emoji": "🤡",
      "count": 6,
      "attributes": {
        "health": 80,
        "morale": 100,
        "combat": 60,
        "stealth": 30,
        "defense": 20
      },
      "behaviors": [
        "drain",
        "steal"
      ],
      "retaliate": false,
      "weapons": []
    },
    "script": {
      "onDamage": "if (damage.target && damage.target.maxHealth) {   // a hunter hit the Boss\n  const prev = memory.lastSquad;                  // count before this hit\n  memory.lastSquad = damage.remainingCount;       // remember the new count\nif (prev != null && damage.remainingCount < prev) {\n  for (const id of Object.keys(g.boss.participants || {})) {\n    const t = byId(id);\n    if (t && isAlive(t)) { add(t, \"health\", -rand(10, 15)); log(t.name + \" задевается взрывом!\"); }\n  }\n}\n}"
    },
    "enabled": true
  },
  {
    "id": "green_noon",
    "mode": "influence",
    "chance": 0.2,
    "weight": 10,
    "duration": {
      "type": "endless",
      "value": 1
    },
    "tpl": "В конце концов, они связаны жизнью. Мы всего лишь отбросили отчанье и гнев.",
    "endTpl": "Мы познаем что есть жизнь и душа своими силами.",
    "boss": {
      "name": "Процесс понимания",
      "emoji": "🤖",
      "count": 5,
      "attributes": {
        "health": 300,
        "morale": 100,
        "combat": 60,
        "stealth": 30,
        "defense": 20
      },
      "behaviors": [
        "patrol"
      ],
      "weapons": [
        {
          "cat": "melee",
          "dmg": [
            1,
            3
          ],
          "spd": 3
        },
        {
          "cat": "ranged",
          "dmg": [
            1,
            2
          ],
          "spd": 1
        }
      ]
    },
    "enabled": true
  },
  {
    "id": "indigo_noon",
    "mode": "influence",
    "chance": 0.2,
    "weight": 6,
    "duration": {
      "type": "nights",
      "value": 3
    },
    "tpl": "Когда ночь наступает в тёмном закоулке, приходят они.",
    "endTpl": "Когда настанет рассвет, ничего уже не останется.",
    "boss": {
      "name": "Чистильщик",
      "emoji": "🧹",
      "count": 12,
      "attributes": {
        "health": 200,
        "morale": 100,
        "combat": 60,
        "stealth": 30,
        "defense": 10
      },
      "behaviors": [
        "patrol",
        "drain"
      ],
      "weapons": [
        {
          "cat": "melee",
          "dmg": [
            4,
            5
          ],
          "spd": 1
        },
        {
          "cat": "melee",
          "dmg": [
            18,
            22
          ],
          "spd": 1
        }
      ]
    },
    "enabled": true
  },
  {
    "id": "purple_noon",
    "mode": "mixed",
    "chance": 0.2,
    "weight": 8,
    "duration": {
      "type": "endless",
      "value": 1
    },
    "tpl": "Лишь низкие поступки были услышаны нами, и мы добивались милосердия и любви к ним.",
    "endTpl": "Мы не сможем понять их, как и они не смогут понять нас.",
    "mods": {
      "nerf": {
        "morale": 10,
        "energy": 10
      }
    },
    "boss": {
      "name": "Великая любовь к нам",
      "emoji": "🪨",
      "count": 6,
      "attributes": {
        "health": 350,
        "morale": 100,
        "combat": 60,
        "stealth": 30,
        "defense": 20
      },
      "behaviors": [
        "drain"
      ],
      "weapons": [
        {
          "cat": "melee",
          "dmg": 1,
          "spd": 6
        }
      ]
    },
    "replace": {
      "day": [
        {
          "tpl": "Монолиты начинают светится и {self} и {others} становится плохо.",
          "targets": [
            1,
            4
          ],
          "weight": 30,
          "target": "random",
          "fxSelf": {
            "health": -10,
            "energy": -10,
            "morale": -10
          },
          "fxOther": {
            "health": -10,
            "energy": -10,
            "morale": -10
          }
        }
      ],
      "night": [
        {
          "tpl": "Монолиты начинают светится и {self} и {others} становится плохо.",
          "targets": [
            1,
            4
          ],
          "weight": 30,
          "target": "random",
          "fxSelf": {
            "health": -10,
            "energy": -10,
            "morale": -10
          },
          "fxOther": {
            "health": -10,
            "energy": -10,
            "morale": -10
          }
        }
      ]
    },
    "script": {
      "onStart": "if (Math.random() < 0.5) {\n  const n = rand(1, 3);                 // random group size between 1 and 3\n  const pool = state.tributes.filter(isAlive).slice();\n  const targets = [];\n  while (targets.length < n && pool.length) {\n    targets.push(pool.splice(rand(0, pool.length - 1), 1)[0]); // draw without repeats\n  }\n\n  for (const target of targets) {\n    add(target, \"health\", -100);            // 100 HP damage\n    log(target.name + \" был раздавлен Монолитом!\");\n  }\n}",
      "onDay": "const n = rand(1, 4);                       // random 1..4 tributes\nconst pool = state.tributes.filter(isAlive).slice();\nfor (let i = 0; i < n && pool.length; i++) {\n  const t = pool.splice(rand(0, pool.length - 1), 1)[0]; // no repeats\n  add(t, \"health\", -10);\n  add(t, \"energy\", -10);\n  add(t, \"morale\", -10);\n  log(t.name + \" становится плохо от сияния Монолитов.\");\n}",
      "onNight": "const n = rand(1, 4);                       // random 1..4 tributes\nconst pool = state.tributes.filter(isAlive).slice();\nfor (let i = 0; i < n && pool.length; i++) {\n  const t = pool.splice(rand(0, pool.length - 1), 1)[0]; // no repeats\n  add(t, \"health\", -10);\n  add(t, \"energy\", -10);\n  add(t, \"morale\", -10);\n  log(t.name + \" становится плохо от сияния Монолитов.\");\n}"
    },
    "enabled": true
  },
  {
    "id": "crimson_noon",
    "mode": "influence",
    "chance": 0.2,
    "weight": 10,
    "duration": {
      "type": "endless",
      "value": 1
    },
    "tpl": "Наше шествие не кончается и мы делимся нашей радостью.",
    "endTpl": "Мы принимаем все удары жизни и саму жизнь, гармонию плоти и более прекрасные отличия.",
    "boss": {
      "name": "Гармония кожи",
      "emoji": "🤡",
      "count": 1,
      "attributes": {
        "health": 550,
        "morale": 100,
        "combat": 60,
        "stealth": 30,
        "defense": 50
      },
      "behaviors": [
        "patrol"
      ],
      "weapons": [
        {
          "cat": "melee",
          "dmg": [
            4,
            9
          ],
          "spd": 1
        },
        {
          "cat": "melee",
          "dmg": [
            7,
            10
          ],
          "spd": 1
        }
      ]
    },
    "enabled": true,
    "script": {
      "onSlay": "for (let i = 0; i < 3; i++) {\n  triggerGlobal('crimson_dawn');\n  log(bossName() + ' разделяется на три Аплодисмента!');\n}"
    }
  }
] };
