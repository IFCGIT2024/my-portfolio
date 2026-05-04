// PDF Splitter App
const { PDFDocument } = PDFLib;

// State
let currentPDF = null;
let pdfDoc = null;
let fileName = '';

// Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileNameEl = document.getElementById('fileName');
const fileStatsEl = document.getElementById('fileStats');
const clearBtn = document.getElementById('clearBtn');
const optionsSection = document.getElementById('optionsSection');
const resultsSection = document.getElementById('resultsSection');
const splitBtn = document.getElementById('splitBtn');
const resetBtn = document.getElementById('resetBtn');
const splitValue = document.getElementById('splitValue');
const splitLabel = document.getElementById('splitLabel');
const resultsGrid = document.getElementById('resultsGrid');
const enableSizeLimit = document.getElementById('enableSizeLimit');
const sizeLimitInputs = document.getElementById('sizeLimitInputs');
const maxSizeMB = document.getElementById('maxSizeMB');
const sizePresetMB = document.getElementById('sizePresetMB');

enableSizeLimit.addEventListener('change', () => {
    sizeLimitInputs.style.display = enableSizeLimit.checked ? 'block' : 'none';
});

sizePresetMB.addEventListener('change', () => {
    if (sizePresetMB.value) {
        maxSizeMB.value = sizePresetMB.value;
    }
});

maxSizeMB.addEventListener('input', () => {
    if (sizePresetMB.value && parseFloat(sizePresetMB.value) !== parseFloat(maxSizeMB.value)) {
        sizePresetMB.value = '';
    }
});

// Mode change
document.querySelectorAll('input[name="splitMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'pages') {
            splitLabel.textContent = 'Pages per file:';
            splitValue.value = 10;
            splitValue.min = 1;
        } else {
            splitLabel.textContent = 'Number of chunks:';
            splitValue.value = 2;
            splitValue.min = 2;
        }
    });
});

// Upload handlers
uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});
uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});
uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        handleFileUpload(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

clearBtn.addEventListener('click', () => {
    resetApp();
});

resetBtn.addEventListener('click', () => {
    resetApp();
});

// Handle file upload
async function handleFileUpload(file) {
    try {
        fileName = file.name.replace('.pdf', '');
        const arrayBuffer = await file.arrayBuffer();
        pdfDoc = await PDFDocument.load(arrayBuffer);
        currentPDF = arrayBuffer;
        
        const pageCount = pdfDoc.getPageCount();
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        // Show file info
        fileNameEl.textContent = file.name;
        fileStatsEl.textContent = `${pageCount} pages • ${fileSize} MB`;
        fileInfo.style.display = 'flex';
        uploadZone.style.display = 'none';
        optionsSection.style.display = 'block';
        
    } catch (error) {
        alert('Error loading PDF: ' + error.message);
    }
}

// Split PDF
splitBtn.addEventListener('click', async () => {
    if (!pdfDoc) return;
    
    const mode = document.querySelector('input[name="splitMode"]:checked').value;
    const value = parseInt(splitValue.value);
    const sizeLimitEnabled = enableSizeLimit.checked;
    const maxSizeValue = parseFloat(maxSizeMB.value);
    const maxPartBytes = sizeLimitEnabled ? Math.floor(maxSizeValue * 1024 * 1024) : null;
    
    if (!value || value < 1) {
        alert('Please enter a valid number');
        return;
    }

    if (sizeLimitEnabled && (!maxSizeValue || maxSizeValue <= 0)) {
        alert('Please enter a valid max size in MB');
        return;
    }
    
    // Disable button
    splitBtn.disabled = true;
    splitBtn.querySelector('.btn-text').style.display = 'none';
    splitBtn.querySelector('.btn-loader').style.display = 'inline';
    
    try {
        let splitPDFs;
        
        if (mode === 'pages') {
            splitPDFs = await splitByPages(value, maxPartBytes);
        } else {
            splitPDFs = await splitIntoChunks(value, maxPartBytes);
        }
        
        displayResults(splitPDFs);
        
    } catch (error) {
        alert('Error splitting PDF: ' + error.message);
    } finally {
        splitBtn.disabled = false;
        splitBtn.querySelector('.btn-text').style.display = 'inline';
        splitBtn.querySelector('.btn-loader').style.display = 'none';
    }
});

// Split by pages
async function splitByPages(pagesPerFile, maxPartBytes) {
    const totalPages = pdfDoc.getPageCount();
    const results = [];
    let partCounter = 1;
    
    for (let i = 0; i < totalPages; i += pagesPerFile) {
        const startPage = i;
        const endPage = Math.min(i + pagesPerFile, totalPages);

        const rangeParts = await createPartsForRange(startPage, endPage, partCounter, maxPartBytes);
        rangeParts.forEach(p => results.push(p));
        partCounter += rangeParts.length;
    }
    
    return results;
}

// Split into chunks
async function splitIntoChunks(numChunks, maxPartBytes) {
    const totalPages = pdfDoc.getPageCount();
    const pagesPerChunk = Math.ceil(totalPages / numChunks);
    const results = [];
    let partCounter = 1;
    
    for (let i = 0; i < numChunks; i++) {
        const startPage = i * pagesPerChunk;
        const endPage = Math.min((i + 1) * pagesPerChunk, totalPages);

        if (startPage >= totalPages) break;

        const rangeParts = await createPartsForRange(startPage, endPage, partCounter, maxPartBytes);
        rangeParts.forEach(p => results.push(p));
        partCounter += rangeParts.length;
    }
    
    return results;
}

// Build one or more parts for a page range, optionally enforcing max bytes per part
async function createPartsForRange(startPage, endPage, partCounterStart, maxPartBytes) {
    if (!maxPartBytes) {
        const fullPdf = await PDFDocument.create();
        for (let p = startPage; p < endPage; p++) {
            const [page] = await fullPdf.copyPages(pdfDoc, [p]);
            fullPdf.addPage(page);
        }
        const fullBytes = await fullPdf.save();
        return [{
            name: `${fileName}_part${partCounterStart}.pdf`,
            pages: `${startPage + 1}-${endPage}`,
            size: (fullBytes.length / 1024).toFixed(2),
            data: fullBytes,
            exceededLimit: false
        }];
    }

    const parts = [];
    let currentStart = startPage;

    while (currentStart < endPage) {
        let currentEnd = currentStart;
        let bestBytes = null;

        while (currentEnd < endPage) {
            const testPdf = await PDFDocument.create();
            for (let p = currentStart; p <= currentEnd; p++) {
                const [page] = await testPdf.copyPages(pdfDoc, [p]);
                testPdf.addPage(page);
            }
            const testBytes = await testPdf.save();

            if (testBytes.length <= maxPartBytes) {
                bestBytes = testBytes;
                currentEnd++;
                continue;
            }

            break;
        }

        if (bestBytes === null) {
            // Single page is larger than the configured limit; keep it as its own part.
            const singlePdf = await PDFDocument.create();
            const [page] = await singlePdf.copyPages(pdfDoc, [currentStart]);
            singlePdf.addPage(page);
            const singleBytes = await singlePdf.save();
            parts.push({
                name: `${fileName}_part${partCounterStart + parts.length}.pdf`,
                pages: `${currentStart + 1}-${currentStart + 1}`,
                size: (singleBytes.length / 1024).toFixed(2),
                data: singleBytes,
                exceededLimit: singleBytes.length > maxPartBytes
            });
            currentStart += 1;
            continue;
        }

        const finalEnd = currentEnd - 1;
        parts.push({
            name: `${fileName}_part${partCounterStart + parts.length}.pdf`,
            pages: `${currentStart + 1}-${finalEnd + 1}`,
            size: (bestBytes.length / 1024).toFixed(2),
            data: bestBytes,
            exceededLimit: false
        });
        currentStart = finalEnd + 1;
    }

    return parts;
}

// Display results
function displayResults(pdfs) {
    resultsGrid.innerHTML = '';
    
    pdfs.forEach((pdf, index) => {
        const item = document.createElement('div');
        item.className = 'result-item';
        
        item.innerHTML = `
            <div class="result-info">
                <div class="result-icon">📄</div>
                <div class="result-details">
                    <div class="result-name">${pdf.name}</div>
                    <div class="result-meta ${pdf.exceededLimit ? 'warning' : ''}">Pages ${pdf.pages} • ${pdf.size} KB${pdf.exceededLimit ? ' • Above size limit (single page too large)' : ''}</div>
                </div>
            </div>
            <button class="btn-download" data-index="${index}">Download</button>
        `;
        
        resultsGrid.appendChild(item);
    });
    
    // Add download handlers
    document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            downloadPDF(pdfs[index]);
        });
    });
    
    optionsSection.style.display = 'none';
    resultsSection.style.display = 'block';
}

// Download PDF
function downloadPDF(pdf) {
    const blob = new Blob([pdf.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdf.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Reset app
function resetApp() {
    currentPDF = null;
    pdfDoc = null;
    fileName = '';
    fileInput.value = '';
    fileInfo.style.display = 'none';
    uploadZone.style.display = 'block';
    optionsSection.style.display = 'none';
    resultsSection.style.display = 'none';
    resultsGrid.innerHTML = '';
    enableSizeLimit.checked = false;
    sizeLimitInputs.style.display = 'none';
    maxSizeMB.value = 5;
    sizePresetMB.value = '';
}
