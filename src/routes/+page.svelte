<script lang="ts">
    // import Greet from "../lib/Greet.svelte";
    import InGame from "$lib/InGame.svelte";

    type ToDisplay = { status: "quick game" | null, changeStatus: (to: ToDisplay["status"]) => void };

    let toDisplay: ToDisplay = { 
        status: null,
        changeStatus(to) {
            this.status = to;
            toDisplay = toDisplay;
        } 
    };
</script>

{#key toDisplay}
    {#if toDisplay.status == "quick game"}
        <InGame/>
    {:else if !toDisplay.status}
        <div class="app-layout-menu">
            <h2>Game Menu</h2>
            <div class="menu">
                <button on:click={ev => toDisplay.changeStatus("quick game")}>Quick game</button>
            </div>
        </div>
    {/if}
{/key}

<style>
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
