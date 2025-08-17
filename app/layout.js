import "./globals.css";

export const metadata = {
  title: "한줄일기",
  description: "AI 감정 요약 미니 다이어리",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="bg-[#FAF8F5] text-gray-800">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
