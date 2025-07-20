import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthContextProvider } from './Context/UserContext.tsx'
import { ToggleProvider } from './Context/ToogleContext.tsx'
import "./Styling/global.css"
import { SocketProvider } from './Context/SocketContext.tsx'
createRoot(document.getElementById('root')!).render(
  <AuthContextProvider>
  <ToggleProvider>
  <SocketProvider>


    <App />
 

  </SocketProvider>
  </ToggleProvider>
  </AuthContextProvider>,
)
