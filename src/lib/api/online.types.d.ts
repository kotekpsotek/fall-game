interface OnlineGame {
    userHimselfProfile: {
        name: string,
        image_blob: string
    },
    adverseLoverProfile: OnlineGame["userHimselfProfile"],
    editStatuses: { 
        himself: boolean,
        adverse: boolean
    },
    connectionEstablished: boolean,
    bothUserRedinness: 0 | 1 | 2
}

type OnlineProfileData = OnlineGame["adverseLoverProfile"];
type MessageTypes = "profile-data" | "no-aceptation" | "rediness-state";

interface P2PCommunciationMessage<T> {
    type: MessageTypes,
    content: T
}

export {
    type OnlineGame,
    type OnlineProfileData,
    type MessageTypes,
    type P2PCommunciationMessage
}
