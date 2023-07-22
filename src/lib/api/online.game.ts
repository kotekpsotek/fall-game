import { exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import type { OnlineGame, OnlineProfileData, P2PCommunciationMessage, MessageTypes } from "./online.types";

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

/**
 * @description Sending messages functionalities
*/
export class MessageSender {
    channel: RTCDataChannel;
    
    constructor(channel: RTCDataChannel) {
        this.channel = channel;
    }

    /** Send message throught P2P communication channel */
    send<T>(type: MessageTypes, content: T) {
        // Try send message throught channel only when is still open (when is not closed)
        if (this.channel.readyState == "open") {
            const message = JSON.stringify({ content, type })
            this.channel.send(message);
        }
        else console.warn("Message not sended");
    }
}

/**
 * @description Manage all kind of Online communication
*/
export class OnlineGameCommunication {
    channel: RTCDataChannel;
    messages: MessageSender
    
    constructor(channel: RTCDataChannel) {
        this.channel = channel;
        this.listenForMessages();
        this.messages = new MessageSender(this.channel);
    }

    /**
     * @description Listen for messages flowing throught P2P communication
    */
    async listenForMessages(assignTo?: any) {
        /* this.channel.addEventListener("message", ({ data }) => {
            const parsedData: P2PCommunciationMessage<any> = JSON.parse(data);

            switch(parsedData.type) {
                case "profile-data":
                    const profileDatas = parsedData.content as OnlineProfileData;
                    assignTo! = profileDatas;
                break;
            }
        }) */
    }
}

/**
 * @description Make rescaling for spawned heart on diffrent screens
 * @param spawningPos 
 * @param dimensions 
 * @returns {{ x: number, y: number }}
 */
export function applyToDifferenceInDimensions(spawningPos: { x: number, y: number }, dimensions: { width: number, height: number, myWidth: number, myHeight: number }): { x: number, y: number } {
    const { width, height, myWidth, myHeight } = dimensions;
    
    // No calculation is needed -> Because difference in screen dimensions doesn't occur and posission does not overflow over screen dimenssion
    if (width == myWidth && height == myHeight && (spawningPos.x <= dimensions.width && spawningPos.y <= dimensions.height)) {
        return spawningPos;
    };

    // When some from spawning posissions is heighter then user screen dimensions, so hereby switch will be performing to maximum dimension value in examined axis
    if (spawningPos.x > dimensions.width) {
        spawningPos.x = dimensions.width;
    }

    if (spawningPos.y > dimensions.height) {
        spawningPos.y = dimensions.height;
    }

    // Calculation is needed -> Because difference in screens dimensions exist
    const oneMyPercent = { per_w: myWidth / 100, per_h: myHeight / 100 };
    const oneCompPercent = { per_w: width / 100, per_h: height / 100 };
    const compSpawnPosIsHisPer = { spwn_w_per: spawningPos.x / oneCompPercent.per_w, spwn_h_per: spawningPos.y / oneCompPercent.per_h };
    const toMyDimension = { x: compSpawnPosIsHisPer.spwn_w_per * oneMyPercent.per_w, y: compSpawnPosIsHisPer.spwn_h_per * oneMyPercent.per_h };

    // Return result
    return toMyDimension;
}
