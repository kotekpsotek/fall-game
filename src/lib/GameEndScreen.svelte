<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Renew, OverflowMenuHorizontal } from "carbon-icons-svelte";
    
    export let userPoints: number = 0;

    const dsp = createEventDispatcher();
</script>

<div class="end-screen">
    <div class="cnt">
        <h1>Game End</h1>
        <p>Your score: <span>{userPoints}</span></p>
        <div class="abilities">
            <button on:click={_ => dsp("new-game-demand")} title="New game">
                <Renew size={28} fill="white"/>
            </button>
            <button on:click={_ => dsp("switch-to-menu")} title="Menu">
                <OverflowMenuHorizontal size={28} fill="white"/>
            </button>
        </div>
    </div>
</div>

<style>
    .cnt {
        width: 300px;
        height: 200px;
        padding: 15px;
        background-color: rgba(10, 10, 94, 0.712);
        border-radius: 4px;
        border: solid 1px white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    
    .end-screen {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0px;
        right: 0px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        row-gap: 15px;
        font-family: 'Roboto-Normal', sans-serif;
    }

    h1 {
        font-weight: 600;
        color: white;
    }

    p {
        font-size: 17px;
    }
    
    span {
        color: white;
    }

    div.abilities {
        display: flex;
        column-gap: 10px;
    }
    
    button {
        width: 50px;
        height: 50px;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        cursor: pointer;
    }
</style>