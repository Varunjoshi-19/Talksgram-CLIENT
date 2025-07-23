import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { io, Socket } from "socket.io-client";
import { useUserAuthContext } from "./UserContext";
import { fetchProfileDetails, seenAllChats } from "../Scripts/FetchDetails";
import { MAIN_BACKEND_URL } from "../Scripts/URL";
import { useChatContext } from "./ChattedUserContext";
import { CountMessages } from "../Scripts/GetData";


interface SocketContextPayload {
    socket: Socket;
    notification: any;
    notificationCount: boolean,
    setNotificationCount: React.Dispatch<React.SetStateAction<boolean>>;

}

const socketContext = createContext<SocketContextPayload | undefined>(undefined);
export function useSocketContext() {
    const context = useContext(socketContext);
    if (!context) throw new Error("socket context not available!");

    return context;
}




export const SocketProvider = ({ children }: { children: React.ReactNode }) => {


    const socket: Socket = useMemo(() => io(MAIN_BACKEND_URL, {
        transports: ["websocket"],
        withCredentials: true
    }), []);


    const { user } = useUserAuthContext();

    const [notification, setNotification] = useState<any>();
    const { setChattedUsers, setMessageCount } = useChatContext();
    const [notificationCount, setNotificationCount] = useState<boolean>(false);




    function handlefollowRequest(data: any) {
        setNotification(data);
        console.log(data);
    }

    async function handleForwardDetails() {

        if (!user) return;

        const userProfile = await fetchProfileDetails(user.id);
        const userId = userProfile._id;

        const connectionDetails = {
            username: user?.username,
            socketId: socket.id,
            userId: userId,
        }

        socket.emit("connectionDetails", connectionDetails);
    }

    async function handleUpdateChattedUser(reelTimeData: any) {
        const { senderId, receiverId, chatId, userId, yourMessage, username, checkName, initateTime, seenStatus, recentChat, unseenCount } = reelTimeData;

        if (!(await validateAndProceed(senderId, receiverId))) return;

        const extractedData: any = {
            chatId, userId, yourMessage, username, checkName, initateTime, seenStatus, recentChat, unseenCount
        };

        setChattedUsers(prev => {
            let newMap = new Map(prev);
            if (!newMap.has(userId)) {
                newMap.set(userId, extractedData);
            }
            const value = newMap.get(userId);
            if (value) {
                value.unseenCount++;
                value.recentChat = recentChat;
                value.initateTime = initateTime;
            }

            handleCountTotalMessages(newMap);
            return newMap;
        });
    }


    const handleCountTotalMessages = useCallback((users: any) => {
        const totalCount = CountMessages(users);
        setMessageCount(totalCount);
    }, []);

    async function validateAndProceed(senderId: string, receiverId: string): Promise<boolean> {

        const currentPath = window.location.pathname;

        if (currentPath === `/Personal-chat/${senderId}`) {
            await seenAllChats(senderId, receiverId);
            return false;
        }

        let id;
        let start = 0;
        let end = currentPath.length;
        for (let i = currentPath.length - 1; i >= 0; i--) {
            const current = currentPath[i];
            if (current == "/") {
                start = i + 1;
                break;
            }
        }
        id = currentPath.substring(start, end);
        if (id === senderId) return false;

        return true;
    }

    useEffect(() => {

        socket.on("user-follow-request", handlefollowRequest);
        socket.on("new-message", handleUpdateChattedUser);
        return () => {
            socket.off("user-follow-request", handlefollowRequest);
            socket.off("new-message", handleUpdateChattedUser);
        }

    }, []);

    useEffect(() => {

        socket.on("connDetailsReq", handleForwardDetails);

        return () => {
            socket.off("connDetailsReq", handleForwardDetails);
        }

    }, [user, socket]);


    return (
        <socketContext.Provider value={{ socket, notification, notificationCount, setNotificationCount }} >
            {children}
        </socketContext.Provider>
    )

}