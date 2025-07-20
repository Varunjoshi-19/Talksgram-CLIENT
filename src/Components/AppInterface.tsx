import styles from "../Styling/AppInterface.module.css";
import MenuOptions from "./MenuOptions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThumbsUp, faComment, faShareAlt, faSearch, faBell
} from "@fortawesome/free-solid-svg-icons";


import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import { useNavigate } from "react-router-dom";
import { useToogle } from "../Context/ToogleContext"
import CommentBox from "./CommentBox";
import { MAIN_BACKEND_URL } from "../Scripts/URL.ts";
import { fetchAllData } from "../Scripts/FetchDetails.ts";
import { CreateAndShareMessage } from "../Scripts/GetData.ts";
import ShareDilogBox from "../modules/ShareDilogBox.tsx";

export interface ProfileInfo {
  _id: string,
  username: string,
  fullname: string,
  post: number,
  bio: string,
  followers: number,
  following: number
};

interface AllPostsProps {

  _id: string;
  authorName: string;
  likeStatus: boolean;
  postLike: number;
  postComment: number;
  postDescription: string;
  createdAt: string,
  author: {
    userId: string;
    userAccId: string;
  }
}[];


function AppInterface() {

  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
  const [allAccounts, setAllAccounts] = useState<ProfileInfo[]>([]);
  const [uploadedPosts, setUploadedPosts] = useState<AllPostsProps[]>([]);
  const [postId, setPostId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [currentPostCount, setCurrentPostCount] = useState<number>(0);
  const [selectedPostUsername, setSelectedPostUsername] = useState<string>("");
  const [searchInputClicked, setSearchInputClicked] = useState<boolean>(false);
  const [toogleCommentBox, setCommentBox] = useState<boolean>(false);
  const [noMorePost, setNoMorePost] = useState<boolean>(false);
  const [currentPostLikes, setCurrentPostLikes] = useState<number>(0);
  const [currentPostDate, setCurrentPostDate] = useState<string>("");
  const [toogleShareDilogBox, setToogleShareDilogBox] = useState<boolean>(false);
  const [sharePostRefId, setSharePostRefId] = useState<string>("");
  const [postOwnerId, setPostOwnerId] = useState<string>("");
  const [postUsername , setPostUserName] = useState<string>("");
  const stories = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

  const navigate = useNavigate();


  const { toogleVisiblility, setSearchInput, searchInput } = useToogle();

  useEffect(() => {

    async function fetchProfileInformation() {
      const profile = localStorage.getItem("user-token");
      if (profile) {
        const parsedProfile = JSON.parse(profile);
        const id = parsedProfile.id;

        const response = await fetch(`${MAIN_BACKEND_URL}/accounts/fetchProfileDetails/${id}`, { method: "POST" });
        const result = await response.json();

        if (response.ok) {
          console.log("this is the user profile", result.userProfile);
          setProfileInfo(result.userProfile);
        } else {

        }
      }
    }

    async function fetchAllAccounts() {

      let parsedUser;
      const user = localStorage.getItem("user-token");
      if (user) {
        parsedUser = JSON.parse(user);

      }


      const response = await fetch(`${MAIN_BACKEND_URL}/accounts/allAccounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(parsedUser)
      });

      const result = await response.json();

      if (response.ok) {

        setAllAccounts(result.allAccounts);
      }


    }



    fetchProfileInformation();
    fetchAllAccounts();

  }, []);


  useEffect(() => {

    if (!profileInfo || profileInfo?._id == "") {
      return;
    }

    else {

      fetchAllPosts();
    }

  }, [profileInfo]);


  async function fetchAllPosts() {
    try {
      const response = await fetch(`${MAIN_BACKEND_URL}/uploadPost/fetchPosts/?skip=${currentPostCount}`, { method: "POST" });
      const postsResult = await response.json();

      if (response.ok && response.status == 202) {
        const postsWithDetails = await Promise.all(
          postsResult.shuffledPosts.map(async (post: AllPostsProps) => {

            try {

              const IdInfo = {
                postId: post._id,
                userId: profileInfo?._id,
              }

              const [authorResponse, likeResponse] = await Promise.all([
                fetch(`${MAIN_BACKEND_URL}/accounts/fetchOtherUser/${post.author.userId}`, { method: "POST" }),
                fetch(`${MAIN_BACKEND_URL}/uploadPost/fetchLikePost`, {

                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"

                  },
                  body: JSON.stringify(IdInfo)

                }),
              ]);

              const authorResult = await authorResponse.json();
              const likeResult = await likeResponse.json();

              setCurrentPostCount(prevCount => prevCount + 1);

              return {
                ...post,
                authorName: authorResponse.ok ? authorResult.userProfile.username : "Unknown",
                likeStatus: likeResponse.ok && likeResponse.status == 200 ? likeResult.likeStatus : false,
              };
            }
            catch (error) {
              console.error(`Error fetching details for post by ${post.author.userId}:`, error);
              return { ...post, authorName: "Unknown", likeStatus: false };
            }
          })
        );

        setUploadedPosts([...uploadedPosts, ...postsWithDetails]);
      }
      if (response.ok && response.status == 201) {
        setNoMorePost(true);

      }

    } catch (error) {
      console.error("Error fetching all posts:", error);
      setUploadedPosts([]);
    }
  }

  function closeInputBar(e: React.MouseEvent) {
    toogleVisiblility(false);
    e.stopPropagation();
    setSearchInputClicked(false);
    setSearchInput("");
  }

  function showSearchAccounts() {
    setSearchInputClicked(true);
    toogleVisiblility(true);


  }

  function VisitProfile(id: string) {

    navigate(`/userProfile/${id}`);
  }

  async function handleClickLike(id: string, likeStatus: boolean) {



    const idInfo = {
      postId: id,
      userId: profileInfo?._id
    }

    if (likeStatus) {

      setUploadedPosts(
        uploadedPosts.map((post) => {

          if (post._id === id) {

            return { ...post, likeStatus: !post.likeStatus, postLike: post.postLike - 1 };
          }

          return post;
        })
      );


      await fetch(`${MAIN_BACKEND_URL}/uploadPost/remove-likePost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(idInfo)
      });


    }


    else {
      setUploadedPosts(
        uploadedPosts.map((post) => {

          if (post._id === id) {

            return { ...post, likeStatus: !post.likeStatus, postLike: post.postLike + 1 };
          }

          return post;
        })
      );


      await fetch(`${MAIN_BACKEND_URL}/uploadPost/add-likePost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(idInfo)
      });

    }

  }


  function handleOpenCommentBox(id: string, username: string, userId: string, totalLikes: number, date: string) {

    setPostId(id);
    setCurrentPostLikes(totalLikes);
    setSelectedPostUsername(username);
    setCurrentPostDate(date);
    setUserId(userId);
    setCommentBox(true);

  }

  function closeCommentInfoBox() {
    setCommentBox(false);
    setPostId("");
  }

  function ProvideInfoToCommentBox() {
    const info = {
      userId: userId,
      username: selectedPostUsername
    }

    return info;
  }

  function handleSharePost(post : AllPostsProps) {

    setToogleShareDilogBox(prev => !prev);
    setSharePostRefId(post._id);
    setPostOwnerId(post.author.userId);
    setPostUserName(post.authorName);
  }




  if (!profileInfo) {
    return <LoadingScreen />
  }


  return (
    <>

      <div className={styles.topLogos}>

        <div  >
          TalksGram
        </div>


        <div
          onClick={showSearchAccounts}
          className={styles.searchBar}
        >
          {searchInputClicked ?
            <>
              <input
                id={styles.inputBox}
                type="text"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button
                onClick={closeInputBar}  // Call closeInputBar on button click
                style={{
                  position: "fixed",
                  right: "27%",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  border: "none",
                  opacity: "0.7",
                  cursor: "pointer"
                }}
              >
                x
              </button>
            </>
            :
            <>
              <FontAwesomeIcon style={{ opacity: "0.5" }} icon={faSearch} />
              <p style={{ opacity: "0.5" }}>Search</p>
            </>
          }
        </div>

        <FontAwesomeIcon onClick={() => navigate("/Notification")} icon={faBell} fontSize={"1.2rem"} style={{ marginRight: "10px" }} />

      </div>



      {/* left side options  */}

      <MenuOptions profile={profileInfo} />

      {toogleCommentBox && <CommentBox id={postId} toogleBox={closeCommentInfoBox}
        userInfoF={ProvideInfoToCommentBox}
        currentLikes={currentPostLikes}
        createdAt={currentPostDate} />}


      {toogleShareDilogBox && <ShareDilogBox sharePostRefId={sharePostRefId} postOwnerId={postOwnerId} postOwnerName={postUsername}
        toogleOpenCloseButton={setToogleShareDilogBox} />}




      <div className={styles.MainCenterContainer} >

        <div className={styles.StoriesAndPostContainer} >

          <div className={styles.storiesContainer}>

            {stories.map((each, index) => (

              <div key={index} id={styles.eachStories} ></div>

            ))}

          </div>


          {uploadedPosts.length > 0 ?

            <div className={styles.postsContainer} >

              {uploadedPosts.map((post, index) => (
                <div key={index} id={styles.eachPostContainer} >

                  <div id={styles.headerInfo}>

                    <img style={{ width: "50px", height: "50px", borderRadius: "50%" }} src={`${MAIN_BACKEND_URL}/accounts/profileImage/${post?.author.userId}`} alt="" />
                    <p>{post?.authorName}</p>

                  </div>

                  <img id={styles.mainPostImage}
                    src={`${MAIN_BACKEND_URL}/uploadPost/postImage/${post?._id}`} alt="" />

                  <div style={{ cursor: "pointer" }} id={styles.description}>

                    <div style={{ display: "flex", gap: "10px", fontSize: "1.5rem" }} >
                      <span><FontAwesomeIcon onClick={() => handleClickLike(post?._id, post?.likeStatus)} icon={faThumbsUp}
                        style={{ color: `${post?.likeStatus ? "BD0553" : "white"}` }} /></span>
                      <span>
                        <FontAwesomeIcon icon={faComment}
                          onClick={() => handleOpenCommentBox(post?._id, post?.authorName,
                            post?.author.userId, post.postLike, post.createdAt)} />
                      </span>
                      <span onClick={() => {

                      }} ><FontAwesomeIcon icon={faShareAlt}  onClick={() => handleSharePost(post)} /></span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }} >
                      <p style={{ fontWeight: "bolder" }}>{post?.postLike} {post.postLike > 1 ? "likes" : "like"}</p>
                      <p style={{ marginBottom: "10px" }}>{post?.postDescription}</p>
                    </div>

                  </div>



                </div>


              ))}

              {uploadedPosts.length > 0 &&
                <button style={{
                  border: '1px solid white', display: `${noMorePost ? "none" : "flex"}`, alignItems: "center", justifyContent: "center",
                  color: "white",
                  bottom: "47px", padding: "10px", backgroundColor: "transparent", fontWeight: "bolder",
                  fontSize: "2rem", cursor: "pointer",
                  position: "relative", width: "25px", height: "25px", borderRadius: "50%"
                }}

                  onClick={fetchAllPosts}>+</button>}

            </div>

            :

            <div>
              {/* <LoadingScreen /> */}

            </div>


          }




        </div>


        <div className={styles.profileAndSuggestions} >

          <div className={styles.UserProfile}>
            <div className={styles.userImage}>
              <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${profileInfo?._id}`} width="100%" height="100%" alt="_pic" />
            </div>

            <div>
              <p>{profileInfo?.username}</p>
              <p>{profileInfo?.fullname}</p>
            </div>
          </div>

          <div className={styles.suggestions}>
            <p>Suggested for you </p>

            {allAccounts ?

              allAccounts.map((item, index) => (

                <div onClick={() => VisitProfile(item._id)} key={index} className={styles.suggestedAccount}>

                  <div id={styles.suggestedProfile}>
                    <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${item._id}`} width="100%" height="100%" alt="_user" />
                  </div>

                  <div>

                    <p>{item.username}</p>
                    <p>{item.fullname}</p>

                  </div>

                </div>

              ))


              :

              <div>No suggestions</div>

            }

          </div>

        </div>


      </div>


    </>
  )
}

export default AppInterface
