import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			pink: {
  				'50': '#fdf2f8',
  				'100': '#fce7f3',
  				'400': '#f472b6',
  				'500': '#ec4899'
  			},
  			indigo: {
  				'500': '#6366f1',
  				'600': '#4f46e5'
  			},
  			cyan: {
  				'500': '#06b6d4'
  			},
  			navy: {
  				'100': '#e0e7ff',
  				'800': '#1e3a5f'
  			},
  			success: '#10b981',
  			warning: '#f59e0b',
  			danger: '#ef4444',
  			info: '#3b82f6',
  			border: 'var(--border)',
        primary: {
          DEFAULT: '#ec4899',
          foreground: '#ffffff'
        }
  		},
  		borderRadius: {
  			DEFAULT: '10px',
  			xs: '10px',
  			sm: '10px',
  			md: '10px',
  			lg: '10px',
  			xl: '10px',
  			'2xl': '10px',
  			'3xl': '10px'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-jetbrains-mono)',
  				'monospace'
  			]
  		},
  		boxShadow: {
  			card: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
  			'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
  			modal: '0 20px 60px rgba(0, 0, 0, 0.18)',
  			dropdown: '0 4px 16px rgba(0, 0, 0, 0.12)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

