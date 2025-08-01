import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.'
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      // TODO: 로그인 API 호출
      console.log('로그인 시도:', formData)
      
      // 임시 로그인 성공 처리
      setTimeout(() => {
        setIsLoading(false)
        navigate('/')
      }, 1000)
      
    } catch (error) {
      setIsLoading(false)
      setErrors({ general: '로그인에 실패했습니다. 다시 시도해주세요.' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 로고 및 제목 */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">MyMatchLog</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-stone-900 mb-2">
            로그인
          </h2>
          <p className="text-stone-600">
            야구장에서의 특별한 순간들을 기록해보세요
          </p>
        </div>

        {/* 로그인 폼 */}
        <Card className="shadow-xl border-0 bg-white">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이메일 입력 */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-700 font-medium">
                  이메일
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={`h-12 text-base bg-white border-gray-300 ${
                    errors.email ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-stone-700 font-medium">
                  비밀번호
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 입력하세요"
                  className={`h-12 text-base ${
                    errors.password ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* 일반 에러 메시지 */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>로그인 중...</span>
                  </div>
                ) : (
                  '로그인'
                )}
              </Button>
            </form>

            {/* 회원가입 링크 */}
            <div className="mt-6 text-center">
              <p className="text-stone-600">
                계정이 없으신가요?{' '}
                <Link
                  to="/signup"
                  className="text-amber-700 hover:text-amber-800 font-semibold transition-colors duration-300"
                >
                  회원가입하기
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 추가 링크 */}
        <div className="text-center space-y-4">
          <Link
            to="/"
            className="text-stone-600 hover:text-amber-700 transition-colors duration-300"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login 