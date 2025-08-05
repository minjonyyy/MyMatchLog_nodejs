-- 테스트용 이벤트 데이터 삽입 (한국어 인코딩 설정)
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- 이벤트 1: 정상적인 이벤트 (참여 가능)
INSERT INTO events (
    title, 
    description, 
    start_at, 
    end_at, 
    gift, 
    capacity, 
    participant_count,
    created_at,
    updated_at
) VALUES (
    '야구 직관 이벤트',
    '직관 기록을 남기고 선착순으로 참여하는 이벤트입니다. 야구 팬들을 위한 특별한 혜택을 제공합니다!',
    NOW() - INTERVAL 1 DAY,
    NOW() + INTERVAL 7 DAY,
    '야구 굿즈 세트 (모자, 티셔츠, 응원봉)',
    100,
    25,
    NOW(),
    NOW()
);

-- 이벤트 2: 정원 마감된 이벤트 (미당첨)
INSERT INTO events (
    title, 
    description, 
    start_at, 
    end_at, 
    gift, 
    capacity, 
    participant_count,
    created_at,
    updated_at
) VALUES (
    '선착순 할인 이벤트',
    '선착순 50명에게 50% 할인 쿠폰을 제공합니다. 빠르게 참여하세요!',
    NOW() - INTERVAL 2 DAY,
    NOW() + INTERVAL 1 DAY,
    '50% 할인 쿠폰',
    50,
    50,  -- 정원 마감
    NOW(),
    NOW()
);

-- 이벤트 3: 진행 중인 이벤트 (참여 가능)
INSERT INTO events (
    title, 
    description, 
    start_at, 
    end_at, 
    gift, 
    capacity, 
    participant_count,
    created_at,
    updated_at
) VALUES (
    '야구 팬 특별 이벤트',
    '야구 팬들을 위한 특별한 이벤트입니다. 경기장 투어와 함께하는 특별한 경험을 제공합니다.',
    NOW() - INTERVAL 1 HOUR,
    NOW() + INTERVAL 3 DAY,
    '경기장 투어 + VIP 좌석 티켓',
    30,
    8,
    NOW(),
    NOW()
);

-- 테스트용 사용자 참여 데이터 (선택사항)
-- 실제 사용자가 참여할 수 있도록 비워둡니다.

SELECT '테스트 이벤트 데이터 삽입 완료' as message;
SELECT 
    id,
    title,
    gift,
    capacity,
    participant_count,
    CASE 
        WHEN participant_count >= capacity THEN '정원 마감'
        WHEN NOW() BETWEEN start_at AND end_at THEN '진행 중'
        WHEN NOW() < start_at THEN '예정'
        ELSE '종료'
    END as status
FROM events 
ORDER BY id; 