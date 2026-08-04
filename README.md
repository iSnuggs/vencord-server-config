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

## Usage

There's no button and no menu — set your preferences once in **Vencord Settings → Plugins → ServerConfig**,
and from then on they apply automatically the moment you join a new server.

The plugin only acts on servers you joined within the **last 60 seconds**. That window is deliberate: it
means servers loading in when you start Discord are left alone, and only a genuine fresh join triggers it.
Servers you were already in are never touched, so turning the plugin on won't rewrite your existing setup.

## Settings

Defaults are geared toward joining a server quietly.

| Setting | Default | What it does |
| --- | --- | --- |
| **Mute new servers** | On | Mutes the server outright |
| **Notification setting** | Nothing | All Messages / Only Mentions / Nothing |
| **Include highlighted messages** | On | Whether Discord's "highlights" still notify |
| **Suppress @everyone and @here** | On | |
| **Suppress all role @mentions** | On | |
| **Allow mobile push** | Off | |
| **Mute new scheduled events** | On | |
| **Show all channels** | Off | Off collapses the list to unread channels only |
| **Hide muted channels** | On | |
| **Block DMs from server members** | On | Same as unticking "Allow direct messages from server members" in Privacy Settings |
| **Nickname** | *(blank)* | Sets this nickname on join; blank leaves it alone |
| **Auto-accept membership screening** | Off | Experimental — see below |

## Notes

**Nickname** can silently fail if the server doesn't let you change it immediately on join (permissions, or
rules gating). Nothing breaks; the nickname just doesn't apply.

**Auto-accept membership screening** ticks the "I agree to the rules" gate for you. It's off by default and
marked experimental because it depends on an internal verification module that can change without warning.
Also worth thinking about before enabling — it agrees to a server's rules on your behalf, without showing
them to you.

**Blocking DMs** works through a separate part of Discord's settings than the notification options
(a top-level `restricted_guilds` list). The plugin reads your current list and appends to it rather than
replacing it, so servers you'd already restricted stay restricted.

Ported from the BetterDiscord **ServerConfig** plugin by Ekibunnel, plus the DM-blocking feature, which the
original didn't have.
