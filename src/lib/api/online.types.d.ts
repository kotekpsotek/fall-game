interface OnlineGame {
    userHimselfProfile: {
        name: string,
        image_blob: string
    },
    adverseLoverProfile: OnlineGame["userHimselfProfile"],
    editStatuses: { 
        himself: boolean,
        adverse: boolean
    }
}

type OnlineProfileData = OnlineGame["adverseLoverProfile"];

export {
    type OnlineGame,
    type OnlineProfileData
}
