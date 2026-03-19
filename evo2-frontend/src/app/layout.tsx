import "~/styles/globals.css";

import { type Metadata } from "next";
import { Poppins } from "next/font/google";

export const metadata: Metadata = {
  title: "Evo2 Variant Analysis",
  description: "Evo2 Variant Analysis",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// Configure Poppins with the weights you'll need for UI
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap", // Ensures text stays visible while font loads
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.className}>
      {/* Applied the poppins font, antialiased for crisp rendering, 
        and set a clean neutral zinc background.
      */}
      <body className="font-sans min-h-screen bg-zinc-50 text-zinc-900 antialiased selection:bg-[#de8246]/20 selection:text-[#de8246]">
        {children}
      </body>
    </html>
  );
}