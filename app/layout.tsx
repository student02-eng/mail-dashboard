import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mail Dashboard",
  description: "Google Sheets 기반 메일 현황 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
