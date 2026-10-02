import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const mincho = Shippori_Mincho_B1({ weight: ["500", "700", "800"], subsets: ["latin"], variable: "--font-mincho", display: "swap" });
const gothic = Zen_Kaku_Gothic_New({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-gothic", display: "swap" });
const mono = JetBrains_Mono({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const SITE = "https://kitsune-tales-qwen.vercel.app";
const DESCRIPTION =
  "Two LoRA fine-tunes of Gemma 4 E4B that write original fantasy light-novel fiction in Japanese (Kitsune-Tales-E4B-JP) and English (Kitsune-Tales-E4B-EN). Synthetic data, interactive training curves, held-out evaluation with 95% confidence intervals, a validated LLM judge and a safety audit.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Kitsune Tales: fantasy light-novel LLMs in Japanese and English", template: "%s | Kitsune Tales" },
  description: DESCRIPTION,
  applicationName: "Kitsune Tales",
  authors: [{ name: "Ashish Kumar", url: "https://github.com/whoashish115" }],
  creator: "Ashish Kumar",
  keywords: [
    "Kitsune Tales",
    "Kitsune-Tales-E4B-JP",
    "Kitsune-Tales-E4B-EN",
    "Gemma 4 E4B",
    "LoRA",
    "DPO",
    "fine-tuning",
    "Japanese LLM",
    "light novel",
    "fantasy fiction",
    "creative writing",
    "LLM evaluation",
    "LLM-as-a-judge",
    "synthetic data",
    "GGUF",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Kitsune Tales",
    title: "Kitsune Tales: fantasy light-novel LLMs in Japanese and English",
    description: DESCRIPTION,
    locale: "en_US",
    alternateLocale: ["ja_JP"],
    images: [{ url: "/figures/judge_preference.png", width: 1647, height: 1023, alt: "LLM judge net preference with 95% confidence intervals, full outputs and equal-length openings" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kitsune Tales: fantasy light-novel LLMs in Japanese and English",
    description: DESCRIPTION,
    images: ["/figures/judge_preference.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

// Applies stored theme and language choices before paint. The theme is light unless the reader picked dark (the OS
// setting is not consulted); the language defaults to English.
const bootScript = `try{var r=document.documentElement;r.setAttribute("data-theme",localStorage.getItem("kitsune-theme")==="dark"?"dark":"light");var l=localStorage.getItem("kitsune-lang");if(l!=="mix"&&l!=="ja")l="en";r.setAttribute("data-lang",l);if(l==="ja")r.setAttribute("lang","ja")}catch(e){document.documentElement.setAttribute("data-theme","light");document.documentElement.setAttribute("data-lang","en")}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-lang="en" data-theme="light" className={`${mincho.variable} ${gothic.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
