module.exports = [
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
    }
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
    }
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
    ]
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
    }
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
    }
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
    }
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
    }
  },
  {
    "id": "boss_test",
    "mode": "boss",
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
      "name": {
        "en": "The Beast",
        "ru": "Зверь"
      },
      "emoji": "\u{1F479}",
      "count": 1,
      "attributes": {
        "health": 120,
        "morale": 80,
        "combat": 70,
        "stealth": 50
      },
      "behaviors": [
        "drain",
        "patrol"
      ]
    }
  }
];
