import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { io, Socket } from "socket.io-client";
import { useUserAuthContext } from "./UserContext";
import { fetchProfileDetails } from "../Scripts/FetchDetails";
import { MAIN_BACKEND_URL } from "../Scripts/URL";


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


    useEffect(() => {

        socket.on("user-follow-request", handlefollowRequest);

        return () => {
            socket.off("user-follow-request", handlefollowRequest);
            socket.off("connDetailsReq", handleForwardDetails);
        }

    }, []);


    useEffect(() => {

        socket.on("connDetailsReq", handleForwardDetails);
       



    }, [user, socket])

    return (
        <socketContext.Provider value={{ socket, notification, notificationCount, setNotificationCount }} >
            {children}
        </socketContext.Provider>
    )

}