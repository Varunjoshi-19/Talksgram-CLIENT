import { MAIN_BACKEND_URL } from "./URL";







export interface ProfileProps {

    _id: string | any,
    fullname: string,
    username: string,
    followers: number,
    following: number,
    bio: string
}

export type ShowFile = {
    extensionName: string,
    actualBlob: string,
}

export type InfoDataType = {
    chat?: string,
    senderUsername: string,
    receiverUsername: string,
    chatId: string,
    audioData?: AudioData | null;
    AdditionalInfoData?: BufferedDataType[];

}

export type AudioData = {

    blobFile: Blob,
    extension: string
}

export type AdditionalDataType = {
    _id?: string,
    contentType: string,

}

export interface Chat {
    _id?: string,
    userId: string | any,
    otherUserId: string | any,
    chatId: string | any;
    senderUsername: string;
    receiverUsername: string,
    initateTime: string;
    chat?: string;
    temporaryAddData?: ShowFile[];
    AdditionalData?: any;
    sharedContent?: {
        type: "post" | "reel",
        postOwnerId: string,
        postOwnerName: string,
        refId: string,
        previewText?: string
    };
}

export type BufferedDataType = {

    file: any,
    extension: string,
}


export interface ChattedUserPayload {
    chatId: string,
    userId: string,
    yourMessage: boolean,
    checkName: string,
    username: string,
    initateTime?: string,
    seenStatus: string,
    recentChat?: string,
    unseenCount: number
}


export function formattedPostTime(postedTime: string) {
    const dateObject = new Date(postedTime);
    const date = dateObject.getDate();
    const year = dateObject.getFullYear();
    const month = convertMonths(dateObject.getMonth());

    return `${date} ${month} ${year}`;
}


function convertMonths(month: number): string {

    switch (month) {
        case 1: return "Jan";
        case 2: return "Feb"
        case 3: return "Mar"
        case 4: return "April"
        case 5: return "May"
        case 6: return "Jun"
        case 7: return "July"
        case 8: return "Aug"
        case 9: return "Sept"
        case 10: return "Oct"
        case 11: return "Nov"
        case 12: return "Dec"
        default: return "";

    }

}


export function handleTimeFormating(previousTime: number) {

    const timeNow = Date.now();
    let timeAgo;
    const seconds = Math.floor((timeNow - previousTime) / 1000);

    if (seconds < 60) {
        timeAgo = `${seconds} sec`;
        return timeAgo;
    }
    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        timeAgo = `${minutes} min`;
        return timeAgo;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        timeAgo = `${hours} hr`;
        return timeAgo;
    }

    const days = Math.floor(hours / 24);
    if (days == 1) {
        timeAgo = `${days} day`;
        return timeAgo;
    }
    else {
        timeAgo = `${days} days`
        return timeAgo;
    }

}

export async function CreateAndShareMessage(shareDataInfo: any, sharedInfo: any) {


    try {
        const response = await fetch(`${MAIN_BACKEND_URL}/uploadPost/share-post/${shareDataInfo.refId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(sharedInfo)
        });

        if (response.ok) {
            return { success: true, message: "successfully shared!" };
        }
        if (!response.ok) {
            return { success: false, message: "failed to share this post!" };
        }

    } catch (error) {
        return { success: false, message: error };
    }


}


export const CountMessages = (users: any) => {
    let count = 0;

    Array.from(users.values()).forEach((each: any) => {
        count += each.unseenCount;
    })

    return count;

}