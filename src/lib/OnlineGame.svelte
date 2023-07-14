<script lang="ts">
   let gameId: string = ""

   function createGame() {

   }

   function joinToGame() {

   }
</script>

<div class="inside">
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
                    <input type="text" placeholder="Game identifier">
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
        align-items: center;
        justify-content: center;
    }
    
    .before-game {
        min-height: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 4px;
        box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 15px;
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
