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
import LoadingScreen from "./Components/LoadingScreen.tsx";
import ForgotPassword from "./Components/ForgotPassword.tsx";
import Reels from "./Components/Reels.tsx";
function App() {

  const { user }: any = useUserAuthContext();


if(!user) {
   
  setTimeout(() => {
  
    <LoadingScreen/>
    
  } , 3000);

}


  return (
    <>


      <BrowserRouter>
        <Routes>

          <Route path="/" element={!user ? <Login /> : <AppInterface />} />
          <Route path="/accounts/password/reset" element={<ForgotPassword />} />
          <Route path="/rs/:id1/:id2" element={<ResetPassword />} />
          <Route path="/accounts/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/accounts/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
          <Route path="/accounts/profile" element={!user ? <Login /> : <Profile />} />
          <Route path="/accounts/inbox/messages" element={!user ? <Login /> : <Messages />} />
          <Route path="/Personal-chat/:id" element={!user ? <Login /> : <Chatting />} />
          <Route path="/userProfile/:id" element={!user ? <Login /> : <UserProfile />} />
          <Route path="/Notification" element={<NotificationPage />} />
          <Route path = "/reels" element={<Reels/>} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>

      </BrowserRouter>

    </>
  )
}


export default App;