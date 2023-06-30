<!-- When user is actually playing in game -->
<script lang="ts">
    import { onMount } from "svelte";
    import { invoke } from "@tauri-apps/api";

    let gameContext: HTMLDivElement;

    interface SpawnedHeart { timeMs: number, image: HTMLImageElement }
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
            const objSpwnd = { timeMs: Date.now(), image };
            heartsSpawned.push(objSpwnd);

            // Capture click on spawned heart on Screen
            image.onclick = clickOnHeart(heartsSpawned.length - 1);
        }
        else {
            // Emit event due to rich maximum hearts amount on screen
            const ev = new Event("hearts-overflow-met");
            window.dispatchEvent(ev);
        }
    }

    /** When user click on spawned heart */
    function clickOnHeart(heartRecordId: number) {
        return (ev: Event) => {
            // Only when list of records isn't empty
            if (heartRecordId < heartsSpawned.length) {
                // Calculations of time
                const clickMs = Date.now();
                const { timeMs: recordMs, image } = heartsSpawned[heartRecordId];
    
                // Calculations of points to assign for user
                const diffMs = clickMs - recordMs;
                const calc = maximumPointsPerCatch - (diffMs * pointFor1msCatchDelay);
                userPoints += calc > 0 ? calc : minimumPointsPerCatch;

                // Remove clicked image
                image.remove();
            }
        }
    }

    let newAdditionPeriodMs = 100;
    let limitHeartsSpawning = 100;
    let maximumPointsPerCatch = 1000;
    let minimumPointsPerCatch = 10;
    let pointFor1msCatchDelay = 1;
    let userPoints = 0;

    // When application was mounted
    onMount(() => {
        let int: NodeJS.Timer;
        const addInt = () => int = setInterval(addHeart, newAdditionPeriodMs);

        // Clear screen and hearts records from user screen
        window.addEventListener("hearts-overflow-met", async () => {
            // Clear addition loop
            clearInterval(int);
            
            // Clear array with added hearts records
            heartsSpawned = [];

            // Clear user screen
            gameContext.innerHTML = "";

            // Display User points, Add it for "games records" and clear it
            console.log("Your points: ", userPoints);
            await invoke("game_end", { userPoints }); // Add points
            userPoints = 0;
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
