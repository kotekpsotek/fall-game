<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import { SpotifyApi, whatIsPlayedStore, type UserProfileData, type UserPlaylistDatas } from "$lib/api/spotify";
    import { UserAvatarFilledAlt, ArrowLeft, Playlist, PlayFilled, SkipBackFilled, SkipForwardFilled } from "carbon-icons-svelte";

    const dsp = createEventDispatcher();
    
    let userData: UserProfileData | undefined;
    let playListDatas: UserPlaylistDatas | undefined;

    let actualOverflowPageNum: number = 1;
    onMount(async () => {
        userData = await SpotifyApi.currentUserProfile();
        playListDatas = await SpotifyApi.currentUserPlaylists();
        console.log(playListDatas)
    });


    /** Start play spotify music playlist */
    let whetherDisplayIframe = false;
    function playPlaylist(spotifyId: string) {
        return function(ev: Event) {
            whatIsPlayedStore.update(actualDatas => {
                actualDatas = { type: "spotify", playing: true, setted: true, spotify_id: spotifyId };
                return actualDatas;
            });
        }
    }
</script>

<svelte:head>
    <script src="https://open.spotify.com/embed-podcast/iframe-api/v1" async></script>
</svelte:head>

{#if userData}
    <div class="spotify-pickup">
        <div class="spotify-badge">
            <img src="/spotify-color-analog.png" alt="">
            <p>Spotify</p>
        </div>
        <div class="bottom">
            <div class="switch-swiftly-back">
                <button on:click={ev => dsp("leave-demand")}>
                    <ArrowLeft size={24} fill="white"/>
                </button>
            </div>
            <div class="user-profile">
                <p id="user-name">{userData.display_name}</p>
                <div class="profile">
                    {#if userData.images.length}
                        <img src="{userData.images[0].url}" alt="">
                    {:else}
                        <UserAvatarFilledAlt size={28} fill="#1DB954"/>
                    {/if}
                </div>
            </div>
        </div>
        <div class="albums-list" class:no-playlists={!playListDatas?.items.length}>
            {#if playListDatas?.items.length}
                {#each playListDatas.items.slice((actualOverflowPageNum == 1 ? 0 : actualOverflowPageNum * 5 - 5), actualOverflowPageNum * 5) as playlist, i}
                    <div class="playlist" data-spotify-uri="{playlist.uri}">
                        <div class="playlist-images">
                            {#if playlist.images.length}
                                <!-- TODO: Add support for up to 3 images as playlist image -->
                                <img src="{playlist.images[0].url}" alt="">
                                <!-- {#each playlist.images as { url }}
                                    <img src="{url}" alt="">
                                {/each} -->
                            {:else}
                                <div class="no-images">
                                    <Playlist size={32}/>
                                </div>
                            {/if}
                        </div>
                        <div class="name">
                            <p>{playlist.name}</p>
                        </div>
                        <div class="actions">
                            <button id="play" on:click={playPlaylist(playlist.id)} title="Play music playlist">
                                <PlayFilled size={28} fill="black"/>
                            </button>
                        </div>
                    </div>
                {/each}
            {:else}
                <p>You haven't got any playlist</p>
            {/if}
        </div>
    </div>
    {#if (playListDatas?.items.length || 0) > 5}
        <div class="overflow-manage">
            <div class="left">
                <button on:click={() => actualOverflowPageNum-=1} style="visibility: {actualOverflowPageNum == 1 ? "hidden" : "visible"};">
                    <SkipBackFilled size={28}/>
                </button>
            </div>
            <div class="page">
                <p>Page: {actualOverflowPageNum}/{Math.ceil((playListDatas?.items.length || 0) / 5)}</p>
            </div>
            <div class="right">
                <button on:click={() => actualOverflowPageNum += 1}>
                    <SkipForwardFilled size={28}/>
                </button>
            </div>
        </div>
    {/if}
{/if}

<style>
    .spotify-pickup {
        width: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        font-family: 'Roboto-Normal', sans-serif;
    }

    .spotify-badge {
        display: flex;
        gap: 5px;
        position: absolute;
        top: -35px;
        right: -5px;
        width: fit-content;
        padding: 5px;
        background-color: white;
        border-radius: 4px;
        cursor: progress;
    }

    .spotify-badge img {
        width: 15px;
        height: 15px;
    }

    .spotify-badge p {
        margin: 0px;
        font-size: 13px;
    }

    .bottom {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .switch-swiftly-back button {
        cursor: pointer;
    }

    .bottom .user-profile {
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: none;
    }

    .user-profile #user-name {
        margin: 0px;
        color: white;
    }

    .user-profile img {
        width: 28px;
        height: 28px;
        border-radius: 50%;
    }

    div.albums-list.no-playlists {
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    div.albums-list {
        --one-playlist-width: 75px;
        --gap-between-playlists: 5px;
        height: calc(var(--one-playlist-width) * 5 + var(--gap-between-playlists) * 3);
        padding-top: 10px;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
        z-index: 2;
    }

    div.albums-list > .playlist {
        width: 100%;
        height: 75px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: whitesmoke;
        border-radius: 4px;
        overflow: hidden;
        cursor: pointer;
        transition: all linear 100ms;
        border: solid 1px transparent;
    }

    .playlist > .playlist-images {
        width: 75px;
        height: 75px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .playlist > .playlist-images img {
        width: 50px;
        height: 50px;
    }

    .playlist > .playlist-images .no-images {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .playlist > .name {
        color: black;
        height: 100%;
        width: calc(90% - 75px * 2);
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .playlist > .actions {
        width: 75px;
        height: 75px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .playlist > .actions button#play {
        padding: 3px;
        height: fit-content;
        width: fit-content;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .playlist:hover {
        transform: scale(1.07);
        background-color: rgb(255, 255, 255);
        border-color: #1DB954 !important;
    }

    .overflow-manage {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: 'Roboto-Normal', sans-serif;
        padding: 5px;
    }

    .overflow-manage :is(.left, .right) {
        width: 75px;
    }

    .overflow-manage button {
        cursor: pointer;
    }

    .overflow-manage p {
        margin: 0px;
    }

    .overflow-manage > div {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
