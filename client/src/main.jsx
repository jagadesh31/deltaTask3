import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { AuthProvider } from './contexts/authContext.jsx'
import { SocketProvider } from './contexts/socketContext.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <SocketProvider>
      <App />
    </SocketProvider>
  </AuthProvider>
)
