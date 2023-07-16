<script lang="ts">
    import { invoke } from "@tauri-apps/api";
    import { io } from "socket.io-client";
    import { UserAvatarFilledAlt, Edit, EditOff } from "carbon-icons-svelte";

    let gameId: string = ""

    const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};
    const rc = new RTCPeerConnection(configuration);
    const so = io("http://localhost:8080");
    let dataChannel: { channel?: RTCDataChannel, listener: () => void } = { // TODO: send message function with full online cover
        listener() {
            this.channel!.onopen = () => console.log("Data channel is open");
            this.channel!.onmessage = ({ data }) => console.log("Message content is: " + data);
        } 
    };

    rc.onicecandidate = (candidate) => {
        so.emit("signal", rc.localDescription); // send offer/answer
    };

    so.on("signal-recv", async (signal) => {
        if (signal.type == "offer") {
            await rc.setRemoteDescription(signal);

            const answer = await rc.createAnswer();
            await rc.setLocalDescription(answer);
        }
        else if (signal.type == "answer") {
            await rc.setRemoteDescription(signal);
        }
    })

    /// Create game
    async function createGame() {
        gameId = await invoke("online_game_id");
        dataChannel.channel = rc.createDataChannel(gameId);
        dataChannel.listener();
        
        so.emit("room", "create", gameId); // Create room
        const offer = await rc.createOffer();
        await rc.setLocalDescription(offer);
    }
    
    /// Action join to game
    async function joinToGame() {
        const gameId = document.getElementById("game-id");
        
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
            });
        };

    }
</script>

<div class="inside">
    <div class="online-profile">
        <button id="profile-img">
            <UserAvatarFilledAlt size={52} fill="whitesmoke"/>
        </button>
        <div class="name">
            <p>Your Name</p>
            <p>Not specified</p>
        </div>
        <button id="edit">
            <Edit fill="whitesmoke"/>
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

    .online-profile > div.name {
        display: flex;
        flex-direction: column;
        row-gap: 2px;
        padding-left: 5px;
        padding-top: 5px;
        padding-bottom: 5px;
    }

    div.name p:first-of-type {
        font-size: 10px;
        text-transform: uppercase;
        font-variant: small-caps;
        color: rgb(214, 212, 212);
        user-select: none;
    }

    div.name p:last-of-type {
        font-size: 18px;
        color: whitesmoke;
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
