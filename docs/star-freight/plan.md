# Plan: star-freight — vertical slices

Each slice: logic → app wiring → tests green (`node --test
experiments/star-freight/star-freight.test.mjs`), committed red → green
(→ refactor). Engine and blob codec are Node-tested; WebRTC handshake and
canvas are structure-tested (browser smoke is the user's acceptance).

## Slice 1 — board + movement math
Axial hex grid, authored ring map (~60 sectors: rim with 4 Starbases, two
nebula barrier rings, mid ring, core), `neighbors`, `moveCost` (barrier 2),
`reachable(from, points)`, `nearestStarbase`. Tests: ring/Starbase
invariants, barrier costs, reachability sets, nearest-base ties.

## Slice 2 — state + turn skeleton
`initState(config, rng)` (seats, ships docked at home Starbases, decks
shuffled via mulberry32, scenario drawn), `applyIntent` core: `roll` →
movement points, `path` validated + ship moves, `endTurn` advances seat,
round rollover calls pirate-phase/win-check hooks (stubs). Rejections:
wrong seat, wrong phase, illegal path. Tests for all of the above.

## Slice 3 — market + economy
Cargo types, per-Starbase prices drifting per round within authored bands;
`buy`/`sell` intents with funds/hold checks; `shop` intent buying
upgrade/equipment/crew cards that add mods. Tests: trade math, rejection
paths, drift bounds over many seeded rounds, mods accumulation.

## Slice 4 — combat + defeat
Opposed 2d6 + mods, tie → defender; `fight`/`flee`; Talisman loss (random
asset, winner scoops cargo), respawn at nearest Starbase, kill/bounty
tallies for scenarios. Seeded-RNG tests incl. zero-asset defeat.

## Slice 5 — events + pirates
Event deck (~20: windfalls, hazards, market shocks, pirate spawns), drawn
ending on non-Starbase sectors with core-weighted chance; `piratePhase`:
greedy barrier-aware step toward nearest ship, deterministic tie-breaks,
contact combat, bounty on defeat. Tests: effect application, pathing,
tie-breaks, spawn placement.

## Slice 6 — scenarios + win + bots
Scenario deck (~6 across bucks/bounty/kills), `checkWin`; `botIntent`
conservative trader/fighter. Tests: each scenario's win check, bot
legality property (N seeded turns, every intent legal), full-game smoke —
4 bots reach a win under every scenario, reporting rounds-to-win.

## Slice 7 — lobby + signaling
Blob codec (`sdpEncode`/`sdpDecode`: deflate via CompressionStream +
base64url, uncompressed fallback) — pure, Node-tested roundtrip. App:
lobby UI with seat slots, invite link per open seat (`#sf=` hash), reply
boxes with per-seat validation, RTCPeerConnection star wiring,
host broadcast / guest intent loop, dormant + botify + re-invite, host-gone
screen. Structure tests: RTC wiring, hash route, broadcast-on-apply, parse.

## Slice 8 — board render + play UI + gallery
Canvas starmap (flat-top hexes, ring tints, tokens, reachable highlight,
path pick, warp + dice animation), DOM HUD (scenario, market, shop, hand,
log, victory screen). Gallery card + "twelve worlds" count restored.
Structure tests: canvas present, HUD elements, gallery entry, app parses.
