# 🚀 AWS 배포 가이드 (aws-deployment-guide.md)

이 문서는 MyMatchLog 프로젝트를 AWS에 배포하는 방법을 설명합니다.

---

## 📋 AWS 배포 옵션

### 1. **AWS ECS (Elastic Container Service) + Fargate** ⭐️ 추천

- **장점**: 서버리스, 자동 스케일링, 관리 용이
- **비용**: 사용한 만큼만 과금
- **적합**: 프로덕션 환경

### 2. **AWS EC2 (Elastic Compute Cloud)**

- **장점**: 완전한 제어권, 다양한 인스턴스 타입
- **비용**: 인스턴스 시간당 과금
- **적합**: 개발/테스트 환경

### 3. **AWS Lambda + API Gateway**

- **장점**: 서버리스, 자동 스케일링
- **비용**: 요청당 과금
- **적합**: 마이크로서비스

---

## 🔧 AWS ECS 배포 설정

### 1. AWS 리소스 준비

#### 1.1 ECR (Elastic Container Registry) 생성

```bash
# ECR 리포지토리 생성
aws ecr create-repository --repository-name mymatchlog-api --region ap-northeast-2

# 로그인
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com
```

#### 1.2 RDS (MySQL) 생성

```bash
# RDS 인스턴스 생성 (MySQL 8.0)
aws rds create-db-instance \
  --db-instance-identifier mymatchlog-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0.35 \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20 \
  --region ap-northeast-2
```

#### 1.3 ElastiCache (Redis) 생성

```bash
# Redis 클러스터 생성
aws elasticache create-cache-cluster \
  --cache-cluster-id mymatchlog-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1 \
  --region ap-northeast-2
```

#### 1.4 S3 버킷 생성

```bash
# S3 버킷 생성 (이미지 저장용)
aws s3 mb s3://mymatchlog-images --region ap-northeast-2
```

### 2. GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions에서 다음 시크릿 추가:

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-northeast-2
ECR_REPOSITORY=mymatchlog-api
ECS_CLUSTER=mymatchlog-cluster
ECS_SERVICE=mymatchlog-service
```

### 3. ECS 클러스터 및 서비스 생성

#### 3.1 ECS 클러스터 생성

```bash
aws ecs create-cluster --cluster-name mymatchlog-cluster
```

#### 3.2 태스크 정의 생성

```json
{
  "family": "mymatchlog-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "mymatchlog-api",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/mymatchlog-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mymatchlog-api",
          "awslogs-region": "ap-northeast-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 3.3 ECS 서비스 생성

```bash
aws ecs create-service \
  --cluster mymatchlog-cluster \
  --service-name mymatchlog-service \
  --task-definition mymatchlog-api:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

---

## 🔄 배포 프로세스

### 1. 자동 배포 (GitHub Actions)

```yaml
# .github/workflows/deploy-aws.yml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Build and push to ECR
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-definition.json
          service: ${{ secrets.ECS_SERVICE }}
          cluster: ${{ secrets.ECS_CLUSTER }}
```

### 2. 수동 배포

```bash
# 로컬에서 직접 배포
docker build -t mymatchlog-api .
docker tag mymatchlog-api:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/mymatchlog-api:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/mymatchlog-api:latest

# ECS 서비스 업데이트
aws ecs update-service --cluster mymatchlog-cluster --service mymatchlog-service --force-new-deployment
```

---

## 📊 모니터링 및 로깅

### 1. CloudWatch 로그

```bash
# 로그 그룹 생성
aws logs create-log-group --log-group-name /ecs/mymatchlog-api

# 로그 확인
aws logs describe-log-streams --log-group-name /ecs/mymatchlog-api
```

### 2. CloudWatch 메트릭

- CPU 사용률
- 메모리 사용률
- 네트워크 I/O
- 애플리케이션 메트릭

### 3. 알림 설정

```bash
# SNS 토픽 생성
aws sns create-topic --name mymatchlog-alerts

# CloudWatch 알람 생성
aws cloudwatch put-metric-alarm \
  --alarm-name "mymatchlog-cpu-high" \
  --alarm-description "CPU 사용률이 높습니다" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

---

## 💰 비용 최적화

### 1. 리소스 크기 조정

- **개발 환경**: t3.micro (최소 사양)
- **프로덕션 환경**: t3.small 또는 t3.medium

### 2. 예약 인스턴스

```bash
# 1년 예약 인스턴스 (30-60% 할인)
aws ec2 describe-reserved-instances-offerings \
  --instance-type t3.small \
  --offering-type All Upfront
```

### 3. Auto Scaling

```bash
# ECS Auto Scaling 설정
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/mymatchlog-cluster/mymatchlog-service \
  --min-capacity 1 \
  --max-capacity 10
```

---

## 🔒 보안 설정

### 1. IAM 역할 및 정책

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2. 보안 그룹 설정

```bash
# 보안 그룹 생성
aws ec2 create-security-group \
  --group-name mymatchlog-sg \
  --description "Security group for MyMatchLog API"

# 인바운드 규칙 추가
aws ec2 authorize-security-group-ingress \
  --group-id sg-12345 \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0
```

---

## 🚀 다음 단계

1. **AWS 계정 설정 및 리소스 생성**
2. **GitHub Secrets 설정**
3. **ECS 클러스터 및 서비스 생성**
4. **첫 번째 배포 테스트**
5. **모니터링 및 알림 설정**
6. **비용 최적화**

이 가이드를 따라하면 AWS에서 안정적이고 확장 가능한 배포 환경을 구축할 수 있습니다! 🎯
