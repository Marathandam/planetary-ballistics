import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Space-themed colors
        space: {
          deep: "hsl(var(--space-deep))",
          void: "hsl(var(--space-void))",
        },
        nebula: {
          purple: "hsl(var(--nebula-purple))",
          pink: "hsl(var(--nebula-pink))",
        },
        stellar: {
          blue: "hsl(var(--stellar-blue))",
        },
        cosmic: {
          cyan: "hsl(var(--cosmic-cyan))",
        },
        plasma: {
          orange: "hsl(var(--plasma-orange))",
        },
        aurora: {
          green: "hsl(var(--aurora-green))",
        },
        // Planet-specific colors
        earth: {
          blue: "hsl(var(--earth-blue))",
          green: "hsl(var(--earth-green))",
        },
        mars: {
          red: "hsl(var(--mars-red))",
        },
        jupiter: {
          cream: "hsl(var(--jupiter-cream))",
        },
        moon: {
          gray: "hsl(var(--moon-gray))",
        },
        atmosphere: {
          glow: "hsl(var(--atmosphere-glow))",
          haze: "hsl(var(--atmospheric-haze))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "stellar-pulse": {
          "0%, 100%": {
            opacity: "0.8",
            transform: "scale(1)",
            filter: "brightness(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.05)",
            filter: "brightness(1.2)",
          },
        },
        "cosmic-drift": {
          "0%": {
            transform: "translateX(-10px) rotate(0deg)",
          },
          "33%": {
            transform: "translateX(10px) rotate(120deg)",
          },
          "66%": {
            transform: "translateX(-5px) rotate(240deg)",
          },
          "100%": {
            transform: "translateX(-10px) rotate(360deg)",
          },
        },
        "nebula-flow": {
          "0%, 100%": {
            background: "linear-gradient(45deg, hsl(var(--nebula-purple)), hsl(var(--nebula-pink)))",
          },
          "50%": {
            background: "linear-gradient(45deg, hsl(var(--plasma-orange)), hsl(var(--cosmic-cyan)))",
          },
        },
        "atmospheric-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--atmosphere-glow) / 0.3)",
          },
          "50%": {
            boxShadow: "0 0 40px hsl(var(--atmosphere-glow) / 0.6)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "stellar-pulse": "stellar-pulse 2s ease-in-out infinite",
        "cosmic-drift": "cosmic-drift 8s ease-in-out infinite",
        "nebula-flow": "nebula-flow 4s ease-in-out infinite",
        "atmospheric-glow": "atmospheric-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
