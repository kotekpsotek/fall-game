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
        const message = JSON.stringify({ content, type })
        this.channel.send(message);
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
