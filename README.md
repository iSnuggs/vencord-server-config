# ServerConfig

A [Vencord](https://github.com/Vendicated/Vencord) userplugin that applies your preferred notification/DM
defaults automatically whenever you join a new server, including blocking DMs from that server's members.

## Install

Vencord userplugins aren't standalone — Vencord compiles everything in `src/userplugins/` into the client
at build time, so there's no drop-in installer. To use this plugin:

1. Clone [Vencord](https://github.com/Vendicated/Vencord) and follow its
   [dev install guide](https://docs.vencord.dev/installing/).
2. Copy (or `git clone`) this repo's contents into `src/userplugins/ServerConfig/` in your Vencord checkout.
3. `pnpm build`, then inject/reinject as usual.
