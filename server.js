const express = require('express');
const marked = require('marked');
const puppeteer = require('puppeteer');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// CSS template for HTML
const htmlTemplate = (content, title = 'Document') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      color: #2c3e50;
    }
    h1 { font-size: 2em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    p { margin-bottom: 1em; }
    ul, ol { padding-left: 2em; margin-bottom: 1em; }
    li { margin-bottom: 0.25em; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background: #f4f4f4;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
      margin-bottom: 1em;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1em;
      margin: 1em 0;
      color: #666;
    }
    a { color: #3498db; text-decoration: none; }
    a:hover { text-decoration: underline; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1em;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    th { background: #f8f8f8; }
    img { max-width: 100%; height: auto; }
    hr { border: none; border-top: 2px solid #eee; margin: 2em 0; }
  </style>
</head>
<body>
  ${content}
</body>
</html>
`;

// Convert Markdown to PDF
async function convertToPDF(markdown, title = 'Document') {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const html = markdown ? marked.parse(markdown) : '';
  const fullHtml = htmlTemplate(html, title);

  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    }
  });

  await browser.close();
  return pdf;
}

// Route: Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Markdown to PDF service is running' });
});

// Route: Convert file upload
app.post('/convert/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fs = require('fs');
    const markdown = fs.readFileSync(req.file.path, 'utf8');
    const title = req.file.originalname.replace(/\.md$/, '').replace(/\.markdown$/, '');

    const pdf = await convertToPDF(markdown, title);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Error converting file:', error);
    res.status(500).json({ error: 'Failed to convert file', message: error.message });
  }
});

// Route: Convert text input
app.post('/convert/text', async (req, res) => {
  try {
    const { markdown, title } = req.body;

    if (!markdown) {
      return res.status(400).json({ error: 'No markdown content provided' });
    }

    const pdf = await convertToPDF(markdown, title || 'Document');

    const safeTitle = (title || 'document').replace(/[^a-zA-Z0-9]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
    res.send(pdf);
  } catch (error) {
    console.error('Error converting text:', error);
    res.status(500).json({ error: 'Failed to convert text', message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Markdown to PDF server running on http://localhost:${PORT}`);
  console.log(`📄 Upload file: POST /convert/file`);
  console.log(`✍️  Convert text: POST /convert/text`);
  console.log(`💚 Health check: GET /health\n`);
});
