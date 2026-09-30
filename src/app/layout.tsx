import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const mincho = Shippori_Mincho_B1({ weight: ["500", "700", "800"], subsets: ["latin"], variable: "--font-mincho", display: "swap" });
const gothic = Zen_Kaku_Gothic_New({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-gothic", display: "swap" });
const mono = JetBrains_Mono({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const SITE = "https://kitsune-tales-qwen.vercel.app";
const DESCRIPTION =
  "Two LoRA fine-tunes of Gemma 4 E4B that write original fantasy light-novel fiction in Japanese (kitsune-tales-e4b-jp) and English (kitsune-tales-e4b-en). Synthetic data pipeline, training curves for every run, evaluation with 95% confidence intervals, a validated LLM judge, safety and memorization audits.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Kitsune Tales: fantasy light-novel LLMs in Japanese and English", template: "%s | Kitsune Tales" },
  description: DESCRIPTION,
  applicationName: "Kitsune Tales",
  authors: [{ name: "Ashish Kumar", url: "https://github.com/whoashish115" }],
  creator: "Ashish Kumar",
  keywords: [
    "Kitsune Tales",
    "kitsune-tales-e4b-jp",
    "kitsune-tales-e4b-en",
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
    images: [{ url: "/figures/eval_metrics.png", width: 2164, height: 952, alt: "Automatic metrics for every evaluated system with 95% confidence intervals" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kitsune Tales: fantasy light-novel LLMs in Japanese and English",
    description: DESCRIPTION,
    images: ["/figures/eval_metrics.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

// Applies stored theme and language choices before paint. Theme follows the OS unless chosen; language defaults to
// "mix" (English with Japanese alongside).
const bootScript = `try{var r=document.documentElement,t=localStorage.getItem("kitsune-theme");if(t==="light"||t==="dark")r.setAttribute("data-theme",t);var l=localStorage.getItem("kitsune-lang");if(l!=="en"&&l!=="ja")l="mix";r.setAttribute("data-lang",l);if(l==="ja")r.setAttribute("lang","ja")}catch(e){document.documentElement.setAttribute("data-lang","mix")}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-lang="mix" className={`${mincho.variable} ${gothic.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
