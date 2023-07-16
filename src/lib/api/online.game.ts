import { exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import type { OnlineGame } from "./online.types";

const onlineProfileFile = "profile.datas.json"

/**
 * @description Load user self profile data from file
 * @returns {Promise<OnlineGame["userHimselfProfile"] | undefined>}
*/
export async function loadProfileData(): Promise<OnlineGame["userHimselfProfile"] | undefined> {
    if (await exists(onlineProfileFile)) {
        const textFileD = await readTextFile(onlineProfileFile);
        const desFileD = JSON.parse(textFileD) as OnlineGame["userHimselfProfile"];
        return desFileD;
    }
    else return;
}

/**
 * @description Save user self profile data into file
 * @returns {Promise<void>}
*/
export async function saveProfileData(data: OnlineGame["userHimselfProfile"]): Promise<void> {
    await writeTextFile(onlineProfileFile, JSON.stringify(data));
} 
