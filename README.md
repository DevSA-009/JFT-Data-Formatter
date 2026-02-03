# JFT Data Formatter - Vite + TypeScript

## 🚀 Features

- ✅ Full TypeScript implementation
- ✅ Vite for fast development and building
- ✅ PANT values: LONG, SHORT, NO
- ✅ Smart column detection (only shows if data exists and not all "NO")
- ✅ Validation for SLEEVE, RIB, PANT
- ✅ Invalid row highlighting with reasons
- ✅ Placeholder image support
- ✅ Plain text copy functionality
- ✅ JSON export
- ✅ Column resizing
- ✅ 3 print formats
- ✅ Keyboard shortcuts

## 📁 Project Structure

```
order-formatter/
├── src/
│   ├── main.ts              # Entry point
│   ├── app.ts               # Main application
│   ├── types.ts             # Type definitions
│   ├── utils.ts             # Utility functions
│   ├── dataProcessor.ts     # Data processing
│   ├── imageHandler.ts      # Image handling
│   ├── htmlGenerator.ts     # HTML generation
│   ├── columnResizer.ts     # Column resizing
│   └── style.css            # Styles
├── public/
│   └── placeholder.svg      # Placeholder image
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── vite.config.ts           # Vite config
```

## 🛠️ Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Usage

1. Enter order data in format: `SIZE --- NAME --- NUMBER --- SLEEVE --- RIB --- PANT`
2. Fill party details
3. Upload image (optional, uses placeholder if not provided)
4. Click "Format Orders"
5. Use buttons to copy or print

## ⌨️ Keyboard Shortcuts

- `Ctrl+I`: Open image selector
- `Ctrl+F`: Format orders
- `Ctrl+C`: Copy JSON
- `Ctrl+P`: Print/PDF

## ✔️ Valid Values

- **SIZE**: XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL, 2-16 (even kids)
- **SLEEVE**: LONG, SHORT, or empty
- **RIB**: LONG, SHORT, NO, or empty
- **PANT**: LONG, SHORT, NO, or empty

## 🏗️ Build

```bash
npm run build
```

Output will be in `dist/` folder.

---

**By DevSA-009**
