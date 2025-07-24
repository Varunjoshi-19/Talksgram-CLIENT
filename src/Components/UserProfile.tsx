import { useNavigate, useParams } from 'react-router-dom'
import MenuOptions from './MenuOptions';
import styles from "../Styling/Profile.module.css";


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faComment, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from "react";


import LoadingScreen from './LoadingScreen';
import { MAIN_BACKEND_URL } from '../Scripts/URL';
import { useSocketContext } from '../Context/SocketContext';
import { useUserAuthContext } from '../Context/UserContext';
import CommentBox from './CommentBox';
import { fetchProfileDetails } from '../Scripts/FetchDetails';
import { AllPostsProps, ProfileInfo } from '../Interfaces';



function UserProfile() {

    const { id }: any = useParams();
    const navigate = useNavigate();

    const { socket } = useSocketContext();
    const { profile } = useUserAuthContext();

    const [profileInfo, setProfileInfo] = useState<ProfileInfo | any>();
    const [showStatus, setShowStatus] = useState<string>("Follow");
    const [allPosts, setAllPosts] = useState<AllPostsProps[]>([]);
    const [selectedPostUsername, setSelectedPostUsername] = useState<string>("");
    const [currentLikes, setCurrentLikes] = useState<number>(0);
    const [createdAtTime, setCreatedAt] = useState<string>("");
    const [postId, setPostId] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [toogleCommentBox, setCommentBox] = useState<boolean>(false);




    useEffect(() => {

        (async () => {

            const user = await fetchProfileDetails(id);

            if (profile) {
                if (id == profile._id) {
                    navigate("/accounts/profile");
                    return;
                }

            }

            if (!user) {
                navigate("/error");
                return;
            }
            setProfileInfo(user);

        })();

        (async () => {
            const response = await fetch(`${MAIN_BACKEND_URL}/uploadPost/allPosts/${id}`, { method: "POST" });

            const result = await response.json();
            if (response.ok) {
                setAllPosts(result.allPosts);

            }
            if (!response.ok) {
                setAllPosts([]);
            }
        })();


    }, [id, profile]);


    useEffect(() => {

        async function checkFollowStatus() {
            const userIdOf = profile?._id;
            const userIds = {
                userId: profileInfo?._id,
                userIdOf: userIdOf
            };

            try {
                // Check requested status
                const response = await fetch(`${MAIN_BACKEND_URL}/Personal-chat/checkRequested`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userIds)
                });

                if (!response.ok) {
                    console.error('Failed to fetch checkRequested', response.statusText);
                    return;
                }

                const result = await response.text(); // Use text() to check the raw response
                const parsedResult = result ? JSON.parse(result) : null;

                if (response.status === 202 && parsedResult) {
                    setShowStatus(parsedResult.status);
                    return;
                }

                // If not requested, check followed status
                if (response.status === 204) {
                    const rs = await fetch(`${MAIN_BACKEND_URL}/Personal-chat/checkFollowed`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(userIds)
                    });
                    const res = await rs.text();
                    const parsedRes = res ? JSON.parse(res) : null;

                    if (rs.ok && parsedRes) {
                        setShowStatus(parsedRes.status);
                    }
                }
            } catch (error) {
                console.error("Error checking follow status:", error);
            }
        }

        checkFollowStatus();
    }, [profile , profileInfo]);

    

    function handleOpenCommentBox(id: string, username: string, userId: string, currentLikes: number, createdAt: string) {

        setCurrentLikes(currentLikes);
        setCreatedAt(createdAt);
        setPostId(id);
        document.body.style.overflow = "hidden";
        setSelectedPostUsername(username);
        setUserId(userId);
        setCommentBox(true);

    }

    function closeCommentInfoBox() {
        setCommentBox(false);
        document.body.style.overflow = "visible";
        document.body.style.overflowX = "hidden";

        setPostId("");
    }

    function ProvideInfoToCommentBox() {
        const info = {
            userId: userId,
            username: selectedPostUsername
        }

        return info;
    }

    async function handleFollowUser() {

        if (!profile) return;

        let followInfo = {

            userId: "",
            userIdOf: "",
            usernameOf: ""
        };

        const userId = profileInfo._id;
        followInfo.userId = userId;



        followInfo.userIdOf = profile?._id;
        followInfo.usernameOf = profile?.username;


        if (showStatus == "Requested") {
            setShowStatus("Follow");
            await fetch(`${MAIN_BACKEND_URL}/Personal-chat/removeFromRequested`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(followInfo)
            });
        }

        if (showStatus == "Follow") {

            setShowStatus("Requested");
            const response = await fetch(`${MAIN_BACKEND_URL}/Personal-chat/SendFollowRequest`, {

                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(followInfo)
            })

            if (response.ok && response.status == 202) {

                const data = {
                    socketId: socket.id,
                    receiverUserID: userId,
                    senderUserID: profile._id,
                    username: profile.username
                }

                socket.emit("follow-request", data);
                return;
            }

        }

        if (showStatus == "Following") {
               setShowStatus("Follow");
             await fetch(`${MAIN_BACKEND_URL}/Personal-chat/removeFollower`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(followInfo)

            })



        }

    }


    const [showMain, setShowMain] = useState<boolean>(false);


  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMain(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!showMain || !profileInfo) {
    return <LoadingScreen />
  }





    return (
        <>

            {profile != null && <MenuOptions profile={profile} />}
            {toogleCommentBox &&
                <CommentBox id={postId}
                    toogleBox={closeCommentInfoBox}
                    userInfoF={ProvideInfoToCommentBox} currentLikes={currentLikes}
                    createdAt={createdAtTime} />
            }

            <div className={styles.profileContainer}>

                <div className={styles.profileInformation}>

                    <div className={styles.profileImage} >
                        <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${profileInfo?._id}`} alt="_profileImage" width="100%" height="100%" />
                    </div>

                    <div className={styles.profileInfo} >

                        <div style={{ display: "flex", gap: "25px", alignItems: "center" }} >
                            <span style={{ fontSize: "1.05rem" }} >{profileInfo?.username}</span>
                            <button onClick={handleFollowUser} style={{ cursor: "pointer", fontSize: "1.03rem", color: "white", backgroundColor: "rgba(82, 78, 78, 0.712)", padding: "5px 10px", borderRadius: "5px", border: 'none', fontWeight: "bolder" }}>{showStatus}</button>
                            <button onClick={() => navigate(`/Personal-chat/${profileInfo?._id}`)} style={{ cursor: "pointer", fontSize: "1.03rem", color: "white", backgroundColor: "#1877F2", padding: "5px 10px", borderRadius: "5px", border: 'none', fontWeight: "bolder" }}>Message</button>
                            <span><FontAwesomeIcon icon={faCog} /></span>
                        </div>

                        <div style={{ display: "flex", gap: "25px" }}>
                            <p><span style={{ fontWeight: "bolder" }}>{profileInfo.post}</span> posts</p>
                            <p><span style={{ fontWeight: "bolder" }}>{profileInfo.followers} </span>{profileInfo.followers > 1 ? "followers" : "follower"}</p>
                            <p><span style={{ fontWeight: "bolder" }}>{profileInfo.following} </span>{profileInfo.following > 1 ? "followings" : "following"}</p>
                        </div>
                        <div><span style={{ fontWeight: "bolder" }}>{profileInfo.fullname}</span></div>

                        <div style={{ display: "flex" }}>
                            {profileInfo?.bio}
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
                        <span style={{ cursor: "pointer", padding: "10px 10px", borderTop: '1px solid white' }} >POSTS</span>

                    </div>




                    {allPosts.length > 0 ?

                        <div className={styles.allPostsContainer} >

                            {allPosts.map((post, index) => (

                                <div onClick={() => handleOpenCommentBox(post._id, profileInfo.username, post.author.userId, post.postLike, post.createdAt)} key={index} className={styles.eachPost}>

                                    <img src={`${MAIN_BACKEND_URL}/uploadPost/postImage/${post?._id}`} height="100%" width="100%" alt="image" />

                                    <div id={styles.likeAndComment} >
                                        <p style={{ display: "flex", gap: "5px" }} >{post.postLike}<FontAwesomeIcon icon={faThumbsUp} /> </p>
                                        <p style={{ display: "flex", gap: "5px" }} >{post.postComment}<FontAwesomeIcon icon={faComment} /> </p>
                                    </div>
                                </div>
                            ))}

                        </div>


                        :

                        <div>
                            no post
                        </div>



                    }




                </div>
























































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

        </>
    )
}

export default UserProfile