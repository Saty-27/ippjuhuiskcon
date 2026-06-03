export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#f52246",
        ink: "#111111",
        muted: "#666666",
        soft: "#f5f6fa"
      },
      fontFamily: {
        sans: ["Poppins", "Montserrat", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        premium: "0 18px 50px rgba(17, 17, 17, 0.10)"
      }
    }
  },
  plugins: []
};
