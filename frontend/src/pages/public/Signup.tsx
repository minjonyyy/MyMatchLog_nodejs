import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'

const Signup: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    favoriteTeamId: '',
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // KBO 팀 목록 (임시 데이터)
  const teams = [
    { id: 1, name: '두산 베어스' },
    { id: 2, name: '삼성 라이온즈' },
    { id: 3, name: '한화 이글스' },
    { id: 4, name: '키움 히어로즈' },
    { id: 5, name: 'KT 위즈' },
    { id: 6, name: 'LG 트윈스' },
    { id: 7, name: 'NC 다이노스' },
    { id: 8, name: 'SSG 랜더스' },
    { id: 9, name: '롯데 자이언츠' },
    { id: 10, name: 'KIA 타이거즈' },
  ]

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

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteTeamId: value
    }))
    if (errors.favoriteTeamId) {
      setErrors(prev => ({
        ...prev,
        favoriteTeamId: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.'
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.'
    }

    // 비밀번호 확인 검증
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    // 닉네임 검증
    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요.'
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다.'
    }

    // 약관 동의 검증
    if (!agreedToTerms) {
      newErrors.terms = '이용약관에 동의해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      // TODO: 회원가입 API 호출
      console.log('회원가입 시도:', formData)
      
      // 임시 회원가입 성공 처리
      setTimeout(() => {
        setIsLoading(false)
        navigate('/login')
      }, 1000)
      
    } catch (error) {
      setIsLoading(false)
      setErrors({ general: '회원가입에 실패했습니다. 다시 시도해주세요.' })
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
            회원가입
          </h2>
          <p className="text-stone-600">
            MyMatchLog와 함께 야구 팬 커뮤니티에 참여해보세요
          </p>
        </div>

        {/* 회원가입 폼 */}
        <Card className="shadow-xl border-0 bg-white">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이메일 입력 */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-700 font-medium">
                  이메일 *
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
                  비밀번호 *
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="6자 이상 입력하세요"
                  className={`h-12 text-base bg-white border-gray-300 ${
                    errors.password ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-stone-700 font-medium">
                  비밀번호 확인 *
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  className={`h-12 text-base bg-white border-gray-300 ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* 닉네임 입력 */}
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-stone-700 font-medium">
                  닉네임 *
                </Label>
                <Input
                  id="nickname"
                  name="nickname"
                  type="text"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="사용할 닉네임을 입력하세요"
                  className={`h-12 text-base bg-white border-gray-300 ${
                    errors.nickname ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {errors.nickname && (
                  <p className="text-sm text-red-600">{errors.nickname}</p>
                )}
              </div>

              {/* 응원팀 선택 */}
              <div className="space-y-2">
                <Label htmlFor="favoriteTeam" className="text-stone-700 font-medium">
                  응원팀 (선택)
                </Label>
                <Select value={formData.favoriteTeamId} onValueChange={handleSelectChange}>
                  <SelectTrigger className="h-12 text-base bg-white border-gray-300">
                    <SelectValue placeholder="응원하는 팀을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()} className="hover:bg-amber-50">
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.favoriteTeamId && (
                  <p className="text-sm text-red-600">{errors.favoriteTeamId}</p>
                )}
              </div>

              {/* 약관 동의 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm text-stone-700">
                    <span className="text-amber-700 hover:text-amber-800 cursor-pointer">
                      이용약관
                    </span>
                    과{' '}
                    <span className="text-amber-700 hover:text-amber-800 cursor-pointer">
                      개인정보처리방침
                    </span>
                    에 동의합니다 *
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-red-600">{errors.terms}</p>
                )}
              </div>

              {/* 일반 에러 메시지 */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* 회원가입 버튼 */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>가입 중...</span>
                  </div>
                ) : (
                  '회원가입'
                )}
              </Button>
            </form>

            {/* 로그인 링크 */}
            <div className="mt-6 text-center">
              <p className="text-stone-600">
                이미 계정이 있으신가요?{' '}
                <Link
                  to="/login"
                  className="text-amber-700 hover:text-amber-800 font-semibold transition-colors duration-300"
                >
                  로그인하기
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

export default Signup 