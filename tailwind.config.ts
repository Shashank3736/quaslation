import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  // Optimize for production builds
  future: {
    hoverOnlyWhenSupported: true, // Only apply hover styles on devices that support hover
  },
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brutal: {
          yellow: '#FFD93D',
          pink: '#FF6B9D',
          cyan: '#6BCF7F',
          purple: '#C996FF',
          orange: '#FF8C42',
          blue: '#4D96FF',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      borderWidth: {
        'brutal': '3px',
        'brutal-lg': '4px',
        'brutal-mobile': '2px', // Mobile-specific thinner borders
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px 0px #000',
        'brutal': '4px 4px 0px 0px #000',
        'brutal-lg': '6px 6px 0px 0px #000',
        'brutal-xl': '8px 8px 0px 0px #000',
        'brutal-yellow': '4px 4px 0px 0px #FFD93D',
        'brutal-pink': '4px 4px 0px 0px #FF6B9D',
        'brutal-cyan': '4px 4px 0px 0px #6BCF7F',
        'brutal-purple': '4px 4px 0px 0px #C996FF',
        // Mobile-specific smaller shadows
        'brutal-mobile': '2px 2px 0px 0px #000',
        'brutal-mobile-yellow': '2px 2px 0px 0px #FFD93D',
        'brutal-mobile-pink': '2px 2px 0px 0px #FF6B9D',
        'brutal-mobile-cyan': '2px 2px 0px 0px #6BCF7F',
        'brutal-mobile-purple': '2px 2px 0px 0px #C996FF',
        // Dark mode white shadows
        'brutal-sm-dark': '2px 2px 0px 0px #fff',
        'brutal-dark': '4px 4px 0px 0px #fff',
        'brutal-lg-dark': '6px 6px 0px 0px #fff',
        'brutal-xl-dark': '8px 8px 0px 0px #fff',
        'brutal-mobile-dark': '2px 2px 0px 0px #fff',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"),require("@tailwindcss/typography")],
} satisfies Config

export default config