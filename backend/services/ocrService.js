const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const { PDFParse } = require('pdf-parse');

class OCRService {
  /**
   * Automatically extracts text from an uploaded file based on its type.
   * Supports PDFs (both searchable and scanned) and common image formats.
   * 
   * @param {string} filePath - Absolute path to the saved file on disk
   * @param {string} fileType - The file extension (e.g. 'pdf', 'png', 'jpg')
   * @returns {Promise<string>} - Extracted text (cleaned and trimmed)
   */
  async extractText(filePath, fileType) {
    if (!fs.existsSync(filePath)) {
      console.warn(`File does not exist at path: ${filePath}`);
      return '';
    }

    const ext = String(fileType).toLowerCase().replace('.', '');

    try {
      let extractedText = '';

      if (ext === 'pdf') {
        console.log(`Starting PDF text extraction for: ${filePath}`);
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer, verbosity: 0 });
        await parser.load();
        
        const parseRes = await parser.getText();
        let text = parseRes.text || '';
        
        // Clean out standard page headers like "-- 1 of 5 --" to see if there is actual content
        const cleanCheck = text.replace(/-- \d+ of \d+ --/g, '').trim();
        
        if (cleanCheck) {
          extractedText = text;
        } else {
          // It's a scanned PDF! Try to extract embedded images and run OCR on them
          console.log(`PDF text index is empty. Attempting image extraction & OCR...`);
          try {
            const imgRes = await parser.getImage({ imageBuffer: true });
            
            // Collect images from the first few pages (to prevent huge processing times, e.g. max 3 pages)
            const pagesToScan = imgRes.pages.slice(0, 3);
            let ocrTexts = [];
            
            for (const page of pagesToScan) {
              if (page.images && page.images.length > 0) {
                // Scan the first image on the page
                const img = page.images[0];
                const ocrRes = await Tesseract.recognize(Buffer.from(img.data), 'eng');
                if (ocrRes.data.text) {
                  ocrTexts.push(ocrRes.data.text);
                }
              }
            }
            extractedText = ocrTexts.join(' ');
          } catch (ocrErr) {
            console.error('Failed to extract images or OCR scanned PDF:', ocrErr.message);
          }
        }
        await parser.destroy();
      } else if (['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'gif'].includes(ext)) {
        console.log(`Starting OCR text extraction for image: ${filePath}`);
        extractedText = await this.ocrImage(filePath);
      } else {
        console.log(`Skipping automated OCR: Unsupported file extension .${ext}`);
        return `Automated log for .${ext} file blueprint.`;
      }

      // Clean up whitespace and newlines
      const cleaned = extractedText
        .replace(/\r?\n|\r/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleaned) {
        return 'Automated OCR complete: Drawing sheet text index empty.';
      }

      // Limit description to a readable preview if it's too long, but keep the core tags
      const previewText = cleaned.length > 500 
        ? cleaned.substring(0, 500) + '... [OCR indexed]'
        : cleaned;

      return `Auto-extracted text index (${cleaned.length} chars) | ${previewText}`;

    } catch (error) {
      console.error('Error during automatic document parsing/OCR:', error.message);
      return `Automated log: File uploaded (${fileType.toUpperCase()})`;
    }
  }

  /**
   * Extracts text from an image using Tesseract OCR.
   */
  async ocrImage(filePath) {
    const result = await Tesseract.recognize(filePath, 'eng');
    return result.data.text || '';
  }
}

module.exports = new OCRService();
