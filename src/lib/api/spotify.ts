import { writable } from "svelte/store";
import { page } from "$app/stores";
import { invoke } from "@tauri-apps/api";

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
    const store_wr = writable<SpotifyAPIAuthData>({} as any);

    // Try load auth datas from file
    invoke<SpotifyAPIAuthData>("load_spotify_auth_datas")
        .then(datas => {
            store_wr.update(ub => {
                // Assign auth datas (mainly 'authtoken') from file only when it hasn't exired yet
                const dN = Date.now();
                const datasExpirationTime = datas.establishedInMs + datas.expires_inS * 1000;
                console.log(dN, datasExpirationTime, dN >= datasExpirationTime)

                if (dN <= datasExpirationTime) {
                    console.log("Loaded Spotify auth-datas from file")
                    ub = datas;
                }
                
                return ub;
            })
        })

    // Save auth datas only when it has got assigned values for keys
    store_wr.subscribe(datas => {
        if (Object.keys(datas).length) {
            const inv = invoke("save_spotify_auth_datas", { datas });
        }
    });

    return {
        ...store_wr
    }
})();
