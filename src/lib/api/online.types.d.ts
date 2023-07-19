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
    /**
     * @description When 0 - means no one user is ready, 1 - other user from competition is ready so decision is assigned to receiver
    */
    bothUserRedinness: 0 | 1,
    /**
     * @description Describe actual game status: not-initialized - means game hasn't been started, started - that game has been started, paused - that game was paused by one from users
    */
    gameStatus: "not-initialized" | "started" | "paused"
}

type OnlineProfileData = OnlineGame["adverseLoverProfile"];
type MessageTypes = "profile-data" | "no-aceptation" | "rediness-state" | "game-started" | "competitor-quit";

interface P2PCommunciationMessage<T> {
    type: MessageTypes,
    content: T
}

export type {
    OnlineGame,
    OnlineProfileData,
    MessageTypes,
    P2PCommunciationMessage
}
