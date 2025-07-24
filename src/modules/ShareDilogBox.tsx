import { X } from "lucide-react";
import styles from "../Styling/ShareDilog.module.css";
import { useEffect, useState } from "react";
import { fetchSearchUser } from "../Scripts/FetchDetails";
import messageStyles from "../Styling/ToMessage.module.css";
import { MAIN_BACKEND_URL } from "../Scripts/URL";
import { useGeneralContext } from "../Context/GeneralContext";
import { useNavigate } from "react-router-dom";
import { searchAccount } from "../Interfaces";

interface ShareDilogBoxPayload {

    toogleOpenCloseButton: React.Dispatch<React.SetStateAction<boolean>>;
    sharePostRefId: string;
    postOwnerId: string,
    postOwnerName: string;
}

function ShareDilogBox({ toogleOpenCloseButton, sharePostRefId, postOwnerId, postOwnerName }: ShareDilogBoxPayload) {

    const [searchValue, setSearchValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { handleSharePost } = useGeneralContext();
    const [searchAccounts, setSearchedAccounts] = useState<searchAccount[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const navigate = useNavigate();


    useEffect(() => {

        async function fetchSearchedUser() {

            setSelectedUserId("");

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
        console.log(JSON.parse(account));
        const parsedAccount = JSON.parse(account);
        const id = parsedAccount._id;
        setSelectedUserId(id);

    }

    async function sharePost() {
        await handleSharePost(selectedUserId,
            sharePostRefId,
            toogleOpenCloseButton,
            navigate,
            postOwnerId,
            postOwnerName);
    }



    return (
        <div className={styles.blackBehindContainer} >

            <div className={styles.crossButton} >
                <X onClick={() => toogleOpenCloseButton(prev => !prev)} />
            </div>


            <div id={messageStyles.toMessage} style={{ height: "55%", width: "40%" }}>

                <div style={{
                    display: "flex", opacity: "1", position: "relative",
                    height: "10%", width: "100%",
                    borderTopLeftRadius: "10px", borderTopRightRadius: "10px",
                    alignItems: " center", justifyContent: "center"
                }}>

                    <p style={{ fontWeight: "bolder" }} >Share with your friends</p>

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

                    {loading && <div className={messageStyles.loader}>

                    </div>}

                </div>

                <div className={messageStyles.foundedAccounts}>


                    {searchAccounts.length > 0 ?

                        searchAccounts.map((account) => (


                            <div onClick={() => handleSelectedUser(JSON.stringify(account))} key={account._id} className={messageStyles.eachAccount} >

                                <div id={messageStyles.profileImage}>
                                    <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${account._id}`} alt="_pic" width="100%" height="100%" />
                                </div>

                                <div>
                                    <p>{account.username}</p>
                                </div>

                                <input value={JSON.stringify(account)}
                                    onChange={() => setSelectedUserId(account._id)}
                                    checked={selectedUserId === account._id}
                                    style={{ position: "absolute", right: "20px", fontSize: "5rem", transform: "scale(2)" }}
                                    type="radio" name="users" />
                            </div>



                        ))

                        :

                        <p key="1" >No account found.</p>

                    }

                </div>
                <button onClick={sharePost} id={messageStyles.chatButton}>Share</button>

            </div >





        </div>
    )
}

export default ShareDilogBox
