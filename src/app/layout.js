import "./globals.css";
import AIChatModal from "@/components/AIChatModal";

export const metadata = {
  title: "Interactive ADA Lab Companion — Visualizer & Walkthroughs",
  description: "A premium interactive educational guide for Analysis & Design of Algorithms labs, featuring step-by-step code execution simulators, C line-by-line walkthroughs, and viva prep.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        {children}
        <AIChatModal />
      </body>
    </html>
  );
}
