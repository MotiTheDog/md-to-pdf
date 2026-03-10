const express = require('express');
const marked = require('marked');
const PDFDocument = require('pdfkit');
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

// Convert HTML-like content to PDF using PDFKit
async function convertToPDF(markdown, title = 'Document') {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        autoFirstPage: false
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add first page
      doc.addPage();

      // Parse markdown to HTML
      const html = markdown ? marked.parse(markdown) : '';
      
      // Simple HTML to PDFKit conversion
      let yPos = 50;
      const margin = 50;
      const pageWidth = 595.28; // A4 width
      const pageHeight = 841.89; // A4 height
      const maxWidth = pageWidth - (margin * 2);

      // Add title
      doc.fontSize(24).fillColor('#2c3e50');
      const titleWidth = doc.widthOfString(title);
      doc.text(title, margin, yPos, { width: maxWidth, align: 'center' });
      yPos += 40;

      // Draw line under title
      doc.strokeColor('#ddd').lineWidth(1);
      doc.moveTo(margin, yPos).lineTo(pageWidth - margin, yPos).stroke();
      yPos += 20;

      // Reset for content
      doc.fontSize(11).fillColor('#333');

      // Simple parser for common markdown elements
      const lines = html.split('\n');
      let inList = false;
      let listLevel = 0;

      for (let line of lines) {
        // Check if we need a new page
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 50;
        }

        // Headers
        if (line.match(/<h1>/i)) {
          const text = line.replace(/<\/?h1>/gi, '').replace(/<[^>]*>/g, '');
          doc.fontSize(20).fillColor('#2c3e50');
          doc.text(text, margin, yPos, { width: maxWidth });
          yPos += 30;
          doc.strokeColor('#eee').lineWidth(2).moveTo(margin, yPos).lineTo(pageWidth - margin, yPos).stroke();
          yPos += 15;
          doc.fontSize(11).fillColor('#333');
        } else if (line.match(/<h2>/i)) {
          const text = line.replace(/<\/?h2>/gi, '').replace(/<[^>]*>/g, '');
          doc.fontSize(16).fillColor('#2c3e50');
          doc.text(text, margin, yPos, { width: maxWidth });
          yPos += 20;
          doc.strokeColor('#eee').lineWidth(1).moveTo(margin, yPos).lineTo(pageWidth - margin, yPos).stroke();
          yPos += 15;
          doc.fontSize(11).fillColor('#333');
        } else if (line.match(/<h3>/i)) {
          const text = line.replace(/<\/?h3>/gi, '').replace(/<[^>]*>/g, '');
          doc.fontSize(14).fillColor('#2c3e50');
          doc.text(text, margin, yPos, { width: maxWidth });
          yPos += 15;
          doc.fontSize(11).fillColor('#333');
        }
        // Code blocks
        else if (line.match(/<pre>/i) || line.match(/<code>/i)) {
          const text = line.replace(/<\/?(pre|code)>/gi, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
          doc.fillColor('#f4f4f4').rect(margin, yPos - 5, maxWidth, doc.heightOfString(text, { width: maxWidth }) + 15).fill();
          doc.fillColor('#333').text(text, margin + 5, yPos + 5, { width: maxWidth - 10 });
          yPos += doc.heightOfString(text, { width: maxWidth - 10 }) + 20;
        }
        // Lists
        else if (line.match(/<li>/i)) {
          const text = line.replace(/<\/?li>/gi, '').replace(/<[^>]*>/g, '').trim();
          if (text) {
            doc.text(`• ${text}`, margin + 10, yPos, { width: maxWidth - 10 });
            yPos += 18;
          }
        }
        // Blockquotes
        else if (line.match(/<blockquote>/i)) {
          const text = line.replace(/<\/?blockquote>/gi, '').replace(/<[^>]*>/g, '');
          doc.fillColor('#666').text(`"${text}"`, margin + 10, yPos, { width: maxWidth - 10 });
          yPos += 20;
          doc.fillColor('#333');
        }
        // Paragraphs
        else if (line.match(/<p>/i)) {
          const text = line.replace(/<\/?p>/gi, '').replace(/<[^>]*>/g, '').trim();
          if (text && !text.match(/^[<\s]*$/)) {
            const height = doc.heightOfString(text, { width: maxWidth });
            doc.text(text, margin, yPos, { width: maxWidth });
            yPos += height + 10;
          }
        }
        // Horizontal rule
        else if (line.match(/<hr>/i)) {
          doc.strokeColor('#eee').lineWidth(2).moveTo(margin, yPos).lineTo(pageWidth - margin, yPos).stroke();
          yPos += 30;
        }
        // Plain text
        else if (line.trim()) {
          const text = line.replace(/<[^>]*>/g, '').trim();
          if (text && !text.match(/^[<\s]*$/)) {
            const height = doc.heightOfString(text, { width: maxWidth });
            doc.text(text, margin, yPos, { width: maxWidth });
            yPos += height + 10;
          }
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Route: Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Markdown to PDF service is running (PDFKit version)' });
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
  console.log(`💚 Health check: GET /health`);
  console.log(`📦 Using: PDFKit (no browser required)\n`);
});
