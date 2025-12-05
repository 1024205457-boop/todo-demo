import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "我的待办清单",
  description: "一个使用 Next.js 和 Tailwind CSS 实现的简洁待办清单应用",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}


