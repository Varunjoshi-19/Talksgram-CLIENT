import { io } from "socket.io-client";
import video1 from "../video/1.mp4";
import video2 from "../video/2.mp4";
import video3 from "../video/3.mp4";
import video4 from "../video/4.mp4";
import video5 from "../video/5.mp4";
import { MAIN_BACKEND_URL } from "./URL";


export const Reels = [


    {

        src: video3,
        autoPlay: false,


    },


    {

        src: video1,
        autoPlay: true,


    },


    {

        src: video2,
        autoPlay: false,


    },





    {

        src: video4,
        playOrPause: true,
        autoPlay: false,


    },

    {

        src: video5,
        playOrPause: true,
        autoPlay: false,


    },

];

export const BACKEND_URL = MAIN_BACKEND_URL;
export const socket = io(MAIN_BACKEND_URL, {
    transports: ["websocket"],
    withCredentials: true,

});

export interface ChattedUserInfo {

    chatId: string | any,
    userId: string,
    otherUserId: string,
    username: string,
    chat: string

}


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
    username: string
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
    username: string;
    initateTime: string;
    chat?: string;
    temporaryAddData?: ShowFile[];
    AdditionalData?: any;
    sharedContent?: {
        type: "post" | "reel",
        postOwnerId : string,
        postOwnerName : string,
        refId: string,
        previewText?: string
    };
}

export type BufferedDataType = {

    file: any,
    extension: string,
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


export async function CreateAndShareMessage(data: any) {

    const { senderDetails, receiverDetails, chatId, refId , userId , username } = data;

    const sharedInfo: Chat = {
        userId: senderDetails._id,
        otherUserId: receiverDetails._id,
        chatId: chatId,
        initateTime: Date.now().toString(),
        username: senderDetails.username || "",
        sharedContent: {
            type: "post",
            postOwnerId : userId,
            postOwnerName : username,
            refId: refId,
            previewText: "this is the shared post!"
        }
    }


    try {
        const response = await fetch(`${BACKEND_URL}/uploadPost/share-post/${refId}`, {
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