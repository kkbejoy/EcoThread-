async function generatePDF() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    // Go to the current page URL
    await page.goto(window.location.href, { waitUntil: 'networkidle2' });
  
    // Generate PDF with default options
    const pdf = await page.pdf();
  
    // Create a blob URL from the PDF data
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
  
    // Open the PDF in a new tab
    window.open(url, '_blank');
  
    await browser.close();
  }
  
  const generatePdfButton = document.getElementById('generate-pdf-button');
  generatePdfButton.addEventListener('click', generatePDF);
  