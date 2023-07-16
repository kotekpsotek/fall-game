import { exists, readTextFile } from "@tauri-apps/api/fs";
import type { OnlineGame } from "./online.types";

/**
 * @description Load user self profile data from file
 * @returns {Promise<OnlineGame["userHimselfProfile"] | undefined>}
*/
export async function loadProfileData(): Promise<OnlineGame["userHimselfProfile"] | undefined> {
    if (await exists("profile.datas.json")) {
        const textFileD = await readTextFile("profile.datas.json");
        const desFileD = JSON.parse(textFileD) as OnlineGame["userHimselfProfile"];
        return desFileD;
    }
    else return;
}


