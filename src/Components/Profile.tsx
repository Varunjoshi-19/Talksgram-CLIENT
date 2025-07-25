import MenuOptions from "./MenuOptions";
import styles from '../Styling/Profile.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faCamera, faThumbsUp, faComment } from '@fortawesome/free-solid-svg-icons';
import CreatePost from "./CreatePost";
import { useEffect, useState } from "react";
import EditProfile from "./EditProfile";
import LoadingScreen from "./LoadingScreen";
import CommentBox from "./CommentBox";
import { MAIN_BACKEND_URL } from "../Scripts/URL";
import { ACTIONS, useUserAuthContext } from "../Context/UserContext";
import { fetchProfileLocalStorage } from "../Scripts/FetchDetails";
import { useNavigate } from "react-router-dom";
import { AllPostsProps } from "../Interfaces";



function Profile() {

    const [selectedOption, setSelectedOption] = useState<string>("POST");
    const [uploadPostPopUp, setUploadPostPopUp] = useState<boolean>(false);
    const [allPosts, setAllPosts] = useState<AllPostsProps[]>([]);
    const [enableEditProfile, setEnableEditProfile] = useState<boolean>(false);
    const [postId, setPostId] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [toogleCommentBox, setCommentBox] = useState<boolean>(false);
    const [selectedPostUsername, setSelectedPostUsername] = useState<string>("");
    const [currentLikes, setCurrentLikes] = useState<number>(0);
    const [createdAtTime, setCreatedAt] = useState<string>("");
    const { profile, dispatch } = useUserAuthContext();

    const navigate = useNavigate();


    function UploadNewPostOption() {
        setUploadPostPopUp(c => !c);
    }

    function handleEditProfile() {
        setEnableEditProfile(c => !c);
    }

    function handleOpenCommentBox(id: string, username: string, userId: string, currentLikes: number, createdAt: string) {

        setCurrentLikes(currentLikes);
        setCreatedAt(createdAt);
        setPostId(id);
        document.body.style.overflow = "hidden";
        setSelectedPostUsername(username);
        setUserId(userId);
        setCommentBox(true);

    }

    function ProvideInfoToCommentBox() {
        const info = {
            userId: userId,
            username: selectedPostUsername
        }

        return info;
    }

    function closeCommentInfoBox() {
        setCommentBox(false);
        document.body.style.overflow = "visible";
        document.body.style.overflowX = "hidden";

        setPostId("");
    }


    useEffect(() => {

        async function fetchAllPosts() {

            if (!profile?._id || profile?._id == "") {
                return;
            }

            const response = await fetch(`${MAIN_BACKEND_URL}/uploadPost/allPosts/${profile?._id}`, { method: "POST" });

            const result = await response.json();
            if (response.ok) {
                setAllPosts(result.allPosts);

            }
            if (!response.ok) {
                setAllPosts([]);
            }
        }

        fetchAllPosts();

    }, [profile])



    if (!profile) {
        // FETCH THE PROFILE FROM THE LOCAL STORAGE...
        (async () => {
            const profile = await fetchProfileLocalStorage();
            if (!profile) navigate("/login");
            dispatch({ type: ACTIONS.REMOVE_PROFILE, payload: profile });
        })();
    }

    const [showMain, setShowMain] = useState<boolean>(false);


    useEffect(() => {
        const timer = setTimeout(() => {
            setShowMain(true);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    if (!showMain || !profile) {
        return <LoadingScreen />
    }




    return (
        <div>
            {uploadPostPopUp && <CreatePost s={UploadNewPostOption} />}

            {profile != null && <MenuOptions profile={profile} />}

            {enableEditProfile && <EditProfile profileInfo={profile} s={handleEditProfile} />}
            {toogleCommentBox &&
                <CommentBox id={postId}
                    toogleBox={closeCommentInfoBox}
                    userInfoF={ProvideInfoToCommentBox} currentLikes={currentLikes}
                    createdAt={createdAtTime} />
            }

            <div className={styles.profileContainer} >

                <div className={styles.profileInformation}>

                    <div className={styles.profileImage} >
                        <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${profile?._id}`} alt="_profileImage" width="100%" height="100%" />
                    </div>

                    <div className={styles.profileInfo} >

                        <div style={{ display: "flex", gap: "25px", alignItems: "center" }} >
                            <span style={{ fontSize: "1.05rem" }} >{profile?.username}</span>
                            <button onClick={handleEditProfile} style={{ cursor: "pointer", fontSize: "1.03rem", color: "white", backgroundColor: "rgba(82, 78, 78, 0.712)", padding: "5px 10px", borderRadius: "5px", border: 'none', fontWeight: "bolder" }}>Edit Profile</button>
                            <button style={{ fontSize: "1.03rem", color: "white", backgroundColor: "rgba(82, 78, 78, 0.712)", padding: "5px 10px", borderRadius: "5px", border: 'none', fontWeight: "bolder" }}>View Archieve</button>
                            <span><FontAwesomeIcon icon={faCog} /></span>
                        </div>

                        <div style={{ display: "flex", gap: "25px" }}>
                            <p><span style={{ fontWeight: "bolder" }}>{profile?.post}</span> post</p>
                            <p><span style={{ fontWeight: "bolder" }}>{profile?.followers} </span>{profile?.followers > 1 ? " followers" : "follower"}</p>
                            <p><span style={{ fontWeight: "bolder" }}>{profile?.following} </span>{profile?.following > 1 ? " followings" : "following"}</p>
                        </div>
                        <div><span style={{ fontWeight: "bolder" }}>{profile?.fullname}</span></div>

                        <div style={{ display: "flex" }}>
                            {profile?.bio}
                        </div>
                    </div>

                </div>

                <div className={styles.highlights}>

                    <div style={{ fontSize: "3rem", display: "flex", alignItems: "center", justifyContent: "center" }} id={styles.eachHighlights}>
                        +
                    </div>

                    <div style={{ fontSize: "3rem", display: "flex", alignItems: "center", justifyContent: "center" }} id={styles.eachHighlights}>
                        +
                    </div>

                    <div style={{ fontSize: "3rem", display: "flex", alignItems: "center", justifyContent: "center" }} id={styles.eachHighlights}>
                        +
                    </div>

                    <div style={{ fontSize: "3rem", display: "flex", alignItems: "center", justifyContent: "center" }} id={styles.eachHighlights}>
                        +
                    </div>

                </div>



                <div className={styles.postContainer} >

                    <div >
                        <span onClick={() => setSelectedOption("POST")} style={{ cursor: "pointer", padding: "10px 10px", borderTop: `${selectedOption == "POST" ? "1px solid white" : "none"}` }} >POSTS</span>
                        <span onClick={() => setSelectedOption("SAVED")} style={{ cursor: "pointer", padding: "10px 10px", borderTop: `${selectedOption == "SAVED" ? "1px solid white" : "none"}` }} >SAVED</span>
                        <span onClick={() => setSelectedOption("TAGGED")} style={{ cursor: "pointer", padding: "10px 10px", borderTop: `${selectedOption == "TAGGED" ? "1px solid white" : "none"}` }} >TAGGED</span>
                    </div>





                </div>


                {selectedOption === "POST" &&

                    <div style={{ position: "relative", left: "10%" }}>
                        {
                            allPosts.length > 0 ?

                                <div className={styles.allPostsContainer} >

                                    {allPosts.map((post, index) => (



                                        <div onClick={() => handleOpenCommentBox(post._id, profile.username, post.author.userId, post.postLike, post.createdAt)} key={index}
                                            className={styles.eachPost}>

                                            <img src={`${MAIN_BACKEND_URL}/uploadPost/postImage/${post?._id}`}
                                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                                alt="image" />

                                            <div id={styles.likeAndComment} >
                                                <p style={{ display: "flex", gap: "5px" }} >{post.postLike}<FontAwesomeIcon icon={faThumbsUp} /> </p>
                                                <p style={{ display: "flex", gap: "5px" }} >{post.postComment}<FontAwesomeIcon icon={faComment} /> </p>
                                            </div>
                                        </div>






                                    ))}

                                </div>
                                :
                                <div style={{ display: "flex", gap: "15px", flexDirection: "column", alignItems: "center", }} >

                                    <div id={styles.cameraIcon}>
                                        <FontAwesomeIcon icon={faCamera} size="3x" />

                                    </div>

                                    <p style={{ fontSize: "25px", fontWeight: "bolder" }} >Share photos</p>
                                    <p >when you share photos ,they will appear on your profile</p>
                                    <p onClick={() => setUploadPostPopUp(true)} style={{ color: "#1877F2", fontWeight: "bolder", cursor: "pointer" }} >Share your first photo</p>

                                </div>
                        }
                    </div>

                }


                {selectedOption === "SAVED" && <div>NO SAVED</div>}
                {selectedOption === "TAGGED" && <div>NO TAGGED</div>}




                <footer>

                    <div style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center", gap: "20px", fontSize: "11px",
                        alignItems: "center", wordWrap: "break-word", flexWrap: "wrap"
                    }}>

                        <span>About</span>
                        <span>Blog</span>
                        <span>Jobs</span>
                        <span>Help</span>
                        <span>API</span>
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Locations</span>
                        <span>Instagram Lite</span>
                        <span>Threads</span>
                        <span>Contact uploading and non-users</span>
                        <span>Meta Verified</span>
                    </div>

                    <div style={{ display: "flex", gap: "30px", fontSize: "12px", padding: "20px 20px" }} >
                        <span>English (UK)</span>
                        <span>© 2024 TALKSGRAM BY VARUN JOSHI</span>
                    </div>


                </footer>

            </div>


        </div>
    )
}

export default Profile


