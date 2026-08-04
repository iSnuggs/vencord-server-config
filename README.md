# ServerConfig

A [Vencord](https://github.com/Vendicated/Vencord) userplugin that applies your preferred notification/DM
defaults automatically whenever you join a new server, including blocking DMs from that server's members.

## Install

> **Be warned: this is not a one-click install.** Vencord builds plugins *into* the client when the
> client itself is built, so there's no "download the file and drop it in a folder" option the way
> BetterDiscord has. To use any userplugin — this one included — you have to build Vencord yourself
> from its source code. That's a genuine time investment, and it's worth knowing that up front rather
> than halfway through.
>
> You do **not** need to know how to code. Every step below is a command you copy and paste. But you
> do need to be willing to use a terminal, and you'll need to redo a short version of this each time
> Vencord updates (see [Keeping it up to date](#keeping-it-up-to-date)).

### Before you start: three things to install

Install these first, in this order. All three are normal installers — click through them.

1. **[Node.js](https://nodejs.org/)** — version **22 or newer**. Take the "LTS" download on the front
   page. This is what actually builds Vencord.
2. **[Git](https://git-scm.com/downloads)** — this is how you download the Vencord source code and,
   later, update it. Accept every default in the installer.
3. **pnpm** — the tool that fetches Vencord's building blocks. It comes bundled with Node, but has to
   be switched on. Open a terminal (see the note below) and run:

   ```
   corepack enable
   ```

> **Opening a terminal.** On **Windows**, press Start, type `powershell`, hit Enter. On **macOS**,
> press Cmd+Space, type `terminal`, hit Enter. On **Linux** you already know. A terminal is just a
> window where you type commands instead of clicking — you'll paste each command below and press Enter.

To check all three worked, run these three commands. Each should print a version number rather than an
error:

```
node --version
git --version
pnpm --version
```

If `node --version` prints something lower than `v22`, install the newer Node before continuing —
the build will fail on older versions.

### Building Vencord with the plugin

Run these one at a time, waiting for each to finish.

1. **Download Vencord's source code.** This creates a `Vencord` folder wherever you currently are:

   ```
   git clone https://github.com/Vendicated/Vencord
   cd Vencord
   ```

2. **Fetch its building blocks.** This takes a few minutes the first time:

   ```
   pnpm install
   ```

3. **Add this plugin.** From inside that `Vencord` folder:

   ```
   git clone https://github.com/iSnuggs/vencord-server-config src/userplugins/ServerConfig
   ```

   The folder name matters — Vencord looks for plugins inside `src/userplugins/`.

4. **Build it:**

   ```
   pnpm build
   ```

5. **Install it into Discord.** **Fully quit Discord first** — not just closing the window. On Windows,
   right-click the Discord icon in the system tray (bottom-right, possibly under the `^` arrow) and
   choose Quit. Then:

   ```
   pnpm inject
   ```

   It'll ask which Discord to patch; pick the one you actually use (most people: Stable). Then reopen
   Discord.

6. In Discord, open **Vencord Settings → Plugins**, find **ServerConfig** and turn it on. Click the
   cog beside it to set your preferences before you join your next server.

That's it. If the plugin appears in that list, it worked.

### Keeping it up to date

Vencord changes often, and Discord updates can break plugins. When you want the latest version, go back
to your `Vencord` folder and run:

```
git pull
pnpm install
pnpm build
```

Then fully quit and reopen Discord. Your plugins in `src/userplugins/` are left alone by `git pull`, so
you won't lose anything. To update *this plugin* specifically:

```
cd src/userplugins/ServerConfig
git pull
cd ../../..
pnpm build
```

**The trade-off worth understanding:** a build-it-yourself Vencord doesn't auto-update the way the normal
installer does. Nothing breaks if you skip updates for a while, but you're now the one deciding when to
run them.

### If it doesn't work

- **Nothing changed after `pnpm inject`.** Discord almost certainly wasn't fully closed. Quit it from the
  system tray (or Task Manager — end every `Discord` process), then run `pnpm inject` again.
- **The plugin isn't in the Plugins list.** It's probably in the wrong folder. It must sit at
  `src/userplugins/ServerConfig/` inside your Vencord folder, with the code files directly inside it — not
  nested in a second folder of the same name. Fix it and run `pnpm build` again.
- **`pnpm build` printed errors.** Check `node --version` is 22 or higher. If it is, the error text
  itself is the useful part — open an issue on this repo and paste it in.
- **You want to undo all of this.** Run `pnpm uninject` from the Vencord folder (with Discord fully
  closed) and Discord goes back to normal. Deleting the Vencord folder afterwards removes the rest.

### Already using Vencord?

If you installed Vencord the normal way (the official installer), that version can't load userplugins —
it ships pre-built, and this plugin isn't in it. Running `pnpm inject` above replaces that install with
your own build, which is what you want. Your Vencord settings, themes and enabled plugins are stored
separately and carry over untouched.

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
