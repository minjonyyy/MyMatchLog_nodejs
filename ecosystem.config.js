module.exports = {
  apps: [
    {
      name: 'mymatchlog-api',
      script: 'src/app.js',
      instances: 'max', // CPU 코어 수만큼 인스턴스 생성
      exec_mode: 'cluster', // 클러스터 모드로 실행
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_test: {
        NODE_ENV: 'test',
        PORT: 3001
      },
      // 로그 설정
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 재시작 설정
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      
      // 헬스체크
      health_check_grace_period: 3000,
      
      // 환경변수
      env_file: '.env',
      
      // 워치 모드 (개발용)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'coverage'],
      
      // 크래시 시 자동 재시작
      autorestart: true,
      
      // 시작 시 대기 시간
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // 메모리 사용량 모니터링
      node_args: '--max-old-space-size=1024'
    }
  ],

  // 배포 설정 (선택사항)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/MyMatchLog_nodejs.git',
      path: '/var/www/mymatchlog',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run db:migrate && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 