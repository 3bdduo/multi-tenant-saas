import type { Metadata, Viewport } from "next";
import { Alexandria, Readex_Pro, Aref_Ruqaa_Ink } from "next/font/google";
import "./globals.css";
import { themeInitScript } from "@/lib/themeInitScript";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { Preloader } from "@/components/Preloader";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeartbeatLoader } from "@/components/ui/HeartbeatLoader";
import { GlobalBackButton } from "@/components/GlobalBackButton";

// Readex Pro: Modern, geometric, friendly Arabic body font (matching Tinta Arabic & Ramis Arabic style)
const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

// Alexandria: Bold, distinctive modern Arabic display font for headings & branding
const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

// Aref Ruqaa Ink: Authentic artistic Arabic brush / ink calligraphy font (matching Lemon Brush style)
const arefRuqaaInk = Aref_Ruqaa_Ink({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-brush",
  display: "swap",
});

export const metadata: Metadata = {
  title: "نبض | Nabd — منصة إدارة العيادات الطبية",
  description: "منصة نبض (Nabd SaaS) المتطورة لإدارة العيادات الطبية — مواعيد، مرضى، وسجلات طبية. Your Pulse, Our Care.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F9FA" },
    { media: "(prefers-color-scheme: dark)", color: "#12181A" },
  ],
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${readexPro.variable} ${alexandria.variable} ${arefRuqaaInk.variable}`}>
      <head>
        {/* Blocking script: applies the correct theme class before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Preload critical above-the-fold images */}
        <link rel="preload" as="image" href="/logo/arc-logo.jpg" />
        <link rel="preload" as="image" href="/images/hero-clinic-1.jpg" />
        <link rel="preload" as="image" href="/images/hero-clinic-2.jpg" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <AuthProvider>
            <AmbientBackground />
            <HeartbeatLoader />
            <GlobalBackButton />
            <Preloader>{children}</Preloader>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
