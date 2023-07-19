<script lang="ts">
    import { Copy } from "carbon-icons-svelte"
    
    const defaultNotSpecifiedId = "Not specified";
    export let gameIdentifier: string = defaultNotSpecifiedId;
    export let additionalConf: Partial<{ leftMargin: boolean, pixel18FontSize: boolean }>

    /**
     * @description Copy Identifier to Device clipboard
     * @param ev - Event object
    */
    async function copyTextIdenfifier(ev: Event) {
        const { currentTarget } = ev;
        const text = (currentTarget as HTMLParagraphElement).querySelector("p")!.textContent!;

        // Copy text to clipboard
        await navigator.clipboard.writeText(text);
    }
</script>

<button class="id-field" class:margin-left={additionalConf?.leftMargin} class:pixel18={additionalConf?.pixel18FontSize} title="Click to copy game identifier" on:click={copyTextIdenfifier}>
    <p>{gameIdentifier || defaultNotSpecifiedId}</p>
    <Copy size={18} fill="whitesmoke"/>
</button>

<style>
    * {
        margin: 0px;
        padding: 0px;
    }
    
    .id-field {
        color: whitesmoke;
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 5px;
        padding: 2px;
        color: orangered;
        font-size: 16px;
    }

    .id-field.margin-left {
        margin-left: 5px;
    }

    .id-field.pixel18 {
        font-size: 18px;
    }
</style>
