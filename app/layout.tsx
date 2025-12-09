import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kalendarz życia",
  description: "Interaktywny kalendarz życia w miesiącach z możliwością eksportu do PDF.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
