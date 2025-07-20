import { useNavigate } from "react-router-dom";
import styles from "../Styling/Signup.module.css";
import React, { useEffect, useState } from "react";
import { MAIN_BACKEND_URL } from "../Scripts/URL";

function Signup() {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [fullname, setFullName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const navigate = useNavigate();


    async function handleOnSignUp(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();


        const accountDetails = { email, password, fullname, username };

        const response = await fetch(`${MAIN_BACKEND_URL}/accounts/signup`, {

            method: "POST",
            headers: {
                "Content-type": "application/json",

            },
            body: JSON.stringify(accountDetails)

        });

        const result = await response.json();

        if (response.ok) {
            setError(null);
            setMessage(result.message);
            navigate("/accounts/login");

        }

        if (!response.ok) {
            setMessage(null);
            setError(result.error);

        }

    }

    useEffect(() => {

        function clearUi() {

            setTimeout(() => {

                setError(null);
                setMessage(null);

            }, 1500);

        }
        clearUi();

    }, [error, message])


    return <>
        <div className={styles.container}>
            {/* Login Information */}
            <div className={styles.loginInfo}>
                <h1 className={styles.logo}>TalksGram</h1>
                <h2>Sign up to see photos and videos from your friends.</h2>
                <form onSubmit={handleOnSignUp} >
                    <input
                        type="text"
                        placeholder="Enter Email"
                        className={styles.input}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className={styles.input}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Full Name"
                        className={styles.input}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        className={styles.input}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <p style={{ fontSize: "12px" }}>People who use our service may have uploaded your contact information to Instagram. Learn More

                        By signing up, you agree to our Terms , Privacy Policy and Cookies Policy .</p>

                    <button type="submit" className={styles.loginButton}>
                        Sign Up
                    </button>

                    {<div style={{ display: "flex", justifyContent: "center", color: "red" }}>{message || error}</div>}
                </form>
                <div className={styles.orDivider}>
                    <div className={styles.line}></div>
                    <span>OR</span>
                    <div className={styles.line}></div>
                </div>
                <button className={styles.facebookLogin}>
                    Log in with Facebook
                </button>
                <a href="/accounts/password/reset" className={styles.forgotPassword}>
                    Forgot password?
                </a>
            </div>

            {/* No Account? Sign Up */}
            <div className={styles.noAccountSignUp}>
                <p>
                    Have an Account ?{" "}
                    <a href="/accounts/login" className={styles.signUpLink}>
                        Login
                    </a>
                </p>
            </div>

            {/* Links to App Store and Play Store */}
            <div className={styles.linkToDownload}>
                <p>Get the app.</p>
                <div className={styles.downloadLinks}>
                    <img

                        alt="Download from App Store"
                    />
                    <img

                        alt="Download from Google Play"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <p>© 2024 TalksGram By Varun Joshi</p>
            </div>
        </div>
    </>


}

export default Signup;