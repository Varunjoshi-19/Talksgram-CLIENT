import MenuOptions from "./MenuOptions";
import styles from '../Styling/Messages.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faEdit, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";
import ToMessage from "./ToMessage";
import { useNavigate } from "react-router-dom";


import ChattedUser from "../modules/ChattedUser.tsx";
import { useUserAuthContext } from "../Context/UserContext.tsx";



function Messages() {

   const [ToMessagePopUp, setToMessagePopUp] = useState<boolean>(false);
   const { profile } = useUserAuthContext();
   const navigate = useNavigate();


   async function redirectToChattingPage(otherUserInfo: string) {

      const parsedOtherUserInfo = JSON.parse(otherUserInfo);
      const otherProfileId = parsedOtherUserInfo._id;

      navigate(`/Personal-chat/${otherProfileId}`);

   }

   function handleMessageButton() {
      setToMessagePopUp(to => !to);
   }


   if (!profile) {
      navigate("/");
      return;
   }


   return (
      <>
         {ToMessagePopUp && <ToMessage toogleButton={handleMessageButton} EnableMessageTab={redirectToChattingPage} />}

         <MenuOptions profile={profile} />

         <div className={styles.allMessages} >

            <div className={styles.usernameAndIcon} >
               <p>{profile?.username}</p>
               <FontAwesomeIcon icon={faEdit} />
            </div>


            <div className={styles.notes}>
               <div id={styles.addNewNote}>
                  +
               </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 20px" }} >
               <p>Messages</p>
               <p>Requests</p>
            </div>


            <ChattedUser />

         </div>


         <div className={styles.sendMessage}>

            <div id={styles.messageIcon} >
               <FontAwesomeIcon icon={faPaperPlane} size="2x" />
            </div>

            <p style={{ fontSize: "1.25rem", fontWeight: "bolder" }} >Your messages</p>
            <p style={{ fontSize: "15px", opacity: "0.5" }} >Send private photos and messages to a friend or group.</p>
            <button onClick={handleMessageButton} style={{
               padding: "5px 5px", fontSize: "15px", color: "white",
               fontWeight: "bolder", backgroundColor: "#1877F2", border: 'none'
               , borderRadius: "5px", cursor: "pointer"
            }} >Send message</button>

         </div>




      </>
   )
}

export default Messages
