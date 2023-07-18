<script lang="ts">
    export let adverseName: string = "";
</script>

<div class="popup">
    <div class="src">
        <h2>User <span>{adverseName || "Not specified"}</span> did not approve your participation in game!</h2>
        <div class="close">
            <button on:click>Ok</button>
        </div>
    </div>
</div>

<style>
    div.popup {
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.2);
        position: absolute;
        top: 0px;
        right: 0px;
    }

    div.src {
        width: 450px;
        background-color: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 4px;
        border: solid 1px whitesmoke;
        box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 15px;
        display: flex;
        flex-direction: column;
        row-gap: 15px;
    }

    div.close {
        display: flex;
        justify-content: flex-end;
    }

    div.close button {
        width: 100px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        background-color: green;
    }
</style>
