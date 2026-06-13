import "./globals.css";

export const metadata = {
  title: "Information Is Wealth",
  description: "Find government welfare schemes you are eligible for",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1e1b4b",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "Inter, sans-serif", background: "#f9fafb" }}>
        {children}
      </body>
    </html>
  );
}