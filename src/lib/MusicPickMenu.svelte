<script lang="ts">
    import { ConnectionSignalOff, ChangeCatalog, Close } from "carbon-icons-svelte";
    import { spotifyInitializeUserAuthentication, spotifyApiAuthDatas, whatIsPlayedStore, spotifyIframeAPI } from "$lib/api/spotify";
    import Spotify from "$lib/MusicInterfaces/Spotify.svelte";
    
    export let musicInterfaceAllContent: HTMLDivElement;

    // Determine what kind of music interface user is displaying currently
    let displayPickuMusicMenu: "spotify" | undefined = undefined;

    // Obtain 'Spotify IFrameAPI' object
    let embeddedAPI: any;

    // Display responsible menu picking music from source
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

    // Event emitted when user click on "Change Playlist" button was captured, what claim about he would like to change actual playing playlist
    function changePlaylist() {
        embeddedAPI.togglePlay();
        $whatIsPlayedStore.setted = false;
    }

    // Event emitted when user click on "Change Playlist" button was captured, what claim about user would like to chanage music picking source
    function declinePlaylist() {
        embeddedAPI.togglePlay();
        whatIsPlayedStore.setInitialValue();
        displayPickuMusicMenu = void displayPickuMusicMenu; // Setup as undefined value
    }

    /** Called for music play manage menu */
    function loadMusicPlayer(node: HTMLElement) {
        const loading = async function() {
            const IFrameAPI = $spotifyIframeAPI;

            // When IFrame API was loaded else make recursivity
            if (IFrameAPI) {
                const { type, spotify_uri } = $whatIsPlayedStore;
        
                // Element within which music state can be managed
                const musicPlayerEl = document.getElementById("player-music");
        
                switch (type) {
                    case "spotify":
                        // Load Spotify music player with controller
                        const options = {
                            uri: spotify_uri
                        };
                        const callback = (embedded: unknown) => embeddedAPI = embedded;
                        IFrameAPI.createController(musicPlayerEl, options, callback);
                }
            }
            else loading();
        }

        // Initialise action
        loading();
        
        // Return object
        return {}
    }

    // After catch such event Spotify user playlist will be show up
    window.addEventListener("spotify-pick-playlist-should-be-open", _ => displayPickuMusicMenu = "spotify");
</script>

<div class="music-interface-content" bind:this={musicInterfaceAllContent}>
    <!-- Background -->
        <div class="music-interface">
            <!-- Source element with interface -->
            {#if !$whatIsPlayedStore.setted}
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
                    <Spotify on:leave-demand={() => { displayPickuMusicMenu = void displayPickuMusicMenu }}/>
                {/if}
            {:else}
                <!-- When music is durning playing or is paused but not declined -->
                <div class="music-play-manager" use:loadMusicPlayer>
                    <div id="player-music"></div>
                    <button id="change-playlist" on:click={changePlaylist}>
                        <ChangeCatalog size={24}/>
                        <p>Change Playlist</p>
                    </button>
                    <button id="decline-playlist" on:click={declinePlaylist}>
                        <Close size={28}/>
                        <p>Decline Music Playlist</p>
                    </button>
                </div>
            {/if}
        </div>
</div>

<svelte:options accessors={true}/>

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
        z-index: 10;
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

    .music-play-manager {
        width: 100%;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    .music-play-manager button {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 10px;
        background-color: white;
        border: solid 1px black;
        border-radius: 4px;
        padding: 5px;
        font-size: 15px;
        cursor: pointer;
    }

    button#change-playlist {
        margin-top: 5px;
    }
</style>
