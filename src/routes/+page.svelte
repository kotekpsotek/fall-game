<script lang="ts">
    import { Music, Close, Play, Pause } from "carbon-icons-svelte";
    import { page } from "$app/stores";
    import { spotifyApiAuthDatas, whatIsPlayedStore, spotifyIframeAPI } from "$lib/api/spotify";
    
    // import Greet from "../lib/Greet.svelte";
    import InGame from "$lib/InGame.svelte";
    import MusicPickMenu from "$lib/MusicPickMenu.svelte";

    // Assign to "spotifyIframeAPI" Spotify Iframe API object thus give access to that
    (async () => {
        let spotifyIframeAPIInit: Promise<any> = new Promise(unleash => {
            (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {        
                unleash(IFrameAPI);
            };
        });
        
        $spotifyIframeAPI = await spotifyIframeAPIInit;
    })();

    // Make next steps to authenticate user in 'Spotify API'
    const url = new URL(document.URL);
    if (url.search.length) {
        const callback = url.searchParams.get("callback");
        const code = url.searchParams.get("code");

        if (callback == "spotify" && code) {
            // Obtain authtoken now
            fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    "Authorization": $page.data.authSpHeader,
                    "Content-Type": "application/x-www-form-urlencoded"   
                },
                body: $page.data.requestBody // Body data are encoded in MIME format "application/x-www-form-urlencoded"
            })
            .then(async resp => {
                if (resp.status == 200) {
                    // Extract and store aut datas
                    const body = await resp.json();
                    $spotifyApiAuthDatas = body;
                    $spotifyApiAuthDatas.establishedInMs = Date.now();

                    $spotifyApiAuthDatas.expires_inS = ($spotifyApiAuthDatas as any).expires_in;
                    delete ($spotifyApiAuthDatas as any).expires_in;

                    // Move page again to 'root' directory
                    window.location.replace("/");
                }
                else console.log("Cannot obtain authtoken");
            })             
        }
        else throw "Unsupported callback type";
    }

    type ToDisplay = { status: "quick game" | null, changeStatus: (to: ToDisplay["status"]) => void };

    let toDisplay: ToDisplay = { 
        status: null,
        changeStatus(to) {
            this.status = to;
            toDisplay = toDisplay;
        } 
    };

    /** Display menu to pick music when user click on "Music" button/html layout element */
    let musicMenuOpen = false;
    let musicMenuComponent: MusicPickMenu;
    function displayMusicMenu() {
        if (musicMenuOpen) {
            if ($whatIsPlayedStore.setted) {
                // When user pick up music to play. This whole surrounding functionality is for play song in background after hide menu from user view
                const { musicInterfaceAllContent } = musicMenuComponent;
                
                // Hide menu is more preferable then closing because music will be playing
                musicInterfaceAllContent.style.visibility = "hidden";
            }
            else {
                // Closing music menu
                musicMenuComponent?.$destroy();
            }

            musicMenuOpen = false;
        } else {
            if ($whatIsPlayedStore.setted) {
                // When user pick up music to play. This whole surrounding functionality is for play song and display song which is actual on playing progress 
                const { musicInterfaceAllContent } = musicMenuComponent;

                // Make menu visible again
                musicInterfaceAllContent.style.visibility = "visible";

                // Load again the music menu
                musicMenuComponent.makeVisible = true;
            } 
            else {
                // Crearting menu    
                musicMenuComponent = new MusicPickMenu({
                    target: document.body
                })
            }

            musicMenuOpen = true;
        }
    }   
</script>

<button class="music-button" on:click={displayMusicMenu} title="Music">
    {#if !musicMenuOpen && !$whatIsPlayedStore.setted}
        <Music size={24} fill="white"/>
    {:else if !musicMenuOpen && $whatIsPlayedStore.setted}
        {#if $whatIsPlayedStore.playing}
            <Pause size={24} fill="white"/>
        {:else}
            <Play size={24} fill="white"/>
        {/if}
    {:else}
        <Close size={27} fill="white"/>
    {/if}
</button>

<!-- Manage song playing statuses -->
{#if $whatIsPlayedStore.setted}
    <div class="songs-statuses-box">
        <!-- Here user can manage songs which are playing -->
        <div class="actual-song-state" id="song-state"></div>
    </div>
{/if}

{#key toDisplay}
    {#if toDisplay.status == "quick game"}
        <InGame on:end={ev => toDisplay.changeStatus(null)} on:renew={ev => toDisplay.changeStatus("quick game")}/>
    {:else if !toDisplay.status}
        <div class="app-layout-menu">
            <h2>Game Menu</h2>
            <div class="menu">
                <button on:click={ev => toDisplay.changeStatus("quick game")}>Quick game</button>
            </div>
        </div>
    {/if}
{/key}

<svelte:head>
    <!-- Load spotify IFrame API for whole application usage (the simplies way) -->
    <script src="https://open.spotify.com/embed-podcast/iframe-api/v1" async></script>
</svelte:head>

<style>
    button.music-button {
        width: 40px;
        height: 40px;
        position: absolute;
        top: 10px;
        right: 5px;
        background-color: rgba(0, 0, 0, 0.7);
        border: solid 1px white;
        border-radius: 50%;
        overflow: hidden !important;
        cursor: pointer;
        z-index: 11;
    }

    .songs-statuses-box {
        width: 200px;
        height: 100px;
    }
    
    .app-layout-menu {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    h2 {
        margin-bottom: 10px;
        color: white;
    }

    .menu {
        display: flex;
        flex-direction: column;
        row-gap: 5px;
    }

    .menu button {
        text-transform: capitalize;
        font-size: 20px;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        border-radius: 2px;
        cursor: pointer;
    }
</style>
