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


export interface ProfileInfo {
    _id: string | any,
    username: string,
    fullname: string,
    post: number,
    bio: string,
    followers: number,
    following: number
};


interface AllPostsProps {

    _id: string;
    postLike: number;
    postComment: number;
    postDescription: string;
    author: {
        userId: string;
        userAccId: string;
    }
    createdAt : string;
}



function Profile() {

    const [post, setPosts] = useState<string>("1px solid");
    const [uploadPostPopUp, setUploadPostPopUp] = useState<boolean>(false);
    const [saved, setSaved] = useState<string>("none");
    const [tagged, setTagged] = useState<string>("none");
    const [allPosts, setAllPosts] = useState<AllPostsProps[]>([]);
    const [profileInfo, setProfileInfo] = useState<ProfileInfo>();
    const [enableEditProfile, setEnableEditProfile] = useState<boolean>(false);
    const [postId, setPostId] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [toogleCommentBox, setCommentBox] = useState<boolean>(false);
    const [selectedPostUsername, setSelectedPostUsername] = useState<string>("");
    const [currentLikes , setCurrentLikes] = useState<number>(0);
    const [createdAtTime , setCreatedAt] = useState<string>("");

    let id: string;

    function toogleBar(bar: string) {

        if (bar == "post") {
            setPosts("1px solid white");
            setSaved("none");
            setTagged("none");
        }
        else if (bar == "saved") {
            setPosts("none");
            setSaved("1px solid white");
            setTagged("none");
        }
        else {
            setPosts("none");
            setSaved("none");
            setTagged("1px solid white");
        }

    }

    function UploadNewPostOption() {
        setUploadPostPopUp(c => !c);
    }


    function handleEditProfile() {
        setEnableEditProfile(c => !c);
    }

    function handleOpenCommentBox(id: string, username: string, userId: string , currentLikes : number , createdAt : string) {
        
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

        const profile = localStorage.getItem("user-token");
        if (profile) {
            const parsedProfile = JSON.parse(profile);
            id = parsedProfile.id;

        }

        async function fetchProfileInformation() {

            if (id == "" || !id) {
                return;
            }


            const response = await fetch(`${MAIN_BACKEND_URL}/accounts/fetchProfileDetails/${id}`, {
                method: "POST"
            })

            const result = await response.json();

            if (response.ok) {
                setProfileInfo(result.userProfile);

            }



        }



        fetchProfileInformation();


    }, [])


    useEffect(() => {



        async function fetchAllPosts() {

            if (!profileInfo?._id || profileInfo?._id == "") {
                return;
            }


            const response = await fetch(`${MAIN_BACKEND_URL}/uploadPost/allPosts/${profileInfo?._id}`, { method: "POST" });

            const result = await response.json();
            if (response.ok) {
                setAllPosts(result.allPosts);

            }
            if (!response.ok) {
                setAllPosts([]);
            }
        }

        fetchAllPosts();

    }, [profileInfo])



    if (!profileInfo) {
        return <LoadingScreen />
    }

    return (
        <div>
            {uploadPostPopUp && <CreatePost s={UploadNewPostOption} />}

            {profileInfo != null && <MenuOptions profile={profileInfo} />}

            {enableEditProfile && <EditProfile profileInfo={profileInfo} s={handleEditProfile} />}
            {toogleCommentBox && 
            <CommentBox id={postId} 
            toogleBox={closeCommentInfoBox} 
            userInfoF={ProvideInfoToCommentBox} currentLikes={currentLikes} 
            createdAt={createdAtTime}/>
            }

            <div className={styles.profileContainer} >

                <div className={styles.profileInformation}>

                    <div className={styles.profileImage} >
                        <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${profileInfo?._id}`} alt="_profileImage" width="100%" height="100%" />
                    </div>

                    <div className={styles.profileInfo} >

                        <div style={{ display: "flex", gap: "25px", alignItems: "center" }} >
                            <span style={{ fontSize: "1.05rem" }} >{profileInfo?.username}</span>
                            <button onClick={handleEditProfile} style={{ cursor: "pointer", fontSize: "1.03rem", color: "white", backgroundColor: "rgba(82, 78, 78, 0.712)", padding: "5px 10px", borderRadius: "5px", border: 'none', fontWeight: "bolder" }}>Edit Profile</button>
                            <button style={{ fontSize: "1.03rem", color: "white", backgroundColor: "rgba(82, 78, 78, 0.712)", padding: "5px 10px", borderRadius: "5px", border: 'none', fontWeight: "bolder" }}>View Archieve</button>
                            <span><FontAwesomeIcon icon={faCog} /></span>
                        </div>

                        <div style={{ display: "flex", gap: "25px" }}>
                            <p><span style={{ fontWeight: "bolder" }}>{profileInfo?.post}</span> post</p>
                            <p><span style={{ fontWeight: "bolder" }}>{profileInfo?.followers} </span>{profileInfo?.followers > 1 ? " followers" : "follower"}</p>
                            <p><span style={{ fontWeight: "bolder" }}>{profileInfo?.following} </span>{profileInfo?.following > 1 ? " followings" : "following"}</p>
                        </div>
                        <div><span style={{ fontWeight: "bolder" }}>{profileInfo?.fullname}</span></div>

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
                        <span onClick={() => toogleBar("post")} style={{ cursor: "pointer", padding: "10px 10px", borderTop: `${post}` }} >POSTS</span>
                        <span onClick={() => toogleBar("saved")} style={{ cursor: "pointer", padding: "10px 10px", borderTop: `${saved}` }} >SAVED</span>
                        <span onClick={() => toogleBar("tagged")} style={{ cursor: "pointer", padding: "10px 10px", borderTop: `${tagged}` }} >TAGGED</span>
                    </div>


                    {post == "none" ?


                        <div>nothing</div>

                        :


                        allPosts.length > 0 ?


                            <div className={styles.allPostsContainer} >

                                {allPosts.map((post, index) => (



                                    <div onClick={() => handleOpenCommentBox(post._id, profileInfo.username, post.author.userId , post.postLike , post.createdAt )} key={index} 
                                    className={styles.eachPost}>

                                        <img src={`${MAIN_BACKEND_URL}/uploadPost/postImage/${post?._id}`} 
                                         style={{ width : "100%" , height : "100%", objectFit: "contain" }}
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


