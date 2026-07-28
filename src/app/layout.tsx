import type { Metadata } from "next";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { CartProvider } from "./context/CartContext";
import SessionExpiredToast from "../components/shared/SessionExpiredToast";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoPract — Sustainable Sal & Palash Leaf Plates",
  description: "Premium biodegradable Sal & Palash leaf plates and bowls. Handcrafted by women artisans in India, used across the USA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="Gg2QDbPw34BzsdiALXU0M5MRByJGOLVKaI1S4FWpTgk" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <SessionExpiredToast />
        </CartProvider>
      </body>
    </html>
  );
}
