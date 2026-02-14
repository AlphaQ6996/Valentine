# Valentine's Day Surprise - Project Setup Guide

## Project Structure

```
valentines-surprise/
├── public/
│   ├── celebration.gif      # Victory/celebration animation
│   └── bouquet.png          # Flower bouquet image
├── src/
│   ├── ValentinesSurprise.jsx   # Main component (provided)
│   ├── App.jsx              # App wrapper (see below)
│   ├── main.jsx             # Entry point (see below)
│   └── index.css            # Tailwind imports (see below)
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Installation Steps

### 1. Create Vite React Project

```bash
npm create vite@latest valentines-surprise -- --template react
cd valentines-surprise
```

### 2. Install Dependencies

```bash
npm install framer-motion three @react-three/fiber
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configure Tailwind CSS

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Create App Files

**src/App.jsx:**
```jsx
import ValentinesSurprise from './ValentinesSurprise'

function App() {
  return <ValentinesSurprise />
}

export default App
```

**src/main.jsx:**
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 5. Add the Main Component

Copy the `ValentinesSurprise.jsx` file provided into `src/` directory.

### 6. Add Required Assets

Place the following files in the `public/` folder:

#### celebration.gif
- **Purpose:** Shows during the "Yes" button celebration stage
- **Recommended:** Animated confetti, fireworks, or happy celebration GIF
- **Dimensions:** 400x400px or larger (square format works best)
- **Where to find:**
  - Giphy: Search "celebration" or "confetti"
  - Tenor: Search "yay celebration"
  - Example keywords: "fireworks", "party popper", "confetti burst"

#### bouquet.png
- **Purpose:** Displays in the Bouquet gift envelope
- **Recommended:** Beautiful flower bouquet image (roses, tulips, mixed flowers)
- **Dimensions:** 512x512px or larger (transparent PNG works best)
- **Where to find:**
  - Unsplash: Search "flower bouquet transparent" or "roses bouquet"
  - Pexels: Search "valentine flowers"
  - Remove.bg: Upload any bouquet image to remove background
  - Example: Purple roses or mixed purple/pink flower arrangement

### 7. Run the Project

```bash
npm run dev
```

Visit `http://localhost:5173` to see your Valentine's surprise!

## Asset Naming Reference

| File Name | Location | Description |
|-----------|----------|-------------|
| `celebration.gif` | `/public/` | Animated GIF for "Yes" button celebration |
| `bouquet.png` | `/public/` | Flower bouquet image for Gift #1 |

## Customization Tips

### Change the Name
In `ChoiceStage` component, find this line:
```jsx
Pick your gift, Love! 💜
```
Replace "Love" with your Valentine's name!

### Adjust Colors
The theme color is `#6D28D9` (deep purple). To change:
- Find and replace `#6D28D9` with your color
- Update `#8B5CF6` (lighter purple) accordingly

### Modify Coupon Cards
In the `CouponsGift` component, edit the `cards` array:
```jsx
const [cards, setCards] = useState([
  { id: 1, title: "Your Custom Reward", emoji: "🎁" },
  // Add more cards here
]);
```

## Troubleshooting

### Three.js Performance Issues
If the heart animation is slow on mobile:
- Reduce `particleCount` from 4000 to 2000
- Adjust particle size in `pointsMaterial`

### Images Not Loading
- Ensure files are in `/public/` folder
- Use exact file names: `celebration.gif` and `bouquet.png`
- Check file extensions match (case-sensitive on some systems)

### Tailwind Not Working
- Run `npm run dev` again
- Check `tailwind.config.js` content paths
- Verify `index.css` has Tailwind directives

## Build for Production

```bash
npm run build
```

The optimized files will be in the `dist/` folder, ready for deployment!

## Deployment Options

- **Vercel:** `npm i -g vercel && vercel`
- **Netlify:** Drag and drop `dist/` folder
- **GitHub Pages:** Use `vite-plugin-pages`

Enjoy your Valentine's Day surprise! 💜
