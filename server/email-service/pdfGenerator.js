const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const qrCode = require('qrcode');
const fs = require('fs');
const path = require('path');

Handlebars.registerHelper('eq', (a, b) => a === b);

async function generatePdf(data) {
  try {
    const plainData = JSON.parse(JSON.stringify(data));

    const qr = await qrCode.toDataURL(`${process.env.SERVER_URL}/ticket/track?id=${plainData._id}`);
    plainData.qrcode = qr;

    const templatePath = path.join(__dirname, 'templates', 'invoice.hbs');

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found at path: ${templatePath}`);
    }

    const templateStr = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(templateStr);
    const html = compiledTemplate(plainData);

    const launchOptions = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    const browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

module.exports = generatePdf;
