import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useUserAuthContext } from "./Context/UserContext.tsx";


// import components  -- 
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import ResetPassword from "./Components/ResetPassword";
import AppInterface from "./Components/AppInterface.tsx";
import Profile from "./Components/Profile.tsx";
import Messages from "./Components/Messages.tsx";
import Chatting from "./Components/Chatting.tsx";
import PageNotFound from "./Components/PageNotFound.tsx";
import UserProfile from "./Components/UserProfile.tsx";

import NotificationPage from "./Components/NotificationPage.tsx";
import ForgotPassword from "./Components/ForgotPassword.tsx";
import Reels from "./Components/Reels.tsx";
import { useEffect, useState } from "react";
import LoadingScreen from "./Components/LoadingScreen.tsx";
function App() {

  const { profile } = useUserAuthContext();


  const [showMain, setShowMain] = useState<boolean>(false);


  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMain(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!showMain) {
    return <LoadingScreen />
  }

  return (
    <>

      <BrowserRouter>
        <Routes>

          <Route path="/" element={!profile ? <Login /> : <AppInterface />} />
          <Route path="/accounts/password/reset" element={<ForgotPassword />} />
          <Route path="/rs/:id1/:id2" element={<ResetPassword />} />
          <Route path="/accounts/login" element={!profile ? <Login /> : <Navigate to="/" />} />
          <Route path="/accounts/signup" element={!profile ? <SignUp /> : <Navigate to="/" />} />
          <Route path="/accounts/profile" element={!profile ? <Login /> : <Profile />} />
          <Route path="/accounts/inbox/messages" element={!profile ? <Login /> : <Messages />} />
          <Route path="/Personal-chat/:id" element={!profile ? <Login /> : <Chatting />} />
          <Route path="/userProfile/:id" element={!profile ? <Login /> : <UserProfile />} />
          <Route path="/Notification" element={<NotificationPage />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>

      </BrowserRouter>

    </>
  )
}


export default App;