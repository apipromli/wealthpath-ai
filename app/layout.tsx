import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WealthPath AI — Your Personalized Financial Roadmap",
  description:
    "AI-powered 12-month financial roadmap personalized to your goals, situation, and dreams. Build wealth with clarity.",
  icons: { icon: "/logo-icon.svg" },
  openGraph: {
    title: "WealthPath AI — Your Personalized Financial Roadmap",
    description:
      "AI-generated 12-month wealth-building roadmap, personalized in seconds.",
    type: "website",
  },
};

/* Inline script runs before React hydrates — prevents theme flash. */
const themeScript = `(function(){
  try {
    var t = localStorage.getItem('wp-theme');
    var p = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if ((t || p) === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Must be the very first child so it fires before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
