<script lang="ts">
    import { invoke } from "@tauri-apps/api";
    import { requestPermission, isPermissionGranted, sendNotification } from "@tauri-apps/api/notification";

    let nameSnakeCase = "";

    /** Say to user Hello with recived from him text */
    async function sayHello() {
        const messageFromBcknd: string = await invoke("hello_to_you", { nameSnakeCase })
        console.log(nameSnakeCase, messageFromBcknd)
        alert(nameSnakeCase)
    }
</script>

<div class="user-name">
    <input type="text" placeholder="Enter your name" bind:value={nameSnakeCase}>
    <button on:click={sayHello}>Get Hello from APP/</button>
</div>
