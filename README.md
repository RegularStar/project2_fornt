# 한줄일기 Frontend (Next.js 15 + Tailwind v4)

## 빠른 시작
```bash
npm i
npm run dev
```

## 백엔드 API 주소 설정
`.env.local`에 넣어주세요:
```
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api
```

## Tailwind v4 메모
- PostCSS 플러그인: `@tailwindcss/postcss`
- `app/globals.css` 상단에 `@import "tailwindcss";` 한 줄이면 됩니다.

## 주요 페이지
- `/` : 오늘의 한줄 입력/목록 + 하루 마무리
- `/summary` : 생성된 요약 표시
- `/history` : 과거 요약 목록

## 유저 식별
- 첫 방문 시 `localStorage.uid` 자동 발급
- 닉네임은 `localStorage.nickname`에 저장 (우상단 표시)
- 모든 API 요청에 `X-User-Id` 헤더 포함
