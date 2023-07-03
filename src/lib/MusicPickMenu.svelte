<script lang="ts">
    import { ConnectionSignalOff } from "carbon-icons-svelte";
    import { spotifyInitializeUserAuthentication, spotifyApiAuthDatas } from "$lib/api/spotify";
    import Spotify from "$lib/MusicInterfaces/Spotify.svelte";
    
    // Determine what kind of music interface user is displaying currently
    let displayPickuMusicMenu: "spotify" | undefined;

    function choosenMusicOption(option: "spotify") {
        switch(option) {
            case "spotify":
                const nowTime = Date.now();
                const expirationTime = $spotifyApiAuthDatas.establishedInMs + $spotifyApiAuthDatas.expires_inS * 1000;

                // Reauthenticate spotify auth datas when these datas don't exists or are expired
                if (!Object.keys($spotifyApiAuthDatas).length || nowTime >= expirationTime) {
                    // Initialise user authentication action
                    spotifyInitializeUserAuthentication();
                } 
                else {
                    // Display Spotify Pick Music menu
                    displayPickuMusicMenu = "spotify";
                };
            break;

            default:
                throw new Error("Unsupported Music Option");
        }

    }
</script>

<div class="music-interface-content">
    <!-- Background -->
        <div class="music-interface">
            <!-- Source element with interface -->
            {#if !displayPickuMusicMenu}
                <!-- Display pickup from source interface -->
                <h2>Music Menu</h2>
                <div class="music-options">
                    <button id="spotify" on:click={ev => choosenMusicOption("spotify")}>
                        <img src="/spotify-color-analog.png" alt=""> 
                        <p>Apply from <span>Spotify</span></p>
                        {#if !document.body.isConnected}
                            <div class="not-connected">
                                <p>Turn on network connection</p>
                                <div class="no-connection-sign">
                                    <ConnectionSignalOff fill="white"/>
                                </div>
                            </div>
                        {/if}
                    </button>
                </div>
            {:else if displayPickuMusicMenu == "spotify"}
                <!-- Display pickup music from 'Spotify' interface -->
                <Spotify/>
            {/if}
        </div>
</div>

<style>
    .music-interface-content {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0px;
        right: 0px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);
    }

    .music-interface {
        min-width: 350px;
        min-height: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        row-gap: 8px;
        padding: 5px;
        background-color: rgb(139, 199, 252);
        border-radius: 4px;
    }

    h2 {
        color: white;
    }

    .music-options {
        width: 95%;
        display: flex;
        flex-direction: column;
    }

    .music-options :is(button) {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 10px;
        border: solid 1px transparent;
        border-radius: 4px;
        cursor: pointer;
        overflow: hidden;
    }

    .music-options :is(button > img) {
        width: 30px;
        height: 30px;
    }

    .music-options :is(button > p) {
        font-size: 16px;
    }

    .music-options :is(button > p span) {
        font-weight: 600;
    }

    button#spotify {
        background-color: white;
        border-color: #1DB954;
    }

    button#spotify span {
        color: #1DB954;
    }

    .not-connected {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .not-connected p {
        color: white;
    }

    .not-connected > .no-connection-sign {
        position: absolute;
        top: -8px;
        right: -12px;
        width: 30px;
        height: 30px;
        padding: 2px;
        border-radius: 50%;
        background-color: red;
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }
</style>
