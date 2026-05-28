# Momo - 나만의 순간 캡처 앱 (Personalized Moment Capture)

**Momo**는 기존 프로젝트를 기반으로 하여 저만의 코딩 스타일과 기술적 선호도를 반영해 대폭 커스터마이징하고 개선한 마이크로블로깅 애플리케이션입니다.

단순한 클론을 넘어, **Firebase에서 Supabase로 백엔드 아키텍처를 완전히 전환**하였으며, 이를 통해 PostgreSQL 기반의 강력한 데이터 관리와 고성능 실시간 기능을 구현했습니다.

## 🚀 주요 개선 및 커스텀 사항

- **아키텍처 전환**: 인증, 데이터베이스, 스토리지, 실시간 기능을 모두 Firebase에서 **Supabase**로 완벽하게 마이그레이션했습니다.
- **고성능 실시간 엔진**: 단순한 리스너를 Supabase의 고성능 Postgres 변경 구독(Change Subscriptions) 방식으로 교체하여 효율을 높였습니다.
- **성능 최적화**: 직접 구현한 이미지 압축 유틸리티(`utils/imageUtils.ts`)를 통해 업로드 속도를 개선하고 스토리지 비용을 절감했습니다.
- **현대적인 UI/UX**: Tailwind CSS를 활용해 커스텀 다크 테마와 매끄러운 애니메이션을 적용하여 사용자 경험을 고도화했습니다.
- **타입 안정성 강화**: TypeScript 인터페이스를 정교하게 설계하여 코드의 신뢰성과 유지보수성을 높였습니다.

## ✨ 주요 기능

- **실시간 업데이트**: Supabase Realtime을 사용하여 게시물 작성, 수정, 좋아요 상태를 즉각적으로 반영합니다.
- **소셜 인증**: Supabase Auth를 통해 Google 및 GitHub 계정으로 안전하게 로그인할 수 있습니다.
- **미디어 지원**: 이미지를 첨부하여 게시물을 올릴 수 있으며, 업로드 전 브라우저에서 자동 압축됩니다.
- **낙관적 UI (Optimistic UI)**: 프로필 수정 시 로컬 상태를 즉시 반영하여 사용자에게 빠른 피드백을 제공합니다.
- **반응형 디자인**: Tailwind CSS를 사용해 모바일과 데스크톱 모두에 최적화된 디자인을 제공합니다.

## 🚀 기술 스택

- **Frontend**: React (TypeScript), Vite
- **Styling**: Tailwind CSS, FontAwesome
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Utilities**: `date-fns`, `react-hot-toast`, `uuid`

## 🛠️ 시작하기

### 1. 저장소 클론
```bash
git clone https://github.com/easysIT/nwitter.git
cd momo
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 환경 변수 설정
루트 디렉토리에 `.env` 파일을 생성하고 `.env.example`의 내용을 복사하여 넣으세요.
```bash
# .env 파일 예시
VITE_SUPABASE_URL=사용자의_프로젝트_URL
VITE_SUPABASE_ANON_KEY=사용자의_ANON_KEY
```

### 4. Supabase 백엔드 설정

#### 데이터베이스 테이블 (`momo`) 생성
SQL Editor에서 아래 쿼리를 실행하세요:
```sql
create table momo (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  "createdAt" int8 not null,
  "creatorId" text not null,
  "displayName" text,
  "photoURL" text,
  "attachmentUrl" text,
  likes text[] default '{}'
);

-- 실시간 기능 활성화
alter table momo replica identity full;

-- RLS 보안 정책 설정
alter table momo enable row level security;
create policy "Anyone can read momo" on momo for select using (true);
create policy "Authenticated users can insert momo" on momo for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own momo" on momo for update using (auth.uid()::text = "creatorId");
create policy "Users can delete their own momo" on momo for delete using (auth.uid()::text = "creatorId");
```

#### 스토리지 버킷 (`momo_storage`) 설정
1. `momo_storage`라는 이름의 퍼블릭 버킷을 생성합니다.
2. 모든 사용자에게 `SELECT` 권한을, 인증된 사용자에게 `ALL` 권한을 주는 정책을 추가합니다.

### 5. 애플리케이션 실행
```bash
npm run dev
```

## 📄 라이선스
이 프로젝트는 교육 및 개인 학습용으로 제작되었습니다.
