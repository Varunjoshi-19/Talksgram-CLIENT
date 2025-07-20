import { MAIN_BACKEND_URL } from "../Scripts/URL";
import styles from "../Styling/EditProfile.module.css";
import { useRef, useState, useEffect } from "react";

interface EditProfileProps {

    profileInfo: {
        _id: string;
        username: string;
        fullname: string;
        post: number,
        bio: string;
        followers: number;
        following: number
    };

    s: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ profileInfo, s }) => {

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [fullname, setFullname] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [profileImage, setProfileImage] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [profile, setFile] = useState<File | null>();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const url = MAIN_BACKEND_URL;

    function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {

        const file = e.target.files?.[0];
     
        if (file) {
            setFile(file);
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
         
        }
    }

    function handleEditProfileImage() {
      
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    async function handleSubmitNewProfile() {

        const cross: HTMLElement | null = document.getElementById("cross-button");

        if (cross) {
            cross.style.display = "none";

            setTimeout(() => {
                cross.style.display = "block";
            }, 2000);

        }

        if (username == "" || fullname == "") {
            setError("feild can not be empty");
            return;
        }


        const formData = new FormData();
        formData.append("id", profileInfo._id);
     

        if (username != profileInfo.username) {
          
            formData.append("username", username);
        }
        if (fullname != profileInfo.fullname) {
          
            formData.append("fullname", fullname);
        }
        if (bio != profileInfo.bio) {
           
            formData.append("bio", bio);
        }
        if (profile) {
            
            formData.append("profileImage", profile);
        }


        const response = await fetch(`${url}/accounts/update-profile`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            setError(null);
            setMessage(result.message);
         
            setTimeout(() => {

                s();

            }, 1500);
        }

        if (!response.ok) {
            setMessage(null);
            setError(result.error);
        }

    }

    useEffect(() => {

        function setDetails() {

            setUsername(profileInfo?.username);
            setFullname(profileInfo?.fullname);
            setBio(profileInfo?.bio);
            setProfileImage(`${MAIN_BACKEND_URL}/accounts/profileImage/${profileInfo?._id}`);
        }


        setDetails();


    }, [profileInfo]);


    useEffect(() => {

        function clearUi() {

            setTimeout(() => {

                setMessage(null);
                setError(null);
            }, 1500)
        }


        clearUi();

    }, [message, error]);



    return (
        <>
            <div className={styles.EditProfileContainer} >


                <button id="cross-button" style={{
                    position: "absolute", right: "10px",
                    color: "white", fontSize: "2rem", backgroundColor: "transparent", border: "none",
                    cursor: "pointer"
                }} onClick={s}>✖</button>
            </div>

            <div id={styles.editProfile}>
                
                <div style={{
                    display: "flex", opacity: "1", position: "relative",
                    height: "10%", width: "100%",
                    borderTopLeftRadius: "10px", borderTopRightRadius: "10px", backgroundColor: "black",
                    alignItems: " center", justifyContent: "center"
                }}>

                    <p style={{ fontWeight: "bolder" }} >Edit Profile</p>

                </div>


                <div style={{
                    alignItems: "center", justifyContent : "center" , top: "15%", left: "10%",  height :"100%", width : "100%",
                    gap: "20px", display: "flex", flexDirection: "column"
                }} >

                    <div style={{  display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" }} >

                        <div id={styles.profileIconEdit} >
                            <img src={profileImage} alt="_profileImage" width="100%" height="100%" />
                        </div>

                        <button onClick={handleEditProfileImage} style={{
                            cursor: "pointer", border: 'none', borderRadius: "5px", padding: "3px 3px"
                            , backgroundColor: "#707070", color: "white", fontWeight: "bolder"
                        }} >Edit</button>

                        <input type="file"
                            name="profileImage"
                            accept="image/*"
                            style={{ display: "none" }}
                            ref={fileInputRef}
                            onChange={handleSelectFile} />

                    </div>


                    <div style={{ display: "flex", border : "none", width : "100%",  flexDirection: "column", gap: "30px" }}>

                        <div style={{ display: 'flex', gap: "10px" }}>
                            <p style={{ fontSize: "1.25rem", fontWeight: "bolder" }} >Name : </p>
                            <input value={fullname} onChange={(e) => setFullname(e.target.value)} type="text" style={{
                                width: "80%", textDecoration: "none",
                                outline: 'none', backgroundColor: "transparent", border: "none",
                                borderBottom: "3px solid black", color: "white", fontSize: "1.25rem",
                            }} />
                        </div>

                        <div style={{   display: 'flex', gap: "5px" }}>
                            <p style={{ fontSize: "1.05rem", fontWeight: "bolder" }}>Username: </p>
                            <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" style={{
                                width: "76.5%", textDecoration: "none",
                                outline: 'none', backgroundColor: "transparent", border: "none",
                                borderBottom: "3px solid black", color: "white", fontSize: "1.25rem"
                            }} />
                        </div>


                        <div style={{  display: 'flex', gap: "50px" }}>
                            <p style={{ position: "relative", left : "10px", fontSize: "1.25rem", fontWeight: "bolder" }}>Bio: </p>
                            <input value={bio} onChange={(e) => setBio(e.target.value)} type="text" style={{
                                width: "78%", textDecoration: "none",
                                outline: 'none', backgroundColor: "transparent", border: "none",
                                borderBottom: "3px solid black", color: "white", fontSize: "1.25rem"
                            }} />
                        </div>


                        <button id = {styles.changeButton} onClick={handleSubmitNewProfile} 
                     >Change</button>
                    </div>

                    {message ? <div style={{ fontWeight: "bolder", color: "#5cb85c", display: "flex" , position : "absolute" , left : "5px" , bottom : "10px" }} >
                       {message}
                    </div>

                        :
                        <div style={{ fontWeight: "bolder", color: "red", display: "flex", position: "absolute", top: "100%", left: "20%" }} >
                            {error}
                        </div>
                    }

                </div>



            </div >
        </>


    )
}

export default EditProfile
