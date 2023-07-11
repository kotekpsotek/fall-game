<!-- When user is actually playing in game -->
<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import { invoke } from "@tauri-apps/api";
    import PointsBadge from "./PointsBadge.svelte";
    import GameEndScreen from "$lib/GameEndScreen.svelte";
    import { PauseFuture, Continue } from "carbon-icons-svelte";

    const disp = createEventDispatcher();
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
            image.style.zIndex = "10";
            gameContext.appendChild(image);

            // Add rotation to image
            const rotateDegrees = await invoke("get_rotation_degrees");
            const plusMinus = Math.floor(Math.random() * 2);
            image.style.transform = `rotate(${plusMinus == 1 ? "" : "-"}${rotateDegrees}deg)`;
            
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

    let newAdditionPeriodMs = 500;
    let limitHeartsSpawning = 100;
    let maximumPointsPerCatch = 1000;
    let minimumPointsPerCatch = 10;
    let pointFor1msCatchDelay = 1;
    let userPoints = 0;

    // When application was mounted
    let gameEnded = false;
    let paused = false;

    /** @description When user click on Pause/Resume button */
    function pauseResume() {
        paused = !paused;
        document.dispatchEvent(new Event("paused"))
    }

    // When user click one time keyborad key
    window.addEventListener("keydown", ({ which, ctrlKey }) => {
        // Pause/Resume game when user hold "CTRL + Space" key-combination
        if (ctrlKey && which == 32) pauseResume();
    });

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
            await invoke("game_end", { userPoints }); // Add points

            // Create game end Screen
            gameEnded = true;
            const gameEndScreen = new GameEndScreen({
                target: document.body,
                props: {
                    userPoints
                }
            });

            // ..Events handling from 'GameEndScreen'
            // ... Emit that user end game
            gameEndScreen.$on("new-game-demand", () => {
                gameEndScreen.$destroy();
                gameEnded = true;
                disp("renew");
            });
            
            // ... Emit that user would like go to menu
            gameEndScreen.$on("switch-to-menu", () => {
                gameEndScreen.$destroy();
                userPoints = 0;
                disp("end");
            });
        });

        // When user decide to pause game
        document.addEventListener("paused", _ => {
            if (!paused) {
                addInt();
            }
            else {
                clearInterval(int);

                setTimeout(() => {
                    const el = document.querySelector("h2.paused-description");
                    el?.addEventListener("animationend", ({ animationName }: any) => {
                        console.warn(animationName)
                        const bCln = animationName.includes("scale-to") ? "front" : "back"; 
                        el.classList.replace(bCln, animationName.includes("scale-to") ? "back" : "front");
                    });
                }, 100)
            }
        });

        // Spawn initial interval
        addInt();
    });
</script>

{#if !gameEnded}
    <PointsBadge {userPoints}/>
{/if}
<button id="pause" on:click={pauseResume}>
    {#if paused}
        <Continue size={24} fill="white"/>
    {:else}
        <PauseFuture size={24} fill="white"/>
    {/if}
</button>
<div class="in-game" bind:this="{gameContext}"></div>
{#if paused}
    <div class="intermission-screen">
        <!-- Class 'back' is only for preserve css styles for this class -->
        <h2 class="paused-description front" class:back={1 == Math.random() - 1}>Paused</h2>
    </div>
{/if}

<style>
    .in-game {
        width: 150vw;
        height: 150vh;
        overflow: auto;
    }

    button#pause {
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
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 11;
    }

    .intermission-screen {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0px;
        right: 0px;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10;
    }

    h2.paused-description {
        color: white;
    }
    
    h2.front {
        animation: scale-to 500ms linear forwards normal;
    }
    
    h2.back {
        animation: scale-from 500ms linear forwards normal;
    }

    @keyframes scale-to {
        to {
            transform: scale(0.5);
        }
    }

    @keyframes scale-from {
        from {
            transform: scale(0.5);
        }

        to {
            transform: scale(1.0);
        }
    }
</style>
