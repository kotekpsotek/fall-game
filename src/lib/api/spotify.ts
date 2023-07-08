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

/** Contains data about user himself profile */
export interface UserProfileData {
    /** Spotify user id */
    display_name: string,
    /** User id */
    id: string,
    /** User profile images when user attached other profile image/s regards to default */
    images: { url: string, height: number, width: number }[],
    // + other keys not depleted by UserProfileData type shape
}

/** Contains datas about user playlists */
export interface UserPlaylistDatas {
    /** Name of playlist */
    /** List of user playlist. Each playlist is represented by independent object located on list */
    items: { 
        /** Identifier of playlist */
        id: string,
        /** Name of playlist */
        name: string,
        /** Spotify identifier of playlist */
        uri: string 
        /** images of playlist in descending dimensions ration. Images list can be empty or carry up to 3 images */
        images: { height: number, width: number, url: string }[],
        /** Whether playlist is public */
        public: boolean
    }[]
}

/** Get Spotify user datas */
export class SpotifyApi {
    /** Abbreviation for making rest calls towards Spotify API */
    private static async makeCall(uri: string, restMethod: "GET" | "POST", body?: any, otherHeaders?: HeadersInit) {
        // Obtain user Auth Datas from Auth Result storage
        const userAuthDatas = await new Promise<SpotifyAPIAuthData>((res, rej) => {
            spotifyApiAuthDatas.update(uAuth => {
                res(uAuth);
                return uAuth;
            })
        });

        // Make REST HTTP call and return it result
        return fetch(uri, {
            method: restMethod,
            headers: {
                "Authorization": 'Bearer ' + userAuthDatas.access_token,
                ...otherHeaders
            },
            body
        })
    } 
    
    /** Obtain current user (**authenticated user**) profile informations */
    static async currentUserProfile() {
        const call = await SpotifyApi.makeCall("https://api.spotify.com/v1/me", "GET");

        if (call.status == 200) {
            const data: UserProfileData = await call.json();
            return Promise.resolve(data);
        }
        else {
            // When error log it content to console
            const stat = await call.json();
            console.log(stat);

            // When error return failure cause
            return Promise.reject("Couldn't obtain profile data");
        }
    }

    /** Obtain list of user playlist maximum up to 50 per one call to offset (next 50 will be avaiable by changing offset from 0 to 1) */
    static async currentUserPlaylists(offset = 0) {
        const call = await SpotifyApi.makeCall(`https://api.spotify.com/v1/me/playlists?offset=${offset}&limit=${50}`, "GET");

        if (call.status == 200) {
            const playlistDatas: UserPlaylistDatas = await call.json();
            return Promise.resolve(playlistDatas);
        }
        else {
            // When error log it content to console
            const stat = await call.json();
            console.log(stat);

            // When error return failure cause
            return Promise.reject("Couldn't obtain playlists data");
        }
    }
}

/** Representing type of source which is actual playing */
interface ActualPlaying {
    type: "spotify",
    /** Whether GUI element to manage subject state should be loaded */
    setted: boolean,
    playing: boolean,
    spotify_id?: string
}

/** Representing source of what is actual playing */
export const whatIsPlayedStore = (function() {
    const store = writable<ActualPlaying>({ playing: false } as ActualPlaying)
    return { ...store }; 
})()
