/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/components/ErrorChecker/**/*.{js,ts,jsx,tsx}",
    "./src/components/Presentation/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
