# PRD: star-freight — sci-fi trading board game, 4-player P2P

## Problem Statement

The cabinet has no multiplayer experiment and no board game. Friends who want
a quick sci-fi trading session have nothing that runs from a single HTML
file, costs nothing to host, and sends nothing to a server — every web board
game out there needs an account, a lobby service, or both.

## Solution

`experiments/star-freight/index.html` — a complete 2D board game in one
file. The host opens the page, draws a scenario, and shares invite links;
up to three friends join by opening a link and pasting one reply blob back
(pure manual-signaled WebRTC, star topology, zero dependencies). Ships roll
dice and warp across a hex starmap with concentric nebula barriers, trade
cargo between Starbases for Space Bucks, kit out with upgrades/equipment/
crew, fight event-spawned pirate packs and each other with opposed rolls,
and race to satisfy the drawn scenario's win condition. Empty seats take
bots, so one visitor can play the whole thing solo from the gallery.

## User Stories

1. As a host, I create a room, see the drawn scenario (or redraw/pick), and
   get one invite link per open seat to share however I like.
2. As a guest, I open an invite link, the page shows me a reply blob to
   send back, and when the host pastes it I land in my seat with the full
   board live.
3. As a player on my turn, I roll for movement points, see exactly which
   sectors I can reach (barriers costing 2 shown honestly), tap a path, and
   my ship warps along it.
4. As a trader docking at a Starbase, I buy and sell cargo lots at that
   base's current prices and shop upgrades/equipment/crew with Space Bucks.
5. As a fighter entering an occupied sector, I choose fight or flee; combat
   is one opposed 2d6 + mods roll; if I lose I watch one random asset go
   and respawn at the nearest Starbase.
6. As a player ending movement on a non-Starbase sector, I draw an event —
   windfall, hazard, market shock, or a pirate pack spawning.
7. As everyone, after the last seat each round I watch pirates hunt 1–2
   sectors toward the nearest ship and force combat on contact.
8. As the winner, the moment my scenario condition is met during the host's
   resolution, the game ends with a victory screen everyone sees.
9. As a host whose guest dropped, that seat goes dormant; I can re-share
   its invite link (same place, same ceremony, state streams back) or hand
   the seat to a bot with one click.
10. As a solo visitor, I create a room, fill the three seats with bots, and
    play a complete game.
11. As a guest whose host vanished, I see an honest "host gone — game over"
    rather than a frozen board.
12. As a gallery visitor, I see star-freight as the twelfth card and the
    header counts twelve worlds again.

## Implementation Decisions

- **Single file, repo conventions.** `experiments/star-freight/index.html`
  with the standard `__logic` script block (pure, `module.exports`-exported)
  and one app script block. No dependencies, file:// friendly (WebRTC
  requires no origin).
- **Engine is pure and host-only.** `initState(config, rng)` builds the
  authored hex map (rings: rim with 4 Starbases, two nebula ring barriers,
  mid ring, core), shuffles decks, seats players/bots.
  `applyIntent(state, seat, intent, rng) → { state, log }` is the single
  rules entry point covering the closed intent set (`roll`, `path`, `buy`,
  `sell`, `shop`, `fight`, `flee`, `endTurn`). `piratePhase(state, rng)`
  moves hunters (greedy hex-distance step, barrier-aware, deterministic
  tie-breaks). `checkWin(state) → seat|null` evaluates the active scenario.
  All RNG is injected (`mulberry32`), so every rule is reproducible in Node.
- **Bot is an intent function.** `botIntent(state, seat) → intent` — a
  conservative trader/fighter policy built only on the public state, called
  by the host for bot seats and botified dropouts. Pure, tested.
- **State sync is whole-state broadcast.** After every applied intent the
  host sends the full JSON state (small: ≤ a few KB) plus an action log line
  to each guest. Guests are pure renderers + intent senders. Rejoin = the
  same broadcast.
- **Signaling.** Offer/answer SDPs are deflate-compressed
  (CompressionStream) and base64url-encoded. Invite = page URL +
  `#sf=<blob>`; reply = bare blob in a copy box. No trickle ICE — gather
  candidates, then emit one blob each way. Seat slots validate that a pasted
  reply matches their pending offer.
- **Rendering.** Canvas for the starmap (flat-top hex grid, ring tint,
  reachable-sector highlight, ship/pirate tokens, warp animation); DOM for
  everything card-shaped (hand, shop, market, scenario, dice, log, lobby).
  Matches the canvas+DOM split every experiment uses.
- **Content scale (one-sitting game).** ~60-sector map, 4 cargo types,
  ~6 scenarios, ~20 events, ~12 shop cards, prices drift per round within
  authored bands. Content lives as data tables in `__logic`.
- **Gallery registration.** Add the card to `experiments/index.html` and
  bump the header count to twelve.

## Testing Decisions

- `experiments/star-freight/star-freight.test.mjs` on the shared harness
  (`loadLogic`); the engine is the test surface: board generation invariants
  (ring structure, barrier costs, Starbase placement), reachability math,
  every intent's happy path + rejection paths (wrong seat, illegal path,
  insufficient funds), combat resolution incl. tie→defender and the
  random-loss table with seeded RNG, defeat respawn at *nearest* Starbase,
  pirate-phase pathing and tie-breaks, market drift bounds, scenario win
  checks (one per scenario type), bot policy returns only legal intents
  (property-style: run N seeded turns, assert legality), full-game
  simulation smoke test (4 bots play to a win under every scenario).
- Structure tests for the app script: RTCPeerConnection + CompressionStream
  present, `#sf=` hash handling, seat-validation, broadcast-on-apply,
  parse-validity, gallery card present.
- WebRTC handshake itself is not unit-testable in Node — acceptance is the
  user's two-browser smoke test; the seat/blob state machine around it IS
  pure and tested.

## Out of Scope

- Any signaling/matchmaking server, CDN library, or hosted relay.
- In-game text/voice chat (players already have an out-of-band channel —
  they needed it to swap blobs).
- Spectators, saved games, reconnect persistence across page reloads.
- Mobile-first layout (playable on desktop; phones best-effort).
- Animations beyond ship warp + dice roll; sound (candidate follow-up).
- Scenario editor / custom decks (data tables invite a future chain).

## Further Notes

- Host-side cheating is structurally possible (host runs the rules) —
  accepted for a friends-table game; noted in the help panel.
- If CompressionStream is unavailable (pre-2023 browsers) the blob falls
  back to uncompressed base64url — links get long but still work.
- The bot policy doubles as a balance probe: the full-game simulation test
  reports rounds-to-win per scenario, an early warning when content tables
  drift out of tune.
