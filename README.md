# Hunger Games Simulator

A local, event-driven Hunger Games inspired simulator with a web UI. Set up a roster of tributes, pick a biome and win condition, and watch the Games resolve themselves — no player input during the match.

Zero dependencies, no build step, vanilla JS frontend.

> **Note:** This project was created primarily with the help of AI. Review the code before relying on it, especially the script-execution features described below.

## Quick start

Requires Node.js >= 16.

```
npm start
```

Then open http://localhost:3000.

The server binds to `127.0.0.1` by default. Override with the `HOST` env var (only do this if you understand the warning below) and the port with `PORT`:

```
PORT=8080 npm start
```

## How it works

- **Setup phase** — add tributes (name, emoji/image, gender, personality, ability, attributes, starting items, alliance), configure the map, pick a win condition, and tune game settings.
- **The Games** — each living tribute picks a daily action automatically, weighted by personality and state. Day/night phases resolve fights, gatherings, stealth thefts, boss hunts, global events, weather, and more. `Start` then `Resolve Day/Night` (or auto-play) advances the match.
- **End** — a winner (or alliance of winners) is declared based on the win condition (`hg`, `survivors`, `boss_slayer`, `hg_plus`).

## Configuration

Game content lives in `config/` as plain JSON and can be hand-edited or managed through the "Game Content" panel in the UI:

- `items.json`, `events.json`, `globalEvents.json` — gameplay content
- `personalities.json`, `abilities.json` — tribute traits and passives
- `packs.json`, `contentPacks.json` — saved tribute setups and content packs
- `locales/<code>.json` — translations; add a file to add a language

If a `config/*.json` file fails to parse, the app falls back to the seed data in the matching `*.js` file in the repo root. `data/game.json` is runtime state, rewritten on every change — treat it as generated.

The engine and content schema are documented in detail in [AGENTS.md](AGENTS.md).

## Project layout

```
server.js        HTTP server + REST API (writes state, serves public/)
engine.js        All game logic (tributes, events, items, globals, i18n)
public/          Vanilla JS/HTML/CSS frontend
config/          User-editable content (JSON) + locales
data/            Runtime state (generated, gitignored)
items.js etc.    Fallback seed data used when config JSON is missing/broken
```

## Security warning

This is a **single-user local tool**. There is **no authentication**, and the API intentionally supports **script execution** (the "code editor" feature — events/globals can run user-authored JS). Anyone who can reach the HTTP port can create events with scripts.

Hardening in place:

- Scripts run inside a [`node:vm`](https://nodejs.org/api/vm.html) sandbox with a 1s timeout. Node globals (`process`, `require`, `Buffer`, …) are **not** exposed — the previous `new Function` escape route (`process.mainModule.require`) is blocked, and runaway loops are killed.
- The server binds to `127.0.0.1` by default, so it is not reachable from the network.

Caveats — `node:vm` is **not a security boundary** (documented escape techniques exist), so this is defense-in-depth, not protection against determined hostile content:

- Never expose the server to the internet or an untrusted network.
- The default loopback bind (`127.0.0.1`) is deliberate. Keep it.
- Do not run it with `HOST=0.0.0.0` unless the machine is fully trusted and firewalled.
- Do not load content packs or event files from people you don't trust.

## License

[MIT](LICENSE)