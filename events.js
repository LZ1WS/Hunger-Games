module.exports = { POOL: [
  {
    "id": "start_cornucopia",
    "cat": "start",
    "phase": "start",
    "tpl": [
      {
        "en": "{self} sprints into the chaos of the Cornucopia, grabs a pack, and dives into the treeline.",
        "ru": "{self} бросается в хаос Рога изобилия, хватает рюкзак и ныряет в лес."
      },
      {
        "en": "The Cornucopia is a storm of bodies and weapons. {self} snatches what they can and runs.",
        "ru": "Рог изобилия — буря тел и оружия. {self} хватает, что может, и бежит."
      },
      {
        "en": "Weapons glint everywhere. {self} grabs the nearest pack and bolts before the mob closes in.",
        "ru": "Оружие блестит повсюду. {self} берёт ближайший рюкзак и уносится прочь, пока толпа не сомкнулась."
      }
    ],
    "weight": 12,
    "targets": 1,
    "fxSelf": {
      "supplies": 18,
      "energy": -8,
      "health": -6
    },
    "loot": [
      "rations",
      "water",
      "knife",
      "bandage"
    ],
    "enabled": true
  },
  {
    "id": "start_clash",
    "cat": "start",
    "phase": "start",
    "tpl": [
      {
        "en": "The gong still echoes. {self} and {other} collide over a weapon at the Cornucopia's base.",
        "ru": "Эхо гонга ещё звучит. {self} и {other} сталкиваются в схватке за оружие у основания Рога изобилия."
      },
      {
        "en": "{self} and {other} lunge for the same blade. Only one walks away.",
        "ru": "{self} и {other} тянутся к одному клинку. Уйти сможет только один."
      },
      {
        "en": "Two tributes, one weapon. {self} and {other} fight for it at the Cornucopia.",
        "ru": "Два трибута, одно оружие. {self} и {other} бьются за него у Рога изобилия."
      }
    ],
    "weight": 12,
    "targets": 2,
    "fxSelf": {
      "health": -14,
      "supplies": 10
    },
    "fxOther": {
      "health": -14
    },
    "rel": -20,
    "relRev": -20,
    "loot": [
      "knife",
      "club"
    ],
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "In the scramble, {self} comes up with the blade. {other} retreats, empty-handed.",
            "ru": "В суматохе клинок достаётся {self}. {other} отступает с пустыми руками."
          }
        ],
        "fxSelf": {
          "health": -8,
          "supplies": 10
        },
        "fxOther": {
          "health": -14
        },
        "loot": [
          "knife",
          "club"
        ],
        "rel": -18,
        "relRev": -22
      },
      {
        "weight": 3,
        "tpl": [
          {
            "en": "The weapon skitters away, and {self} and {other} both lunge — into each other.",
            "ru": "Оружие отлетает в сторону, и {self} и {other} оба бросаются — друг на друга."
          }
        ],
        "fxSelf": {
          "health": -16
        },
        "fxOther": {
          "health": -16
        },
        "rel": -18,
        "relRev": -18
      },
      {
        "tpl": {
          "en": "{others[1]} dives between {self} and {other}, and the fight goes three ways.",
          "ru": "{others[1]} бросается между {self} и {other}, и бой становится тройным."
        },
        "fxSelf": {
          "health": -12
        },
        "fxOther": {
          "health": -12
        },
        "targets": 3,
        "weight": 2,
        "rel": -12,
        "relRev": -12
      }
    ],
    "enabled": true,
    "target": null
  },
  {
    "id": "start_truce",
    "cat": "start",
    "phase": "start",
    "tpl": [
      {
        "en": "Amid the bloodshed, {self} and {other} lock eyes and wordlessly agree not to kill each other. Yet.",
        "ru": "Среди бойни {self} и {other} встречаются взглядами и молча соглашаются пока не убивать друг друга."
      },
      {
        "en": "In the madness, {self} and {other} share a long, silent look — and part ways alive.",
        "ru": "В этом безумии {self} и {other} обмениваются долгим молчаливым взглядом — и расходятся живыми."
      },
      {
        "en": "Both {self} and {other} hesitate. Somehow, neither strikes. They scatter.",
        "ru": "И {self}, и {other} колеблются. Каким-то чудом никто не ударяет. Они разбегаются."
      }
    ],
    "weight": 9,
    "targets": 2,
    "fxSelf": {
      "morale": 6
    },
    "fxOther": {
      "morale": 6
    },
    "rel": 15,
    "relRev": 15,
    "enabled": true
  },
  {
    "id": "start_flee",
    "cat": "start",
    "phase": "start",
    "tpl": [
      {
        "en": "{self} turns and runs the instant the gong sounds, abandoning the Cornucopia entirely.",
        "ru": "{self} разворачивается и бежит в тот же миг, как звучит гонг, полностью бросив Рог изобилия."
      },
      {
        "en": "No heroics. {self} runs the moment the gong dies and vanishes into the woods.",
        "ru": "Без геройства. {self} бежит, едва смолкает гонг, и исчезает в лесу."
      },
      {
        "en": "The safest play: {self} abandons the Cornucopia without looking back.",
        "ru": "Самый безопасный ход: {self} бросает Рог изобилия, не оглядываясь."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "health": -3,
      "morale": -4
    },
    "enabled": true
  },
  {
    "id": "start_scavenge",
    "cat": "start",
    "phase": "start",
    "tpl": [
      {
        "en": "{self} snatches a small blade and a strip of dried meat from the Cornucopia fringe.",
        "ru": "{self} хватает небольшой клинок и полоску вяленого мяса на краю Рога изобилия."
      },
      {
        "en": "Quick hands. {self} grabs a blade and a pouch of dried meat from the pile's edge.",
        "ru": "Быстрые руки. {self} хватает клинок и мешочек вяленого мяса с края кучи."
      },
      {
        "en": "{self} darts in, scoops up supplies, and is gone before anyone reacts.",
        "ru": "{self} метнулся внутрь, прихватил припасы и исчез, пока никто не опомнился."
      }
    ],
    "weight": 10,
    "targets": 1,
    "fxSelf": {
      "supplies": 14,
      "food": 8,
      "health": -5
    },
    "loot": [
      "meat",
      "rations",
      "knife"
    ],
    "enabled": true
  },
  {
    "id": "start_injured",
    "cat": "start",
    "phase": "start",
    "tpl": [
      {
        "en": "A panicked tribute slashes at {self} in the scrum. {self} staggers away, bleeding.",
        "ru": "В суматохе паникующий трибут задевает {self} клинком. {self} отступает, истекая кровью."
      },
      {
        "en": "In the crush, a blade opens a gash on {self}. They claw free and stagger off.",
        "ru": "В давке чей-то клинок рассекает {self}. Он(а) вырывается и, шатаясь, уходит."
      },
      {
        "en": "The bloodbath marks {self} — a deep cut, a stumble, and a desperate escape.",
        "ru": "Бойня оставляет метку на {self} — глубокая рана, спотыкающиеся шаги и отчаянное бегство."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "health": -18,
      "morale": -6,
      "supplies": 4
    },
    "fxProf": {
      "melee": -1
    },
    "enabled": true
  },
  {
    "id": "start_cannon",
    "cat": "start",
    "phase": "start",
    "tpl": [
      {
        "en": "A cannon fires. Someone is already dead. {self} freezes, then moves on, numb.",
        "ru": "Грохочет пушка. Кто-то уже мёртв. {self} замирает, затем идёт дальше, оглушённый."
      },
      {
        "en": "A cannon. {self} counts the dead and feels their own heart pounding.",
        "ru": "Пушечный выстрел. {self} считает погибших и чувствует, как колотится собственное сердце."
      },
      {
        "en": "The first cannon of the Games. {self} lets out a breath they didn't know they held.",
        "ru": "Первая пушка Игр. {self} выдыхает, даже не заметив, что задерживал дыхание."
      }
    ],
    "weight": 6,
    "targets": 1,
    "fxSelf": {
      "morale": -8
    },
    "enabled": true
  },
  {
    "id": "start_scuffle",
    "cat": "start",
    "phase": "start",
    "tpl": [
      {
        "en": "In the bloodbath, {group} collide in a three-way scuffle.",
        "ru": "В бойне {group} сталкиваются в трёхсторонней потасовке."
      },
      {
        "en": "In the press of bodies, {group} tangle and strike out at each other.",
        "ru": "В толчее тел {group} сплетаются и наносят удары друг другу."
      },
      {
        "en": "Three-way chaos: {group} claw and shove in the bloodbath.",
        "ru": "Трёхсторонний хаос: {group} царапаются и толкаются в бойне."
      }
    ],
    "weight": 6,
    "targets": 3,
    "fxSelf": {
      "health": -12,
      "supplies": 8
    },
    "fxOther": {
      "health": -12
    },
    "rel": -10,
    "relRev": -10,
    "enabled": true
  },
  {
    "id": "start_chaos",
    "cat": "start",
    "phase": "start",
    "tpl": [
      {
        "en": "Chaos at the Cornucopia. {group} lash out blindly at anything that moves.",
        "ru": "Хаос у Рога изобилия. {group} вслепую кидаются на всё, что движется."
      },
      {
        "en": "The Cornucopia descends into pure chaos. {group} lash out at anything that moves.",
        "ru": "Рог изобилия погружается в полный хаос. {group} бьют по всему, что движется."
      },
      {
        "en": "Nothing but screaming and steel. {group} swing wildly in the madness.",
        "ru": "Крики и сталь. {group} бешено размахивают оружием в этом безумии."
      }
    ],
    "weight": 5,
    "targets": [
      3,
      4
    ],
    "fxSelf": {
      "health": -14,
      "morale": -6,
      "supplies": 6
    },
    "fxOther": {
      "health": -10
    },
    "rel": -12,
    "relRev": -12,
    "enabled": true
  },
  {
    "id": "gather_berries",
    "cat": "gather",
    "phase": "day",
    "tpl": [
      {
        "en": "A dense berry thicket rewards {self}'s hands with sweet handfuls.",
        "ru": "Густой куст ягод щедро одаривает руки {self}."
      },
      {
        "en": "{self} spots a berry bush and picks it clean.",
        "ru": "{self} замечает куст ягод и собирает его дочиста."
      },
      {
        "en": "A patch of ripe berries. {self} gathers as many as they can carry.",
        "ru": "Поляна спелых ягод. {self} набирает столько, сколько может унести."
      }
    ],
    "weight": 12,
    "targets": 1,
    "fxSelf": {
      "food": 16,
      "energy": -8
    },
    "scale": {
      "food": "survival"
    },
    "loot": [
      "berries"
    ],
    "enabled": true
  },
  {
    "id": "gather_hunt_ok",
    "cat": "gather",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} stalks and brings down a rabbit with a well-aimed blow.",
        "ru": "{self} выслеживает и метким ударом добывает кролика."
      },
      {
        "en": "{self} reads the tracks and takes the rabbit down in one clean move.",
        "ru": "{self} читает следы и сбивает кролика одним точным движением."
      },
      {
        "en": "Patience pays off: {self} drops a rabbit with a well-thrown stone.",
        "ru": "Терпение окупается: {self} добывает кролика метко брошенным камнем."
      }
    ],
    "weight": 10,
    "targets": 1,
    "fxSelf": {
      "food": 26,
      "energy": -14
    },
    "scale": {
      "food": "survival"
    },
    "loot": [
      "meat"
    ],
    "cond": {
      "skill": {
        "name": "survival",
        "min": 40
      }
    },
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "{self} lands a flawless shot. The rabbit drops where it stands.",
            "ru": "{self} наносит безупречный бросок. Кролик падает на месте."
          }
        ],
        "fxSelf": {
          "food": 28,
          "energy": -12
        },
        "loot": [
          "meat"
        ]
      },
      {
        "weight": 3,
        "targets": 2,
        "tpl": [
          {
            "en": "The kill is hardly made when {other} steps out of the trees, eyes on the prize.",
            "ru": "Едва {self} добивает добычу, из-за деревьев выходит {other}, вцепившись взглядом в трофей."
          }
        ],
        "fxSelf": {
          "food": 14,
          "energy": -12
        },
        "fxOther": {
          "food": 6
        },
        "rel": -12,
        "relRev": -12
      },
      {
        "weight": 2,
        "tpl": [
          {
            "en": "The arrow finds flesh, but the wounded animal drags itself into the brush.",
            "ru": "Стрела находит плоть, но раненый зверь уволакивает себя в кусты."
          }
        ],
        "fxSelf": {
          "food": 6,
          "energy": -14,
          "morale": -4
        }
      }
    ],
    "enabled": true
  },
  {
    "id": "gather_hunt_fail",
    "cat": "gather",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} chases game all day and returns empty-handed, legs aching.",
        "ru": "{self} весь день гоняется за дичью и возвращается ни с чем, с ноющими ногами."
      },
      {
        "en": "{self} hears the game, gives chase, and comes back with nothing.",
        "ru": "{self} слышит дичь, бросается в погоню и возвращается ни с чем."
      },
      {
        "en": "Hours of stalking, one missed throw. {self} returns hungry and tired.",
        "ru": "Часы выслеживания, один промах. {self} возвращается голодным и усталым."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "energy": -16,
      "food": -4,
      "morale": -4
    },
    "cond": {
      "skill": {
        "name": "survival",
        "max": 50
      }
    },
    "enabled": true
  },
  {
    "id": "gather_fish",
    "cat": "gather",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} wades into a cold river and spears a fat fish.",
        "ru": "{self} заходит в холодную реку и пронзает копьём жирную рыбу."
      },
      {
        "en": "{self} stands in the cold river and brings up a fish on the first try.",
        "ru": "{self} стоит в холодной реке и с первой попытки вытаскивает рыбу."
      },
      {
        "en": "A flash of silver — {self} spears a fish in the shallows.",
        "ru": "Вспышка серебра — {self} пронзает рыбу на отмели."
      }
    ],
    "weight": 10,
    "targets": 1,
    "fxSelf": {
      "food": 20,
      "energy": -10,
      "health": -2
    },
    "scale": {
      "food": "survival"
    },
    "loot": [
      "meat"
    ],
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "The spear comes up dripping silver. A fine fish for {self}.",
            "ru": "Копьё выходит из воды, серебрясь. Отличная рыба для {self}."
          }
        ],
        "fxSelf": {
          "food": 22,
          "energy": -10
        },
        "loot": [
          "meat"
        ]
      },
      {
        "weight": 3,
        "tpl": [
          {
            "en": "A slick stone sends {self} into the river, soaked and empty-handed.",
            "ru": "Скользкий камень отправляет {self} в реку — промокшим и ни с чем."
          }
        ],
        "fxSelf": {
          "food": 4,
          "energy": -12,
          "health": -4
        }
      }
    ],
    "enabled": true
  },
  {
    "id": "gather_water",
    "cat": "gather",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} finds a clear spring, drinks deeply, and fills a flask.",
        "ru": "{self} находит чистый родник, пьёт досыта и наполняет флягу."
      },
      {
        "en": "The spring tastes like life. {self} drinks and fills every flask they own.",
        "ru": "Родник на вкус как сама жизнь. {self} пьёт и наполняет все свои фляги."
      },
      {
        "en": "{self} finds running water, gulps it down, and rests a moment.",
        "ru": "{self} находит проточную воду, жадно пьёт и на миг отдыхает."
      }
    ],
    "weight": 10,
    "targets": 1,
    "fxSelf": {
      "food": 10,
      "health": 6
    },
    "loot": [
      "water"
    ],
    "enabled": true
  },
  {
    "id": "gather_trap",
    "cat": "gather",
    "phase": "day",
    "tpl": [
      {
        "en": "A snare {self} set the night before holds a plump, struggling bird.",
        "ru": "В силок, расставленный {self} прошлой ночью, попалась пухлая бьющаяся птица."
      },
      {
        "en": "The snare line twitches — {self} has caught a bird for dinner.",
        "ru": "Леска силков натягивается — {self} поймал птицу на ужин."
      },
      {
        "en": "{self} checks their snares and finds a struggling fowl in one of them.",
        "ru": "{self} проверяет силки и находит в одном из них бьющуюся птицу."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "food": 18,
      "energy": -4
    },
    "scale": {
      "food": "craft"
    },
    "fxProf": {
      "tool": 1
    },
    "loot": [
      "meat",
      "rope"
    ],
    "cond": {
      "skill": {
        "name": "craft",
        "min": 35
      }
    },
    "enabled": true
  },
  {
    "id": "gather_poison",
    "cat": "gather",
    "phase": "day",
    "tpl": [
      {
        "en": "The berries were bitter and wrong. {self} spits them out, stomach churning.",
        "ru": "Ягоды оказались горькими и несъедобными. {self} выплёвывает их, скрутившись от рези в животе."
      },
      {
        "en": "The berries taste wrong almost immediately. {self} spits and spits again.",
        "ru": "Ягоды на вкус неправильные почти сразу. {self} сплёвывает снова и снова."
      },
      {
        "en": "{self} bites into a bitter berry and knows at once it was a mistake.",
        "ru": "{self} откусывает горькую ягоду и сразу понимает, что это была ошибка."
      }
    ],
    "weight": 6,
    "targets": 1,
    "fxSelf": {
      "food": 2,
      "health": -9
    },
    "enabled": true
  },
  {
    "id": "gather_roots",
    "cat": "gather",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} digs up starchy roots, slow but steady work.",
        "ru": "{self} выкапывает крахмалистые коренья — работа медленная, но верная."
      },
      {
        "en": "{self} digs for roots with bare hands and a stick. Slow, honest work.",
        "ru": "{self} выкапывает коренья голыми руками и палкой. Медленная, честная работа."
      },
      {
        "en": "Starchy roots, hard to reach, worth every scrape. {self} keeps digging.",
        "ru": "Крахмалистые коренья, до которых трудно добраться, но оно того стоит. {self} продолжает копать."
      }
    ],
    "weight": 10,
    "targets": 1,
    "fxSelf": {
      "food": 12,
      "energy": -8
    },
    "enabled": true
  },
  {
    "id": "scout_ridge",
    "cat": "scout",
    "phase": "day",
    "tpl": [
      {
        "en": "From a high ridge {self} maps the arena and spots two camps and a distant stockpile.",
        "ru": "С высокого хребта {self} наносит на карту арену и замечает два лагеря и дальний склад припасов."
      },
      {
        "en": "From the ridge, {self} spots camps, a river, and the ruins of the Cornucopia stockpile.",
        "ru": "С хребта {self} видит лагеря, реку и остатки склада у Рога изобилия."
      },
      {
        "en": "A full view of the arena from above. {self} memorises every landmark.",
        "ru": "Арена как на ладони. {self} запоминает каждую примету."
      }
    ],
    "weight": 12,
    "targets": 1,
    "fxSelf": {
      "morale": 6,
      "supplies": 6
    },
    "scale": {
      "morale": "survival"
    },
    "enabled": true
  },
  {
    "id": "scout_steal",
    "cat": "scout",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} creeps into an empty camp and lifts supplies before slipping away.",
        "ru": "{self} пробирается в пустой лагерь, забирает припасы и ускользает."
      },
      {
        "en": "The camp is empty. {self} helps themselves and is gone like a ghost.",
        "ru": "Лагерь пуст. {self} забирает своё и исчезает как призрак."
      },
      {
        "en": "{self} picks the camp clean while no one is watching.",
        "ru": "{self} обчищает лагерь, пока никто не видит."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "supplies": 14,
      "energy": -10
    },
    "loot": [
      "rations",
      "bandage",
      "water",
      "knife"
    ],
    "stat": "thefts",
    "enabled": true
  },
  {
    "id": "scout_lost",
    "cat": "scout",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} wanders into unfamiliar woods and loses hours finding the way back.",
        "ru": "{self} забредает в незнакомые леса и часами ищет обратный путь."
      },
      {
        "en": "The trees all look the same. {self} circles for hours before finding the way back.",
        "ru": "Деревья выглядят одинаково. {self} кружит часами, прежде чем находит обратный путь."
      },
      {
        "en": "{self} wanders deep into the unknown and barely makes it home by dark.",
        "ru": "{self} забредает глубоко в незнакомые места и едва успевает вернуться до темноты."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "energy": -12,
      "morale": -7,
      "food": -4
    },
    "enabled": true
  },
  {
    "id": "scout_cave",
    "cat": "scout",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} discovers a defensible cave hidden behind a waterfall.",
        "ru": "{self} находит защищённую пещеру, скрытую за водопадом."
      },
      {
        "en": "Behind the waterfall, {self} finds a dry cave big enough for shelter.",
        "ru": "За водопадом {self} находит сухую пещеру, достаточно просторную для укрытия."
      },
      {
        "en": "A hidden hollow opens up behind the water. {self} marks it on memory.",
        "ru": "За водой открывается скрытая ниша. {self} запоминает её."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "morale": 8,
      "supplies": 4
    },
    "loot": [
      "water",
      "flint"
    ],
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "Dry, dark, defensible. {self} files the cave away as a refuge.",
            "ru": "Сухо, темно, легко защищаться. {self} запоминает пещеру как убежище."
          }
        ],
        "fxSelf": {
          "morale": 9,
          "supplies": 5
        }
      },
      {
        "weight": 3,
        "tpl": [
          {
            "en": "Something large stirs in the cave's mouth. {self} backs away slowly.",
            "ru": "Что-то большое шевелится у входа в пещеру. {self} медленно отступает."
          }
        ],
        "fxSelf": {
          "health": -5,
          "morale": -6,
          "energy": -6
        }
      }
    ],
    "enabled": true
  },
  {
    "id": "scout_tracks",
    "cat": "scout",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} finds fresh tracks and a dropped knife near a mudflat.",
        "ru": "{self} находит свежие следы и оброненный нож у илистой отмели."
      },
      {
        "en": "Fresh prints in the mud, and a knife someone dropped. {self} pockets it.",
        "ru": "Свежие следы в грязи и нож, который кто-то обронил. {self} забирает его."
      },
      {
        "en": "{self} follows a trail and finds a discarded blade near the river.",
        "ru": "{self} идёт по следу и находит у реки брошенный клинок."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "supplies": 10,
      "combat": 3,
      "energy": -6
    },
    "fxProf": {
      "ranged": 1
    },
    "loot": [
      "knife"
    ],
    "enabled": true
  },
  {
    "id": "scout_near_miss",
    "cat": "scout",
    "phase": "day",
    "tpl": "",
    "weight": 8,
    "targets": 2,
    "fxSelf": {
      "energy": -8,
      "morale": -3
    },
    "enabled": true,
    "fxOther": {},
    "subs": [
      {
        "tpl": [
          "{other} замечает {self} во время разведки. {self} замирает за бревном, но тот выходит на него.",
          "Шорох. {self} замирает, когда {other} выходит на него.",
          "{self} прячется за стволом, затаив дыхание, но шаги {other} приближаются."
        ],
        "targets": 2,
        "weight": 50,
        "script": "if (self.attributes.stealth >= rand(1, 100)) {\n    log(tr(\"scout_stealth\", { self: self.name, other: other.name }));\n} else if (theirFeel >= 20) {\n  addRel(other, self, -rand(1, 5));\n} else if (theirFeel <= -30) {\n  if (other.attributes.combat >= 60) {\n    addRel(other, self, -rand(15, 25));\n    fight(other, self);\n    log(tr(\"scout_fight\", { self: self.name, other: other.name }));\n  } else if (self.attributes.charm >= 50) {\n    addRel(other, self, -rand(10, 15));\n    log(tr(\"scout_charm\", { self: self.name, other: other.name }));\n  } else {\n    addRel(other, self, -rand(1, 10));\n    log(tr(\"scout_confront\", { self: self.name, other: other.name }));\n  }\n} else {\n    log(tr(\"scout_charm\", { self: self.name, other: other.name }));\n}"
      },
      {
        "tpl": [
          "{other} едва не замечает {self} во время разведки. {self} замирает за бревном, пока тот не пройдёт.",
          "Шорох. {self} замирает, когда {other} проходит на расстоянии вытянутой руки.",
          "{self} прячется за стволом, затаив дыхание, пока шаги {other} не стихнут."
        ],
        "targets": 2,
        "weight": 50
      }
    ],
    "target": null
  },
  {
    "id": "build_shelter",
    "cat": "build",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} lashes branches and leaves into a dry, sturdy shelter.",
        "ru": "{self} связывает ветви и листья в сухое, прочное укрытие."
      },
      {
        "en": "{self} weaves branches and moss into a roof that will hold against rain.",
        "ru": "{self} сплетает ветви и мох в крышу, которая выдержит дождь."
      },
      {
        "en": "By dusk {self} has a lean-to, small but solid.",
        "ru": "К закату у {self} есть шалаш — небольшой, но крепкий."
      }
    ],
    "weight": 12,
    "targets": 1,
    "fxSelf": {
      "morale": 8,
      "energy": 4
    },
    "scale": {
      "morale": "craft"
    },
    "fxProf": {
      "tool": 1
    },
    "loot": [
      "rope"
    ],
    "flag": "shelter",
    "enabled": true
  },
  {
    "id": "build_fire",
    "cat": "build",
    "phase": "day",
    "tpl": [
      {
        "en": "Striking flint, {self} coaxes a fire to life and cooks the day's catch.",
        "ru": "Высекая искру, {self} разводит огонь и готовит дневной улов."
      },
      {
        "en": "Sparks catch. {self} feeds the flame and sets a pot over it.",
        "ru": "Искра занялась. {self} раздувает огонь и ставит над ним котелок."
      },
      {
        "en": "{self} gets a fire going and the smell of cooked food fills the camp.",
        "ru": "{self} разводит костёр, и запах еды наполняет лагерь."
      }
    ],
    "weight": 10,
    "targets": 1,
    "fxSelf": {
      "morale": 10,
      "food": 5
    },
    "fxProf": {
      "tool": 1
    },
    "loot": [
      "flint"
    ],
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "The fire catches and {self} manages a hot meal over it.",
            "ru": "Огонь разгорается, и {self} готовит над ним горячую еду."
          }
        ],
        "fxSelf": {
          "morale": 8,
          "food": 8
        }
      },
      {
        "weight": 3,
        "tpl": [
          {
            "en": "The smoke column is visible for miles. {self} douses it, unsettled.",
            "ru": "Столб дыма виден за мили. {self} гасит его, встревоженный."
          }
        ],
        "fxSelf": {
          "morale": -4,
          "supplies": -4
        }
      },
      {
        "weight": 2,
        "tpl": [
          {
            "en": "Twice the fire dies. {self} hunches over the flint until their hands ache.",
            "ru": "Дважды огонь гаснет. {self} склонился над огнивом, пока руки не заныли."
          }
        ],
        "fxSelf": {
          "morale": 2,
          "energy": -6
        }
      }
    ],
    "enabled": true
  },
  {
    "id": "build_snares",
    "cat": "build",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} sets a web of snares around the camp for the days ahead.",
        "ru": "{self} расставляет сеть силков вокруг лагеря на будущие дни."
      },
      {
        "en": "{self} lays a circle of snares where the rabbits run.",
        "ru": "{self} расставляет круг силков там, где бегают кролики."
      },
      {
        "en": "Clever traps, hidden in the undergrowth. {self} sets them and waits.",
        "ru": "Хитрые ловушки, спрятанные в подлеске. {self} ставит их и ждёт."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "supplies": 4
    },
    "scale": {
      "supplies": "craft"
    },
    "fxProf": {
      "tool": 1
    },
    "loot": [
      "rope"
    ],
    "enabled": true
  },
  {
    "id": "build_spear",
    "cat": "build",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} sharpens, fires, and balances a throwing spear.",
        "ru": "{self} затачивает, обжигает и балансирует метательное копьё."
      },
      {
        "en": "{self} takes a long branch and turns it into a weapon.",
        "ru": "{self} берёт длинную ветку и превращает её в оружие."
      },
      {
        "en": "Charred tip, careful balance. {self} hefts a new spear.",
        "ru": "Обожжённый наконечник, выверенный баланс. {self} пробует новое копьё."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "combat": 4,
      "supplies": 6,
      "energy": -6
    },
    "fxProf": {
      "melee": 1
    },
    "loot": [
      "spear"
    ],
    "enabled": true
  },
  {
    "id": "build_stakes",
    "cat": "build",
    "phase": "day",
    "tpl": [
      {
        "en": "Sharpened stakes now ring the camp. {self} sleeps easier knowing.",
        "ru": "Заострённые колья теперь окружают лагерь. {self} спит спокойнее."
      },
      {
        "en": "{self} hammers sharpened stakes around the camp perimeter.",
        "ru": "{self} вбивает заострённые колья по периметру лагеря."
      },
      {
        "en": "A ring of sharp wood now guards the camp. {self} nods, satisfied.",
        "ru": "Кольцо из острого дерева теперь охраняет лагерь. {self} довольно кивает."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "supplies": 8,
      "morale": 5
    },
    "scale": {
      "supplies": "craft"
    },
    "enabled": true
  },
  {
    "id": "build_collapse",
    "cat": "build",
    "phase": "day",
    "tpl": [
      {
        "en": "The half-built frame collapses on {self}, bruising ribs.",
        "ru": "Недоделанный каркас обрушивается на {self}, разбивая рёбра."
      },
      {
        "en": "The frame groans and gives way, burying {self} in a tangle of wood.",
        "ru": "Каркас стонет и поддаётся, погребая {self} под сплетением веток."
      },
      {
        "en": "One bad knot, and the shelter collapses on {self}. Bruised but alive.",
        "ru": "Один плохой узел — и укрытие рушится на {self}. Побитый, но живой."
      }
    ],
    "weight": 6,
    "targets": 1,
    "fxSelf": {
      "health": -9,
      "energy": -10,
      "morale": -5
    },
    "enabled": true
  },
  {
    "id": "build_still",
    "cat": "build",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} rigs a simple solar still and collects clean water.",
        "ru": "{self} сооружает простой солнечный опреснитель и собирает чистую воду."
      },
      {
        "en": "{self} rigs plastic and stones into a solar still. By evening, water.",
        "ru": "{self} сооружает солнечный опреснитель из плёнки и камней. К вечеру — вода."
      },
      {
        "en": "A simple still: plastic, sun, patience. {self} sips the first clean drops.",
        "ru": "Простой опреснитель: плёнка, солнце, терпение. {self} пробует первые чистые капли."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "food": 8
    },
    "scale": {
      "food": "craft"
    },
    "fxProf": {
      "tool": 1
    },
    "loot": [
      "water"
    ],
    "enabled": true
  },
  {
    "id": "fight_ambush",
    "cat": "fight",
    "phase": "day",
    "tpl": [
      {
        "en": "Bursting from the brush, {self} ambushes {other} with a vicious strike.",
        "ru": "Вырвавшись из кустов, {self} с жестоким ударом нападает на {other}."
      },
      {
        "en": "Without warning, {self} explodes from cover and slams into {other}.",
        "ru": "Без предупреждения {self} вырывается из укрытия и обрушивается на {other}."
      },
      {
        "en": "{self} stalks {other} for an hour, then strikes when their back is turned.",
        "ru": "{self} час выслеживает {other}, а затем бьёт, когда тот стоит спиной."
      }
    ],
    "weight": 12,
    "targets": 2,
    "fxSelf": {
      "energy": -12,
      "supplies": 10
    },
    "fxOther": {
      "health": -22,
      "morale": -8
    },
    "rel": -25,
    "relRev": -30,
    "loot": [
      "knife",
      "bow",
      "club",
      "axe"
    ],
    "cond": {
      "relSelf": {
        "max": 0
      }
    },
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "One strike, perfectly placed. {self} drops {other} before they can scream.",
            "ru": "Один удар, нанесённый идеально. {self} сбивает {other} до того, как тот успеет вскрикнуть."
          }
        ],
        "fxOther": {
          "health": -12,
          "morale": -10
        },
        "loot": [
          "knife",
          "axe",
          "bow",
          "club"
        ],
        "rel": -20,
        "relRev": -25
      },
      {
        "weight": 3,
        "tpl": [
          {
            "en": "{other} twists at the last second, and {self} pays for the mistake.",
            "ru": "{other} уворачивается в последний миг, и {self} платит за ошибку."
          }
        ],
        "fxSelf": {
          "health": -8,
          "energy": -6
        },
        "fxOther": {
          "health": -14
        },
        "rel": -20,
        "relRev": -25
      },
      {
        "weight": 2,
        "targets": 3,
        "tpl": [
          {
            "en": "The brush conceals a whole ambush party. {self} takes on {others} at once.",
            "ru": "В кустах прячется целая засада. {self} принимает бой сразу против {others}."
          }
        ],
        "fxSelf": {
          "health": -16,
          "morale": -8
        },
        "fxOther": {
          "health": -6
        },
        "rel": -14,
        "relRev": -18,
        "loot": [
          "knife",
          "bow",
          "water"
        ]
      }
    ],
    "outcome": [
      {
        "when": "other.dead",
        "tpl": {
          "en": "{self} finishes {other} before they can even scream.",
          "ru": "{self} добивает {other}, прежде чем тот успевает закричать."
        }
      }
    ],
    "weaponTpls": {
      "explosive": {
        "en": "{self} detonates a {weapon} right in {other}'s path.",
        "ru": "{self} взрывает {weapon} прямо на пути {other}."
      },
      "ranged": {
        "en": "{self} draws a bead on {other} from cover and fires their {weapon}.",
        "ru": "{self} берёт {other} на прицел из укрытия и стреляет из {weapon}."
      },
      "melee": {
        "en": "{self} erupts from the brush and buries a {weapon} in {other}.",
        "ru": "{self} вырывается из кустов и вонзает {weapon} в {other}."
      }
    },
    "enabled": true
  },
  {
    "id": "fight_duel",
    "cat": "fight",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} and {other} cross blades in a clearing, neither giving ground.",
        "ru": "{self} и {other} скрещивают клинки на поляне, никто не уступает."
      },
      {
        "en": "Steel meets steel. {self} and {other} circle, neither finding an opening.",
        "ru": "Сталь встречает сталь. {self} и {other} кружат, не находя бреши."
      },
      {
        "en": "It's a duel to first blood. {self} and {other} trade careful blows.",
        "ru": "Дуэль до первой крови. {self} и {other} обмениваются осторожными ударами."
      }
    ],
    "weight": 12,
    "targets": 2,
    "fxSelf": {
      "health": -12,
      "energy": -10
    },
    "fxOther": {
      "health": -12,
      "energy": -10
    },
    "rel": -15,
    "relRev": -15,
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "Steel sings. {self} draws first blood from {other}.",
            "ru": "Сталь поёт. {self} открывает счёт, раня {other}."
          },
          {
            "en": "A sharp exchange, and {other} is bleeding first.",
            "ru": "Резкая схватка — и {other} первым оказывается в крови."
          }
        ],
        "fxOther": {
          "health": -14,
          "morale": -6
        },
        "rel": -12,
        "relRev": -15
      },
      {
        "weight": 3,
        "tpl": [
          {
            "en": "A vicious twist, and {other}'s weapon clatters to the ground. {self} stands over it.",
            "ru": "Жестокий приём — и оружие {other} звенит о землю. {self} нависает над ним."
          }
        ],
        "fxOther": {
          "health": -10,
          "morale": -10
        },
        "loot": [
          "knife",
          "club",
          "bow"
        ],
        "rel": -15,
        "relRev": -20
      },
      {
        "weight": 2,
        "targets": 3,
        "tpl": [
          {
            "en": "The duel draws a crowd. {group} end up tangled in a three-way scrap.",
            "ru": "Дуэль привлекает зрителей. {group} оказываются втянутыми в трёхстороннюю потасовку."
          }
        ],
        "fxSelf": {
          "health": -8,
          "energy": -8
        },
        "fxOther": {
          "health": -8,
          "energy": -6
        },
        "rel": -8,
        "relRev": -8
      }
    ],
    "outcome": [
      {
        "when": "other.dead",
        "tpl": {
          "en": "{self} stands over {other}'s fallen body, breathing hard.",
          "ru": "{self} стоит над телом {other}, тяжело дыша."
        }
      },
      {
        "when": "self.dead",
        "tpl": {
          "en": "{self} falls in the duel with {other}, the arena growing quiet.",
          "ru": "{self} падает в дуэли с {other}, и арена затихает."
        }
      }
    ],
    "weaponTpls": {
      "explosive": {
        "en": "{self} hurls a {weapon} at {other}, and the clearing erupts.",
        "ru": "{self} швыряет {weapon} в {other}, и поляну взрывает грохот."
      },
      "ranged": {
        "en": "{self} looses an arrow from their {weapon}, catching {other} in the open.",
        "ru": "{self} пускает стрелу из своего {weapon}, заставая {other} на открытом месте."
      },
      "melee": {
        "en": "{self} closes in, {weapon} flashing, to duel {other}.",
        "ru": "{self} сближается с {other}, сверкая {weapon}, для дуэли."
      }
    },
    "enabled": true
  },
  {
    "id": "fight_chase",
    "cat": "fight",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} charges at {other}, who flees rather than fight.",
        "ru": "{self} несётся на {other}, и тот предпочитает бегство бою."
      },
      {
        "en": "{self} rushes at {other}, who turns and sprints into the trees.",
        "ru": "{self} бросается на {other}, а тот разворачивается и мчится в лес."
      },
      {
        "en": "A charge is enough — {other} breaks and runs from {self}.",
        "ru": "Натиска хватает — {other} ломается и бежит от {self}."
      }
    ],
    "weight": 10,
    "targets": 2,
    "fxSelf": {
      "energy": -8,
      "supplies": 5
    },
    "fxOther": {
      "morale": -10,
      "energy": -8
    },
    "rel": -15,
    "relRev": -28,
    "loot": [
      "knife",
      "club"
    ],
    "cond": {
      "relSelf": {
        "max": 20
      }
    },
    "outcome": [
      {
        "when": "other.dead",
        "tpl": {
          "en": "{self} catches {other} and brings them down before they can flee.",
          "ru": "{self} настигает {other} и сбивает с ног, прежде чем тот успевает бежать."
        }
      },
      {
        "when": "self.dead",
        "tpl": {
          "en": "{self} dies pursuing {other} into the trees.",
          "ru": "{self} погибает, преследуя {other} среди деревьев."
        }
      }
    ],
    "weaponTpls": {
      "explosive": {
        "en": "{self} hurls a {weapon} after the fleeing {other}.",
        "ru": "{self} швыряет {weapon} вдогонку убегающему {other}."
      },
      "ranged": {
        "en": "{self} stops, raises their {weapon}, and looses a shot at {other}.",
        "ru": "{self} останавливается, вскидывает {weapon} и стреляет в {other}."
      },
      "melee": {
        "en": "{self} hunts {other} down, {weapon} in hand.",
        "ru": "{self} преследует {other}, сжимая в руке {weapon}."
      }
    },
    "enabled": true
  },
  {
    "id": "fight_standoff",
    "cat": "fight",
    "phase": "day",
    "tpl": [
      {
        "en": "Neither {self} nor {other} is willing to throw the first blow. Both back off slowly.",
        "ru": "Ни {self}, ни {other} не готовы нанести первый удар. Оба медленно отступают."
      },
      {
        "en": "Both breathe hard. Neither wants this. {self} and {other} back away slowly.",
        "ru": "Оба тяжело дышат. Никому это не нужно. {self} и {other} медленно отступают."
      },
      {
        "en": "A long, tense moment, then both {self} and {other} lower their weapons.",
        "ru": "Долгий напряжённый миг, и оба — {self} и {other} — опускают оружие."
      }
    ],
    "weight": 8,
    "targets": 2,
    "fxSelf": {
      "energy": -6
    },
    "fxOther": {
      "energy": -6
    },
    "rel": -4,
    "relRev": -4,
    "enabled": true
  },
  {
    "id": "fight_beast",
    "cat": "fight",
    "phase": "day",
    "tpl": [
      {
        "en": "A wild animal tears into the camp. {self} fights it off with fire and steel.",
        "ru": "Дикий зверь врывается в лагерь. {self} отбивается огнём и сталью."
      },
      {
        "en": "A wolf lunges from the dark. {self} meets it with fire and steel.",
        "ru": "Волк кидается из темноты. {self} встречает его огнём и сталью."
      },
      {
        "en": "{self} wrestles a beast off the camp, bleeding but victorious.",
        "ru": "{self} отбивает зверя от лагеря — в крови, но победив."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "health": -12,
      "supplies": 10,
      "morale": 6,
      "energy": -8
    },
    "fxProf": {
      "melee": 1
    },
    "loot": [
      "meat"
    ],
    "cond": {
      "skill": {
        "name": "combat",
        "min": 30
      }
    },
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "{self} ends the beast with a clean blow to the throat.",
            "ru": "{self} заканчивает зверя точным ударом в горло."
          }
        ],
        "fxSelf": {
          "health": -8,
          "morale": 8,
          "supplies": 10,
          "energy": -8
        },
        "loot": [
          "meat"
        ],
        "fxProf": {
          "melee": 1
        }
      },
      {
        "weight": 3,
        "tpl": [
          {
            "en": "The beast tears into {self} before it finally dies.",
            "ru": "Зверь раздирает {self}, прежде чем наконец умирает."
          }
        ],
        "fxSelf": {
          "health": -16,
          "morale": 4,
          "energy": -10
        },
        "loot": [
          "meat"
        ]
      }
    ],
    "enabled": true
  },
  {
    "id": "fight_training",
    "cat": "fight",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} drills with their weapon until their arms burn and their aim sharpens.",
        "ru": "{self} тренируется с оружием, пока руки не загораются, а прицел не точится."
      },
      {
        "en": "{self} runs drills until their arms shake and their aim sharpens.",
        "ru": "{self} отрабатывает приёмы, пока руки не дрожат, а прицел не точится."
      },
      {
        "en": "Repetition, repetition. {self} hones their strikes in the clearing.",
        "ru": "Повторение, повторение. {self} оттачивает удары на поляне."
      }
    ],
    "weight": 6,
    "targets": 1,
    "fxSelf": {
      "combat": 5,
      "energy": -9
    },
    "fxProf": {
      "melee": 2,
      "ranged": 1
    },
    "enabled": true
  },
  {
    "id": "fight_brawl",
    "cat": "fight",
    "phase": "day",
    "tpl": [
      {
        "en": "A brawl erupts between {group} over a cache of supplies.",
        "ru": "Из-за тайника с припасами между {group} вспыхивает драка."
      },
      {
        "en": "Supplies scatter as {group} brawl in the dirt.",
        "ru": "Припасы разлетаются, пока {group} дерутся в грязи."
      },
      {
        "en": "A loud, ugly fight over food — {group} end up bruised and gasping.",
        "ru": "Громкая, безобразная драка за еду — {group} остаются побитыми и запыхавшимися."
      }
    ],
    "weight": 6,
    "targets": 3,
    "fxSelf": {
      "health": -12,
      "energy": -10,
      "supplies": 6
    },
    "fxOther": {
      "health": -10,
      "energy": -8
    },
    "rel": -10,
    "relRev": -10,
    "loot": [
      "knife",
      "club",
      "bow",
      "water"
    ],
    "weaponTpls": {
      "explosive": {
        "en": "{group} scatter as {self} pulls the pin on a {weapon}.",
        "ru": "{group} разбегаются, когда {self} выдёргивает чеку из {weapon}."
      },
      "melee": {
        "en": "{group} descend into a knife-and-fist brawl.",
        "ru": "{group} сходятся в драке на кулаках и ножах."
      }
    },
    "enabled": true
  },
  {
    "id": "fight_melee",
    "cat": "fight",
    "phase": "day",
    "tpl": [
      {
        "en": "Steel clashes as {group} trade blows in a three-way scuffle.",
        "ru": "Сталь звенит: {group} обмениваются ударами в трёхсторонней потасовке."
      },
      {
        "en": "Clang! {group} collide in a whirl of fists and blades.",
        "ru": "Звон! {group} сталкиваются в вихре кулаков и клинков."
      },
      {
        "en": "Three-way violence: {group} each give and take savage blows.",
        "ru": "Трёхстороннее насилие: {group} обмениваются жестокими ударами."
      }
    ],
    "weight": 6,
    "targets": 3,
    "fxSelf": {
      "health": -10,
      "energy": -8
    },
    "fxOther": {
      "health": -10,
      "energy": -8
    },
    "rel": -8,
    "relRev": -8,
    "enabled": true
  },
  {
    "id": "fight_gang",
    "cat": "fight",
    "phase": "day",
    "tpl": [
      {
        "en": "An alliance of {others} corners {self} in the treeline.",
        "ru": "Союз {others} загоняет {self} в угол у опушки."
      },
      {
        "en": "A pincer. {self} is cornered by {others}.",
        "ru": "Клещи. {self} зажат в окружении {others}."
      },
      {
        "en": "Numbers tell. {others} close in on {self} from three sides.",
        "ru": "Число решает. {others} сходятся на {self} с трёх сторон."
      }
    ],
    "weight": 3,
    "targets": [
      3,
      4
    ],
    "fxSelf": {
      "health": -18,
      "morale": -6
    },
    "fxOther": {
      "health": -4
    },
    "rel": -12,
    "relRev": -15,
    "cond": {
      "relSelf": {
        "max": 0
      }
    },
    "outcome": [
      {
        "when": "self.dead",
        "tpl": {
          "en": "Overwhelmed, {self} falls as {others} close in.",
          "ru": "Подавленный числом, {self} падает, когда {others} смыкаются."
        }
      }
    ],
    "enabled": true
  },
  {
    "id": "fight_brawl4",
    "cat": "fight",
    "phase": "day",
    "tpl": [
      {
        "en": "The whole clearing turns into a brawl as {group} fly at each other.",
        "ru": "Вся поляна превращается в побоище — {group} набрасываются друг на друга."
      },
      {
        "en": "The clearing erupts — {group} are on each other in seconds.",
        "ru": "Поляна взрывается — {group} сходятся друг с другом за секунды."
      },
      {
        "en": "A four-way riot. {group} swing, dodge, and go down swinging.",
        "ru": "Четверной бунт. {group} бьют, уворачиваются и падают в драке."
      }
    ],
    "weight": 4,
    "targets": 4,
    "fxSelf": {
      "health": -12,
      "energy": -12
    },
    "fxOther": {
      "health": -10,
      "energy": -10
    },
    "rel": -8,
    "relRev": -8,
    "enabled": true
  },
  {
    "id": "social_stories",
    "cat": "social",
    "phase": "day",
    "tpl": [
      {
        "en": "By the fire, {self} and {other} trade stories of home and forget the arena for a moment.",
        "ru": "У костра {self} и {other} рассказывают друг другу о доме и на миг забывают об арене."
      },
      {
        "en": "{self} and {other} share whispers about home under the stars.",
        "ru": "{self} и {other} шепчутся о доме под звёздами."
      },
      {
        "en": "Talk turns to before the Games. {self} and {other} open up by the fire.",
        "ru": "Разговор заходит о жизни до Игр. {self} и {other} раскрываются у костра."
      }
    ],
    "weight": 12,
    "targets": 2,
    "fxSelf": {
      "morale": 9
    },
    "fxOther": {
      "morale": 9
    },
    "rel": 16,
    "relRev": 16,
    "cond": {
      "relSelf": {
        "min": -10
      }
    },
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "A joke lands, and for a moment {self} and {other} laugh like children.",
            "ru": "Шутка попадает в цель, и на миг {self} и {other} смеются как дети."
          }
        ],
        "fxSelf": {
          "morale": 11
        },
        "fxOther": {
          "morale": 11
        },
        "rel": 16,
        "relRev": 16
      },
      {
        "weight": 3,
        "tpl": [
          {
            "en": "The stories turn to the ones they've lost. {self} and {other} sit in shared grief.",
            "ru": "Рассказы сворачивают к тем, кого они потеряли. {self} и {other} сидят в общей печали."
          }
        ],
        "fxSelf": {
          "morale": -4
        },
        "fxOther": {
          "morale": -4
        },
        "rel": 12,
        "relRev": 12
      },
      {
        "weight": 2,
        "tpl": [
          {
            "en": "{self} hums a song from home. {other} joins in, voice shaking.",
            "ru": "{self} напевает песню из дома. {other} подхватывает дрожащим голосом."
          }
        ],
        "fxSelf": {
          "morale": 9,
          "energy": -4
        },
        "fxOther": {
          "morale": 9
        },
        "rel": 14,
        "relRev": 14
      }
    ],
    "enabled": true
  },
  {
    "id": "social_share",
    "cat": "social",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} splits their food with {other}, a small gesture of trust.",
        "ru": "{self} делится едой с {other} — маленький жест доверия."
      },
      {
        "en": "{self} breaks their last portion in two and hands half to {other}.",
        "ru": "{self} делит последнюю порцию пополам и отдаёт половину {other}."
      },
      {
        "en": "Without a word, {self} pushes food toward {other}.",
        "ru": "Молча {self} пододвигает еду к {other}."
      }
    ],
    "weight": 10,
    "targets": 2,
    "fxSelf": {
      "food": -6,
      "morale": 5
    },
    "fxOther": {
      "food": 8
    },
    "rel": 20,
    "relRev": 26,
    "cond": {
      "relSelf": {
        "min": 0
      }
    },
    "enabled": true
  },
  {
    "id": "social_argue",
    "cat": "social",
    "phase": "day",
    "tpl": [
      {
        "en": "A quarrel erupts between {self} and {other} over the last of the supplies.",
        "ru": "Между {self} и {other} вспыхивает ссора из-за последних припасов."
      },
      {
        "en": "Voices rise. {self} and {other} are at each other over the supplies.",
        "ru": "Голоса повышаются. {self} и {other} ссорятся из-за припасов."
      },
      {
        "en": "A sharp exchange turns into a real argument between {self} and {other}.",
        "ru": "Резкая перепалка перерастает в настоящий спор между {self} и {other}."
      }
    ],
    "weight": 8,
    "targets": 2,
    "fxSelf": {
      "morale": -6
    },
    "fxOther": {
      "morale": -6
    },
    "rel": -13,
    "relRev": -13,
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "Words fail. {self} and {other} nearly come to blows before parting.",
            "ru": "Слова кончаются. {self} и {other} едва не доходят до драки, прежде чем разойтись."
          }
        ],
        "fxSelf": {
          "morale": -9
        },
        "fxOther": {
          "morale": -9
        },
        "rel": -16,
        "relRev": -16
      },
      {
        "weight": 3,
        "tpl": [
          {
            "en": "The argument burns out as fast as it flared. Both fall into a grumpy silence.",
            "ru": "Спор затухает так же быстро, как вспыхнул. Оба погружаются в сердитое молчание."
          }
        ],
        "fxSelf": {
          "morale": -4
        },
        "fxOther": {
          "morale": -4
        },
        "rel": -6,
        "relRev": -6
      },
      {
        "weight": 2,
        "targets": 3,
        "tpl": [
          {
            "en": "Shouts bring {group} running, and the camp splits into factions.",
            "ru": "Крики приводят {group}, и лагерь раскалывается на фракции."
          }
        ],
        "fxSelf": {
          "morale": -6
        },
        "fxOther": {
          "morale": -6
        },
        "rel": -8,
        "relRev": -8
      }
    ],
    "enabled": true
  },
  {
    "id": "social_comfort",
    "cat": "social",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} finds {other} weeping and stays with them until they steady.",
        "ru": "{self} находит {other} в слезах и остаётся рядом, пока тот не успокоится."
      },
      {
        "en": "{self} sits beside {other} and says nothing. That's enough.",
        "ru": "{self} садится рядом с {other} и молчит. Этого достаточно."
      },
      {
        "en": "A hand on the shoulder. {self} lets {other} cry it out.",
        "ru": "Рука на плече. {self} позволяет {other} выплакаться."
      }
    ],
    "weight": 8,
    "targets": 2,
    "fxSelf": {
      "morale": 6
    },
    "fxOther": {
      "morale": 9
    },
    "rel": 18,
    "relRev": 20,
    "fxProf": {
      "medical": 1
    },
    "cond": {
      "relSelf": {
        "min": 10
      }
    },
    "enabled": true
  },
  {
    "id": "social_alliance",
    "cat": "social",
    "phase": "day",
    "tpl": [
      {
        "en": "A handshake, sealed in silence. {self} and {other} are allies now.",
        "ru": "Рукопожатие, скреплённое молчанием. Теперь {self} и {other} — союзники."
      },
      {
        "en": "A firm handshake. {self} and {other} swear to watch each other's backs.",
        "ru": "Крепкое рукопожатие. {self} и {other} клянутся прикрывать друг друга."
      },
      {
        "en": "Trust is a rare currency. {self} and {other} just bought some.",
        "ru": "Доверие — редкая валюта. {self} и {other} только что немного купили."
      }
    ],
    "weight": 8,
    "targets": 2,
    "fxSelf": {
      "morale": 8
    },
    "fxOther": {
      "morale": 8
    },
    "rel": 26,
    "relRev": 26,
    "cond": {
      "relSelf": {
        "min": 20
      }
    },
    "enabled": true
  },
  {
    "id": "social_romance",
    "cat": "social",
    "phase": "day",
    "tpl": [
      {
        "en": "Something unspoken passes between {self} and {other} in the firelight.",
        "ru": "В свете костра между {self} и {other} проскальзывает что-то невысказанное."
      },
      {
        "en": "Under the stars, {self} and {other} let the firelight say the rest.",
        "ru": "Под звёздами {self} и {other} позволяют свету костра договорить остальное."
      },
      {
        "en": "Something sparks between {self} and {other}. The fire burns low.",
        "ru": "Что-то вспыхивает между {self} и {other}. Огонь догорает."
      }
    ],
    "weight": 4,
    "targets": 2,
    "fxSelf": {
      "morale": 12
    },
    "fxOther": {
      "morale": 12
    },
    "rel": 30,
    "relRev": 30,
    "cond": {
      "relSelf": {
        "min": 30
      }
    },
    "enabled": true
  },
  {
    "id": "social_distrust",
    "cat": "social",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} keeps {other} at arm's length, certain of betrayal to come.",
        "ru": "{self} держит {other} на расстоянии, уверенный в грядущем предательстве."
      },
      {
        "en": "{self} watches {other} too closely to call them friend.",
        "ru": "{self} слишком пристально следит за {other}, чтобы называть его другом."
      },
      {
        "en": "Kind words, cold eyes. {self} doesn't trust {other} for a second.",
        "ru": "Добрые слова, холодный взгляд. {self} ни секунды не доверяет {other}."
      }
    ],
    "weight": 8,
    "targets": 2,
    "fxSelf": {
      "morale": -3
    },
    "fxOther": {
      "morale": -4
    },
    "rel": -9,
    "relRev": -9,
    "enabled": true
  },
  {
    "id": "social_lead",
    "cat": "social",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} rallies the camp, rationing firewood and lifting everyone's spirits.",
        "ru": "{self} сплачивает лагерь, распределяет дрова и поднимает всем дух."
      },
      {
        "en": "{self} takes charge, splitting tasks and steadying the camp's nerves.",
        "ru": "{self} берёт на себя командование, распределяя дела и успокаивая лагерь."
      },
      {
        "en": "One clear voice cuts through the fear. {self} rallies everyone.",
        "ru": "Один ясный голос пробивается сквозь страх. {self} сплачивает всех."
      }
    ],
    "weight": 6,
    "targets": 1,
    "fxSelf": {
      "morale": 8
    },
    "scale": {
      "morale": "charm"
    },
    "cond": {
      "skill": {
        "name": "charm",
        "min": 40
      }
    },
    "enabled": true
  },
  {
    "id": "social_camp",
    "cat": "social",
    "phase": "day",
    "tpl": [
      {
        "en": "Around the fire, {group} share what little they have.",
        "ru": "У костра {group} делятся тем немногим, что у них есть."
      },
      {
        "en": "Around the shared fire, {group} pass a single canteen.",
        "ru": "У общего костра {group} передают по кругу одну флягу."
      },
      {
        "en": "Trading stories and half their food, {group} share the evening.",
        "ru": "Делясь историями и половиной еды, {group} коротают вечер."
      }
    ],
    "weight": 6,
    "targets": [
      2,
      4
    ],
    "fxSelf": {
      "morale": 6
    },
    "fxOther": {
      "morale": 6
    },
    "rel": 10,
    "relRev": 10,
    "cond": {
      "relSelf": {
        "min": 0
      }
    },
    "enabled": true
  },
  {
    "id": "social_circle",
    "cat": "social",
    "phase": "day",
    "tpl": [
      {
        "en": "A wary circle forms. {group} trade news of the arena.",
        "ru": "Образуется настороженный круг: {group} обмениваются новостями об арене."
      },
      {
        "en": "A wary ring of tributes: {group} trades information about the arena.",
        "ru": "Настороженный круг трибутов: {group} обменивается сведениями об арене."
      },
      {
        "en": "{group} sit in a careful circle, each watching the others.",
        "ru": "{group} сидят в осторожном кругу, каждый следит за остальными."
      }
    ],
    "weight": 5,
    "targets": 3,
    "fxSelf": {
      "morale": 4,
      "energy": -4
    },
    "fxOther": {
      "morale": 4
    },
    "rel": 6,
    "relRev": 6,
    "enabled": true
  },
  {
    "id": "social_alliance3",
    "cat": "social",
    "phase": "day",
    "tpl": [
      {
        "en": "A three-way alliance is sworn between {group}.",
        "ru": "Между {group} заключается тройственный союз."
      },
      {
        "en": "Three voices, one oath. {group} are allies from this hour.",
        "ru": "Три голоса, одна клятва. {group} — союзники с этого часа."
      },
      {
        "en": "A pact is sealed between {group}, sworn on whatever gods are listening.",
        "ru": "Между {group} заключён договор, скреплённый любыми богами, что слышат."
      }
    ],
    "weight": 3,
    "targets": 3,
    "fxSelf": {
      "morale": 8
    },
    "fxOther": {
      "morale": 8
    },
    "rel": 18,
    "relRev": 18,
    "cond": {
      "relSelf": {
        "min": 20
      }
    },
    "enabled": true
  },
  {
    "id": "social_split",
    "cat": "social",
    "phase": "day",
    "tpl": [
      {
        "en": "A quarrel splits the camp as {group} argue over a plan.",
        "ru": "Ссора раскалывает лагерь: {group} спорят о плане."
      },
      {
        "en": "One plan, two sides, shouting. {group} split the camp apart.",
        "ru": "Один план, два лагеря, крик. {group} раскалывают стоянку."
      },
      {
        "en": "The argument turns ugly and {group} storm off in different directions.",
        "ru": "Спор становится гадким, и {group} разбегаются в разные стороны."
      }
    ],
    "weight": 4,
    "targets": 3,
    "fxSelf": {
      "morale": -6
    },
    "fxOther": {
      "morale": -6
    },
    "rel": -8,
    "relRev": -8,
    "enabled": true
  },
  {
    "id": "rest_deep",
    "cat": "rest",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} finds a quiet spot and sleeps like the dead.",
        "ru": "{self} находит тихое место и спит без задних ног."
      },
      {
        "en": "{self} curls up in the leaves and sleeps without a single dream.",
        "ru": "{self} сворачивается в листьях и спит без единого сна."
      },
      {
        "en": "For eight blessed hours, {self} knows nothing but darkness and rest.",
        "ru": "Восемь благословенных часов {self} не знает ничего, кроме темноты и отдыха."
      }
    ],
    "weight": 12,
    "targets": 1,
    "fxSelf": {
      "energy": 24,
      "health": 3,
      "food": -3
    },
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "{self} sleeps so deeply the world forgets them.",
            "ru": "{self} спит так крепко, что мир забывает о нём."
          }
        ],
        "fxSelf": {
          "energy": 28,
          "health": 4,
          "food": -3
        }
      },
      {
        "weight": 3,
        "tpl": [
          {
            "en": "Twice {self} is jolted awake, but the rest between still counts.",
            "ru": "Дважды {self} просыпается от резкого звука, но отдых между этим всё равно засчитывается."
          }
        ],
        "fxSelf": {
          "energy": 16,
          "health": 2,
          "food": -3
        }
      }
    ],
    "enabled": true
  },
  {
    "id": "rest_meditate",
    "cat": "rest",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} sits perfectly still and calms their racing mind.",
        "ru": "{self} замирает неподвижно и успокаивает мечущиеся мысли."
      },
      {
        "en": "{self} breathes in, breathes out, and lets the arena fall away.",
        "ru": "{self} вдыхает, выдыхает и отпускает арену."
      },
      {
        "en": "Stillness. {self} finds a pocket of calm in the chaos.",
        "ru": "Неподвижность. {self} находит островок спокойствия в хаосе."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "morale": 10,
      "energy": 5
    },
    "enabled": true
  },
  {
    "id": "rest_nightmare",
    "cat": "rest",
    "phase": "day",
    "tpl": [
      {
        "en": "Even in daylight, {self} cannot shake the nightmare of the bloodbath.",
        "ru": "Даже днём {self} не может избавиться от кошмара бойни."
      },
      {
        "en": "{self} wakes with a scream caught in their throat, bloodbath still behind their eyes.",
        "ru": "{self} просыпается с криком, застрявшим в горле, а перед глазами — бойня."
      },
      {
        "en": "Daylight can't keep the dream away. {self} shakes it off, barely.",
        "ru": "Дневной свет не может прогнать кошмар. {self} с трудом стряхивает его."
      }
    ],
    "weight": 6,
    "targets": 1,
    "fxSelf": {
      "morale": -9,
      "energy": 5
    },
    "enabled": true
  },
  {
    "id": "rest_restless",
    "cat": "rest",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} tries to rest but hunger gnaws and the mind races.",
        "ru": "{self} пытается отдохнуть, но голод грызёт, а мысли несутся."
      },
      {
        "en": "{self} lies awake, counting sounds instead of sheep.",
        "ru": "{self} лежит без сна, считая звуки вместо овец."
      },
      {
        "en": "Every snap of a twig jars {self} awake. Rest stays out of reach.",
        "ru": "Каждый хруст ветки подбрасывает {self}. Отдых не приходит."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "energy": 5,
      "morale": -8
    },
    "enabled": true
  },
  {
    "id": "rest_daydream",
    "cat": "rest",
    "phase": "day",
    "tpl": [
      {
        "en": "{self} thinks of home and hardens their heart for what is to come.",
        "ru": "{self} думает о доме и закаляет сердце для грядущего."
      },
      {
        "en": "{self} closes their eyes and pictures home until it hurts.",
        "ru": "{self} закрывает глаза и вспоминает дом, пока не становится больно."
      },
      {
        "en": "Memories of a life before the Games give {self} a moment's peace.",
        "ru": "Воспоминания о жизни до Игр дарят {self} минуту покоя."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "morale": 5,
      "energy": 3
    },
    "enabled": true
  },
  {
    "id": "rest_doze",
    "cat": "rest",
    "phase": "day",
    "tpl": [
      {
        "en": "Nothing but a long, empty doze in the shade.",
        "ru": "Только долгая, пустая дрёма в тени."
      },
      {
        "en": "{self} sprawls in the shade and lets the afternoon slide past.",
        "ru": "{self} растягивается в тени и позволяет дню пройти мимо."
      },
      {
        "en": "Nothing to do, nowhere to be. {self} dozes in the warm light.",
        "ru": "Нечем заняться, некуда спешить. {self} дремлет в тёплом свете."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "energy": 10,
      "food": -2
    },
    "enabled": true
  },
  {
    "id": "night_sleep_ok",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "The night is quiet. {self} sleeps soundly and wakes ready.",
        "ru": "Ночь тиха. {self} спит крепко и просыпается готовым."
      },
      {
        "en": "A calm night. {self} sleeps deeply and greets the dawn well-rested.",
        "ru": "Спокойная ночь. {self} спит крепко и встречает рассвет отдохнувшим."
      },
      {
        "en": "No threats, no noise. {self} wakes refreshed for the first time in days.",
        "ru": "Ни угроз, ни шума. {self} просыпается бодрым впервые за дни."
      }
    ],
    "weight": 14,
    "targets": 1,
    "fxSelf": {
      "energy": 22,
      "health": 3
    },
    "enabled": true
  },
  {
    "id": "night_ambush",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "In the dead of night, a blade finds {self} while they sleep.",
        "ru": "Глубокой ночью, пока {self} спит, к нему приходит клинок."
      },
      {
        "en": "A shadow moves in the dark, and a blade finds {self} where they sleep.",
        "ru": "Тень движется в темноте, и клинок находит {self} там, где он(а) спит."
      },
      {
        "en": "They come at night, silent as death. {self} barely wakes in time.",
        "ru": "Они приходят ночью, тихие как смерть. {self} едва успевает проснуться."
      }
    ],
    "weight": 6,
    "targets": 1,
    "fxSelf": {
      "health": -18,
      "supplies": -6,
      "energy": -6
    },
    "fxProf": {
      "melee": -1
    },
    "cond": {
      "skill": {
        "name": "survival",
        "max": 60
      }
    },
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "A sound spooks the attacker. {self} survives the night with a shallow cut.",
            "ru": "Звук отпугивает нападавшего. {self} переживает ночь с неглубоким порезом."
          }
        ],
        "fxSelf": {
          "health": -8,
          "supplies": -4,
          "energy": -4
        }
      },
      {
        "weight": 3,
        "tpl": [
          {
            "en": "The blade sinks deep before {self} can even open their eyes.",
            "ru": "Клинок погружается глубоко, прежде чем {self} успевает открыть глаза."
          }
        ],
        "fxSelf": {
          "health": -20,
          "supplies": -8,
          "energy": -8
        }
      },
      {
        "weight": 2,
        "targets": 2,
        "tpl": [
          {
            "en": "A cry from the dark wakes {other}, who drives the attacker off {self}.",
            "ru": "Крик из темноты будит {other}, и тот отгоняет нападавшего от {self}."
          }
        ],
        "fxSelf": {
          "health": -10,
          "morale": -4,
          "energy": -4
        },
        "fxOther": {
          "energy": -6
        },
        "rel": 14,
        "relRev": 14
      }
    ],
    "enabled": true
  },
  {
    "id": "night_beast",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "A predator circles the camp. {self} drives it off with shouts and sparks.",
        "ru": "Хищник кружит вокруг лагеря. {self} отгоняет его криками и искрами."
      },
      {
        "en": "Glowing eyes at the camp edge. {self} drives the beast off with sparks.",
        "ru": "Светящиеся глаза у края лагеря. {self} отгоняет зверя искрами."
      },
      {
        "en": "Something snarls in the dark. {self} holds a brand high until it retreats.",
        "ru": "Что-то рычит в темноте. {self} держит горящую ветку, пока зверь не отступит."
      }
    ],
    "weight": 6,
    "targets": 1,
    "fxSelf": {
      "health": -5,
      "morale": -4,
      "energy": -8
    },
    "enabled": true
  },
  {
    "id": "night_stars",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "The sky blazes with stars. {self} lies awake, feeling very small.",
        "ru": "Небо усыпано звёздами. {self} лежит без сна, чувствуя себя крошечным."
      },
      {
        "en": "So many stars. {self} wonders which ones are watching them.",
        "ru": "Как много звёзд. {self} гадает, какие из них смотрят на него."
      },
      {
        "en": "The sky is endless. {self} lies beneath it, suddenly very aware of being alone.",
        "ru": "Небо бесконечно. {self} лежит под ним, вдруг остро ощущая одиночество."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "morale": 8
    },
    "enabled": true
  },
  {
    "id": "night_cold",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "The cold bites deep. Without a fire, {self} shivers until dawn.",
        "ru": "Холод пробирает до костей. Без огня {self} дрожит до рассвета."
      },
      {
        "en": "The temperature drops hard. {self} shakes through the darkest hours.",
        "ru": "Температура резко падает. {self} дрожит в самые тёмные часы."
      },
      {
        "en": "No fire, no blanket. {self} hugs their knees and waits for dawn.",
        "ru": "Ни огня, ни одеяла. {self} обнимает колени и ждёт рассвета."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "health": -6,
      "energy": -9,
      "morale": -5
    },
    "cond": {
      "stat": {
        "name": "supplies",
        "max": 40
      }
    },
    "subs": [
      {
        "weight": 4,
        "tpl": [
          {
            "en": "{self} burns the last dry wood and keeps the worst of the chill away.",
            "ru": "{self} сжигает последние сухие дрова и отгоняет самый страшный холод."
          }
        ],
        "fxSelf": {
          "health": -3,
          "energy": -6,
          "morale": -2,
          "supplies": -5
        }
      },
      {
        "weight": 3,
        "tpl": [
          {
            "en": "Nothing to burn. {self} shakes through a frozen, endless night.",
            "ru": "Нечем разжечь огонь. {self} дрожит всю ледяную, бесконечную ночь."
          }
        ],
        "fxSelf": {
          "health": -9,
          "energy": -10,
          "morale": -7
        }
      }
    ],
    "cold": true,
    "enabled": true
  },
  {
    "id": "night_guard",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "{self} takes first watch and keeps the camp safe till midnight.",
        "ru": "{self} заступает в первую смену и хранит лагерь до полуночи."
      },
      {
        "en": "{self} keeps the first watch, ears straining into the dark.",
        "ru": "{self} несёт первую вахту, вслушиваясь в темноту."
      },
      {
        "en": "Someone has to stay awake. Tonight it's {self}, pacing the camp edge.",
        "ru": "Кто-то должен не спать. Сегодня это {self}, шагающий по краю лагеря."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "energy": -9,
      "morale": 5
    },
    "enabled": true
  },
  {
    "id": "night_watch_friend",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "{self} and {other} share the watch, talking quietly to stay awake.",
        "ru": "{self} и {other} делят дозор, тихо переговариваясь, чтобы не заснуть."
      },
      {
        "en": "{self} and {other} pass the night in low voices, keeping each other awake.",
        "ru": "{self} и {other} коротают ночь вполголоса, не давая друг другу уснуть."
      },
      {
        "en": "Two pairs of eyes are better than one. {self} and {other} share the watch.",
        "ru": "Две пары глаз лучше одной. {self} и {other} делят дозор."
      }
    ],
    "weight": 8,
    "targets": 2,
    "fxSelf": {
      "energy": -6,
      "morale": 6
    },
    "fxOther": {
      "energy": -6,
      "morale": 6
    },
    "rel": 13,
    "relRev": 13,
    "cond": {
      "relSelf": {
        "min": 10
      }
    },
    "enabled": true
  },
  {
    "id": "night_theft",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "While {other} sleeps, {self} quietly lifts food from their pack.",
        "ru": "Пока {other} спит, {self} незаметно вытаскивает еду из его рюкзака."
      },
      {
        "en": "A quiet hand in the dark. {self} lifts food from {other}'s pack.",
        "ru": "Тихая рука в темноте. {self} вытаскивает еду из рюкзака {other}."
      },
      {
        "en": "{self} moves like a whisper and takes what {other} will not miss.",
        "ru": "{self} движется как шёпот и забирает то, чего {other} не заметит."
      }
    ],
    "weight": 6,
    "targets": 2,
    "fxSelf": {
      "food": 8,
      "morale": -3
    },
    "fxOther": {
      "food": -8,
      "morale": -6
    },
    "relRev": -22,
    "loot": [
      "rations",
      "water"
    ],
    "stat": "thefts",
    "stealth": "theft",
    "enabled": true
  },
  {
    "id": "night_howls",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "Howls surround the camp all night. No one sleeps easy.",
        "ru": "Вой окружает лагерь всю ночь. Никто не спит спокойно."
      },
      {
        "en": "The howling starts at midnight and doesn't stop. Nobody sleeps.",
        "ru": "Вой начинается в полночь и не прекращается. Никто не спит."
      },
      {
        "en": "Distant wolves, or something worse. {self} grips their weapon all night.",
        "ru": "Далёкие волки — или что-то похуже. {self} всю ночь сжимает оружие."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "morale": -5,
      "energy": -5
    },
    "enabled": true
  },
  {
    "id": "night_dew",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "{self} collects dew from the leaves at first light.",
        "ru": "{self} собирает росу с листьев на рассвете."
      },
      {
        "en": "{self} wipes the leaves at first light and squeezes water into their mouth.",
        "ru": "{self} стирает росу с листьев на рассвете и выдавливает воду в рот."
      },
      {
        "en": "Dawn dew: precious drops collected by {self} into a cup.",
        "ru": "Утренняя роса: драгоценные капли, собранные {self} в чашку."
      }
    ],
    "weight": 6,
    "targets": 1,
    "fxSelf": {
      "food": 4
    },
    "loot": [
      "water"
    ],
    "enabled": true
  },
  {
    "id": "night_recall",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "The anthem plays, and {self} remembers the fallen. Sleep comes hard.",
        "ru": "Звучит гимн, и {self} вспоминает павших. Сон не идёт."
      },
      {
        "en": "The anthem names the fallen. {self} listens, and a weight settles in their chest.",
        "ru": "Гимн называет павших. {self} слушает, и на грудь ложится тяжесть."
      },
      {
        "en": "One by one, the dead are sung. {self} grips the dirt and listens.",
        "ru": "Один за другим поются имена мёртвых. {self} впивается пальцами в землю и слушает."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "morale": -6,
      "energy": 6
    },
    "enabled": true
  },
  {
    "id": "night_campfire",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "{group} keep a small fire burning through the night.",
        "ru": "{group} всю ночь поддерживают небольшой огонь."
      },
      {
        "en": "A low fire, a small circle. {group} share the long night together.",
        "ru": "Тихий огонь, тесный круг. {group} делят долгую ночь вместе."
      },
      {
        "en": "The fire is their only light. {group} keep it fed through the dark.",
        "ru": "Огонь — их единственный свет. {group} подкармливают его всю ночь."
      }
    ],
    "weight": 4,
    "targets": [
      2,
      4
    ],
    "fxSelf": {
      "energy": -6,
      "morale": 5
    },
    "fxOther": {
      "energy": -6,
      "morale": 5
    },
    "rel": 8,
    "relRev": 8,
    "cond": {
      "relSelf": {
        "min": 5
      }
    },
    "enabled": true
  },
  {
    "id": "night_stalked",
    "cat": "night",
    "phase": "night",
    "tpl": [
      {
        "en": "In the dark, {self} feels eyes on them. {others} draw close, weapons ready.",
        "ru": "В темноте {self} чувствует на себе чей-то взгляд. {others} подходят ближе, готовые к бою."
      },
      {
        "en": "Something is out there. {self} feels it, and {others} edge closer, tense.",
        "ru": "Что-то там есть. {self} чувствует это, и {others} подбираются ближе, напряжённые."
      },
      {
        "en": "Eyes in the dark. {self} stands back to back with {others}.",
        "ru": "Глаза в темноте. {self} встаёт спиной к спине с {others}."
      }
    ],
    "weight": 3,
    "targets": 3,
    "fxSelf": {
      "health": -6,
      "morale": -4
    },
    "fxOther": {
      "health": -4,
      "morale": -3
    },
    "rel": 6,
    "relRev": 6,
    "enabled": true
  },
  {
    "id": "survive_storm",
    "cat": "survive",
    "phase": "any",
    "tpl": [
      {
        "en": "A storm lashes the arena, soaking {self} to the bone.",
        "ru": "Буря хлещет арену, промачивая {self} до костей."
      },
      {
        "en": "The storm rolls in and drowns the arena in sheets of rain.",
        "ru": "Шторм накатывает и заливает арену потоками дождя."
      },
      {
        "en": "Thunder splits the sky. {self} is soaked in seconds.",
        "ru": "Гром раскалывает небо. {self} промокает за секунды."
      }
    ],
    "weight": 10,
    "targets": 1,
    "fxSelf": {
      "health": -5,
      "energy": -8,
      "morale": -6
    },
    "enabled": true
  },
  {
    "id": "survive_sun",
    "cat": "survive",
    "phase": "day",
    "tpl": [
      {
        "en": "The sun is merciless. {self} finds shade and water where they can.",
        "ru": "Солнце безжалостно. {self} ищет тень и воду где может."
      },
      {
        "en": "The heat is a weapon. {self} stays in whatever shade they can find.",
        "ru": "Жара — это оружие. {self} держится в любой тени, какую может найти."
      },
      {
        "en": "No mercy from the sun today. {self} drinks little and waits out the peak.",
        "ru": "Сегодня солнце безжалостно. {self} пьёт мало и пережидает пик."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "health": -5,
      "energy": -6
    },
    "enabled": true
  },
  {
    "id": "survive_sick",
    "cat": "survive",
    "phase": "any",
    "tpl": [
      {
        "en": "A fever takes hold of {self}. They tremble through the hours.",
        "ru": "Лихорадка одолевает {self}. Он дрожит часами."
      },
      {
        "en": "Chills, sweat, fever. {self} rides out a bad sickness.",
        "ru": "Озноб, пот, жар. {self} перемогает тяжёлую хворь."
      },
      {
        "en": "{self} wakes shaking and knows they're sick. The arena waits for no one.",
        "ru": "{self} просыпается в дрожи и понимает, что заболел(а). Арена никого не ждёт."
      }
    ],
    "weight": 6,
    "targets": 1,
    "fxSelf": {
      "health": -12,
      "energy": -8,
      "morale": -6
    },
    "enabled": true
  },
  {
    "id": "survive_injury",
    "cat": "survive",
    "phase": "any",
    "tpl": [
      {
        "en": "{self} slips on wet rock and twists an ankle.",
        "ru": "{self} поскальзывается на мокром камне и вывихивает лодыжку."
      },
      {
        "en": "A sharp turn, a slick stone, and {self} goes down hard.",
        "ru": "Резкий поворот, скользкий камень — и {self} жёстко падает."
      },
      {
        "en": "{self} rolls an ankle in the roots and hisses through the pain.",
        "ru": "{self} подворачивает лодыжку на корнях и шипит от боли."
      }
    ],
    "weight": 6,
    "targets": 1,
    "fxSelf": {
      "health": -8,
      "energy": -5
    },
    "fxProf": {
      "medical": -2
    },
    "enabled": true
  },
  {
    "id": "survive_omen",
    "cat": "survive",
    "phase": "any",
    "tpl": [
      {
        "en": "A small bird lands near {self} and sings. A good sign, surely.",
        "ru": "Рядом с {self} садится маленькая птичка и поёт. Наверняка хороший знак."
      },
      {
        "en": "A small bird lands on a branch near {self} and sings its heart out.",
        "ru": "Маленькая птица садится на ветку рядом с {self} и поёт от всей души."
      },
      {
        "en": "It might mean nothing. {self} chooses to read it as a good sign.",
        "ru": "Может, это ничего не значит. {self} предпочитает видеть в этом добрый знак."
      }
    ],
    "weight": 8,
    "targets": 1,
    "fxSelf": {
      "morale": 8
    },
    "enabled": true
  },
  {
    "id": "survive_anthem",
    "cat": "survive",
    "phase": "any",
    "tpl": [
      {
        "en": "{self} hears the anthem drift across the arena and clenches their fists.",
        "ru": "{self} слышит гимн, плывущий над ареной, и сжимает кулаки."
      },
      {
        "en": "The anthem drifts across the arena again. {self} clenches their jaw.",
        "ru": "Гимн снова плывёт над ареной. {self} сжимает челюсти."
      },
      {
        "en": "Music for the dead. {self} stands still until the last note fades.",
        "ru": "Музыка для мёртвых. {self} стоит неподвижно, пока не стихнет последняя нота."
      }
    ],
    "weight": 6,
    "targets": 1,
    "fxSelf": {
      "morale": -5
    },
    "enabled": true
  }
] };
