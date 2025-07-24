import React, { useEffect, useState } from 'react'
import styles from "../Styling/CommentBox.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSmile
} from "@fortawesome/free-solid-svg-icons";
import { MAIN_BACKEND_URL } from '../Scripts/URL.ts';
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { formattedPostTime, handleTimeFormating } from '../Scripts/GetData.ts';
import ShareDilogBox from '../modules/ShareDilogBox.tsx';
import { useGeneralContext } from '../Context/GeneralContext.tsx';
import { GetIdAndUsername } from '../Scripts/FetchDetails.ts';
import { useUserAuthContext } from '../Context/UserContext.tsx';
import { CommentProps, PostIdProps, UserInfoProps } from '../Interfaces/index.ts';
import LoadingScreen from './LoadingScreen.tsx';




const CommentBox: React.FC<PostIdProps> = ({ id, toogleBox, userInfoF, currentLikes, createdAt }) => {

  const [userInfo, setUserInfo] = useState<UserInfoProps | null>(null);
  const [commentInput, setCommentInput] = useState<string>("");
  const [allComments, setAllComments] = useState<CommentProps[]>([]);
  const [toogleShareDilogBox, setToogleShareDilogBox] = useState<boolean>(false);
  const [sharePostRefId, setSharePostRefId] = useState<string>("");
  const [postOwnerId, setPostOwnerId] = useState<string>("");
  const [postUsername, setPostUserName] = useState<string>("");
  const [likeStatus, setLikeStatus] = useState<boolean>(false);
  const [totalLikes, setTotalLikes] = useState<number>(currentLikes);

  const { fetchPostStatus, handleLikePost } = useGeneralContext();
  const { profile } = useUserAuthContext();

  useEffect(() => {

    if (id == "") return;

    async function fetchAllComments() {

      const info = userInfoF();
      setUserInfo(info);

      const response = await fetch(`${MAIN_BACKEND_URL}/uploadPost/fetch-comments/${id}`, { method: "POST" });

      const result = await response.json();

      if (response.ok) {
        console.log(result.comments);
        const commentsWithUsernames = await Promise.all(
          result.comments.map(async (item: CommentProps) => {

            const commentResponse = await GetIdAndUsername(item.userId);
            const timeAgo = handleTimeFormating(item.initiateTime);

            return {
              ...item,
              username: commentResponse?.username || "unknown user",
              time: timeAgo
            };
          })
        );

        setAllComments(commentsWithUsernames);
      }

      if (!response.ok) {
        setAllComments([]);

      }


    }

    fetchAllComments();
  }, [id]);

  useEffect(() => {

    (async () => {
      const status = await fetchPostStatus(id);
      const { likeStatus } = status;
      setLikeStatus(likeStatus);
    })();

  }, [id, fetchPostStatus]);


  async function handlePostComment() {

    if (commentInput.trim() != "") {
      const newComment = commentInput;
      setCommentInput("");



      const commentInfo = {
        postId: id,
        userId: profile?._id,
        comment: newComment
      }

      const response = await fetch(`${MAIN_BACKEND_URL}/uploadPost/add-comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(commentInfo)

      })

      const result = await response.json();

      if (response.ok) {
        const commentTime = result.data.initiateTime;

        const timeAgo: string = handleTimeFormating(commentTime);

        setAllComments([{
          userId: profile?._id,
          username: profile?.username,
          comment: newComment,
          time: timeAgo,
          initiateTime: commentTime

        },
        ...allComments]);

        setCommentInput("");
      }
      if (!response.ok) {
        setCommentInput("");

      }

    }

  }

  async function handleSharePost() {

    const response = await fetch(`${MAIN_BACKEND_URL}/uploadPost/fetch-single-post/${id}`);
    const result = await response.json();

    if (response.ok) {
      const post = result.post;
      setSharePostRefId(post._id);
      setPostOwnerId(post.author.userId);
      setPostUserName(post.authorName);
      setToogleShareDilogBox(prev => !prev);
    }


  }

  async function handleClickLikePost() {
    const currentLikeStatus = await handleLikePost(id, likeStatus);
    setLikeStatus(currentLikeStatus);
    if (currentLikeStatus) {
      setTotalLikes(prev => prev + 1);
    } else {
      setTotalLikes(prev => prev - 1);
    }
  }



  const [showMain, setShowMain] = useState<boolean>(false);


  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMain(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!showMain || !allComments) {
    return <LoadingScreen />
  }




  return (
    <>

      {toogleShareDilogBox && <ShareDilogBox sharePostRefId={sharePostRefId} postOwnerId={postOwnerId} postOwnerName={postUsername}
        toogleOpenCloseButton={setToogleShareDilogBox} />}


      <div className={styles.CommentBoxContainer} >

        <button style={{
          position: "absolute", right: "10px",
          color: "white", fontSize: "2rem", backgroundColor: "transparent", border: "none",
          cursor: "pointer"
        }} onClick={toogleBox}>✖</button>

      </div>

      <div className={styles.commentBox}>

        <div className={styles.postImage}>
          <img src={`${MAIN_BACKEND_URL}/uploadPost/postImage/${id}`}
            alt="" width="90%" height="100%"
            style={{ borderBottomLeftRadius: "10px", objectFit: "contain", borderTopLeftRadius: "10px" }} />
        </div>

        <div className={styles.comments} >

          <div id={styles.postedUserInfo} >

            <div id={styles.profileImage}>
              <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${userInfo?.userId}`} alt="" />
            </div>

            <p>{userInfo?.username}</p>

          </div>


          <div className={styles.allComments}>


            {allComments.length > 0 ?


              allComments.map((comment, index) => (


                <div key={index} className={styles.eachComment}>

                  <div id={styles.imageIcon} >
                    <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${comment.userId}`}
                      style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                      alt="" />
                  </div>

                  <div id={styles.usernameAndTime}>
                    <p style={{ fontWeight: "bolder", fontSize: "13px", fontFamily: "Helvetica Neue , Helvetica, Arial, sans-serif" }} >{comment.username}</p>
                    <p style={{ fontSize: "12px", marginTop: "5px", opacity: "0.7" }}>{comment.time}</p>
                  </div>

                  <div id={styles.userComment}>
                    <p style={{ fontSize: "15px", opacity: "0.9", fontWeight: "400", fontFamily: "Helvetica Neue , Helvetica, Arial, sans-serif" }} >{comment.comment}</p>
                  </div>

                </div>

              ))

              :


              <div id={styles.noComments} >
                <p style={{ fontSize: "1.4rem", fontWeight: "bolder" }} >No comments yet.</p>
                <p style={{ fontSize: "14px" }} >Start the conversation.</p>
              </div>

            }








          </div>



          <div id={styles.postComment}>
            <div className={styles.LikeOperations}  >
              <div style={{ width: "100%", display: 'flex', alignItems: "center", justifyContent: "space-between" }} >
                <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center" }} >
                  <Heart stroke={`${likeStatus ? "red" : "white"}`} fill={`${likeStatus ? "red" : "none"}`} onClick={handleClickLikePost} id={styles.likeItems} />
                  <MessageCircle id={styles.likeItems} />
                  <Send onClick={handleSharePost} id={styles.likeItems} />
                </div>
                <div>
                  <Bookmark id={styles.likeItems} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }} >
                <div style={{ display: "flex", gap: "3px" }} >
                  <span>{totalLikes}</span>
                  <span>{totalLikes > 1 ? "likes" : "like"}</span>
                </div>
                <div>
                  <span>{formattedPostTime(createdAt)}</span>
                </div>
              </div>

            </div>

            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px" }} >
              <FontAwesomeIcon icon={faSmile} style={{ fontSize: "1.2rem" }} />
              <input value={commentInput} onChange={(e) => setCommentInput(e.target.value)}
                type="text" placeholder='Add a comment...' />
              <button onClick={handlePostComment} disabled={commentInput.length > 0 ? false : true}
                style={{ opacity: `${commentInput.length > 0 ? "1" : "0.2"}` }} >Post</button>
            </div>



          </div>





        </div>

      </div>

    </>
  )
}

export default CommentBox
