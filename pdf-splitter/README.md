# PDF too big

A simple, privacy-focused web app to split large PDF files into smaller chunks.

## Features

- 📄 **Split by Pages**: Split every N pages into a separate file
- ✂️ **Split by Chunks**: Divide PDF into N equal parts
- 📏 **Max Size Limit**: Optional max MB per split part
- 🔒 **100% Private**: All processing happens in your browser - files never leave your device
- 💨 **Fast**: Client-side processing with pdf-lib
- 📱 **Responsive**: Works on desktop and mobile

## How to Use

1. Upload your PDF file (drag & drop or browse)
2. Choose split mode:
   - **By Pages**: Specify how many pages per file
   - **By Chunks**: Specify how many files to create
3. (Optional) Enable **Max file size per part** and set a size in MB
4. Click "Split PDF"
5. Download your split files

If an individual page is larger than your configured size limit, that single-page part is still generated and marked as above limit.

## Tech Stack

- Vanilla JavaScript
- [pdf-lib](https://pdf-lib.js.org/) for PDF manipulation
- Pure CSS (no frameworks)
- Client-side only (no server required)

## Deploy

Can be deployed to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- Or just open `index.html` locally

## Privacy

All PDF processing happens entirely in your browser using JavaScript. Your files:
- ✅ Never uploaded to any server
- ✅ Never leave your device
- ✅ Are processed completely offline

Perfect for sensitive documents!

## License

MIT
