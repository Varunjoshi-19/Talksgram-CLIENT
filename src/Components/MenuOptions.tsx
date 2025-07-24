import styles from "../Styling/MenuOptions.module.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faSearch, faCompass, faPlayCircle,
  faCommentDots, faBell, faPlusCircle, faSignOutAlt,
  faUser
} from "@fortawesome/free-solid-svg-icons";

import { useCallback, useEffect, useState } from "react";

import SearchBar from "./SearchBar";
import Notification from "./Notification";
import CreatePost from "./CreatePost";
import { ACTIONS, useUserAuthContext } from "../Context/UserContext";
import { useToogle } from "../Context/ToogleContext";
import LoadingScreen from "./LoadingScreen";
import { MAIN_BACKEND_URL } from "../Scripts/URL";
import { useSocketContext } from "../Context/SocketContext";
import { useChatContext } from "../Context/ChattedUserContext";
import { MenuOptionProps, notificationPayload } from "../Interfaces";




const MenuOptions: React.FC<MenuOptionProps> = ({ profile }) => {

  const [notificationBar, setNotificationBar] = useState<boolean>(false);
  const [uploadPostBar, setUploadPostBar] = useState<boolean>(false);

  const [notificCount, setNotiCount] = useState<number>(0);

  const [AllNotifications, setAllNotifications] = useState<Map<string, notificationPayload>>(new Map());


  const navigate = useNavigate();
  const { dispatch } = useUserAuthContext();
  const { searchBarVisible, toogleVisiblility, setSearchInput } = useToogle();
  const { socket, notification } = useSocketContext();
  const { messageCount } = useChatContext();




  useEffect(() => {
    fetchAllRequests();
  }, [profile]);


  useEffect(() => {
    handleNotification();
  }, [notification]);


  const handleNotification = useCallback(() => {

    if (notification) {
      fetchAllRequests();
    }

  }, [notification]);


  async function fetchAllRequests() {

    if (!profile?._id || profile?._id == "") {
      return;
    }


    const response = await fetch(`${MAIN_BACKEND_URL}/Personal-chat/fetchRequests/${profile?._id}`, { method: "POST" });

    const result = await response.json();

    if (response.ok) {
      console.log(result.requests);
      setAllNotifications((prevNotification) => {
        const newNotification = new Map(prevNotification);

        result.requests.forEach((each: any) => {
          const { userIdOf } = each;
          if (userIdOf) {
            newNotification.set(userIdOf, each); // Overwrites only if userId exists
            console.log("Setting notification for userId:", userIdOf);
          }
        });

        return newNotification;
      });

      setNotiCount(0);
      result.requests.map(() => {
        setNotiCount((prevCount) => prevCount + 1);
      })
    }

  }

  function NavigateToHomePage() {
    setSearchInput("");
    toogleVisiblility(false);
    setNotificationBar(false);
    navigate("/");

  }

  function NavigateToProfilePage() {
    setSearchInput("");
    toogleVisiblility(false);

    setNotificationBar(false);
    navigate("/accounts/profile");
  }

  function NavigateToMessagePage() {
    setSearchInput("");
    toogleVisiblility(false);
    setNotificationBar(false);

    navigate("/accounts/inbox/messages");
  }

  function OpenSearchBar() {
    setSearchInput("");
    setNotificationBar(false);
    toogleVisiblility(!searchBarVisible);
  }

  function OpenNotificationBar() {
    setSearchInput("");
    toogleVisiblility(false);
    setNotificationBar(notification => !notification);
  }

  function UploadNewPostOption() {
    toogleVisiblility(false);
    setSearchInput("");
    setUploadPostBar(c => !c);
  }

  function handleOpenReels() {

    navigate("/reels");

  }

  function Logout() {
    dispatch({ type: ACTIONS.REMOVE_PROFILE});
    handleSendOfflineStatus();
    localStorage.removeItem("profile-details");
    navigate("/accounts/login");
  }


  function handleSendOfflineStatus() {
    const user = localStorage.getItem("profile-details");
    if (user) {
      const parsedUserProfile = JSON.parse(user);
      const userId = parsedUserProfile._id;
      socket.emit("offline", userId);
      console.log(`User offline with socket id ${socket.id} and user id ${userId}`);

    }
  }

  if (profile == null) {
    return <LoadingScreen />
  }





  return (
    <>

      {searchBarVisible && <SearchBar />}
      {notificationBar && <Notification AllNotifications={AllNotifications} setAllNotifications={setAllNotifications} setNotiCount={setNotiCount} />}
      {uploadPostBar && <CreatePost s={UploadNewPostOption} />}

      <div className={styles.leftOptions}>


        <ul id={styles.options}>
          <li><span>TALKSGRAM</span></li>
          <li onClick={NavigateToHomePage}> <FontAwesomeIcon icon={faHome} fontSize={"1.5rem"} />  <span>Home</span></li>
          <li id={styles.logo} onClick={OpenSearchBar} > <FontAwesomeIcon icon={faSearch} fontSize={"1.5rem"} />
            <span>Search</span>
          </li>


          <li><FontAwesomeIcon icon={faCompass} fontSize={"1.5rem"} /> <span>Explore</span></li>
          <li onClick={handleOpenReels} >  <FontAwesomeIcon icon={faPlayCircle} fontSize={"1.5rem"} /> <span>Reels</span></li>

          <li style={{ position: "relative" }} onClick={NavigateToMessagePage} >
            <FontAwesomeIcon icon={faCommentDots} fontSize={"1.5rem"} />
            <span>Messages</span>
            {messageCount > 0 &&
              <span style={{
                position: "absolute", width: "23px", height: "23px",
                borderRadius: "50%", left: "25px", bottom: "37%", backgroundColor: "red", display: "flex", alignItems: "center"
                , justifyContent: "center", fontWeight: "bolder"
              }} >{messageCount}
              </span>
            }
          </li>

          <li id={styles.logo} onClick={OpenNotificationBar} > <FontAwesomeIcon icon={faBell} fontSize={"1.5rem"} /><span>Notification

          </span>
            {notificCount > 0 && <span style={{
              position: "absolute", width: "25px", height: "25px"
              , borderRadius: "50%", left: "20px", bottom: "37%", backgroundColor: "red", display: "flex", alignItems: "center"
              , justifyContent: "center", fontWeight: "bolder"
            }} >{notificCount}
            </span>}
          </li>

          <li onClick={UploadNewPostOption} > <FontAwesomeIcon icon={faPlusCircle} fontSize={"1.5rem"} /><span>Create</span></li>
          <li onClick={NavigateToProfilePage} > <FontAwesomeIcon icon={faUser} fontSize={"1.5rem"} /><span>Profile</span></li>
          <li id={styles.logoutButton} onClick={Logout}  > <FontAwesomeIcon icon={faSignOutAlt} fontSize={"1.5rem"} /><span>Logout</span></li>
        </ul>




      </div>

    </>
  )

}
export default MenuOptions
