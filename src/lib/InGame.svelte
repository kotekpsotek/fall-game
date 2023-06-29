<!-- When user is actually playing in game -->
<script lang="ts">
    import { onMount } from "svelte";
    import { invoke } from "@tauri-apps/api";

    let gameContext: HTMLDivElement;

    interface SpawnedHeart { timeMs: number }
    let heartsSpawned: SpawnedHeart[] = [];

    /** Add image with heart to screen */
    async function addHeart() {
        // Attach time of spawning each heart to variable with whole set
        if (heartsSpawned.length < limitHeartsSpawning) {
            // Obtain position for heart paste
            const [pos_width, pos_height] = (await invoke("get_coords")) as Array<number>;
            
            // Add position of heart to view
            const image = new Image(75, 75);
            image.src = "/heart.png";
            image.style.position = "absolute";
            image.style.top = pos_height + "px"; 
            image.style.right = pos_width + "px";
            gameContext.appendChild(image);
            
            // Add new heart to records of hearts lisy
            const objSpwnd = { timeMs: Date.now() };
            heartsSpawned.push(objSpwnd);

            // Capture click on spawned heart on Screen
            image.onclick = clickOnHeart;
        }
        else {
            // Emit event due to overflow
            const ev = new Event("hearts-overflow-met");
            window.dispatchEvent(ev);
        }
    }

    /** When user click on spawned heart */
    function clickOnHeart() {
        //TODO: ..
    }

    let newAdditionPeriodMs = 100;
    let limitHeartsSpawning = 100;

    // When application was mounted
    onMount(() => {
        let int: NodeJS.Timer;
        const addInt = () => int = setInterval(addHeart, newAdditionPeriodMs);

        // Clear screen and hearts records from user screen
        window.addEventListener("hearts-overflow-met", () => {
            // Clear addition loop
            clearInterval(int);
            
            // Clear array with added hearts records
            heartsSpawned = [];

            // Clear user screen
            gameContext.innerHTML = "";
        });

        // Spawn initial interval
        addInt();
    });
</script>

<div class="in-game" bind:this="{gameContext}"></div>

<style>
    .in-game {
        width: 150vw;
        height: 150vh;
        background-color: rgb(243, 147, 164);
        overflow: auto;
    }
</style>
