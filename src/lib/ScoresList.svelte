<script lang="ts">
    import type { GameRecord } from "./api/game.types";
    import { Close } from "carbon-icons-svelte";
    import { createEventDispatcher } from "svelte";
    export let scores: GameRecord[];

    const dsp = createEventDispatcher();

    /** @description Get string representing game duration time with maximum accuracy to seconds and minimum to hours */
    function getGameDuration(gameTime: number): string {
        const date = new Date(gameTime);
        let tf = "";

        if (date.getFullYear() == new Date().getFullYear() && date.getHours()) {
            tf += date.getHours() + " hr ";
        }

        if (date.getMinutes()) {
            tf += date.getMinutes() + " min ";
        }

        if (date.getSeconds()) {
            tf += date.getSeconds() + " sec "
        }

        if (!tf.trim().length) {
            tf += "Invalid Game Duration Time"
        }

        return tf.trim();
    }
</script>

<div class="scores-menu-layout">
    <button class="close" on:click={_ => dsp("terminate")} title="Close menu">
        <Close size={28} fill="white"/>
    </button>
    
    <div class="scores-menu">
        <h2>Your Game Scores</h2>
        <table class="scores">
            <tr>
                <th>Game Date</th>
                <th>Game Duration</th>
                <th>Points for Game</th>
            </tr>
            {#each scores.reverse() as { game_time, start_time, points }}
                <tr>
                    <td class="date">
                        <p class="date-date">{new Date(start_time + game_time).toLocaleDateString("en-En")}</p>
                        <p class="date-time">{new Date(start_time + game_time).toLocaleTimeString("en-En")}</p>
                    </td>
                    <td class="game-duration">
                        <p>{getGameDuration(game_time)}</p>
                    </td>
                    <td class="points">
                        {points} pts
                    </td>
                </tr>
            {/each}
        </table>
    </div>
</div>

<style>
    * {
        font-family: 'Roboto-Normal', sans-serif;
    }

    h2 {
        color: white;
    }
    
    .scores-menu-layout {
        width: 100vw;
        height: 100vh;
        display: flex;
        position: absolute;
        top: 0px;
        right: 0px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: rgb(243, 147, 164);
        z-index: 10;
    }

    .scores-menu {
        width: 700px;
        height: 700px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        row-gap: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 4px;
        box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 15px;
        overflow: auto;
    }

    .scores-menu::-webkit-scrollbar {
        background-color: rgba(0, 0, 0, 0.0);
        width: 5px;
    }

    .scores-menu::-webkit-scrollbar-thumb {
        background-color: black;
        border-radius: 5px;
    }

    table.scores {
        width: 100%;
        table-layout: auto;
        border-collapse: collapse;
        overflow: hidden;
        border-radius: 4px;
    }

    th {
        background-color: black;
        color: white;
        padding: 5px;
    }

    td {
        text-align: center;
        background-color: rgb(139, 199, 252, 0.4);
        color: white;
    }

    td.date {
        display: flex;
        column-gap: 5px;
        justify-content: center;
    }

    p.date-date {
        color: rgb(255, 188, 140);
    }

    p.date-time {
        color: rgb(209, 161, 254);
    }

    td.points {
        color: rgb(203, 242, 144);
    }

    button.close {
        width: 40px;
        height: 40px;
        position: absolute;
        top: 10px;
        left: 5px;
        background-color: rgba(0, 0, 0, 0.7);
        border: solid 1px white;
        border-radius: 50%;
        overflow: hidden !important;
        cursor: pointer;
        z-index: 11;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
