//probably the messiest code i've ever written but it works so :)

import { Badges } from "../public/assets/badges/BadgesEncoded";
import { getFlags } from "./getFlags";
import * as LanyardTypes from "./LanyardTypes";
import { encodeBase64 } from "./toBase64";
import { blue, green, gray, gold, red } from "./defaultAvatars";
import escape from "escape-html";

type Parameters = {
    theme?: string;
    bg?: string;
    animated?: string;
    hideDiscrim?: string;
    hideStatus?: string;
    hideTimestamp?: string;
    hideBadges?: string;
    borderRadius?: string;
    idleMessage?: string;
    spotifyMessage?: string;
};

const elapsedTime = (timestamp: any) => {
    let startTime = timestamp;
    let endTime = Number(new Date());
    let difference = (endTime - startTime) / 1000;

    // we only calculate them, but we don't display them.
    // this fixes a bug in the Discord API that does not send the correct timestamp to presence.
    let daysDifference = Math.floor(difference / 60 / 60 / 24);
    difference -= daysDifference * 60 * 60 * 24;

    let hoursDifference = Math.floor(difference / 60 / 60);
    difference -= hoursDifference * 60 * 60;

    let minutesDifference = Math.floor(difference / 60);
    difference -= minutesDifference * 60;

    let secondsDifference = Math.floor(difference);

    return `${hoursDifference >= 1 ? ("0" + hoursDifference).slice(-2) + ":" : ""}${("0" + minutesDifference).slice(
        -2
    )}:${("0" + secondsDifference).slice(-2)}`;
};

const renderCard = async (body: LanyardTypes.Root, params: Parameters): Promise<string> => {
    let { data } = body;


    let colors: {
        statusOnline: string;
        statusIdle: string;
        statusDnd: string;
        statusOffline: string;
        background: string;
        text: string;
        username: string;
        discrim: string;
        userStatus: string;
        idleMessage: string;
        spotifyBackground: string;
        spotifyMessage: string;
        spotifySong: string;
        spotifyArtist: string;
        activityBackground: string;
        activityName: string;
        activityDetails: string;
        activityState: string;
        activityTimestamps: string;
    } = {
        statusOnline: "a6e3a1",
        statusIdle: "fab387",
        statusDnd: "eba0ac",
        statusOffline: "7f849c",

        background: "1e1e2e",
        text: "cdd6f4",
        username: "cdd6f4",
        discrim: "bac2de",
        userStatus: "a6adc8",

        idleMessage: "585b70",

        spotifyBackground: "a6d189",
        spotifyMessage: "6c7086",
        spotifySong: "45475a",
        spotifyArtist: "585b70",

        activityBackground: "89b4fa",
        activityName: "6c7086",
        activityDetails: "45475a",
        activityState: "45475a",
        activityTimestamps: "585b70"
    };

    let statusColor: string = colors.statusOffline,
        userStatus: string = "",
        avatarExtension: string = "webp",
        statusExtension: string = "webp",
        activity: any = false,
        theme = "dark",
        discrim = "show",
        hideStatus = "false",
        hideTimestamp = "false",
        hideBadges = "false",
        borderRadius = "10px",
        idleMessage = "I'm not currently doing anything!",
        spotifyMessage = "Listening to Spotify";


    if (data.activities[0]?.emoji?.animated) statusExtension = "gif";
    if (data.discord_user.avatar && data.discord_user.avatar.startsWith("a_")) avatarExtension = "gif";
    if (params.animated === "false") avatarExtension = "webp";
    if (params.hideStatus === "true") hideStatus = "true";
    if (params.hideTimestamp === "true") hideTimestamp = "true";
    if (params.hideBadges === "true") hideBadges = "true";
    if (params.hideDiscrim === "true") discrim = "hide";
    if (params.theme === "light") {
        theme = "light";
        // Todo: Selecting colors for light theme
        colors = {
            statusOnline: "a6e3a1",
            statusIdle: "fab387",
            statusDnd: "eba0ac",
            statusOffline: "7f849c",

            background: "1e1e2e",
            text: "cdd6f4",
            username: "cdd6f4",
            discrim: "bac2de",
            userStatus: "a6adc8",

            idleMessage: "585b70",

            spotifyBackground: "a6d189",
            spotifyMessage: "6c7086",
            spotifySong: "45475a",
            spotifyArtist: "585b70",

            activityBackground: "89b4fa",
            activityName: "6c7086",
            activityDetails: "45475a",
            activityState: "45475a",
            activityTimestamps: "585b70"
        };
    }
    if (params.bg) colors.background = params.bg;
    if (params.idleMessage) idleMessage = params.idleMessage;
    if (params.spotifyMessage) spotifyMessage = params.spotifyMessage;
    if (params.borderRadius) borderRadius = params.borderRadius;

    let avatar: String;
    if (data.discord_user.avatar) {
        avatar = await encodeBase64(
            `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${
                data.discord_user.avatar
            }.${avatarExtension}?size=${avatarExtension === "gif" ? "64" : "256"}`
        );
    } else {
        let lastDigit = Number(data.discord_user.discriminator.substr(-1));
        if (lastDigit >= 5) {
            lastDigit -= 5;
        }
        // the default avatar that discord uses depends on the last digit of the user's discriminator
        switch (lastDigit) {
            case 1:
                avatar = gray;
                break;
            case 2:
                avatar = green;
                break;
            case 3:
                avatar = gold;
                break;
            case 4:
                avatar = red;
                break;
            default:
                avatar = blue;
        }
    }

    switch (data.discord_status) {
        case "online":
            statusColor = colors.statusOnline;
            break;
        case "idle":
            statusColor = colors.statusIdle;
            break;
        case "dnd":
            statusColor = colors.statusDnd;
            break;
        case "offline":
            statusColor = colors.statusOffline;
            break;
    }

    let flags: string[] = getFlags(data.discord_user.public_flags);
    if (data.discord_user.avatar && data.discord_user.avatar.includes("a_")) flags.push("Nitro");

    if (data.activities[0] && data.activities[0].state && data.activities[0].type === 4)
        userStatus = data.activities[0].state;

    // filter only type 0
    const activities = data.activities.filter(activity => activity.type === 0);

    // take the highest one
    activity = Array.isArray(activities) ? activities[0] : activities;

    return `
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" width="410px" height="210px">
                <foreignObject x="0" y="0" width="410" height="210">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="
                        position: absolute;
                        width: 400px;
                        height: 200px;
                        inset: 0;
                        background-color: #${colors.background};
                        color: #${colors.text};
                        font-family: 'Century Gothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        display: flex;
                        flex-direction: column;
                        border-radius: ${borderRadius};
                    ">
                        <div style="
                            width: 400px;
                            height: 100px;
                            inset: 0;
                            display: flex;
                            flex-direction: row;
                            padding-bottom: 5px;
                        ">
                            <div style="
                                display: flex;
                                flex-direction: row;
                                height: 80px;
                                width: 80px;
                            ">
                                <img src="data:image/png;base64,${avatar}"
                                style="
                                    border-radius: ${borderRadius};
                                    width: 50px;
                                    height: 50px;
                                    position: relative;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                "/>
                                <svg xmlns="http://www.w3.org/2000/svg"
                                style="
                                    overflow: visible;
                                    z-index: 1;
                                ">
                                    <rect fill="#${statusColor}" x="4" y="54" width="16" height="16" rx="4" ry="4" stroke="#${colors.background}" style="stroke-width: 4px;"/>
                                </svg>
                            </div>
                            <div style="
                                height: 80px;
                                width: 260px;
                            ">
                                <div style="
                                    display: flex;
                                    flex-direction: row;
                                    position: relative;
                                    top: ${userStatus.length > 0 && hideStatus !== "true" ? "35%" : "50%"};
                                    transform: translate(0, -50%);
                                    height: 25px;
                                ">
                                    <h1 style="
                                        font-size: 1.15rem;
                                        margin: 0 5px 0 0;
                                        color: #${colors.username};
                                    ">
                                    ${escape(data.discord_user.username)}${
                                        discrim !== "hide"
                                            ? `<span style="color: #${colors.discrim}; font-weight: lighter;">#${
                                                data.discord_user.discriminator
                                            }</span>`
                                            : ""
                                    }
                                    </h1>

                                    ${
                                        hideBadges == "true" ? "" : flags.map(v => `
                                        <img src="data:image/png;base64,${Badges[v]}" style="
                                            width: auto;
                                            height: 20px;
                                            position: relative;
                                            top: 50%;
                                            transform: translate(0%, -50%);
                                            margin: 0 0 0 4px;
                                        " />`).join("")
                                    }
                                </div>
                                ${
                                    userStatus.length > 0 && hideStatus !== "true" ? `
                                    <h1 style="
                                        font-size: 0.9rem;
                                        margin-top: 16px;
                                        color: #${colors.userStatus};
                                        font-weight: lighter;
                                        overflow: hidden;
                                        white-space: nowrap;
                                        text-overflow: ellipsis;
                                    ">
                                    ${
                                        data.activities[0].emoji && data.activities[0].emoji.id ? `
                                        <img src="data:image/png;base64,${await encodeBase64(
                                            `https://cdn.discordapp.com/emojis/${data.activities[0].emoji.id}.${statusExtension}`
                                        )}"
                                        style="
                                            width: 15px;
                                            height: 15px;
                                            position: relative;
                                            top: 10px;
                                            transform: translate(0%, -50%);
                                            margin: 0 2px 0 0;
                                        " />` : ``
                                    }
                                    ${
                                        data.activities[0].emoji && !data.activities[0].emoji.id
                                            ? data.activities[0].emoji.name + " " + escape(userStatus)
                                            : escape(userStatus)
                                    }
                                </h1>` : ``
                                }
                            </div>
                        </div>

                        ${
                            activity ? `
                            <svg xmlns="http://www.w3.org/2000/svg" style="overflow: visible;" fill="none" viewBox="0 0 294 20" height="21" width="400" preserveAspectRatio="none">
                                <path d="M0 21V7.19143C0 7.19143 38.8172 -2.31216 87.1664 0.530784C138.272 1.7492 156.532 13.564 222.108 14.5019C266.093 14.5019 294 7.35388 294 7.35388V21H0Z" fill="#${colors.activityBackground}"/>
                            </svg>
                            <div style="
                                display: flex;
                                flex-direction: row;
                                background-color: #${colors.activityBackground};
                                border-radius: 0 0 ${borderRadius} ${borderRadius};
                                height: 120px;
                                font-size: 0.75rem;
                                padding: 0 0 0 15px;
                            ">
                                <div style="
                                    margin-right: 15px;
                                    width: auto;
                                    height: auto;
                                ">
                                    ${
                                        activity.assets && activity.assets.large_image ? `
                                        <img src="data:image/png;base64,${await encodeBase64(
                                        activity.assets.large_image.startsWith("mp:external/")
                                            ? `https://media.discordapp.net/external/${activity.assets.large_image.replace("mp:external/", "")}`
                                            : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.webp`
                                    )}"
                                        style="
                                            width: 80px;
                                            height: 80px;
                                            border-radius: ${borderRadius};
                                        "/>
                                    ` : `
                                    <img src="data:image/png;base64,${await encodeBase64(
                                        `https://lanyard.artuu.me/assets/unknown.png`
                                    )}" style="
                                        width: 70px;
                                        height: 70px;
                                        margin-top: 4px;
                                        filter: invert(100);
                                    "/>
                                `}
                                ${
                                    activity.assets && activity.assets.small_image ? `
                                    <img src="data:image/png;base64,${await encodeBase64(
                                        activity.assets.small_image.startsWith("mp:external/")
                                            ? `https://media.discordapp.net/external/${activity.assets.small_image.replace("mp:external/", "")}`
                                            : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.small_image}.webp`
                                    )}"
                                    style="
                                        width: 25px;
                                        height: 25px;
                                        border-radius: ${borderRadius};
                                        margin-left: -28px;
                                        margin-bottom: -12px;
                                        border: solid 5px #${colors.activityBackground};
                                    "/>` : ``
                                }
                                </div>
                                <div style="
                                    color: #999;
                                    margin-top: ${
                                        activity.timestamps && activity.timestamps.start && hideTimestamp !== "true"
                                            ? "-6px"
                                            : "5px"
                                    };
                                    line-height: 1;
                                    width: 270px;
                                ">
                                    <p style="
                                        color: #${colors.activityName};
                                        font-size: 0.85rem;
                                        font-weight: bold;
                                        overflow: hidden;
                                        white-space: nowrap;
                                        text-overflow: ellipsis;
                                        height: 15px;
                                        margin: 7px 0;
                                    ">${escape(activity.name)}</p>
                                        ${
                                            activity.details
                                                ? `
                                            <p style="
                                                color: #${colors.activityDetails};
                                                overflow: hidden;
                                                white-space: nowrap;
                                                font-size: 0.85rem;
                                                text-overflow: ellipsis;
                                                height: 15px;
                                                margin: 7px 0;
                                            ">${escape(activity.details)}</p>`
                                                : ``
                                        }
                                        ${
                                            activity.state
                                                ? `
                                            <p style="
                                                color: #${colors.activityState};
                                                overflow: hidden;
                                                white-space: nowrap;
                                                font-size: 0.85rem;
                                                text-overflow: ellipsis;
                                                height: 15px;
                                                margin: 7px 0;
                                            ">${escape(activity.state)}${
                                                    activity.party && activity.party.size
                                                        ? ` (${activity.party.size[0]} of ${activity.party.size[1]})`
                                                        : ""
                                                }</p>` : ``
                                        }
                                        ${
                                            activity.timestamps && activity.timestamps.start && hideTimestamp !== "true" ? `
                                            <p style="
                                                color: #${colors.activityTimestamps};
                                                overflow: hidden;
                                                white-space: nowrap;
                                                font-size: 0.85rem;
                                                text-overflow: ellipsis;
                                                height: 15px;
                                                margin: 7px 0;
                                            ">${elapsedTime(new Date(activity.timestamps.start).getTime())} elapsed</p>`
                                                : ``
                                        }
                                </div>
                            </div>
                            ` : ``
                        }

            ${
                data.listening_to_spotify === true && !activity && data.activities[Object.keys(data.activities).length - 1].type === 2
                    ? `
                <svg xmlns="http://www.w3.org/2000/svg" style="overflow: visible;" fill="none" viewBox="0 0 294 20" height="21" width="400" preserveAspectRatio="none">
                    <path d="M0 21V7.19143C0 7.19143 38.8172 -2.31216 87.1664 0.530784C138.272 1.7492 156.532 13.564 222.108 14.5019C266.093 14.5019 294 7.35388 294 7.35388V21H0Z" fill="#${colors.spotifyBackground}"/>
                </svg>
                <div style="
                    display: flex;
                    flex-direction: row;
                    height: 120px;
                    font-size: 0.8rem;
                    padding-left: 18px;
                    background-color: #${colors.spotifyBackground};
                    border-radius: 0 0 ${borderRadius} ${borderRadius};
                ">
                    <img src="${await (async () => {
                        const album = await encodeBase64(data.spotify.album_art_url);
                        if (album) return `data:image/png;base64,${album}" style="`;
                        return 'https://lanyard.artuu.me/assets/unknown.png" style="filter: invert(100);';
                    })()}
                        width: 80px;
                        height: 80px;
                        border-radius: ${borderRadius};
                        margin-right: 15px;
                    "/>

                    <div style="
                        color: #999;
                        margin-top: -3px;
                        line-height: 1;
                        width: 270px;
                    ">
                        <p style="font-size: 0.75rem; font-weight: bold; color: #${colors.spotifyMessage}; margin-bottom: 15px;">${spotifyMessage}</p>
                        <p style="
                            height: 15px;
                            color: #${colors.spotifySong};
                            font-weight: bold;
                            font-size: 0.9rem;
                            overflow: hidden;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            margin: 5px 0;
                        ">${escape(data.spotify.song)}</p>
                        <p style="
                            margin: 5px 0;
                            height: 15px;
                            overflow: hidden;
                            white-space: nowrap;
                            font-size: 0.85rem;
                            text-overflow: ellipsis;
                            color: #${colors.spotifyArtist};
                        ">${escape(data.spotify.artist.replace(";", ","))}</p>
                    </div>
                </div>
            ` : ``
            }
            ${
                !activity && data.listening_to_spotify === false
                    ? `<div style="
                    display: flex;
                    flex-direction: row;
                    height: 150px;
                    justify-content: center;
                    align-items: center;
                ">
                    <p style="
                        font-style: italic;
                        font-size: 0.8rem;
                        color: #${colors.idleMessage};
                        height: auto;
                        text-align: center;
                    ">
                        ${escape(idleMessage)}
                    </p>
                </div>` : ``
            }

                    </div>
                </foreignObject>
            </svg>
        `;
};

export default renderCard;
