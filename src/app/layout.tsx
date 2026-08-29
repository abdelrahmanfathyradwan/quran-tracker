import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout";
import { ToastProvider, AuthGuard } from "@/components/shared";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-arabic",
});

export const metadata: Metadata = {
  title: "متابعة الحفظ — لوحة تحكم الشيخ",
  description: "نظام بسيط وجميل لمتابعة حفظ القرآن الكريم ومراجعته للطلاب",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${ibmPlexArabic.variable}`}>
      <body className="antialiased min-h-screen bg-stone-50 text-stone-900">
        <ToastProvider>
          <AuthGuard>
            <AppLayout>{children}</AppLayout>
          </AuthGuard>
        </ToastProvider>
      </body>
    </html>
  );
}
