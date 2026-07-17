import definePlugin, { OptionType } from "@utils/types";
import { definePluginSettings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import { findByPropsLazy } from "@webpack";
import { RestAPI } from "@webpack/common";

// Ported from the BetterDiscord "ServerConfig" plugin (Ekibunnel), with
// defaults matching this user's actual saved BD config, plus a DM-blocking
// feature the original never had.
// Applies your preferred notification settings (and optionally a nickname)
// the moment you join a brand new server.

const logger = new Logger("ServerConfig");

const GuildSettingsActions = findByPropsLazy("updateGuildNotificationSettings");
const NicknameActions = findByPropsLazy("changeNickname");
const VerificationActions = findByPropsLazy("submitVerificationForm");

// Ignore GUILD_CREATE events for servers you didn't *just* join (e.g. ones
// loaded on client startup) - mirrors the original plugin's 60s window.
const APPLY_WINDOW_MS = 60_000;

const settings = definePluginSettings({
    muted: {
        type: OptionType.BOOLEAN,
        description: "Mute new servers",
        default: true
    },
    messageNotifications: {
        type: OptionType.SELECT,
        description: "Notification setting for new servers",
        options: [
            { label: "All Messages", value: 0 },
            { label: "Only Mentions", value: 1 },
            { label: "Nothing", value: 2, default: true }
        ]
    },
    notifyHighlights: {
        type: OptionType.SELECT,
        description: "Include highlighted messages in notifications",
        options: [
            { label: "Off", value: 1 },
            { label: "On", value: 2, default: true }
        ]
    },
    suppressEveryone: {
        type: OptionType.BOOLEAN,
        description: "Suppress @everyone and @here",
        default: true
    },
    suppressRoles: {
        type: OptionType.BOOLEAN,
        description: "Suppress all role @mentions",
        default: true
    },
    mobilePush: {
        type: OptionType.BOOLEAN,
        description: "Allow mobile push notifications",
        default: false
    },
    muteScheduledEvents: {
        type: OptionType.BOOLEAN,
        description: "Mute new scheduled events",
        default: true
    },
    showAllChannels: {
        type: OptionType.BOOLEAN,
        description: "Show all channels (don't collapse to unreads-only)",
        default: false
    },
    hideMutedChannels: {
        type: OptionType.BOOLEAN,
        description: "Hide muted channels",
        default: true
    },
    restrictDms: {
        type: OptionType.BOOLEAN,
        description: "Block DMs from members of new servers you join (same as disabling \"Allow direct messages from server members\" in Privacy Settings)",
        default: true
    },
    nickname: {
        type: OptionType.STRING,
        description: "Nickname to set on join (blank = don't change). May silently fail if the server doesn't grant instant nickname permission.",
        default: ""
    },
    acceptTerms: {
        type: OptionType.BOOLEAN,
        description: "Experimental: auto-accept server membership screening. May break without warning.",
        default: false
    }
});

async function onGuildCreate({ guild }: any) {
    if (!guild?.joined_at) return;

    const joinedAt = new Date(guild.joined_at).getTime();
    if (Date.now() - joinedAt > APPLY_WINDOW_MS) return;

    GuildSettingsActions.updateGuildNotificationSettings(guild.id, {
        muted: settings.store.muted,
        message_notifications: settings.store.messageNotifications,
        notify_highlights: settings.store.notifyHighlights,
        suppress_everyone: settings.store.suppressEveryone,
        suppress_roles: settings.store.suppressRoles,
        mobile_push: settings.store.mobilePush,
        mute_scheduled_events: settings.store.muteScheduledEvents,
        flags: settings.store.showAllChannels ? 0 : 16384,
        hide_muted_channels: settings.store.hideMutedChannels
    });

    if (settings.store.nickname) {
        NicknameActions.changeNickname(guild.id, null, "@me", settings.store.nickname);
    }

    if (settings.store.restrictDms) {
        await restrictGuildDms(guild.id);
    }
}

// "Allow direct messages from server members" isn't part of the guild
// notification-settings object above - it's a separate top-level list
// (`restricted_guilds`) on the same legacy settings object AnimatedStatus
// already patches for custom_status. PATCH replaces the whole array rather
// than merging, so we GET the current list first and append to it.
async function restrictGuildDms(guildId: string) {
    try {
        const res: any = await RestAPI.get({ url: "/users/@me/settings" });
        const current: string[] = res?.body?.restricted_guilds ?? [];
        if (current.includes(guildId)) return;

        await RestAPI.patch({
            url: "/users/@me/settings",
            body: { restricted_guilds: [...current, guildId] }
        });
    } catch (e) {
        logger.error("Failed to restrict DMs for new guild", e);
    }
}

function onGuildJoinRequestCreate({ guildId }: any) {
    if (settings.store.acceptTerms) {
        VerificationActions.submitVerificationForm(guildId, "@me");
    }
}

export default definePlugin({
    name: "ServerConfig",
    description: "Automatically applies your preferred notification/DM settings and nickname when you join a new server.",
    authors: [{ name: "isnuggs", id: 1483261914392825958n }],
    settings,
    flux: {
        GUILD_CREATE: onGuildCreate,
        GUILD_JOIN_REQUEST_CREATE: onGuildJoinRequestCreate
    }
});
