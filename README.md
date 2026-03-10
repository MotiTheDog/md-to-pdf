# Markdown to PDF Converter

A simple web application that converts Markdown files or text to beautifully formatted PDFs.

## Features

- **File Upload**: Upload `.md` files directly
- **Text Paste**: Paste Markdown text directly into the browser
- **Clean PDF Output**: Professional formatting with CSS styling
- **Drag & Drop**: Drag and drop support for file uploads
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Backend**: Node.js + Express
- **PDF Generation**: Puppeteer (Chrome rendering)
- **Markdown Parsing**: marked
- **File Upload**: multer
- **Frontend**: Vanilla HTML/CSS/JS (no dependencies)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MotiTheDog/md-to-pdf.git
   cd md-to-pdf
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Upload Method

1. Click "Upload File" tab
2. Select a `.md` file or drag & drop it
3. Click "Convert to PDF"
4. Download your PDF

### Paste Method

1. Click "Paste Text" tab
2. Optionally enter a document title
3. Paste your Markdown content
4. Click "Convert to PDF"
5. Download your PDF

## API Endpoints

### Health Check
```
GET /health
```

### Convert File Upload
```
POST /convert/file
Content-Type: multipart/form-data

Body:
- file: .md file (max 10MB)
```

### Convert Text
```
POST /convert/text
Content-Type: application/json

Body:
{
  "markdown": "# Hello World",
  "title": "My Document" (optional)
}
```

## PDF Styling

The PDF output includes:

- Clean typography with system fonts
- Styled headings (H1-H6)
- Code blocks with syntax highlighting background
- Tables with borders
- Blockquotes
- Links and images
- Lists (ordered and unordered)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
node server.js

# Or use npm start
npm start
```

The server runs on port 3000 by default (configurable via `PORT` environment variable).

## License

MIT

## Author

Built with ❤️ by Dev Agent
