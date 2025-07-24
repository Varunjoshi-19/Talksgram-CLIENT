import { createContext, useContext  } from "react";
import { Chat, CreateAndShareMessage } from "../Scripts/GetData";
import { fetchAllData, fetchProfileLocalStorage } from "../Scripts/FetchDetails";
import { NavigateFunction } from "react-router-dom";
import { MAIN_BACKEND_URL } from "../Scripts/URL";
import { useUserAuthContext } from "./UserContext";
import { useSocketContext } from "./SocketContext";

interface GeneralContextPayload {
    handleSharePost: (selectedUserId: string,
        sharePostRefId: string,
        toogleOpenCloseButton: React.Dispatch<React.SetStateAction<boolean>>,
        navigate: NavigateFunction,
        postOwnerId: string,
        postOwnerName: string,
    ) => Promise<void>;
    fetchPostStatus: (postId: string) => Promise<any>,
    handleLikePost: (postId: string, likedStatus: boolean) => Promise<boolean>;

}


const generalContext = createContext<GeneralContextPayload | undefined>(undefined);


export function useGeneralContext() {
    const context = useContext(generalContext);
    if (!context) throw new Error("general context not available!");

    return context;
}


export const GeneralContextProvider = ({ children }: { children: React.ReactNode }) => {


    const { profile } = useUserAuthContext();
    const { socket }  = useSocketContext();


    async function handleSharePost(selectedUserId: string,
        sharePostRefId: string,
        toogleOpenCloseButton: React.Dispatch<React.SetStateAction<boolean>>,
        navigate: NavigateFunction,
        postOwnerId: string,
        postOwnerName: string
    ) {

        if (!profile) return;
        console.log(selectedUserId, sharePostRefId);
        const otherUserId = selectedUserId;
        const data = await fetchAllData(profile, otherUserId);
        const { success } = data;
        if (!success) {
            navigate("/error");
            return;
        }

        const shareDataInfo = { ...data, refId: sharePostRefId, userId: postOwnerId, username: postOwnerName };
        const { receiverDetails, chatId, refId, userId, username } = shareDataInfo;

        const sharedInfo: Chat = {
            userId: profile._id,
            otherUserId: receiverDetails._id,
            chatId: chatId,
            initateTime: Date.now().toString(),
            senderUsername: profile.username || "",
            receiverUsername: receiverDetails.username || "",
            sharedContent: {
                type: "post",
                postOwnerId: userId,
                postOwnerName: username,
                refId: refId,
                previewText: "this is the shared post!"
            }
        }

        const reelTimeData = {
            senderId: profile._id,
            receiverId: receiverDetails._id,
            userId: profile._id,
            chatId: chatId,
            yourMessage: false,
            checkName: profile.username,
            username: profile.username,
            seenStatus: false,
            initateTime: Date.now() - 2 * 1000,
            recentChat: null,
            unseenCount: 0

        }


        // send the real time reference of that post that you are sharing 
        socket.emit("new-message", reelTimeData);
        socket.emit("new-chat", sharedInfo);

        const status: any = await CreateAndShareMessage(shareDataInfo, sharedInfo);




        if (!status.success) {
            alert("failed to share this post!");
            return;
        }

        toogleOpenCloseButton(false);


    }

    async function fetchPostStatus(postId: string) {

        const userProfile = localStorage.getItem("profile-details");

        if (userProfile) {

            const parsedProfile = JSON.parse(userProfile);
            const userId = parsedProfile._id;
            const infoId = { postId: postId, userId: userId };


            const likeResponse = await fetch(`${MAIN_BACKEND_URL}/uploadPost/fetchLikePost`, {

                method: "POST",
                headers: {
                    "Content-Type": "application/json"

                },
                body: JSON.stringify(infoId)

            })
            const likeResult = await likeResponse.json();
            console.log(likeResult);

            return {
                likeStatus: likeResponse.ok && likeResponse.status == 200 ? likeResult.likeStatus : false,
            }
        }



    }

    async function handleLikePost(postId: string, likeStatus: boolean): Promise<boolean> {

        const profile: any = await fetchProfileLocalStorage();
        if (!profile) return false;

        const idInfo = {
            postId: postId,
            userId: profile._id
        }

        console.log(idInfo);

        if (likeStatus) {
            await fetch(`${MAIN_BACKEND_URL}/uploadPost/remove-likePost`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(idInfo)
            });
            return false;
        }
        else {
            await fetch(`${MAIN_BACKEND_URL}/uploadPost/add-likePost`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(idInfo)
            });
            return true;
        }
    }


    return (
        <generalContext.Provider value={{ handleSharePost, fetchPostStatus, handleLikePost }} >
            {children}
        </generalContext.Provider>
    )
}


