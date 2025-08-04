# 📋 frontend_todolist.md - 프론트엔드 개발 계획서

이 문서는 'MyMatchLog' 야구 직관 기록&이벤트 플랫폼의 프론트엔드 개발 계획을 정의합니다. 각 페이지, 기능, 컴포넌트별 구현 상태를 todo 리스트 형식으로 관리합니다.

---

## 🎯 전체 페이지 개발 우선순위 및 상태

### Phase 1: 핵심 인프라 (우선순위: 높음)
- [x] 프로젝트 초기 설정 (Vite + React + TypeScript)
- [x] TailwindCSS 설정 및 디자인 시스템 구축
- [x] shadcn/ui 컴포넌트 라이브러리 설정
- [x] React Router 설정 및 기본 라우팅 구조
- [x] React Query 설정 및 API 통신 인프라
- [x] Zustand 상태 관리 설정
- [x] 기본 레이아웃 컴포넌트 (Header, Footer)

### Phase 1.5: 메인 페이지 완성 및 디자인 기준 확립 (우선순위: 높음)
- [x] 메인 페이지 전체 디자인 및 레이아웃 완성
- [x] Hero Section 최적화 (플랫폼 소개, CTA 버튼)
- [x] Feature Section 완성 (주요 기능 카드)
- [x] Recent Events Section 완성 (이벤트 카드 디자인)
- [x] Popular Stadiums Section 완성 (경기장 카드 디자인)
- [x] 반응형 디자인 완벽 적용 (모바일/태블릿/데스크톱)
- [x] 애니메이션 및 인터랙션 효과 추가
- [x] 디자인 시스템 문서화 (컬러, 폰트, 스페이싱, 컴포넌트 스타일)
- [x] 메인 페이지를 기준으로 한 디자인 가이드라인 확립

### Phase 2: 인증 시스템 (우선순위: 높음)
- [x] 로그인 페이지 (`/login`)
- [x] 회원가입 페이지 (`/signup`)
- [x] 인증 상태 관리 (Zustand + localStorage)
- [x] 보호된 라우트 구현
- [x] JWT 토큰 갱신 로직 (api.ts에 구현됨)
- [x] 인증 상태 초기화 로직 (AuthInitializer)
- [x] 새로고침 시 인증 상태 유지 기능
- [x] 인증 확인 중 로딩 화면 구현

### Phase 3: 핵심 기능 (우선순위: 높음)
- [x] 직관 기록 목록 페이지 (`/match-logs`)
- [x] 직관 기록 작성 페이지 (`/match-logs/create`)
- [x] 직관 기록 상세 페이지 (`/match-logs/:id`)
- [ ] 직관 기록 수정 페이지 (`/match-logs/:id/edit`)
- [x] 티켓 OCR 기능 구현

### Phase 4: 이벤트 시스템 (우선순위: 중간)
- [ ] 이벤트 목록 페이지 (`/events`)
- [ ] 이벤트 상세 페이지 (`/events/:id`)
- [ ] 이벤트 참여 기능
- [ ] 이벤트 상태별 필터링

### Phase 5: 사용자 관리 (우선순위: 중간)
- [ ] 마이페이지 (`/mypage`)
- [ ] 프로필 설정 페이지 (`/settings`)
- [ ] 직관 통계 및 차트
- [ ] 응원팀 설정

### Phase 6: 관리자 기능 (우선순위: 낮음)
- [ ] 관리자 대시보드 (`/admin`)
- [ ] 이벤트 관리 페이지 (`/admin/events`)
- [ ] 참여자 관리 페이지 (`/admin/events/:id/participants`)

### Phase 7: 최적화 및 배포 (우선순위: 낮음)
- [ ] 성능 최적화 (Code Splitting, Lazy Loading)
- [ ] 접근성 검증 및 개선
- [ ] 반응형 디자인 완성
- [ ] 배포 환경 설정

---

## 📄 각 페이지별 주요 기능 및 상태

### 🏠 공개 페이지

#### PAGE_HOME (`/`) ✅ 완료
- [x] Hero Section (플랫폼 소개, CTA 버튼)
- [x] Feature Section (주요 기능 안내, 카드 디자인)
- [x] Recent Events Section (최근 이벤트, 이벤트 카드)
- [x] Popular Stadiums Section (인기 경기장, 경기장 카드)
- [x] 반응형 레이아웃 완벽 적용
- [x] 애니메이션 및 인터랙션 효과
- [x] 디자인 시스템 기준 확립
- [x] 다른 페이지 디자인 참조용 완성

#### PAGE_LOGIN (`/login`) ✅ 완료
- [x] 이메일/비밀번호 입력 폼
- [x] 실시간 유효성 검증
- [x] 로그인 상태 관리
- [x] 에러 메시지 표시
- [x] 회원가입 페이지 링크
- [x] 메인 페이지와 동일한 디자인 분위기 적용
- [x] 반응형 디자인 및 애니메이션 효과

#### PAGE_SIGNUP (`/signup`) ✅ 완료
- [x] 회원가입 폼 (이메일, 비밀번호, 닉네임)
- [x] 응원팀 선택 기능 (KBO 10개 팀)
- [x] 실시간 유효성 검증
- [x] 약관 동의 체크박스
- [x] 로그인 페이지 링크
- [x] 메인 페이지와 동일한 디자인 분위기 적용
- [x] 반응형 디자인 및 애니메이션 효과

#### PAGE_EVENTS_LIST (`/events`)
- [ ] 이벤트 카드 목록 표시
- [ ] 이벤트 상태별 필터링
- [ ] 페이지네이션
- [ ] 검색 기능
- [ ] 이벤트 상세 페이지 링크

#### PAGE_EVENT_DETAIL (`/events/:id`)
- [ ] 이벤트 상세 정보 표시
- [ ] 참여 신청 버튼
- [ ] 참여자 현황 표시
- [ ] 이벤트 상태별 UI
- [ ] 목록으로 돌아가기

### 🔐 인증 필요 페이지

#### PAGE_MATCH_LOGS_LIST (`/match-logs`) ✅ 완료
- [x] 직관 기록 카드 목록
- [x] 날짜/팀별 필터링
- [x] 검색 기능
- [x] 페이지네이션
- [x] 새 기록 작성 버튼
- [x] 기록 상세 페이지 링크

#### PAGE_MATCH_LOG_CREATE (`/match-logs/create`) ✅ 완료
- [x] 경기 정보 입력 폼
- [x] 티켓 이미지 업로드
- [x] OCR 자동 정보 추출
- [x] 실시간 유효성 검증
- [x] 제출 버튼 및 로딩 상태
- [x] 경기장별 홈팀 제약조건 구현

#### PAGE_MATCH_LOG_DETAIL (`/match-logs/:id`) ✅ 완료
- [x] 직관 기록 상세 정보
- [x] 티켓 이미지 표시
- [x] 수정/삭제 버튼
- [x] 삭제 확인 다이얼로그
- [x] 목록으로 돌아가기

#### PAGE_MATCH_LOG_EDIT (`/match-logs/:id/edit`)
- [ ] 기존 정보 폼에 표시
- [ ] 티켓 이미지 교체 기능
- [ ] 실시간 유효성 검증
- [ ] 업데이트 버튼
- [ ] 상세 페이지로 돌아가기

#### PAGE_MYPAGE (`/mypage`)
- [ ] 사용자 프로필 정보
- [ ] 직관 통계 (총 횟수, 팀별 통계)
- [ ] 최근 직관 기록 목록
- [ ] 사이드바 네비게이션
- [ ] 설정 페이지 링크

#### PAGE_SETTINGS (`/settings`)
- [ ] 닉네임 변경 기능
- [ ] 응원팀 변경 기능
- [ ] 비밀번호 변경 기능
- [ ] 실시간 유효성 검증
- [ ] 저장 버튼 및 상태 표시

### 👑 관리자 페이지

#### PAGE_ADMIN_DASHBOARD (`/admin`)
- [ ] 전체 통계 현황
- [ ] 최근 이벤트 목록
- [ ] 사용자 활동 현황
- [ ] 관리자 네비게이션
- [ ] 권한 확인 로직

#### PAGE_ADMIN_EVENTS (`/admin/events`)
- [ ] 이벤트 목록 (관리용)
- [ ] 이벤트 생성 버튼
- [ ] 이벤트 수정/삭제 기능
- [ ] 이벤트 상태 관리
- [ ] 참여자 관리 링크

#### PAGE_ADMIN_EVENT_PARTICIPANTS (`/admin/events/:id/participants`)
- [ ] 이벤트 정보 표시
- [ ] 참여자 목록 표시
- [ ] 참여자 상태 관리
- [ ] 참여자 목록 내보내기
- [ ] 이벤트 관리로 돌아가기

---

## 🧩 공통 컴포넌트 리스트 및 상태

### 🎨 UI 컴포넌트 (shadcn/ui 기반)
- [x] Button (Primary, Secondary, Outline, Ghost)
- [x] Card (Default, Featured, Stats, Match Log)
- [x] Input (Text, Email, Password, Search)
- [x] Label
- [x] Form (FormField, FormItem, FormMessage)
- [ ] Select (팀 선택, 경기장 선택)
- [ ] Textarea (메모 입력)
- [ ] Checkbox (약관 동의)
- [ ] Radio Group (결과 선택)
- [ ] Badge (이벤트 상태, 게임 결과)
- [ ] Avatar (사용자 프로필)
- [ ] Dialog (확인 다이얼로그)
- [ ] Toast (알림 메시지)
- [ ] Loading Spinner
- [ ] Skeleton (로딩 상태)

### 🧭 레이아웃 컴포넌트
- [ ] Header (로고, 네비게이션, 사용자 메뉴)
- [ ] Sidebar (마이페이지 네비게이션)
- [ ] Footer (회사 정보, 링크)
- [ ] Navigation (메인 메뉴, 모바일 메뉴)
- [ ] Container (최대 너비, 패딩)
- [ ] Grid (반응형 그리드 시스템)

### 📝 폼 컴포넌트
- [ ] LoginForm (이메일, 비밀번호)
- [ ] SignupForm (이메일, 비밀번호, 닉네임, 응원팀)
- [ ] MatchLogForm (경기 정보 입력)
- [ ] ProfileForm (프로필 수정)
- [ ] PasswordForm (비밀번호 변경)
- [ ] EventForm (이벤트 생성/수정)

### 🎯 도메인별 컴포넌트
- [ ] TeamSelector (팀 선택)
- [ ] StadiumSelector (경기장 선택)
- [ ] TicketUpload (티켓 이미지 업로드)
- [ ] OCRResult (OCR 결과 표시)
- [ ] MatchLogCard (직관 기록 카드)
- [ ] EventCard (이벤트 카드)
- [ ] StatisticsChart (통계 차트)
- [ ] Pagination (페이지네이션)
- [ ] FilterBar (필터링 바)
- [ ] SearchBar (검색 바)

### 🔧 유틸리티 컴포넌트
- [ ] ErrorBoundary (에러 처리)
- [ ] ProtectedRoute (보호된 라우트)
- [ ] LoadingPage (페이지 로딩)
- [ ] EmptyState (빈 상태 표시)
- [ ] ConfirmDialog (확인 다이얼로그)
- [ ] ImageViewer (이미지 뷰어)

---

## 📁 예상 폴더 구조 (React + TailwindCSS 기준)

### 프로젝트 루트
```
mymatchlog-frontend/
├── public/                    # 정적 파일
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── src/
│   ├── components/           # 컴포넌트
│   │   ├── ui/              # shadcn/ui 컴포넌트 ✅
│   │   │   ├── button.tsx ✅
│   │   │   ├── card.tsx ✅
│   │   │   ├── input.tsx ✅
│   │   │   ├── label.tsx ✅
│   │   │   ├── form.tsx ✅
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── index.ts
│   │   ├── layout/          # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Container.tsx
│   │   │   └── index.ts
│   │   ├── forms/           # 폼 컴포넌트
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── MatchLogForm.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── PasswordForm.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── index.ts
│   │   └── features/        # 도메인별 컴포넌트
│   │       ├── auth/
│   │       │   ├── AuthProvider.tsx
│   │       │   └── ProtectedRoute.tsx
│   │       ├── match-logs/
│   │       │   ├── MatchLogCard.tsx
│   │       │   ├── TicketUpload.tsx
│   │       │   ├── OCRResult.tsx
│   │       │   └── StatisticsChart.tsx
│   │       ├── events/
│   │       │   ├── EventCard.tsx
│   │       │   ├── EventFilter.tsx
│   │       │   └── EventParticipation.tsx
│   │       ├── teams/
│   │       │   ├── TeamSelector.tsx
│   │       │   └── TeamIcon.tsx
│   │       ├── stadiums/
│   │       │   ├── StadiumSelector.tsx
│   │       │   └── StadiumCard.tsx
│   │       └── admin/
│   │           ├── AdminDashboard.tsx
│   │           ├── EventManagement.tsx
│   │           └── ParticipantList.tsx
│   ├── pages/               # 페이지 컴포넌트 ✅
│   │   ├── public/         # 공개 페이지 ✅
│   │   │   ├── Home.tsx ✅
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Events.tsx
│   │   │   └── EventDetail.tsx
│   │   ├── protected/      # 인증 필요 페이지
│   │   │   ├── MatchLogs.tsx
│   │   │   ├── MatchLogCreate.tsx
│   │   │   ├── MatchLogDetail.tsx
│   │   │   ├── MatchLogEdit.tsx
│   │   │   ├── MyPage.tsx
│   │   │   └── Settings.tsx
│   │   └── admin/          # 관리자 페이지
│   │       ├── Dashboard.tsx
│   │       ├── EventManagement.tsx
│   │       └── ParticipantManagement.tsx
│   ├── hooks/              # 커스텀 훅
│   │   ├── useAuth.ts
│   │   ├── useMatchLogs.ts
│   │   ├── useEvents.ts
│   │   ├── useTeams.ts
│   │   ├── useStadiums.ts
│   │   ├── useOCR.ts
│   │   └── useLocalStorage.ts
│   ├── services/           # API 서비스
│   │   ├── api.ts         # Axios 설정
│   │   ├── auth.ts        # 인증 관련 API
│   │   ├── matchLogs.ts   # 직관 기록 API
│   │   ├── events.ts      # 이벤트 API
│   │   ├── teams.ts       # 팀 API
│   │   ├── stadiums.ts    # 경기장 API
│   │   ├── ocr.ts         # OCR API
│   │   └── admin.ts       # 관리자 API
│   ├── stores/            # Zustand 스토어
│   │   ├── authStore.ts   # 인증 상태
│   │   ├── uiStore.ts     # UI 상태
│   │   └── index.ts
│   ├── utils/             # 유틸리티 함수
│   │   ├── constants.ts   # 상수
│   │   ├── helpers.ts     # 헬퍼 함수
│   │   ├── validation.ts  # 유효성 검증
│   │   ├── formatters.ts  # 포맷터
│   │   └── storage.ts     # 로컬 스토리지
│   ├── types/             # TypeScript 타입 정의
│   │   ├── api.ts         # API 응답 타입
│   │   ├── auth.ts        # 인증 관련 타입
│   │   ├── matchLogs.ts   # 직관 기록 타입
│   │   ├── events.ts      # 이벤트 타입
│   │   ├── teams.ts       # 팀 타입
│   │   ├── stadiums.ts    # 경기장 타입
│   │   └── common.ts      # 공통 타입
│   ├── styles/            # 글로벌 스타일 ✅
│   │   ├── globals.css    # 글로벌 CSS ✅
│   │   ├── components.css # 컴포넌트 스타일 ✅
│   │   └── animations.css # 애니메이션 ✅
│   ├── providers/         # Context Provider
│   │   ├── AuthProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   ├── ToastProvider.tsx
│   │   └── index.ts
│   ├── App.tsx           # 메인 앱 컴포넌트 ✅
│   ├── main.tsx          # 앱 진입점 ✅
│   └── vite-env.d.ts     # Vite 타입 정의 ✅
├── .eslintrc.js          # ESLint 설정 ✅
├── .prettierrc           # Prettier 설정
├── tailwind.config.js    # TailwindCSS 설정 ✅ (v3.4.0)
├── postcss.config.js     # PostCSS 설정 ✅ (v3 호환)
├── tsconfig.json         # TypeScript 설정 ✅
├── vite.config.ts        # Vite 설정 ✅
├── package.json          # 의존성 관리 ✅
└── README.md             # 프로젝트 문서
```

### 주요 설정 파일
- [x] `tailwind.config.js` - TailwindCSS 설정 (v3.4.0, SK렌터카 테마 컬러)
- [x] `tsconfig.json` - TypeScript 설정
- [x] `vite.config.ts` - Vite 빌드 설정
- [x] `.eslintrc.js` - ESLint 코드 품질 설정
- [ ] `.prettierrc` - Prettier 코드 포맷팅 설정
- [x] `package.json` - 의존성 및 스크립트 정의

---

## 📊 개발 진행 상황 추적

### 전체 진행률
- **Phase 1 (인프라)**: 100% (7/7 완료) ✅
- **Phase 1.5 (메인 페이지 완성)**: 100% (9/9 완료) ✅
- **Phase 2 (인증)**: 100% (5/5 완료) ✅
- **Phase 3 (핵심 기능)**: 80% (4/5 완료) ✅
- **Phase 4 (이벤트)**: 0% (0/4 완료)
- **Phase 5 (사용자 관리)**: 0% (0/4 완료)
- **Phase 6 (관리자)**: 0% (0/3 완료)
- **Phase 7 (최적화)**: 0% (0/4 완료)

### 현재 완료된 항목
✅ **기본 환경 설정**
- Vite + React + TypeScript 프로젝트 설정
- TailwindCSS v3.4.0 설정 (안정적 버전)
- shadcn/ui 컴포넌트 라이브러리 설정 (Button, Card, Input, Label, Form)
- TypeScript 경로 매핑 설정
- ESLint 설정
- React Router 설정 및 기본 라우팅 구조

✅ **프론트엔드 인프라 구축**
- React Query 설정 (API 통신 인프라)
- Zustand 상태 관리 설정 (인증 상태 관리)
- Axios 설정 (토큰 자동 추가, 갱신 로직)
- 기본 레이아웃 컴포넌트 (Header, Footer)
- UI 컴포넌트 라이브러리 확장 (Select, Textarea, Badge, Dialog, Toast 등)

✅ **메인 페이지 완성**
- Hero Section (플랫폼 소개, CTA 버튼)
- Feature Section (주요 기능 카드)
- Recent Events Section (이벤트 카드)
- Popular Stadiums Section (경기장 카드)
- CTA Section (회원가입 유도)
- 반응형 디자인 완벽 적용
- 애니메이션 및 인터랙션 효과
- SK렌터카 테마 컬러 적용

✅ **인증 시스템 구현**
- 로그인 페이지 (이메일/비밀번호, 유효성 검증, 에러 처리)
- 회원가입 페이지 (응원팀 선택, 약관 동의, 실시간 검증)
- 보호된 라우트 구현 (인증 필요 페이지, 관리자 권한 페이지)
- JWT 토큰 갱신 로직 (Axios 인터셉터)
- 메인 페이지와 동일한 디자인 분위기 적용
- 반응형 디자인 및 애니메이션 효과

✅ **디자인 시스템 확립**
- SK렌터카 Primary Red (#EA002C) 메인 컬러
- 반응형 그리드 시스템
- 카드 디자인 패턴
- 버튼 스타일 가이드라인
- 타이포그래피 계층 구조

### 다음 단계 우선순위
1. **React Query 설정** - API 통신 인프라
2. **Zustand 설정** - 상태 관리
3. **기본 레이아웃 컴포넌트** - Header, Footer, Sidebar
4. **추가 UI 컴포넌트** - Select, Textarea, Badge, Dialog 등
5. **로그인/회원가입 페이지** - 인증 시스템 구축

---

## 🚀 즉시 시작 가능한 작업

### 1. React Query 설정
```bash
npm install @tanstack/react-query
```

### 2. Zustand 설정
```bash
npm install zustand
```

### 3. 추가 UI 컴포넌트 설치
```bash
npx shadcn@latest add select textarea checkbox radio-group badge avatar dialog toast
```

### 4. Axios 설정
```bash
npm install axios
```

### 5. 기본 레이아웃 컴포넌트 생성
- Header 컴포넌트 (로고, 네비게이션, 사용자 메뉴)
- Footer 컴포넌트 (회사 정보, 링크)
- Sidebar 컴포넌트 (마이페이지 네비게이션)

---

## 🔧 최근 변경사항 (2024-01-01)

### TailwindCSS v4 → v3 다운그레이드
- **이유**: v4는 아직 베타 버전으로 안정성 문제
- **변경사항**:
  - `tailwindcss@^3.4.0` 설치
  - `@tailwindcss/postcss` 패키지 추가
  - PostCSS 설정 업데이트
  - CSS 파일 v3 호환으로 수정
  - 불필요한 패키지 제거 (`tw-animate-css`)

### 디자인 시스템 업데이트
- SK렌터카 테마 컬러 추가
- 커스텀 애니메이션 키프레임 추가
- 컴포넌트별 CSS 클래스 정의
- 반응형 디자인 기준 확립

이제 안정적인 TailwindCSS v3 환경에서 개발을 진행할 수 있습니다.

