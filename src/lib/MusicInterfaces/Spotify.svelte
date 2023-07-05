<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import { SpotifyApi, type UserProfileData, type UserPlaylistDatas } from "$lib/api/spotify";
    import { UserAvatarFilledAlt, ArrowLeft, Playlist, PlayFilled } from "carbon-icons-svelte";

    const dsp = createEventDispatcher();
    
    let userData: UserProfileData | undefined;
    let playListDatas: UserPlaylistDatas | undefined;

    onMount(async () => {
        userData = await SpotifyApi.currentUserProfile();
        playListDatas = await SpotifyApi.currentUserPlaylists();
        console.log(playListDatas)
    });
</script>

{#if userData}
    <div class="spotify-pickup">
        <div class="spotify-badge">
            <img src="/spotify-color-analog.png" alt="">
            <p>Spotify</p>
        </div>
        <div class="bottom">
            <div class="switch-swiftly-back">
                <button on:click={ev => dsp("left-demand")}>
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
                {#each playListDatas.items as playlist, i}
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
                            <button id="play">
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
        padding-top: 10px;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
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
</style>
