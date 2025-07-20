import styles from "../Styling/ForgetPassword.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MAIN_BACKEND_URL } from "../Scripts/URL";



function ResetPassword() {

    const [password, setPassword] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const navigate = useNavigate();
    const { id1, id2 } = useParams<{ id1: string; id2: string }>();
    const URL = MAIN_BACKEND_URL;





    useEffect(() => {


        async function checkValidParams() {

            const response = await fetch(`${MAIN_BACKEND_URL}/accounts/valid-password-reset/${id1}/${id2}`, { method: "POST" })

            if (!response.ok) {
                navigate("/err");
            }


        }

        checkValidParams();

    }, [id1, id2])


    async function ResetPassword() {

        if (password == "") {
            setMessage("fields can not be empty");
            return;
        }


        const resetData = {

            keyId: id2,
            userId: id1,
            newPassword: password

        }



        const response = await fetch(`${URL}/resetPassword`, {

            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(resetData)
        });

        const result = await response.json();

        if (response.ok) {
            setMessage(result.message);

            setTimeout(() => {

                navigate("/accounts/login");

            }, 1500);
        }

        if (!response.ok) {
            setMessage(result.error);
        }


    }



    useEffect(() => {

        function clearUi() {

            setTimeout(() => {
                setMessage("");
            }, 1500);
        }

        clearUi();

    }, [message]);

    return (

        <>
            <div className={styles.container}>

                <p id={styles.talksgram}>TALKSGRAM</p>
            


                <div className={styles.infoBox}>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                            id={styles.lockIcon}>

                            <FontAwesomeIcon icon={faLock} size="3x" color="white" />

                        </div>

                        <p style={{ margin: "10px" }}>TROUBLE IN LOGINING ?</p>

                        <input

                            style={{
                                margin: "10px", width: "300px", height: "35px",
                                borderRadius: "5px", color: "white", border: "1px solid gray", background: "none", padding: "5px"
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='enter your new password'
                        />



                        <button style={{
                            backgroundColor: "#1877F2", color: "white",
                            fontWeight: "bold", fontSize: "15px", margin: "10px", width: "300px",
                            height: "30px", borderRadius: "5px", border: "none", cursor: "pointer"
                        }} className={styles.scale}

                            onClick={ResetPassword}

                        >Reset Password</button>

                    </div>

                    <p>{message}</p>

                </div>



                {/* Footer */}
                <div className={styles.footer}>
                    <p>© 2024 TalksGram By Varun Joshi</p>
                </div>
            </div>
        </>
    )
}

export default ResetPassword
