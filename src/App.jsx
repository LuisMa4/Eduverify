import { Routes, Route } from 'react-router-dom'
import EduVerifyLogin from './pages/login.jsx'
import EduVerifyRegister from './pages/register.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<EduVerifyLogin />} />
      <Route path="/register" element={<EduVerifyRegister />} />
    </Routes>
  )
}

export default App
