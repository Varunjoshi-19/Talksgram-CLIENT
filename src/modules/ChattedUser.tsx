import { useNavigate } from "react-router-dom";
import { useChatContext } from "../Context/ChattedUserContext"
import { ChattedUserPayload, handleTimeFormating } from "../Scripts/GetData";
import styles from '../Styling/Messages.module.css';
import { MAIN_BACKEND_URL } from "../Scripts/URL";
import { useUserAuthContext } from "../Context/UserContext";
import { seenAllChats } from "../Scripts/FetchDetails";

interface ChattedProps {
    ResetEverythingOnDom?: () => void;
}


function ChattedUser({ ResetEverythingOnDom }: ChattedProps) {

    const { AllChattedUsers, setChattedUsers, setMessageCount } = useChatContext();
    const { profile } = useUserAuthContext();
    const navigate = useNavigate();



    async function handleEnableMessageTab(_: string, value: string) {
        const user: any = JSON.parse(value);

        if (!profile) return;
        if (ResetEverythingOnDom) {
            ResetEverythingOnDom();
        }

        navigate(`/Personal-chat/${user.userId}`);

        let iteratorCount = 0;
        setChattedUsers(prevChattedUser => {
            const newMap = new Map(prevChattedUser);
            if (user && user.userId) {
                const value = newMap.get(user.userId);
                if (value) {
                    iteratorCount = value.unseenCount;
                    value.unseenCount = 0;
                }
            }

            return newMap;

        })



        if (user.yourMessage) {
            return;
        }


        const receiverId = profile._id;
        const senderId = user.userId;

        for (let i = 0; i < iteratorCount; i++) {
            setMessageCount(prevCount => prevCount - 1);
        }
        await seenAllChats(senderId, receiverId);

    }

    if (!profile) return;


    return (
        <div style={{ gap: "20px" }} className={styles.MessagesContainer}>

            {AllChattedUsers.size > 0 &&

                Array.from(AllChattedUsers).map(([key, value]: [key: string, value: ChattedUserPayload]) => (

                    <div key={key} onClick={() => handleEnableMessageTab(key, JSON.stringify(value))} style={{ gap: "20px" }} id={styles.userMessage}>
                        <div id={styles.userIcon}>
                            <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${value.userId}`} width="100%" height="100%" alt="_image" />
                        </div>

                        <div>
                            <p style={{ opacity: "0.9" }}>{value.username}</p>
                            {value.unseenCount > 0 ?


                                <span style={{ fontWeight: "bolder", fontSize: "13px" }}>{value.unseenCount} unread message
                                    {value.initateTime && <span style={{ marginLeft: "4px", fontWeight: "lighter", fontSize: "12px" }}>• {handleTimeFormating(Number(value.initateTime))}</span>}
                                </span>

                                :

                                <span style={{ opacity: "0.5" }}>{profile.username != value.checkName ? `${value.checkName}` : "You"}• {value.recentChat ? value.recentChat : "some attactment"}</span>
                            }
                        </div>
                        {value.unseenCount > 0 &&
                            <span
                                style={{
                                    position: "absolute", right: "30px", width: "10px", height: "10px",
                                    backgroundColor: "blue", borderRadius: "50%"

                                }}></span>}
                    </div>

                ))

            }




        </div>
    )
}

export default ChattedUser
