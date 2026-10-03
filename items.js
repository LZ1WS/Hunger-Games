function it(id, name, emoji, cat, opts) {
  return Object.assign({ id, name, emoji, cat, weight: 10 }, opts || {});
}

const ITEMS = [
  // melee
  it("knife", "Knife", "\u{1F52A}", "melee", { dmg: 6, weight: 20, dur: 40, spd: 3 }),
  it("club", "Club", "\u{1F3CF}", "melee", { dmg: 7, weight: 16, dur: 35, spd: 2 }),
  it("machete", "Machete", "\u{1F5E1}\uFE0F", "melee", { dmg: 9, weight: 10, dur: 45, spd: 2 }),
  it("spear", "Spear", "\u{1F531}", "melee", { dmg: 10, weight: 10, dur: 40, spd: 2 }),
  it("axe", "Axe", "\u{1FA93}", "melee", { dmg: 11, weight: 12, dur: 50, spd: 1 }),

  // ranged
  it("bow", "Bow", "\u{1F3F9}", "ranged", { dmg: 9, weight: 10, dur: 45, spd: 2 }),
  it("crossbow", "Crossbow", "\u{1F3AF}", "ranged", { dmg: 12, weight: 5, dur: 40, spd: 1 }),

  // explosive (single use)
  it("grenade", "Grenade", "\u{1F4A3}", "explosive", { dmg: 20, weight: 5, single: true }),
  it("molotov", "Molotov", "\u{1F37E}", "explosive", { dmg: 14, weight: 6, single: true }),
  it("pipe_bomb", "Pipe Bomb", "\u{1F9E8}", "explosive", { dmg: 17, weight: 4, single: true }),

  // tools
  it("rope", "Rope", "\u{1FAA2}", "tool", { weight: 16, dur: 30 }),
  it("net", "Net", "\u{1F945}", "tool", { weight: 10, dur: 25 }),
  it("flint", "Flint & Steel", "\u{1F525}", "tool", { weight: 12, dur: 35, warm: 1 }),
  it("shovel", "Shovel", "\u26CF\uFE0F", "tool", { weight: 8, dur: 30 }),

  // medical (consumed on use)
  it("bandage", "Bandage", "\u{1FA79}", "medical", { heal: 15, weight: 18 }),
  it("pills", "Painkillers", "\u{1F48A}", "medical", { heal: 20, weight: 10 }),
  it("antidote", "Antidote", "\u{1F9EA}", "medical", { heal: 25, weight: 5 }),
  it("medkit", "Medkit", "\u{1F9F0}", "medical", { heal: 35, weight: 6 }),

  // armor
  it("helmet", "Helmet", "\u{1FA96}", "armor", { prot: 3, weight: 8, dur: 25 }),
  it("vest", "Leather Vest", "\u{1F9E5}", "armor", { prot: 4, weight: 12, dur: 30 }),
  it("shield", "Shield", "\u{1F6E1}\uFE0F", "armor", { prot: 6, weight: 9, dur: 40 }),
  it("armor", "Body Armor", "\u{1F9BA}", "armor", { prot: 8, weight: 5, dur: 45 }),
  it("coat", "Warm Coat", "\u{1F9E5}", "armor", { prot: 2, warm: 3, weight: 8, dur: 30 }),
  it("blanket", "Blanket", "\u{1F6CF}\uFE0F", "armor", { prot: 1, warm: 4, weight: 7, dur: 25 }),

  // fuel (burned for warmth)
  it("firewood", "Firewood", "\u{1FAB5}", "fuel", { warm: 3, weight: 14 }),

  // provisions (consumed on use)
  it("berries", "Berries", "\u{1FAD0}", "provisions", { feed: 8, weight: 20 }),
  it("water", "Water Flask", "\u{1F4A7}", "provisions", { feed: 10, weight: 20 }),
  it("bar", "Energy Bar", "\u{1F36B}", "provisions", { feed: 12, weight: 14 }),
  it("rations", "Rations", "\u{1F96B}", "provisions", { feed: 18, weight: 16 }),
  it("meat", "Dried Meat", "\u{1F969}", "provisions", { feed: 22, weight: 12 })
];

const ITEMS_BY_ID = {};
for (const item of ITEMS) ITEMS_BY_ID[item.id] = item;

const WEAPON_CATS = ["melee", "ranged", "explosive"];

module.exports = { ITEMS, ITEMS_BY_ID, WEAPON_CATS };