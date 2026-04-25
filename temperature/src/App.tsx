import Dashboard from './components/Dashboard'
import ChatbotPopup from './components/ChatbotPopup'

const isEmbedded = window.self !== window.top

export default function App() {
  return (
    <div className="dark">
      <Dashboard />
      {!isEmbedded && <ChatbotPopup />}
    </div>
  )
}
