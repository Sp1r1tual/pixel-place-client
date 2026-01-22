# Pixel Place (Client)

**Pixel Place** is an interactive online platform where users collaborate to create a massive pixel canvas – one pixel at a time. Inspired by projects like [Reddit r/place](https://www.reddit.com/r/place/), [w/place](https://wplace.live/), and other collective art experiments, it turns chaos and creativity into a living digital mosaic.

---

## Concept

**Pixel Place isn’t just a project – it’s a social experiment.** It’s about coexistence on a single canvas, where hundreds of users shape a shared digital world – sometimes chaotic, sometimes beautiful, always alive.

It’s pixel democracy: **each user gets one pixel, but together, they build art.**

---

## About the Project

This is the author’s second full-fledged project, and the MVP was built in just 10 days. The project allowed the author to practice WebSockets, real-time collaboration, and state synchronization. Ever since starting programming, the author dreamed of creating a project like this – a digital canvas shaped by lot of users simultaneously.

---

## Features

- 🧱 Live collaborative canvas – see others’ updates instantly via WebSockets
- 🔐 JWT authentication – secure login, account activation via email, and password recovery
- 🎨 Color palette – choose from a curated set of colors
- 🔍 Pixel info – view details about each pixel on the canvas
- 🔋 Energy system – each pixel placement consumes energy that regenerates over time
- 👩‍🦰 User profiles – displaying statistics and users avatars
- 🪙 Shop – users have the ability to purchase upgrades with in-game currency
- 🌍 Localization – support for three languages to reach a wider audience

---

## Tech Stack

- React
- TypeScript
- React Router
- Canvas
- Zustand
- Axios
- Socket.IO Client
- i18next
- React Toastify
- React Loading Skeleton
- React Error Boundary

**Architecture**: Client ↔ (Main API - Mail API) ↔ Database

---

## Future Plans

- **Leaderboard system** – global ranking based on activity, precision, and contribution streaks; highlights top creators and pixel warriors.

- **Daily bonuses & streak rewards** – log in daily to earn cooldown reductions, cosmetic effects, or limited-time colors.

- **Moderation tools** – community-driven reporting and restoration systems to prevent vandalism and maintain fair play.

- **Seasonal events & limited challenges** – themed canvases, world resets, or time-limited events that bring the community together in bursts of creativity.

- **Complete documentation** – provide full and detailed documentation for the client

---

## License

Currently, this project does not include a formal license. All rights are reserved by the author.

If you plan to use, modify, or distribute this project, please contact the author for permission.

Built with ❤️ by the Pixel Place community
