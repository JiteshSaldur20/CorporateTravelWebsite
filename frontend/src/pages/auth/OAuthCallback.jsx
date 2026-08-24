import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loadUser } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    const token = searchParams.get('token')
    const refreshToken = searchParams.get('refreshToken')
    if (token) {
      localStorage.setItem('token', token)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      loadUser().then(() => {
        addToast('Logged in with Google!', 'success')
        navigate('/')
      })
    } else {
      addToast('Google login failed', 'danger')
      navigate('/login')
    }
  }, [searchParams, navigate, loadUser, addToast])

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" />
    </div>
  )
}
