<!-- When user is actually playing in game -->
<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import { invoke } from "@tauri-apps/api";
    import { emit } from "@tauri-apps/api/event";
    import { gameEndScreenDisplaying } from "$lib/api/states";
    import PointsBadge from "./PointsBadge.svelte";
    import GameEndScreen from "$lib/GameEndScreen.svelte";
    import { PauseFuture, Continue, Close } from "carbon-icons-svelte";
    import type { OnlineCompetitorScreenHeart } from "./api/online.types";
    import type { OnlineGameCommunication } from "./api/online.game";

    export let onlineGame: boolean = false;
    export let onlineGameUserEntitle: "gamer" | "receiver";
    export let onlineCompetitorHeartsPosition: OnlineCompetitorScreenHeart[] = [];
    /** When 'onlineGameUserEntitle' = "gamer" her value must be assigned */
    export let communicationManager: OnlineGameCommunication | undefined = undefined;
    
    const disp = createEventDispatcher();
    let gameContext: HTMLDivElement;

    interface SpawnedHeart { timeMs: number, image: HTMLImageElement }
    let heartsSpawned: SpawnedHeart[] = [];

    /** Add image with heart to screen */
    async function addHeart() {
        if (!onlineGame || (onlineGame && onlineGameUserEntitle == "gamer")) { // When user doesn't play in online mode or play with but his gamer status is "gamer"
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
                const characterPlusMinus = plusMinus == 1 ? "" : "-";
                image.style.transform = `rotate(${characterPlusMinus}${rotateDegrees}deg)`;
                
                // Add new heart to records of hearts lisy
                const timeMs = Date.now();
                const objSpwnd = { timeMs, image };
                heartsSpawned.push(objSpwnd);
    
                // Capture click on spawned heart on Screen
                image.onclick = clickOnHeart(heartsSpawned.length - 1);
    
                // Online Game Mode: Send hearts to another user
                if (onlineGame) {
                    const payload = {
                        timeMs, 
                        position: { 
                            x: pos_width,
                            y: pos_height
                        },
                        rotation: Number(characterPlusMinus),
                        userScreenData: {
                            width: document.body.clientWidth,
                            height: document.body.clientHeight
                        }
                    } satisfies OnlineCompetitorScreenHeart;
                    communicationManager?.messages.send("competitor-game-payload", payload)
                }
            }
            else {
                // Emit event due to rich maximum hearts amount on screen
                const ev = new Event("hearts-overflow-met");
                window.dispatchEvent(ev);
            }
        } else { // When user is playing in online game and his status is "receiver"
            
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
                userPoints += Math.round(calc > 0 ? calc : minimumPointsPerCatch);

                // Remove clicked image
                image.remove();
            }
        }
    }

    let newAdditionPeriodMs = 450; // Miliseconds gap between addition new hearts to user screen pureview. When user don't click any heart each game will be last 45 seconds
    let limitHeartsSpawning = 100; // Maximum hearts count which can be display on user desktop screen. When user don't click any heart each game will be last 45 seconds
    let maximumPointsPerCatch = 1000; // Maximum user points amout to catch from one click
    let minimumPointsPerCatch = 10; // It's equavilent of 9ms, so equavilent to click on heart after 1.091 second far away it spawn moment
    let pointFor1msCatchDelay = 0.909; // user has got 1.1 second to obtain any points otherwise grease 'minimumPointsPerCatch'
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

    // Listen for Initialize Pause from outside (regards to this component) snippest calls
    window.addEventListener("pause-init-outside", () => {
        pauseResume();
    });

    onMount(async () => {
        // To inform backend that user is while game
        const _bckOnGameSign = await emit("user-on-game");

        // Game main acts
        let int: NodeJS.Timer;
        let gameStartTime = Date.now();
        const addInt = () => int = setInterval(addHeart, newAdditionPeriodMs);
        const commonEndGameActivities = async () => {
            // End game raise up time of game calculations and reset game start time
            const gameTime = Date.now() - gameStartTime;
            
            // Clear addition loop
            clearInterval(int);
            
            // Clear array with added hearts records
            heartsSpawned = [];

            // Clear user screen
            gameContext.innerHTML = "";

            // Display User points, Add it for "games records" and clear it
            await invoke("game_end", { userPoints, gameTime, gameStartTime }); // Add points

            // Inform backend that user ends actual the game
            const _showNativeWindowMenuBar = await emit("user-out-of-game");

            // Sign game process as ended
            gameEnded = true;
        }

        // Clear screen and hearts records from user screen
        window.addEventListener("hearts-overflow-met", async () => {
            // Perform common activities in order to end game
            await commonEndGameActivities();

            // Create game end Screen
            const gameEndScreen = new GameEndScreen({
                target: document.body,
                props: {
                    userPoints
                }
            });

            // Change global state which witness that 'Game End' Menu is displaying on view
            $gameEndScreenDisplaying = true;

            // ..Events handling from 'GameEndScreen'
            // ... Emit that user end game
            gameEndScreen.$on("new-game-demand", () => {
                $gameEndScreenDisplaying = false;
                gameEndScreen.$destroy();
                gameEnded = true;
                disp("renew");
            });
            
            // ... Emit that user would like go to menu
            gameEndScreen.$on("switch-to-menu", () => {
                $gameEndScreenDisplaying = false;
                gameEndScreen.$destroy();
                userPoints = 0;
                disp("end");
            });
        });

        // When game was ended from some reason
        window.addEventListener("end", async _ => {
            // Perform common activities in order to end game
            await commonEndGameActivities();

            // Emit end game event
            disp("end");
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

<!-- Whether game should be paused -->
{#if paused}
    <div class="intermission-screen">
        <!-- Class 'back' is only for preserve css styles for this class -->
        <h2 class="paused-description front" class:back={1 == Math.random() - 1}>Paused</h2>
        <div class="options">
            <button on:click={_ => window.dispatchEvent(new Event("end"))} title="End game">
                <Close size={28} fill="white"/>
            </button>
        </div>
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
        row-gap: 20px;
        align-items: center;
        z-index: 10;
    }

    .intermission-screen > :is(.options) {
        display: flex;
        column-gap: 10px;
    }
    
    .intermission-screen > :is(.options) button {
        width: 50px;
        height: 50px;
        padding: 10px;
        border: solid 1px white;
        border-radius: 4px;
        background-color: rgba(10, 10, 94, 0.712);
        cursor: pointer;
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
