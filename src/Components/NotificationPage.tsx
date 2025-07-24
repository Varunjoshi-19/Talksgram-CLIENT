import { useEffect, useState } from "react";
import styles from "../Styling/NotificationPage.module.css";
import { MAIN_BACKEND_URL } from "../Scripts/URL.js";
import { useUserAuthContext } from "../Context/UserContext.js";
import { NotificationProps } from "../Interfaces/index.js";



function NotificationPage() {

    const [AllNotifications, setAllNotifications] = useState<NotificationProps[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const { profile } = useUserAuthContext();


    useEffect(() => {

        async function fetchAllRequests() {
            if (!profile) return;

            const id = profile._id;
            const response = await fetch(`${MAIN_BACKEND_URL}/Personal-chat/fetchRequests/${id}`, { method: "POST" });

            const result = await response.json();

            if (response.ok) {
                setAllNotifications(result.requests);
            }

        }

        fetchAllRequests();

    }, [profile]);

    useEffect(() => {


        function clearUi() {

            setTimeout(() => {

                setMessage(null);

            }, 1500);

        }
        clearUi();

    }, [message]);


    async function handleAcceptRequest(item: string) {
        const parsedItem = JSON.parse(item);

        const response = await fetch(`${MAIN_BACKEND_URL}/Personal-chat/AcceptedRequest`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: item
        });

        const result = await response.json();
        if (response.ok) {
            setMessage(`${result.message} of ${parsedItem.usernameOf}`);
            setAllNotifications(

                (notification) => notification.filter((each) => {

                    return each.userId != parsedItem.userId;
                }))
        }
        if (!response.ok) {
            setMessage(result.error);
        }

    }

    async function handleRejectRequest(item: string) {

        const parsedItem = JSON.parse(item);

        const response = await fetch(`${MAIN_BACKEND_URL}/Personal-chat/removeFromRequested`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: item

        });
        const result = await response.json();
        if (response.ok) {
            setMessage(`Request ${result.message} of ${parsedItem.usernameOf}`);
            setAllNotifications(

                (notification) => notification.filter((each) => {

                    return each.userId != parsedItem.userId;
                }))
        }

    }



    return (
        <div style={{ gap: "30px" }} className={styles.NotificContainer} >

            <p style={{ padding: "20px 20px", fontWeight: "bolder", fontSize: "1.25rem" }}>Notification</p>

            <div className={styles.AllNotific} >

                {AllNotifications.length > 0 ?


                    AllNotifications.map((item, index) => (


                        <div key={index} className={styles.eachNotific}>

                            <div id={styles.profileImage}>
                                <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${item.userIdOf}`} width="100%" height="100%" alt="" />
                            </div>

                            <p style={{ color: "white", fontWeight: "bolder" }}>
                                {item.usernameOf}
                            </p>

                            <div style={{ display: "flex", gap: "10px", marginLeft: "0%" }} >
                                <button onClick={() => handleAcceptRequest(JSON.stringify(item))} style={{
                                    padding: "5px 5px", fontSize: "15px", color: "white",
                                    fontWeight: "bolder", backgroundColor: "#1877F2", border: 'none'
                                    , borderRadius: "5px", cursor: "pointer"
                                }} >Accept</button>

                                <button onClick={() => handleRejectRequest(JSON.stringify(item))} style={{
                                    padding: "5px 5px", fontSize: "15px", color: "white",
                                    fontWeight: "bolder", backgroundColor: "rgba(112, 112, 112, 0.507)", border: 'none'
                                    , borderRadius: "5px", cursor: "pointer"
                                }} >Reject</button>
                            </div>

                        </div>

                    ))


                    :

                    <div>No notification</div>
                }

                {message && <div className={styles.message} >
                    <p style={{ fontSize: "15px" }} >{message}</p>
                </div>}
            </div>


        </div>
    );
}

export default NotificationPage;
