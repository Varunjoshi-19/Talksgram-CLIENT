import React, { useState, useEffect } from "react";
import styles from "../Styling/Login.module.css";
import { useNavigate } from "react-router-dom";
import { ACTIONS, useUserAuthContext } from "../Context/UserContext"
import { MAIN_BACKEND_URL } from "../Scripts/URL.ts";
import { useSocketContext } from "../Context/SocketContext.tsx";


function Login() {
    const [text, setText] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);


    const { socket } = useSocketContext();


    const URL = `${MAIN_BACKEND_URL}/accounts/login`;
    const navigate = useNavigate();
    const { dispatch } = useUserAuthContext();

    useEffect(() => {

        if (text.includes("@gmail.com")) {
            setEmail(text);
        }
        else {
            setUsername(text);
        }


        function clearUi() {


            setTimeout(() => {

                setError(null);
                setMessage(null);
            }, 1500)
        }

        clearUi();

    }, [text, error, message]);


    async function handleOnLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const accountInfo = {
            username,
            email,
            password
        };

        const response = await fetch(URL, {

            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(accountInfo)

        });

        const result = await response.json();

        if (response.ok) {
            operationsRelatedOnLogin(result);
        }
        if (!response.ok) {
            setMessage(null);
            setError(result.error);

        }


    }

    async function operationsRelatedOnLogin(result: any) {

        const profile = result.data.profile;
        localStorage.setItem("profile-details", JSON.stringify(profile));
        dispatch({ type: ACTIONS.SET_PROFILE, payload: profile });

        setError(null);
        setMessage(result.message);
        navigate("/");
        handleSendOnlineStatus(result.profile);


    }

    async function handleSendOnlineStatus(profile: any) {
        const id = profile._id;
        const username = profile.username;
        socket.emit("online", { userId: id, username: username });
    }

    return (
        <>
            <div className={styles.container}>
                {/* Login Information */}
                <div className={styles.loginInfo}>
                    <h1 className={styles.logo}>TalksGram</h1>
                    <form onSubmit={handleOnLogin}>
                        <input
                            type="text"
                            placeholder="Phone number, username, or email"
                            className={styles.input}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className={styles.input}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="submit" className={styles.loginButton}>
                            Log in
                        </button>

                        {<div style={{ display: "flex", justifyContent: "center", color: "red" }}>{message || error}</div>}
                    </form>
                    <div className={styles.orDivider}>
                        <div className={styles.line}></div>
                        <span>OR</span>
                        <div className={styles.line}></div>
                    </div>

                    <a href="/accounts/password/reset" className={styles.forgotPassword}>
                        Forgot password?
                    </a>
                </div>

                {/* No Account? Sign Up */}
                <div className={styles.noAccountSignUp}>
                    <p>
                        Don't have an account?{" "}
                        <a href="/accounts/signup" className={styles.signUpLink}>
                            Sign up
                        </a>
                    </p>
                </div>



                {/* Footer */}
                <div className={styles.footer}>
                    <p>© 2024 TalksGram By Varun Joshi</p>
                </div>
            </div>
        </>
    );
}

export default Login;
