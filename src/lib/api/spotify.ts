import { writable } from "svelte/store";
import { page } from "$app/stores"

interface SpotifyAPIAuthData {
    establishedInMs: number;
    access_token: string,
    token_type: string,
    scope: string
    expires_inS: number,
    refresh_token: string
}

/** Initialize user authentication in order to obtain "authtoken" for API next calls */
export function spotifyInitializeUserAuthentication() {
    page.subscribe(s => {
        const authenticationOptions = s.data.spotifyAuthUrlParams;
    
        // Obtain authentication code
        window.location.replace(`https://accounts.spotify.com/authorize?${authenticationOptions}`);
    });
}

/** Store data required to communicate with 'Spotify API' */
// TODO: Save auth datas by backend in file or operation memory
export const spotifyApiAuthDatas = (() => {
    const store_wr = writable<SpotifyAPIAuthData>({} as any)

    return {
        ...store_wr
    }
})();
