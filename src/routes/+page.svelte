<script lang="ts">
    import { Music, Close, Play, Pause } from "carbon-icons-svelte";
    
    // import Greet from "../lib/Greet.svelte";
    import InGame from "$lib/InGame.svelte";
    import MusicPickMenu from "$lib/MusicPickMenu.svelte";

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
            // Closing music menu
            musicMenuComponent?.$destroy();
            musicMenuOpen = false;
        } else {
            // Crearting menu
            musicMenuOpen = true;
    
            musicMenuComponent = new MusicPickMenu({
                target: document.body
            })
    
            // Listen events
            // TODO:
        }
    }
</script>

<button class="music-button" on:click={displayMusicMenu} title="Music">
    {#if !musicMenuOpen}
        <Music size={24} fill="white"/>
    {:else}
        <Close size={27} fill="white"/>
    {/if}
</button>

{#if toDisplay.status == "quick game"}
    <InGame on:end={ev => toDisplay.changeStatus(null)}/>
{:else if !toDisplay.status}
    <div class="app-layout-menu">
        <h2>Game Menu</h2>
        <div class="menu">
            <button on:click={ev => toDisplay.changeStatus("quick game")}>Quick game</button>
        </div>
    </div>
{/if}

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
        z-index: 2;
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
