<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from "svelte";
    import { invoke } from "@tauri-apps/api";
    import { io } from "socket.io-client";
    import { UserAvatarFilledAlt, Edit, EditOff, ArrowLeft, Rotate } from "carbon-icons-svelte";
    import { loadProfileData, saveProfileData, OnlineGameCommunication } from "$lib/api/online.game";
    import type { OnlineGame, OnlineProfileData, P2PCommunciationMessage } from "$lib/api/online.types.d";
    import { parse } from "svelte/compiler";

    const dsp = createEventDispatcher();

    let gameId: string = "";
    let waithingForIce = false;
    let communicationManager: OnlineGameCommunication | undefined;
    const onlineGame: OnlineGame = {
        userHimselfProfile: {
            name: "",
            image_blob: ""
        },
        adverseLoverProfile: {
            name: "",
            image_blob: ""
        },
        editStatuses: {
            himself: false,
            adverse: false
        }
    };

    const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};
    const rc = new RTCPeerConnection(configuration);
    const so = io("http://localhost:8080");
    let dataChannel: { channel?: RTCDataChannel, listener: () => void, isOpen: boolean } = { // TODO: send message function with full online cover
        isOpen: false,
        listener() {
            this.channel!.onopen = () => {
                // Determine channel as open
                this.isOpen = true;

                // Create communication manager instance
                communicationManager = new OnlineGameCommunication(this.channel!);

                // Send message with user profile datas
                communicationManager.messages.send("profile-data", onlineGame["userHimselfProfile"]);
            }

            // Manage communication events received listener
            this.channel?.addEventListener("message", ({ data }) => {
                const parsedData: P2PCommunciationMessage<any> = JSON.parse(data);

                switch(parsedData.type) {
                    case "profile-data":
                        onlineGame.adverseLoverProfile = parsedData.content;
                    break;
                }
            })
        } 
    };

    rc.onicecandidate = async ({ candidate }) => {
        waithingForIce = false;

        // Send new candidate to the remote peers
        if (candidate) {
            const can = JSON.stringify({ can: candidate })
            so.emit("candidate", can, gameId);
        }
    };

    // When new remote candidate is received
    so.on("new-candidate", async (candidate) => {
        const can = JSON.parse(candidate).can;
        await rc.addIceCandidate(can);
    });

    so.on("signal-recv", async (signal) => {
        if (signal.type == "offer") {
            // Setup offer as remote descriptiom
            await rc.setRemoteDescription(signal);

            // Create answer
            const answer = await rc.createAnswer();
            await rc.setLocalDescription(answer);

            // Send answer
            so.emit("signal", answer, gameId); // send offer/answer
        }
        else if (signal.type == "answer") {
            await rc.setRemoteDescription(signal);
            console.log("Remote description setted up");
        }
    })

    /// Create game
    async function createGame() {
        gameId = await invoke("online_game_id");
        dataChannel.channel = rc.createDataChannel(gameId);
        dataChannel.listener();
        
        so.emit("room", "create", gameId); // Create room

        // Create offer
        const offer = await rc.createOffer();
        await rc.setLocalDescription(offer);
        waithingForIce = true;

        // Send offer
        so.emit("signal", offer, gameId); // send offer/answer
    }
    
    /// Action join to game
    async function joinToGame() {
        gameId = (document.getElementById("game-id") as HTMLInputElement).value;
        
        if (!gameId) {
            console.error("Attach firstly 'game ID' when you would like to join")
        } else {
            rc.ondatachannel = (c) => {
                dataChannel.channel = c.channel;
                dataChannel.listener();
                // Here messages can be send
            };
    
            so.emit("room", "join", gameId, async (offers: RTCSessionDescriptionInit[]) => {
                // Add offerts
                offers.forEach(async offer => await rc.setRemoteDescription(offer));
    
                // Prepare answer
                const answer = await rc.createAnswer();
                await rc.setLocalDescription(answer);

                // Send answer
                so.emit("signal", answer, gameId); // send offer/answer
            });
        };

    }

    // Svelte Action function
    function pS(target: HTMLInputElement) {
        const listClick = () => {
            target.click();
        }

        const parentElement = target.parentElement!;

        // Initialize click on input[type=file] element
        parentElement.addEventListener("click", listClick)
        
        // Listen when user pickup file
        target.addEventListener("change", async (e) => {
            const file = target!.files![0];
            const fileImgExt = ["png", "jpg", "jpeg", "webp"];

            if (fileImgExt.includes(file.name.split(".").slice(-1)[0])) {
                // Convert file to base64 url form
                const r = new FileReader();

                r.onload = () => {
                    onlineGame.userHimselfProfile.image_blob = r.result as string;
                }
                
                r.readAsDataURL(file);
            }
            else console.warn(`You must attach file which is one from types: ${fileImgExt.join(", ")}`);
        })
        
        // Return object
        return {
            destroy() {
                parentElement.removeEventListener("click", listClick);
            }
        };
    }

    // When module scardfolding was rendered
    onMount(async () => {
        // Load user profile datas from file
        const userSelfProfileDatas = await loadProfileData();
        if (userSelfProfileDatas) {
            onlineGame.userHimselfProfile = userSelfProfileDatas;
        };

    });

    // When module was rendered out from app html dom
    onDestroy(async () => {
        // Save user profile datas in file
        await saveProfileData(onlineGame.userHimselfProfile);
    });
</script>

<button class="go-back" on:click={_ => dsp("go-back")}>
    <ArrowLeft size={24} fill="white"/>
</button>

{#if waithingForIce}
    <div class="waiting-for-ice">
        <div class="rot">
            <Rotate fill="whitesmoke" size={32}/>
        </div>
        <p>Waiting for prepare your room...</p>
    </div>
{/if}

<div class="inside">
    <div class="online-profile">
        <button id="profile-img" on:click={_ => null}>
            {#if !onlineGame.userHimselfProfile.image_blob}
                <UserAvatarFilledAlt size={52} fill="whitesmoke"/>
            {:else}
                <img src="{onlineGame.userHimselfProfile.image_blob}" alt="">
            {/if}
            {#if onlineGame.editStatuses.himself}
                <input type="file" id="profile-image-picker" hidden use:pS>
            {/if}
        </button>
        <div class="name">
            <p class="desc">Your Name</p>
            {#if onlineGame.editStatuses.himself}
                <input type="text" placeholder="Determine new name" bind:value={onlineGame.userHimselfProfile.name}>
            {:else}
                <p>{onlineGame.userHimselfProfile.name || "No specified"}</p>
            {/if}
        </div>
        <button id="edit" on:click={_ => onlineGame.editStatuses.himself = !onlineGame.editStatuses.himself}>
            {#if onlineGame.editStatuses.himself}
                <EditOff fill="whitesmoke"/>
            {:else}
                <Edit fill="whitesmoke"/>
            {/if}
        </button>
    </div>
    <div class="before-game">
        <div class="game-id-top-notch">
            <p>Game ID: <span class="game-id-emphasized">{gameId || "not specified"}</span></p>
        </div>
        <div class="decision">
            <div class="create">
                <h2>Create game</h2>
                <p class="game-id">{gameId}</p>
                <button on:click={createGame}>Make new</button>
            </div>
            <div class="join">
                <h2>Join to game</h2>
                <div class="inpt">
                    <input type="text" id="game-id" placeholder="Game identifier">
                    <button on:click={joinToGame}>Join to game</button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    * {
        font-family: 'Roboto-Normal', sans-serif;
        padding: 0px;
        margin: 0px;
    }

    button {
        cursor: pointer;
    }

    button.go-back {
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

    h2 {
        color: whitesmoke;
    }

    .inside {
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        row-gap: 10px;
    }
    
    .inside > div {
        width: 750px;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 4px;
        box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 15px;
    }

    .before-game {
        min-height: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    div.waiting-for-ice {
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        row-gap: 10px;
        align-items: center;
        justify-content: center;
        color: whitesmoke;
    }

    div.rot {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: rotate 500ms linear infinite forwards;
    }

    @keyframes rotate {
        to {
            transform: rotate(360deg);
        }
    }

    .online-profile {
        height: 150px;
        display: flex;
        column-gap: 5px;
        position: relative;
    }

    .online-profile > button#profile-img {
        width: 35%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-right: 5px;
        border-right: 2px solid black;
    }

    .online-profile > button#profile-img > img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background-color: black;
    }

    .online-profile > div.name {
        display: flex;
        flex-direction: column;
        row-gap: 2px;
        padding-left: 5px;
        padding-top: 5px;
        padding-bottom: 5px;
    }

    div.name p:first-of-type.desc {
        font-size: 10px;
        text-transform: uppercase;
        font-variant: small-caps;
        color: rgb(214, 212, 212);
        user-select: none;
    }

    div.name p:last-of-type:not(.desc) {
        font-size: 18px;
        color: whitesmoke;
    }

    div.name input[type="text"] {
        background-color: rgba(0, 0, 0, 0.15);
        outline: none;
        border: solid 1px black;
        font-size: 18px;
        padding: 5px;
        padding-left: 1px;
        padding-right: 1px;
        color: whitesmoke;
        caret-color: orangered;
    }

    div.name > input[type="text"]::placeholder {
        color: rgba(245, 245, 245, 0.628);
    }

    .online-profile > button#edit {
        position: absolute;
        top: 5px;
        right: 5px;
        padding: 4px;
        background-color: black;
        vertical-align: middle;
        border: solid 1px whitesmoke;
        border-radius: 4px;
    }

    .game-id-top-notch {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        color: white;
        padding-top: 5px;
        padding-bottom: 20px;
        border-bottom: solid 1px black;
        font-size: 18px;
    }

    span.game-id-emphasized {
        color: red;
    }

    .decision {
        display: flex;
        column-gap: 10px;
        padding-top: 15px;
        justify-content: flex-start;
    }

    .decision > div {
        width: 350px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        row-gap: 10px;
    }

    div.create button {
        height: 35px;
        width: 100%;
        background-color: rgba(94, 211, 141, 0.902);
        border-radius: 4px;
        font-size: 15px;
        color: white;
    }

    div.join div.inpt {
        width: 100%;
        height: 35px;
        display: flex;
    }

    div.inpt {
        border: solid 1px orangered;
        border-radius: 4px;
        overflow: hidden;
    }

    div.inpt > * {
        height: 100%;
    }

    div.inpt input {
        width: 70%;
        padding-left: 8px;
        padding-right: 8px;
        border: none;
        outline: none;
        background-color: rgba(0, 0, 0, 0.628);
        color: red;
    }

    div.inpt input::placeholder {
        color: whitesmoke;
    }

    div.inpt button {
        width: 30%;
        text-align: center;
        background-color: black;
        color: orangered;
    }
</style>
