import { useEffect } from 'react'
import { useAuthStore } from '../../../stores/authStore'
import { getMyInfo } from '../../../services/auth'

const AuthInitializer: React.FC = () => {
  const { setUser, setTokens, setInitialized } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken')
      
      if (accessToken) {
        try {
          // 저장된 토큰으로 사용자 정보 조회
          const response = await getMyInfo()
          
          if (response.success) {
            setUser(response.data.user)
            const refreshToken = localStorage.getItem('refreshToken')
            setTokens(accessToken, refreshToken || '')
          } else {
            // 토큰이 유효하지 않으면 제거
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        } catch (error) {
          // 에러 발생 시 토큰 제거
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
      
      // 초기화 완료 표시
      setInitialized(true)
    }

    initializeAuth()
  }, [setUser, setTokens, setInitialized])

  return null
}

export default AuthInitializer 