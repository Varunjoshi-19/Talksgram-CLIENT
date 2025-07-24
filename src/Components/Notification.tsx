import { useState, useEffect } from "react";
import styles from "../Styling/Notification.module.css";
import { MAIN_BACKEND_URL } from "../Scripts/URL";
import { updateLocalStorageData } from "../Scripts/FetchDetails";
import { notificationPayload } from "../Interfaces";


interface NotificationProps {
    AllNotifications: Map<string, notificationPayload>;
    setAllNotifications: React.Dispatch<React.SetStateAction<Map<string, notificationPayload>>>;


    setNotiCount: React.Dispatch<React.SetStateAction<number>>;
}


const Notification: React.FC<NotificationProps> = ({ AllNotifications, setAllNotifications, setNotiCount }) => {

    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {

        const timeoutId = setTimeout(() => {
            setMessage(null);
        }, 2000);

        return () => {
            clearTimeout(timeoutId);
        }

    }, [message]);


    async function handleAcceptRequest(item: string) {

        const parsedItem = JSON.parse(item);
        console.log(parsedItem);

        setNotiCount(count => count - 1);

        setAllNotifications((prevNotification) => {

            const newMap = new Map(prevNotification);
            newMap.delete(parsedItem.userIdOf);
            return newMap;
        });

        setMessage(`Request accepted of ${parsedItem?.usernameOf}`);


        await fetch(`${MAIN_BACKEND_URL}/Personal-chat/AcceptedRequest`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: item
        });


        await updateLocalStorageData(parsedItem.userId);

    }

    async function handleRejectRequest(item: string) {

        const parsedItem = JSON.parse(item);


        setNotiCount(count => count - 1);

        setAllNotifications((prevNotification) => {

            const newMap = new Map(prevNotification);
            newMap.delete(parsedItem.userIdOf);
            return newMap;
        })

        setMessage(`Request rejected of ${parsedItem?.usernameOf}`);

        await fetch(`${MAIN_BACKEND_URL}/Personal-chat/removeFromRequested`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: item

        });

    }


    return (
        <div style={{ gap: "30px" }} className={styles.NotificationContainer} >

            <p style={{ padding: "20px 20px", fontWeight: "bolder", fontSize: "1.25rem" }}>Notification</p>

            <div className={styles.AllNotifications} >

                {AllNotifications.size > 0 ?

                    Array.from(AllNotifications).map(([userId, notification]) => (


                        <div key={userId} className={styles.eachNotification}>

                            <div id={styles.profileImage}>
                                <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${notification.userIdOf}`} width="100%" height="100%" alt="" />
                            </div>

                            <p>
                                {notification.usernameOf}
                            </p>

                            <div style={{ display: "flex", gap: "10px", marginLeft: "0%" }} >
                                <button onClick={() => handleAcceptRequest(JSON.stringify(notification))}
                                    style={{ backgroundColor: "#1877F2" }}
                                    className={styles.CustomButton} >
                                    <span>Accept</span>

                                </button>

                                <button onClick={() => handleRejectRequest(JSON.stringify(notification))}
                                    style={{ backgroundColor: "#2d2d2d" }}
                                    className={styles.CustomButton} >
                                    <span>Reject</span>
                                </button>
                            </div>
                        </div>

                    ))


                    :

                    <div>No notification</div>
                }

                <div>
                    {message && <p>{message}</p>}

                </div>

            </div>


        </div>
    );
}

export default Notification;
