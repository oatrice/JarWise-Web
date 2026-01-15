/** @type {import('tailwindcss').Config} */
import themeColors from './tailwind.theme.js';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ...themeColors
            }
        },
    },
    plugins: [],
}
