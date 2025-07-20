import styles from "../Styling/ForgetPassword.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MAIN_BACKEND_URL } from "../Scripts/URL";



function ForgotPassword() {

const [message, setMessage] = useState<string | null>("");
const [inputText, setInputText] = useState<string>("");
const [OTP, setOTP] = useState<number | null>(null);
const [userId, setUserId] = useState<string | null>(null);
const navigate = useNavigate();



    useEffect(() => {

        function clearUi() {

            setTimeout(() => {
                setMessage("");
            }, 1500);
        }

        clearUi();

    }, [message]);


    async function SendOtp() {

        if (!inputText.includes("@gmail.com")) {
            setMessage("invalid email format");
            return;
        }

        if (inputText == "") {
            setMessage("fields can not be empty");
            return;
        }

        const info = {

            email: inputText
        }

        const response = await fetch(`${MAIN_BACKEND_URL}/accounts/sendOtp`, {


            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(info)
        });

        const result = await response.json();

        if (response.ok) {

            setOTP(result.OTP);
            setUserId(result.userId);
            setInputText("");
            window.alert(`OTP -> ${result.OTP} , Copy your OTP otherwise you loss it.`);
        }

        if (!response.ok) {
            setMessage(result.message);
        }


    }

    async function VerifyOtp() {
        try {
            const info = {
                userId: userId,
                enteredOTP: Number(inputText),
            };

            const response = await fetch(`${MAIN_BACKEND_URL}/accounts/verifyOTP`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(info),
            });


            const result = await response.json();

            if (response.ok) {
                setMessage(result.message || "Verification successful!");

                setTimeout(() => {
                    navigate(`/rs/${userId}/${result?.keyId}`);
                }, 2000);
            }
            else if (!response.ok && response.status === 400) {
                setMessage(result.message);
            }
            else {
                setMessage(result?.message || "An error occurred.");

                setTimeout(() => {
                    navigate("/");
                }, 2000);
            }
        }
        catch (error) {
            console.error("Error:", error);
            setMessage("An unexpected error occurred.");
        }
    }


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
                        <p style={{ fontSize : "13px" }}>Enter your email address, phone number or username, and we'll send you a link to get back into your account.</p>

                        <input

                            style={{
                                margin: "10px", width: "300px", height: "35px", 
                                borderRadius: "5px", color: "white", border: "1px solid gray", background: "none", padding: "5px"
                            }}
                            value={inputText}
                            type={OTP ? "number" : "text"}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={OTP ? "enter OTP" : "enter email"}
                        />



                        <button onClick={OTP ? VerifyOtp : SendOtp} style={{
                            backgroundColor: "#1877F2", color: "white",
                            fontWeight: "bold", fontSize: "15px", margin: "10px", width: "300px",
                            height: "30px", borderRadius: "5px", border: "none", cursor: "pointer"
                        }} className={styles.scale}



                        >{OTP ? "Verify" : "Send OTP"}</button>

                    </div>

                    {message && <p>{message}</p>}

                </div>



                {/* Footer */}
                <div className={styles.footer}>
                    <p>© 2024 TalksGram By Varun Joshi</p>
                </div>
            </div>
        </>
    )
}

export default ForgotPassword
