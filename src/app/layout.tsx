import type { Metadata } from "next";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { CartProvider } from "./context/CartContext";
import SessionExpiredToast from "../components/shared/SessionExpiredToast";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoPract — Sustainable Areca Leaf Plates",
  description: "Premium biodegradable areca leaf plates and bowls. Handcrafted by women artisans in India, used across the USA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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
