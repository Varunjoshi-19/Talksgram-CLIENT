import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchChattedUserDetails } from "../Scripts/FetchDetails";
import { ChattedUserPayload, CountMessages } from "../Scripts/GetData";
import { useUserAuthContext } from "./UserContext";

interface chatContextPayload {
    AllChattedUsers: Map<string, ChattedUserPayload>;
    messageCount: number;
    setMessageCount: React.Dispatch<React.SetStateAction<number>>;
    setChattedUsers: React.Dispatch<React.SetStateAction<Map<string, ChattedUserPayload>>>;
}


const chatContext = createContext<chatContextPayload | undefined>(undefined)

export function useChatContext() {
    const context = useContext(chatContext);
    if (!context) throw new Error("context not available!")

    return context;
}

export function ChatContextProvider({ children }: { children: React.ReactNode }) {

    const [AllChattedUsers, setChattedUsers] = useState<Map<string, ChattedUserPayload>>(new Map());
    const [messageCount, setMessageCount] = useState<number>(0);
    const { profile } = useUserAuthContext();


    const handleCountTotalMessages = useCallback((users: any) => {
        const totalCount = CountMessages(users);
        setMessageCount(totalCount);
    }, []);


    useEffect(() => {

        async function fetchChattedUser() {
            if (profile) {
                const id = profile._id;
                const users: any = await fetchChattedUserDetails(id);
                console.log("these are the fetch chateed user ", users);
                setChattedUsers(users);
                handleCountTotalMessages(users);
            }
        }

        fetchChattedUser();

    }, [profile]);


    return (

        <chatContext.Provider value={{ AllChattedUsers, setChattedUsers, messageCount, setMessageCount }}>
            {children}
        </chatContext.Provider>
    )


}

