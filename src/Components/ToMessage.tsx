import { useEffect, useState } from "react";
import styles from "../Styling/ToMessage.module.css";

import { fetchSearchUser } from "../Scripts/FetchDetails.ts";
import { MAIN_BACKEND_URL } from "../Scripts/URL.ts";

export interface searchAccount {
    _id: string,
    username: string,
    fullname: string,
    followers: number,
    following: number
}



interface ToMessageProps {

    toogleButton: () => void;
    EnableMessageTab: (value: string) => void;
}


const ToMessage: React.FC<ToMessageProps> = ({ toogleButton, EnableMessageTab }) => {

    const [searchAccounts, setSearchedAccounts] = useState<searchAccount[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedUserForChat, setSelectedUser] = useState<searchAccount | any>();
    const [disableChat, setDisableChat] = useState<boolean>(true);

    useEffect(() => {

        async function fetchSearchedUser() {


            setSelectedUser("");
            setDisableChat(true);

            if (searchValue == "") {

                setSearchedAccounts([]);
                return;
            }

            setLoading(true);

            const result = await fetchSearchUser(searchValue);

            if (result) {
                setSearchedAccounts(result);
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }

            if (!result) {
                setSearchedAccounts([]);
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }


        }

        fetchSearchedUser();

    }, [searchValue])


    function handleSelectedUser(account: string) {
        setSelectedUser(account);
        setDisableChat(false);
    }

    function EnableChat() {
        if (selectedUserForChat) {
            setDisableChat(false);
        }
    }

    function handleStartChatting() {
        toogleButton();
        EnableMessageTab(selectedUserForChat);

    }


    return (
        <>
            <div className={styles.ToMessageContainer} >

            </div>

            <div id={styles.toMessage}>

                <button id="cross-button" style={{
                    position: "absolute", right: "10px", zIndex: "1",
                    color: "white", fontSize: "2rem", backgroundColor: "transparent", border: "none",
                    cursor: "pointer"
                }} onClick={toogleButton} >
                    ✖
                </button>

                <div style={{
                    display: "flex", opacity: "1", position: "relative",
                    height: "10%", width: "100%",
                    borderTopLeftRadius: "10px", borderTopRightRadius: "10px",
                    alignItems: " center", justifyContent: "center"
                }}>

                    <p style={{ fontWeight: "bolder" }} >New message</p>

                </div>



                <div style={{
                    position: "absolute", width: "100%", height: "10%",
                    top: "10%", gap: "10px",
                    borderTop: "1px solid rgba(168, 165, 165, 0.212)",
                    borderBottom: "1px solid rgba(168, 165, 165, 0.212)",
                    display: "flex", alignItems: "center"
                }}>

                    <p style={{ padding: "10px 10px", fontWeight: "bolder" }}>To : </p>
                    <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
                        type="text" style={{
                            backgroundColor: "transparent", border: "none", outline: "none",
                            color: "white", fontSize: "1.10rem", width: "80%"
                        }} placeholder="Search..." />

                    {loading && <div className={styles.loader}>

                    </div>}

                </div>

                <div className={styles.foundedAccounts}>


                    {searchAccounts.length > 0 ?

                        searchAccounts.map((account) => (


                            <div onClick={() => handleSelectedUser(JSON.stringify(account))} key={account._id} className={styles.eachAccount} >

                                <div id={styles.profileImage}>
                                    <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${account._id}`} alt="_pic" width="100%" height="100%" />
                                </div>

                                <div>
                                    <p>{account.username}</p>
                                </div>

                                <input onClick={EnableChat} value={JSON.stringify(account)}
                                    onChange={() => setSelectedUser(JSON.stringify(account))}
                                    checked={selectedUserForChat === JSON.stringify(account)}
                                    style={{ position: "absolute", right: "20px", fontSize: "5rem", transform: "scale(2)" }}
                                    type="radio" name="users" />
                            </div>



                        ))

                        :

                        <p key="1" >No account found.</p>

                    }

                </div>
                <button onClick={handleStartChatting} disabled={disableChat} style={{ opacity: `${disableChat ? "0.2" : "1"}` }} id={styles.chatButton}>Chat</button>

            </div >

        </>


    )
}

export default ToMessage
