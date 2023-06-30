<script lang="ts">
    export let userPoints = 0;
</script>

<div class="points-badge">
    <div class="pnts">
        <p>Your points:</p>
        <p class="points">{userPoints}</p>
    </div>
</div>

<style>
    .points-badge {
        font-family: 'Roboto-Normal';
        width: 100vw;
        position: absolute;
        top: 10px;
    }
    
    .pnts {
        display: flex;
        justify-content: center;
        column-gap: 10px;
        z-index: 10;    
    }
    
    .points {
        color: white;
        font-weight: 600;
        text-decoration: underline solid white;
    }
</style>
