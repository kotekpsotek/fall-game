<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import { SpotifyApi, type UserProfileData } from "$lib/api/spotify";
    import { UserAvatarFilledAlt, ArrowLeft } from "carbon-icons-svelte";

    const dsp = createEventDispatcher();
    
    let userData: UserProfileData | undefined;

    onMount(async () => {
        userData = await SpotifyApi.currentUserProfile();
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
                        <img src="{userData.images[0].href}" alt="">
                    {:else}
                        <UserAvatarFilledAlt size={28} fill="#1DB954"/>
                    {/if}
                </div>
            </div>
        </div>
        <div class="albums-list">
           <!-- TODO: --> 
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
    }
</style>
