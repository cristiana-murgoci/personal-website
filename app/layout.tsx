import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Space_Mono } from "next/font/google";
import "./globals.css";
import styles from "./page.module.css";
import SiteHeader from "./components/SiteHeader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cristianamurgoci.com"),
  title: {
    default: "Cristiana Murgoci",
    template: "%s · Cristiana Murgoci",
  },
  description:
    "Researcher at the intersection of AI safety, statistics, and physical automation. Harvard Statistics & CS with a concurrent Master's in Statistics.",
  authors: [{ name: "Cristiana Murgoci", url: "https://cristianamurgoci.com" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Cristiana Murgoci",
    description:
      "Researcher at the intersection of AI safety, statistics, and physical automation.",
    type: "website",
    url: "https://cristianamurgoci.com",
    images: [
      { url: "/headshot.jpg", width: 800, height: 1067, alt: "Cristiana Murgoci" },
    ],
  },
  twitter: {
    card: "summary",
    title: "Cristiana Murgoci",
    description:
      "Researcher at the intersection of AI safety, statistics, and physical automation.",
    images: ["/headshot.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Cristiana Murgoci",
  url: "https://cristianamurgoci.com",
  image: "https://cristianamurgoci.com/headshot.jpg",
  jobTitle: "Researcher",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Harvard University",
  },
  knowsAbout: [
    "AI Safety",
    "Statistics",
    "Machine Learning",
    "Algorithmic Game Theory",
    "Mechanism Design",
    "Quantum Computing",
    "Differential Privacy",
  ],
  sameAs: ["https://linkedin.com/in/cristiana-murgoci"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${spaceMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <main className={styles.main}>
          <SiteHeader />
          {children}
        </main>
      </body>
    </html>
  );
}
