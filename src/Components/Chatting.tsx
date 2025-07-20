import { useNavigate, useParams } from 'react-router-dom'
import MenuOptions from './MenuOptions';
import styles from "../Styling/Messages.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faEdit, faInfoCircle, faSmile, faPause, faMicrophone, faImage, faHeart, faImages, faPlay } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from "react";
import { fetchChattedUserDetails, fetchAllData, fetchDetailsOfUserPost, fetchUserOnlineStatus } from "../Scripts/FetchDetails.ts";
import LoadingScreen from './LoadingScreen.tsx';
import {
    ProfileProps, InfoDataType, BufferedDataType, ChattedUserInfo, AdditionalDataType,
    ShowFile, AudioData, Chat
} from "../Scripts/GetData.ts";
import { MAIN_BACKEND_URL } from '../Scripts/URL.ts';
import { useSocketContext } from '../Context/SocketContext.tsx';
import CommentBox from './CommentBox.tsx';
import LocalImagesAndVideos from '../modules/LocalImagesAndVideos.tsx';






function Chatting() {

    const { id } = useParams();

    const navigate = useNavigate();

    const videoExtension = ["mp4", "video/mp4", "webm", "ogg"];
    const imageExtension = ["jpg", "image/png", "image/jpg", "image/jpeg", "jpeg", "png", "gif", "webp"];
    const audioExtension = ["mp3", "wav", "audio/wav", "ogg"];

    const { socket } = useSocketContext();
    const [messageInputValue, setMessageInputValue] = useState<string>("");
    const [otherUserDetails, setUserDetails] = useState<ProfileProps | any>();
    const [myProfileDetails, setMyProfileDetails] = useState<ProfileProps | any>();
    const [AllChattedUsers, setChattedUsers] = useState<ChattedUserInfo[]>([]);
    const [AllChats, setAllChats] = useState<Chat[]>([]);
    const [chatId, setChatId] = useState<string | any>("");
    const [chatLoaded, setChatLoaded] = useState<boolean>(false);
    const [chatSkip, setChatSkip] = useState<number>(0);
    const [disableFetchMess, setDisableFetchMessage] = useState<boolean>(false);
    const inputMessageRef = useRef<HTMLInputElement>(null);
    const sendMessageButtonRef = useRef<HTMLButtonElement>(null);
    const lastMessageRef = useRef<HTMLDivElement | null>(null);



    // video and image stuff
    const [showMultipleItems, setShowMultipleItems] = useState<ShowFile[]>([]);
    const [multipleItemSelected, setMultipleItemsSelected] = useState<File[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);
    const [bufferedData, setBufferedData] = useState<BufferedDataType[]>([]);
    // video and image stuff



    // recorder stuff
    const maxTimeOfRecording = 3 * 60;
    const [mediaRecoder, setMediaRecoder] = useState<MediaRecorder | null>(null);
    const [recording, setRecording] = useState<boolean>(false);
    const [audioUrl, setAudioUrl] = useState<any | null>(null);
    const [audioFileBlob, setAudioFileBlob] = useState<Blob | null>(null);
    const [runningTimer, setRunningTimer] = useState<number>(0);
    const [audioDataInfo, setAudioDataInfo] = useState<AudioData | null>();
    const recoderDivRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const [playOrPause, setPlayOrPause] = useState<boolean>(false);
    const [toogleCommentBox, setCommentBox] = useState<boolean>(false);
    const [postId, setPostId] = useState<string>("");
    const [selectedPostUsername, setSelectedPostUsername] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [currentPostLikes, setCurrentPostLikes] = useState<number>(0);
    const [currentPostDate, setCurrentPostDate] = useState<string>("");
    const [selectedImageItem, setImageItem] = useState<string>("");
    const [displayImageSelected, setImageSelected] = useState<boolean>(false);
    const [userOnlineStatus, setUserOnlineStatus] = useState<boolean>(false);

    const recordedAudioRef = useRef<HTMLAudioElement>(null);
    let audioChunks: Blob[] = [];
    let stream;
    let recorder;
    let recoderIntervalId: any;
    let recorderTimeout: any;
    // recorder stuff


    const chatContainerRef = useRef<HTMLDivElement>(null);



    useEffect(() => {

        socket.on("user-online", (userId) => {
            if (userId === id) {
                console.log("user online via login");
                setUserOnlineStatus(true);
            }

        });

        socket.on("online", (userId) => {
            if (userId === id) {
                setUserOnlineStatus(true);
            }
        })

        socket.on("offline", (userId) => {
            if (userId === id) {
                setUserOnlineStatus(false);
            }
        })

        return () => {
            socket.off("online");
            socket.off("user-online");
            socket.off("offline");
        };
    }, [id, socket]);


    useEffect(() => {


        if (lastMessageRef.current) {

            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }


        socket.emit('seen-chat', chatId, myProfileDetails?.username);

        socket.on('chat-receive', (info) => {


            const ChatInfo: Chat = {
                userId: myProfileDetails?._id,
                otherUserId: otherUserDetails?._id,
                chatId: info.chatId,
                username: info.username,
                initateTime: Date.now().toString(),

            }
            if (info.chat) {
                ChatInfo.chat = info.chat;
            }

            if (info.audioData && info.audioData.blobFile) {
                const blob = new Blob([info.audioData.blobFile], { type: `audio/${info.audioData.extension}` });
                const url = URL.createObjectURL(blob);

                const tempData: ShowFile = {
                    actualBlob: url,
                    extensionName: info.audioData.extension
                };

                // Ensure `temporaryAddData` exists
                ChatInfo.temporaryAddData = ChatInfo.temporaryAddData || [];
                ChatInfo.temporaryAddData.push(tempData);
            }


            if (info.AdditionalInfoData) {


                const tempData: ShowFile[] = info.AdditionalInfoData.map((each: BufferedDataType) => {
                    const blob = new Blob([each.file], { type: each.extension })
                    const url = URL.createObjectURL(blob);

                    return {
                        actualBlob: url,
                        extensionName: each.extension
                    }
                })
                ChatInfo.temporaryAddData = tempData;

            }

            setAllChats((prevChats) => [...prevChats, ChatInfo]);
        });




        return () => {
            socket.off('chat-receive');
        };
    }, [chatId, myProfileDetails?.username, AllChats]);


    useEffect(() => {

        if (!mediaRecoder) return;

        recoderIntervalId = setInterval(() => {
            setRunningTimer((prev) => prev + 1);
            setProgress((prev) => Math.min(prev + (100 / maxTimeOfRecording), 100));
        }, 1000);


        const recorderTimeout = setTimeout(() => {
            clearInterval(recoderIntervalId);
        }, maxTimeOfRecording * 1000);

        mediaRecoder.ondataavailable = (event: BlobEvent) => {
            audioChunks.push(event.data);
        }

        mediaRecoder.onstop = () => {

            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            setAudioDataInfo({ blobFile: audioBlob, extension: "wav" });
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log(audioChunks);
            setAudioFileBlob(audioBlob);
            setAudioUrl(audioUrl);
            audioChunks = [];

            if (recoderDivRef.current) recoderDivRef.current.style.transition = "none";
            setRunningTimer(0);
            setProgress(0);
            clearInterval(recoderIntervalId);
            clearTimeout(recorderTimeout);
        }


        return () => {
            clearInterval(recoderIntervalId);
            clearTimeout(recorderTimeout);
        };


    }, [mediaRecoder]);


    useEffect(() => {

        async function fetchAllBothUserData() {
            const data = await fetchAllData(id!);
            const { success, senderDetails, receiverDetails, chatId } = data;
            if (!success) {
                navigate("/error");
                return;
            }

            setMyProfileDetails(senderDetails);
            setUserDetails(receiverDetails);
            setChatId(chatId);

        }

        async function handleGetOnlineStatus() {
            const status = await fetchUserOnlineStatus(id!);
            setUserOnlineStatus(status);
        }


        fetchAllBothUserData();
        handleGetOnlineStatus();
    }, [id]);


    useEffect(() => {

        fetchChatsFromDatabase();

        // if (lastMessageRef.current) {
        //     lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        // }

    }, [chatId]);


    useEffect(() => {

        async function fetchChattedUser() {
            const users = await fetchChattedUserDetails(myProfileDetails?._id);
            setChattedUsers(users);
        }

        fetchChattedUser();

    }, [myProfileDetails]);


    // ------ other handling functions -------  // 

    function handleSendMessage() {

        if (messageInputValue.length > 0) {

            if (messageInputValue.trim()) {

                // for others 
                const InfoData: InfoDataType = {
                    chat: messageInputValue,
                    username: myProfileDetails?.username,
                    chatId: chatId,


                }
                // for local me 
                const ChatInfo: Chat = {
                    userId: myProfileDetails?._id,
                    otherUserId: otherUserDetails?._id,
                    chatId: chatId,
                    username: myProfileDetails?.username || '',
                    initateTime: Date.now().toString(),
                    chat: messageInputValue,
                };

                socket.emit('new-chat', InfoData);
                savedChatToDatabases(ChatInfo);



                if (multipleItemSelected.length > 0) {

                    const MInfoData: InfoDataType = {
                        AdditionalInfoData: bufferedData,
                        username: myProfileDetails?.username,
                        chatId: chatId,

                    }

                    const MChatInfo: Chat = {
                        userId: myProfileDetails?._id,
                        otherUserId: otherUserDetails?._id,
                        chatId: chatId,
                        username: myProfileDetails?.username || '',
                        initateTime: Date.now().toString(),
                        AdditionalData: multipleItemSelected
                    };

                    socket.emit('new-chat', MInfoData);
                    saveAdditionalInfo(MChatInfo);
                    console.log("Your message has been sent with additional data", ChatInfo);
                }


                setMessageInputValue('');
                setMultipleItemsSelected([]);
                setShowMultipleItems([]);
                setBufferedData([]);
                return;

            }

        }

        if (multipleItemSelected.length > 0) {


            const InfoData: InfoDataType = {
                AdditionalInfoData: bufferedData,
                username: myProfileDetails?.username,
                chatId: chatId,

            }

            const ChatInfo: Chat = {
                userId: myProfileDetails?._id,
                otherUserId: otherUserDetails?._id,
                chatId: chatId,
                username: myProfileDetails?.username || '',
                initateTime: Date.now().toString(),
                AdditionalData: multipleItemSelected
            };

            socket.emit('new-chat', InfoData);

            saveAdditionalInfo(ChatInfo);
            setMessageInputValue('');
            setMultipleItemsSelected([]);
            setShowMultipleItems([]);
            setBufferedData([]);
            return;


        }

        if (audioFileBlob) {
            console.log("you have sended audioBlob file bro");
            const InfoData: InfoDataType = {

                audioData: audioDataInfo,
                username: myProfileDetails?.username,
                chatId: chatId,


            }

            const ChatInfo: Chat = {
                userId: myProfileDetails?._id,
                otherUserId: otherUserDetails?._id,
                chatId: chatId,
                username: myProfileDetails?.username || '',
                initateTime: Date.now().toString(),
                AdditionalData: audioDataInfo
            };




            socket.emit('new-chat', InfoData);

            saveAudioDataInfo(ChatInfo);
            setMessageInputValue('');
            ResetEverythingOnDom();
            setMultipleItemsSelected([]);
            setShowMultipleItems([]);
            setBufferedData([]);
            return;
        }

    }

    async function fetchChatsFromDatabase() {

        setChatLoaded(false);
        const response = await fetch(`${MAIN_BACKEND_URL}/Personal-chat/fetch-all-personal-chats/${chatId}?chatSkip=${chatSkip}`, {
            method: "POST",
        });

        const result = await response.json();


        if (response.ok && response.status == 202) {
            if (!result.messageAvaliable) {
                setDisableFetchMessage(true);
                setChatLoaded(true);
                return;
            }
        }

        if (response.ok) {

            if (chatSkip > 0) {

                console.log("spread one exectuted");
                console.log(result);
                setAllChats(prevChats => [...result, ...prevChats]);
                setChatSkip(prev => prev + 10);

            }
            else {

                console.log("single chat exectued");
                setAllChats(result);
                setChatSkip(prev => prev + 10);
            }

        }


        setChatLoaded(true);
    }

    async function savedChatToDatabases(chat: Chat) {

        const response = await fetch(`${MAIN_BACKEND_URL}/personal-chat/save-personal-chats`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(chat),
        });

        if (response.ok) console.log("Chat has been saved to the database");




    }

    async function saveAdditionalInfo(AdditionalInfo: Chat) {


        const formData = new FormData();

        formData.append("allData", JSON.stringify(AdditionalInfo));

        AdditionalInfo.AdditionalData?.forEach((file: any) => {
            formData.append("files", file);
        })


        const response = await fetch(`${MAIN_BACKEND_URL}/personal-chat/additionalInfo-message`, {
            method: "POST",
            body: formData
        });

        if (response.ok) console.log("Chat has been saved to the database");
    }

    async function saveAudioDataInfo(ChatInfo: Chat) {

        const audioFile = ChatInfo.AdditionalData.blobFile;
        console.log("this is the ", audioFile);
        const formData = new FormData();

        formData.append("audioData", JSON.stringify(ChatInfo));
        formData.append("audioFile", audioFile);

        const response = await fetch(`${MAIN_BACKEND_URL}/personal-chat/audioDataInfo-message`, {
            method: "POST",
            body: formData
        });

        if (response.ok) console.log("Chat has been saved to the database");
    }

    function handleEnableMessageTab(value: string) {
        const user = JSON.parse(value);
        // reset everything
        ResetEverythingOnDom();
        navigate(`/Personal-chat/${user.userId}`);

    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {

        if (event.key == "Enter") {
            handleSendMessage();
        }
    }

    function handleSelectedFile(e: React.ChangeEvent<HTMLInputElement>) {

        const file = e.target.files?.[0];

        if (file) {
            const extension = file.name.split(".")[1];
            console.log(extension);
            if (extension == "mp4" || extension == "jpeg" || extension == "jpg" || extension == "png") {


                const fileReader = new FileReader();

                fileReader.onload = function (e) {
                    const arrayBuffer = e.target?.result;
                    console.log("Video Sent:", arrayBuffer);
                    setBufferedData(prev => [...prev, { file: arrayBuffer, extension: extension }]);
                }

                fileReader.readAsArrayBuffer(file);

                setMultipleItemsSelected(prev => [...prev, file]);
                const showFile = URL.createObjectURL(file);
                console.log("Look over here ", file.type, showFile);
                setShowMultipleItems(prev => [...prev, { extensionName: extension, actualBlob: showFile }]);
            }


        }
    }

    function handleDiscardButton() {

        ResetEverythingOnDom();
    }

    async function handleRecordAudio() {
        setRecording(true);

        if (sendMessageButtonRef.current) sendMessageButtonRef.current.disabled = true;


        if (inputMessageRef.current) inputMessageRef.current.disabled = true;
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunks = [];
        recorder = new MediaRecorder(stream);
        setMediaRecoder(recorder);
        recorder.start();


    }

    function handleStopRecording() {
        if (sendMessageButtonRef.current) sendMessageButtonRef.current.hidden = false;
        audioChunks = [];
        setPlayOrPause(true);
        mediaRecoder?.stop();
        setMediaRecoder(null);
    }

    function PlayRecorderAudio() {

        audioChunks = [];
        if (recordedAudioRef.current && recordedAudioRef.current.paused) {
            setPlayOrPause(false);
            recordedAudioRef.current.play();
        }
        else {
            setPlayOrPause(true);
            recordedAudioRef.current?.pause();
        }

    }

    function ResetEverythingOnDom() {


        if (inputMessageRef.current) inputMessageRef.current.disabled = false;

        if (sendMessageButtonRef.current) sendMessageButtonRef.current.hidden = false;

        if (recordedAudioRef.current) {
            recordedAudioRef.current.remove();
        }

        setMediaRecoder(null);
        setChatSkip(0);
        setAudioFileBlob(null);
        setAudioDataInfo(null);
        clearInterval(recoderIntervalId);
        clearTimeout(recorderTimeout);
        setMessageInputValue("");
        setMultipleItemsSelected([]);
        setShowMultipleItems([]);
        audioChunks = [];
        recorder = null;
        stream = null;
        setAudioUrl(null);
        setRecording(false);
        setPlayOrPause(false);
        setRunningTimer(0);
        setProgress(0);
    }

    async function handleGetPost(chat: Chat) {

        const post = await fetchDetailsOfUserPost(chat.sharedContent?.refId!);
        const { author: { userId }, createdAt, postLike } = post;
        console.log("post")
        handleOpenCommentBox(chat.sharedContent?.refId!, chat.sharedContent?.postOwnerName!, userId, postLike, createdAt);
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







    return (
        <>
            {!myProfileDetails && !otherUserDetails ? <LoadingScreen /> : <div>

                <MenuOptions profile={myProfileDetails} />
                {displayImageSelected && <LocalImagesAndVideos image={selectedImageItem} setCloseImage={setImageSelected} />}

                {toogleCommentBox && <CommentBox id={postId} toogleBox={closeCommentInfoBox}
                    userInfoF={ProvideInfoToCommentBox}
                    currentLikes={currentPostLikes}
                    createdAt={currentPostDate} />}

                <div className={styles.allMessages} >

                    <div className={styles.usernameAndIcon} >
                        <p>{myProfileDetails?.username}</p>
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

                    <div style={{ gap: "20px" }} className={styles.MessagesContainer}>

                        {AllChattedUsers &&

                            AllChattedUsers.map((user, index) => (
                                <div key={index} onClick={() => handleEnableMessageTab(JSON.stringify(user))} style={{ gap: "20px" }} id={styles.userMessage}>
                                    <div id={styles.userIcon}>
                                        <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${user.userId}`} width="100%" height="100%" alt="_image" />
                                    </div>

                                    <div>
                                        <p>{user.username}</p>
                                        <p>{user.chat}</p>
                                    </div>

                                </div>

                            ))
                        }

                    </div>

                </div>



                <div className={styles.bothProfileAndMessages} >

                    <div style={{ gap: "10px" }} className={styles.chatMessage}>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                            <div style={{
                                display: "flex", gap: "10px", alignItems: "center", position: "relative"
                            }}>

                                <div id={styles.profileIcon}>
                                    <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${id}`} height="100%" width="100%" alt="profile" />
                                </div>

                                <p>{otherUserDetails?.username}</p>
                                <span style={{ backgroundColor: `${userOnlineStatus ? "rgb(18, 255, 18)" : "rgba(71, 71, 71, 1)"}` }} className={styles.toogleStatus}></span>
                            </div>

                            <FontAwesomeIcon icon={faInfoCircle} style={{ fontSize: "1.24rem" }} />

                        </div>

                    </div>



                    <div className={styles.ChatMessageContainer}>


                        {/*  OTHER USER PROFILE */}
                        <div style={{

                            position: "relative", top: "0%", padding: "10px",
                            display: "flex", flexDirection: "column", gap: "10px",
                            alignItems: "center"
                        }}>
                            <div id={styles.profileIcon} style={{ width: "90px", height: "90px" }} >
                                <img src={`${MAIN_BACKEND_URL}/accounts/profileImage/${id}`} height="100%" width="100%" alt="profile" />
                            </div>
                            <p>{otherUserDetails?.fullname}</p>
                            <button onClick={() => navigate(`/userProfile/${otherUserDetails?._id}`)} style={{
                                padding: "5px 5px", border: "none",
                                borderRadius: "5px", color: "white", backgroundColor: "rgba(124, 121, 121, 0.534)",
                                fontWeight: "bolder", cursor: "pointer"
                            }}>View Profile</button>



                        </div>


                        {/*  LOAD MORE CHATS AND SPINNER */}
                        <div style={{
                            WebkitTapHighlightColor: "transparent",
                            display: disableFetchMess ? "none" : "flex",
                            alignItems: "center", justifyContent: "center", cursor: "pointer"
                        }} >


                            {
                                chatLoaded ?

                                    <span onClick={fetchChatsFromDatabase}
                                        className={styles.NewMessageAdd}>+</span>
                                    :

                                    <div className={styles.MessageLoader}></div>
                            }

                        </div>




                        {/*  ALL CHATS RENDERING */}

                        {AllChats &&

                            AllChats.map((chat, index) => (
                                <div ref={chatContainerRef}
                                    key={index}
                                    className={`${styles.message} ${chat.username === myProfileDetails?.username ? styles.me : styles.other
                                        }`}
                                >

                                    {/* This is the TEXT MESSAGE */}
                                    {chat.chat &&

                                        <>
                                            <p
                                                className={
                                                    chat.username === myProfileDetails?.username ? styles.myTextMessage : styles.otherMessage
                                                }
                                            >
                                                {chat.chat}

                                            </p>



                                        </>

                                    }

                                    {/* This is the TEMPORARY MESSAGE USING SOCKET DATA AT REAL TIME  */}

                                    {chat.temporaryAddData &&


                                        <div id={styles.AdditionalData}>
                                            {chat.temporaryAddData?.map((each) => {
                                                if (videoExtension.includes(each.extensionName)) {

                                                    return (
                                                        <video key={each.actualBlob} src={each.actualBlob} controls
                                                            style={{ width: "200px", objectFit: "cover", objectPosition: "center" }}
                                                            className={chat.username === myProfileDetails?.username ? styles.myMessage : styles.otherMessage}
                                                        />
                                                    );
                                                } else if (audioExtension.includes(each.extensionName)) {

                                                    return (
                                                        <audio key={each.actualBlob} src={each.actualBlob} controls
                                                            className={chat.username === myProfileDetails?.username ? styles.myMessage : styles.otherMessage}
                                                        />
                                                    );
                                                } else if (imageExtension.includes(each.extensionName)) {

                                                    return (
                                                        <img onClick={() => {
                                                            setImageItem(each.actualBlob);
                                                            setImageSelected(prev => !prev);
                                                        }} key={each.actualBlob} src={each.actualBlob} alt="image"
                                                            style={{ width: "200px", objectFit: "contain", objectPosition: "center", cursor: "pointer" }}
                                                            className={chat.username === myProfileDetails?.username ? styles.myMessage : styles.otherMessage}
                                                        />
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>





                                    }

                                    {/* This is the AUDIO , VIDEO AND IMAGE DATA RECEIVED FROM BACKEND WHEN USER FETCH  */}

                                    {

                                        chat.AdditionalData &&



                                        <div id={styles.AdditionalData}>
                                            {chat.AdditionalData?.map((each: AdditionalDataType) => {
                                                if (videoExtension.includes(each.contentType)) {
                                                    return (
                                                        <video
                                                            key={each._id}
                                                            src={`${MAIN_BACKEND_URL}/Personal-chat/render-message-items/${chat._id}/${each._id}`}
                                                            controls
                                                            style={{ width: "200px", objectFit: "contain", objectPosition: "center" }}
                                                            className={chat.username === myProfileDetails?.username ? styles.myMessage : styles.otherMessage}
                                                        />
                                                    );
                                                } else if (audioExtension.includes(each.contentType)) {
                                                    return (
                                                        <audio
                                                            key={each._id}
                                                            src={`${MAIN_BACKEND_URL}/Personal-chat/render-message-items/${chat._id}/${each._id}`}
                                                            controls
                                                            style={{ width: "200px", objectFit: "contain", objectPosition: "center" }}
                                                            className={chat.username === myProfileDetails?.username ? styles.myMessage : styles.otherMessage}
                                                        />
                                                    );
                                                } else if (imageExtension.includes(each.contentType)) {
                                                    return (
                                                        <img onClick={() => {
                                                            setImageItem(`${MAIN_BACKEND_URL}/Personal-chat/render-message-items/${chat._id}/${each._id}`);
                                                            setImageSelected(true);
                                                        }}
                                                            key={each._id}
                                                            src={`${MAIN_BACKEND_URL}/Personal-chat/render-message-items/${chat._id}/${each._id}`}
                                                            alt="image"
                                                            style={{ width: "200px", objectFit: "contain", objectPosition: "center", cursor: "pointer" }}
                                                            className={chat.username === myProfileDetails?.username ? styles.myMessage : styles.otherMessage}
                                                        />
                                                    );
                                                }

                                                return null;
                                            })}
                                        </div>





                                    }

                                    {/* SHARED ITEMS OVER HERE */}

                                    {

                                        chat.sharedContent &&

                                        <div className={styles.sharedContent}>

                                            <div className={styles.innerSharedItem}>
                                                <div style={{ display: "flex", alignItems: "center", gap: '10px', padding: "5px" }} >
                                                    <img width="40px" height="40px"
                                                        style={{ borderRadius: "50%" }}
                                                        src={`${MAIN_BACKEND_URL}/accounts/profileImage/${chat.sharedContent.postOwnerId}`} alt="" />
                                                    <span>{chat.sharedContent.postOwnerName}</span>
                                                </div>
                                                <img onClick={() => handleGetPost(chat)} src={`${MAIN_BACKEND_URL}/uploadPost/postImage/${chat.sharedContent.refId}`}
                                                    style={{ width: "100%", height: "100%", objectFit: 'contain' }}
                                                    alt="Image" />

                                                <div style={{ padding: "5px" }} >
                                                    <span>{chat.sharedContent.previewText}</span>
                                                </div>
                                            </div>

                                        </div>

                                    }


                                    <div ref={lastMessageRef} ></div>
                                    <div ref={lastMessageRef} ></div>

                                </div>


                            ))}


                        {/* MESSAGE INPUT BOX   */}

                        <div className={styles.messageInputBox}>


                            {/* CURRENT WORKING AREA UNDER CONSTRUCTION */}


                            {recording &&

                                <div id="audioContainer" className={styles.AudioRecorder}>
                                    <div ref={recoderDivRef}
                                        style={{
                                            position: "absolute",
                                            left: "0px",
                                            width: `${progress}%`,
                                            height: "30px",
                                            zIndex: "1",
                                            backgroundColor: "red",
                                            transition: "width 1s linear"
                                        }}
                                        id={styles.timerDiv}></div>
                                    <span>
                                        {String(Math.floor(runningTimer / 60)).padStart(2, "0")}:
                                        {String(runningTimer % 60).padStart(2, "0")}
                                    </span>
                                    <button id={styles.playOrPauseButton} onClick={audioUrl ? PlayRecorderAudio : handleStopRecording} >
                                        <FontAwesomeIcon icon={playOrPause ? faPlay : faPause} />
                                    </button>
                                    <audio src={audioUrl} ref={recordedAudioRef}
                                        hidden={true}
                                        controls ></audio>
                                </div>

                            }



                            {multipleItemSelected.length > 0 &&

                                <div className={styles.selectedItems}  >

                                    <input type="file" ref={fileRef} onChange={handleSelectedFile} hidden={true} />
                                    <div onClick={() => fileRef.current?.click()} id={styles.anotherFileSelection} >
                                        <FontAwesomeIcon icon={faImages} />
                                    </div>

                                    <div style={{ display: "flex", gap: "10px" }} >
                                        {showMultipleItems.map((each) => (
                                            each.extensionName == "mp4"
                                                ?
                                                <video src={each.actualBlob} loop={true} controls autoPlay={true} muted
                                                    style={{ border: "1px solid rgba(27, 27, 27, 0.926)", borderRadius: "5px", width: "200px", objectFit: "contain", flexShrink: "0" }} />
                                                :
                                                <img src={each.actualBlob} alt="" style={{
                                                    border: "1px solid rgba(27, 27, 27, 0.926)",
                                                    borderRadius: "10px",
                                                    width: "200px", objectFit: "contain", flexShrink: "0"
                                                }} />
                                        ))}

                                    </div>

                                </div>

                            }



                            <FontAwesomeIcon icon={faSmile} id={styles.fontAwButtons} />

                            <input ref={inputMessageRef} onKeyDown={handleKeyDown} placeholder="Message..." value={messageInputValue} onChange={(e) => setMessageInputValue(e.target.value)}
                                type="text" style={{
                                    width: "78%", position: "relative",
                                    backgroundColor: "transparent", border: "none", outline: "none", color: "white", fontSize: "1.05rem"
                                }} />

                            {messageInputValue.length > 0 || multipleItemSelected.length > 0 || recording ?

                                <>

                                    <button ref={sendMessageButtonRef} onClick={handleSendMessage} id={styles.sendMessageButton} style={{
                                        left: "10px", border: "none",
                                        display: "flex", justifyContent: "right",
                                        padding: "5px 17px", gap: "10px",
                                        backgroundColor: "transparent", width: "100px",
                                        fontWeight: "bolder", cursor: "pointer"
                                    }}
                                    >Send</button>

                                    {multipleItemSelected.length > 0 || recording ?
                                        <button onClick={handleDiscardButton} id={styles.sendMessageButton} style={{
                                            border: "none",
                                            display: "flex", justifyContent: "right",
                                            padding: "5px 17px", gap: "10px",
                                            backgroundColor: "transparent",
                                            fontWeight: "bolder", cursor: "pointer"
                                        }} >Discard</button>

                                        :
                                        null

                                    }

                                </>



                                :
                                <div style={{
                                    position: "relative", left: "5px", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    gap: "5px", width: "100px"
                                }} >

                                    <FontAwesomeIcon onClick={handleRecordAudio} id={styles.fontAwButtons} icon={faMicrophone} />
                                    <FontAwesomeIcon id={styles.fontAwButtons} icon={faHeart} />
                                    <FontAwesomeIcon onClick={() => fileRef.current?.click()} id={styles.fontAwButtons} icon={faImage} />
                                    <input type="file" hidden={true}
                                        ref={fileRef}
                                        onChange={handleSelectedFile}
                                    />
                                </div>
                            }
                        </div>

                    </div>

                </div>


            </div>
            }


        </>
    )
}

export default Chatting
