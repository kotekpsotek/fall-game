<script lang="ts">
    import { UserAvatarFilledAlt } from "carbon-icons-svelte";
    import type { OnlineProfileData } from "$lib/api/online.types";
    
    export let aboutUserDatas: OnlineProfileData;
    export let forUserGrade: "you" | "other";
</script>

<div class="online-game-badge" class:you={forUserGrade == "you"}>
    <div class="img">
        {#if aboutUserDatas.image_blob}
            <img src="{aboutUserDatas.image_blob}" alt="">
        {:else}
            <UserAvatarFilledAlt size={24} fill="whitesmoke"/>
        {/if}
    </div>
    <div class="name">
        {#if forUserGrade == "you"}
            <p>You ({aboutUserDatas.name || "Not specified"})</p>
        {:else}
            <p>{aboutUserDatas.name || "Not specified"}</p>
        {/if}
    </div>
</div>

<style>
    * {
        font-family: 'Roboto-Normal', sans-serif;
    }

    .online-game-badge {
        height: 40px;
        width: 175px;
        padding-left: 5px;
        padding-right: 5px;
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: rgba(0, 0, 0, 0.5);
        border: solid 1px black;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        column-gap: 5px;
        cursor: none;
    }

    .online-game-badge.you {
        left: 50px;
    }

    img {
        width: 25px;
        height: 25px;
        border: solid 1px whitesmoke;
        border-radius: 50%;
        object-fit: contain;
        background-color: black;
    }

    .name {
        font-size: 15px;
        color: whitesmoke;
        width: 100%;
    }

    .name > p {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
</style>
