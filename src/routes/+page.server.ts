import querystring from "querystring";
import { randomBytes } from "crypto";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "$env/static/private";

export const load = ({ url, request }) => {
    if (!url.search.length) { // Returned Params from this clousure are attached each time when page is without any URL Search params. This is required for allow user to start authentication on Spotify
        const spotifyAuthUrlParams = querystring.stringify(
            {
                response_type: "code",
                client_id: SPOTIFY_CLIENT_ID,
                scope: "user-read-private user-read-email playlist-read-private",
                redirect_uri: url.origin + "?callback=spotify", // Here is redirection target
                state: randomBytes(16).toString("hex")
            }
        );
    
        return {
            // Initialize for allow to obtain code from 'spotify api'
            spotifyAuthUrlParams
        }
    }
    else {
        if (url.search.length){ // These Return datas from this clousure will be attached to page which was redirection target from first Spotify API authorization step. Hereby these datas are in supermacy to get Auth Token for Spotify API
            const cb = url.searchParams.get("callback");
            const code = url.searchParams.get("code");

            if (cb == "spotify" && code) {
                // Prepare params for action obtaining authtoken
                return {
                    requestBody: querystring.stringify({
                        grant_type: "authorization_code",
                        code,
                        redirect_uri: url.origin + "?callback=spotify"
                    }), // Prepare 'requestBody'
                    authSpHeader: 'Basic ' + (Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')) // Prepare authorization header
                }
            }
        }
        
        return {}
    };
}