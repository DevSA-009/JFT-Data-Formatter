/* ================= CONSTANTS ================= */

const SIZE_ORDER = [
  "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL",
  "2", "4", "6", "8", "10", "12", "14", "16"
];

const STORAGE_KEYS = {
  FORMAT: 'order_formatter_last_format',
  ORDER_DATA: 'order_formatter_last_data'
};

const baseTableHeads = ["NAME", "NUMBER", "SIZE", "SLEEVE", "RIB", "PANT"];

/* ================= STATE ================= */

let uploadedImage = null;
let validRows = [];
let summaryData = {};
let missedCount = 0;
let showIndex = false;
let currentFormat = 'format2';

/* ================= UTILITY FUNCTIONS ================= */

const normalizeSizes = (size = "") => {
  size = size.toUpperCase().trim();
  const map = { XXL: "2XL", XXXL: "3XL", XXXXL: "4XL", XXXXXL: "5XL" };
  if (map[size]) return map[size];
  if (/^\d+$/.test(size)) {
    const num = parseInt(size);
    return String(num % 2 === 0 ? num : num + 1);
  }
  return size;
};

const formatSizeForDisplay = (size) => {
  return /^\d+$/.test(size) ? `${size} KIDS` : size;
};

const parseLine = (line) => {
  const p = line.split(/\s*---\s*/);
  const clean = (v = "") => /^\s*$/.test(v) ? "" : v.trim();

  return {
    SIZE: p[0] !== undefined ? normalizeSizes(p[0]) : undefined,
    NAME: p[1] !== undefined ? clean(p[1]).toUpperCase() : undefined,
    NUMBER: p[2] !== undefined ? clean(p[2]).toUpperCase() : undefined,
    SLEEVE: p[3] !== undefined ? (p[3] || "").toUpperCase() : undefined,
    RIB: p[4] !== undefined ? (p[4] || "").toUpperCase() : undefined,
    PANT: p[5] !== undefined ? (p[5] || "").toUpperCase() : undefined,
  };
};

const validateRow = (row) => {
  // Check if any required field is undefined
  if (row.SIZE === undefined || row.NAME === undefined || row.NUMBER === undefined ||
    row.SLEEVE === undefined || row.RIB === undefined || row.PANT === undefined) {
    return { valid: false, reason: 'STRUCTURE' };
  }

  // Check SIZE
  if (!SIZE_ORDER.includes(row.SIZE)) {
    return { valid: false, reason: 'SIZE' };
  }

  // Validate SLEEVE (must be LONG or SHORT or empty)
  if (row.SLEEVE && row.SLEEVE !== "LONG" && row.SLEEVE !== "SHORT") {
    return { valid: false, reason: 'SLEEVE' };
  }

  // Validate RIB (must be LONG, SHORT, NO, or empty)
  if (row.RIB && row.RIB !== "CUFF" && row.RIB !== "YES" && row.RIB !== "NO") {
    return { valid: false, reason: 'RIB' };
  }

  // Validate PANT (must be YES, NO, or empty)
  if (row.PANT && row.PANT !== "YES" && row.PANT !== "NO") {
    return { valid: false, reason: 'PANT' };
  }

  return { valid: true };
};

const sortSizes = (sizes) => {
  return sizes.sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
};

const showToast = (message, type = 'info') => {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
};

/* ================= IMAGE HANDLING ================= */

const displayImage = (src) => {
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = `<img src="${src}" alt="Uploaded Image" />`;
  document.getElementById('imagePreviewSection').style.display = 'block';
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImage = e.target.result;
      displayImage(uploadedImage);
      showToast('Image uploaded', 'success');
    };
    reader.readAsDataURL(file);
  }
};

const handlePaste = (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith('image/')) {
      const blob = items[i].getAsFile();
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImage = e.target.result;
        displayImage(uploadedImage);
        showToast('Image pasted', 'success');
      };
      reader.readAsDataURL(blob);
      event.preventDefault();
      break;
    }
  }
};

const removeImage = () => {
  uploadedImage = null;
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('imageInput').value = '';
  document.getElementById('imagePreviewSection').style.display = 'none';
  showToast('Image removed', 'info');
};

/* ================= DATA PROCESSING ================= */

const processText = (text) => {
  validRows = [];
  summaryData = {};
  missedCount = 0;

  text.split("\n").forEach(line => {
    if (!line.trim()) return;

    const row = parseLine(line);
    const validation = validateRow(row);

    if (!validation.valid) {
      validRows.push({ ...row, MISSED: true, REASON: validation.reason });
      missedCount++;
      return;
    }

    validRows.push({ ...row, MISSED: false });

    if (!summaryData[row.SIZE]) {
      summaryData[row.SIZE] = { TOTAL: 0, LONG: 0, SHORT: 0, RIB: 0, PANT: 0 };
    }

    summaryData[row.SIZE].TOTAL++;
    if (row.SLEEVE === "LONG") summaryData[row.SIZE].LONG++;
    if (row.SLEEVE === "SHORT") summaryData[row.SIZE].SHORT++;
    if (row.RIB === "CUFF" || row.RIB === "YES") summaryData[row.SIZE].RIB++;
    if (row.PANT === "YES") summaryData[row.SIZE].PANT++;
  });
};

const analyzeSummary = () => {

  const hasItems = {
    "NAME": validRows.some(r => !r.MISSED && r.NAME && r.NAME !== ""),
    "NUMBER": validRows.some(r => !r.MISSED && r.NUMBER && r.NUMBER !== ""),
    "SIZE": validRows.some(r => !r.MISSED && r.SIZE && r.SIZE !== ""),
    "SLEEVE": validRows.some(r => !r.MISSED && r.SLEEVE && r.SLEEVE !== ""),
    "RIB": validRows.some(r => !r.MISSED && r.RIB && r.RIB === "YES" || r.RIB === "CUFF"),
    "PANT": validRows.some(r => !r.MISSED && r.PANT === "YES")
  }

  const sleeveTypes = new Set(validRows.filter(r => !r.MISSED && r.SLEEVE && r.SLEEVE !== "").map(r => r.SLEEVE));
  let sleeveInfo = "None";
  if (sleeveTypes.has("LONG") && sleeveTypes.has("SHORT")) {
    sleeveInfo = "Long & Short";
  } else if (sleeveTypes.has("LONG")) {
    sleeveInfo = "Long";
  } else if (sleeveTypes.has("SHORT")) {
    sleeveInfo = "Short";
  }

  const ribTypes = new Set(validRows.filter(r => !r.MISSED && r.RIB && r.RIB !== "" && r.RIB !== "NO").map(r => r.RIB));
  let ribInfo = "None";
  if (ribTypes.has("LONG") && ribTypes.has("SHORT")) {
    ribInfo = "Long & Short";
  } else if (ribTypes.has("LONG")) {
    ribInfo = "Long";
  } else if (ribTypes.has("SHORT")) {
    ribInfo = "Short";
  }

  const pantTypes = new Set(validRows.filter(r => !r.MISSED && r.PANT && r.PANT !== "" && r.PANT !== "NO").map(r => r.PANT));
  let pantInfo = "None";
  if (pantTypes.has("LONG") && pantTypes.has("SHORT")) {
    pantInfo = "Long & Short";
  } else if (pantTypes.has("YES")) {
    pantInfo = "Yes";
  }
  else if (pantTypes.has("LONG")) {
    pantInfo = "Long";
  } else if (pantTypes.has("SHORT")) {
    pantInfo = "Short";
  }

  const hasLongInSummary = Object.values(summaryData).some(s => s.LONG > 0);
  const hasShortInSummary = Object.values(summaryData).some(s => s.SHORT > 0);
  const hasRibInSummary = Object.values(summaryData).some(s => s.RIB > 0);
  const hasPantInSummary = Object.values(summaryData).some(s => s.PANT > 0);

  return { hasItems, sleeveInfo, ribInfo, hasLongInSummary, hasShortInSummary, hasPantInSummary, pantInfo, hasRibInSummary };
};

/* ================= HTML GENERATORS ================= */

const generateTopInfo = (partyName, jerseyType, fabricsType, analysis) => {
  const displayPartyName = partyName.trim() === "" ? "_______________" : partyName;

  let html = '<div class="top-info-grid">';

  if (uploadedImage) {
    html += `<div class="image-side"><img src="${uploadedImage}" alt="Design" /></div>`;
  }

  html += '<div class="info-grid">';
  html += `
    <div class="info-item">
      <span class="info-label">Party Name</span>
      <span class="info-value">${displayPartyName}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Jersey Type</span>
      <span class="info-value">${jerseyType}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Fabrics</span>
      <span class="info-value">${fabricsType}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Sleeve</span>
      <span class="info-value">${analysis.sleeveInfo}</span>
    </div>
    <div class="info-item">
      <span class="info-label">RIB</span>
      <span class="info-value">${analysis.ribInfo}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Pant</span>
      <span class="info-value">${analysis.pantInfo}</span>
    </div>
  `;
  html += '</div>';

  html += '<div class="summary-side">';
  html += generateSummaryTable(analysis);
  html += '</div>';

  html += '</div>';
  return html;
};

const generateSummaryTable = (analysis) => {
  let totalBody = 0, totalLong = 0, totalRib = 0, totalShort = 0, totalPant = 0;

  let html = '<table class="resizable-table"><thead><tr><th>SIZE</th><th>TOTAL</th>';

  if (analysis.hasLongInSummary) html += '<th>LONG</th>';
  if (analysis.hasShortInSummary) html += '<th>SHORT</th>';
  if (analysis.hasRibInSummary) html += '<th>RIB</th>';
  if (analysis.hasPantInSummary) html += '<th>PANT</th>';

  html += '</tr></thead><tbody>';

  sortSizes(Object.keys(summaryData)).forEach(size => {
    const s = summaryData[size];
    totalBody += s.TOTAL;
    totalLong += s.LONG;
    totalShort += s.SHORT;
    totalRib += s.RIB;
    totalPant += s.PANT;

    html += `<tr><td>${formatSizeForDisplay(size)}</td><td>${s.TOTAL}</td>`;
    if (analysis.hasLongInSummary) html += `<td>${s.LONG}</td>`;
    if (analysis.hasShortInSummary) html += `<td>${s.SHORT}</td>`;
    if (analysis.hasRibInSummary) html += `<td>${s.RIB}</td>`;
    if (analysis.hasPantInSummary) html += `<td>${s.PANT}</td>`;
    html += '</tr>';
  });

  html += `<tr class="summary-footer"><td>TOTAL</td><td>${totalBody}</td>`;
  if (analysis.hasLongInSummary) html += `<td>${totalLong}</td>`;
  if (analysis.hasShortInSummary) html += `<td>${totalShort}</td>`;
  if (analysis.hasRibInSummary) html += `<td>${totalRib}</td>`;
  if (analysis.hasPantInSummary) html += `<td>${totalPant}</td>`;
  html += '</tr>';

  if (missedCount) {
    const colspan = 2 + (analysis.hasLongInSummary ? 1 : 0) + (analysis.hasShortInSummary ? 1 : 0) + (analysis.hasRibInSummary ? 1 : 0) + (analysis.hasPantInSummary ? 1 : 0);
    html += `<tr class="warn-row"><td colspan="${colspan}">Invalid Rows: ${missedCount}</td></tr>`;
  }

  html += '</tbody></table>';
  return html;
};

const generateDetailTable = (analysis) => {
  let serial = 1;

  const finalTableHeads = baseTableHeads.filter(head => analysis.hasItems[head]);

  let html = '<div class="section-header"><h2>Detail List</h2></div>';
  html += '<table class="resizable-table"><thead><tr>';

  if (showIndex) html += '<th>SN</th>';
  finalTableHeads.forEach(head => html += `<th>${head}</th>`);

  html += '</tr></thead><tbody>';

  const sizesInData = [...new Set(validRows.filter(r => !r.MISSED).map(r => r.SIZE))];

  sortSizes(sizesInData).forEach(size => {
    validRows
      .filter(r => r.SIZE === size && !r.MISSED)
      .forEach(r => {
        const isLong = r.SLEEVE === "LONG";
        const rowClass = isLong ? 'long-sleeve' : '';

        html += `<tr class="${rowClass}">`;

        if (showIndex) html += `<td>${serial++}</td>`;

        finalTableHeads.forEach(head => {
          let mainValue = r[head];
          let fallbackValue = "-";

          if (head === "SIZE") {
            mainValue = formatSizeForDisplay(mainValue);
          }

          if (head === "SLEEVE") {
            fallbackValue = "SHORT"
          };

          if (head !== "NAME" && head !== "NUMBER" && head !== "SLEEVE" && head !== "SIZE" && mainValue === "NO") {
            mainValue = '';
          }

          html += `<td>${mainValue || fallbackValue}</td>`;
        })
        html += '</tr>';
      });
  });

  validRows.filter(r => r.MISSED).forEach(r => {

    const reasonHead = r.REASON;

    if (reasonHead === "STRUCTURE") {
      html += `<tr class="error-row">Invalid Structure</tr>`;
      return;
    }

    html += `<tr class="warn-row">`;

    if (showIndex) html += `<td>${serial++}</td>`;
    finalTableHeads.forEach(head => {
      let mainValue = r[head];
      let fallbackValue = "-";

      if (head === "SIZE" && reasonHead !== "SIZE") {
        mainValue = formatSizeForDisplay(mainValue);
      }

      if (head === "SLEEVE") {
        fallbackValue = "SHORT"
      };

      if (head !== "NAME" && head !== "NUMBER" && head !== "SLEEVE" && head !== "SIZE" && mainValue === "NO") {
        mainValue = '';
      }

      html += `<td class="${head === reasonHead ? "invalid-ceil" : ""}">${mainValue || fallbackValue}</td>`;
    })

    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
};

/* ================= SPLIT VIEW LAYOUT ================= */

const generateSplitLayout = (partyName, jerseyType, fabricsType, analysis) => {
  const displayPartyName = partyName.trim() === "" ? "_______________" : partyName;

  let html = '<div class="split-layout"><div class="left-column">';

  if (uploadedImage) {
    html += `<div class="image-container"><img src="${uploadedImage}" alt="Design" /></div>`;
  }

  html += `
    <div class="info-block">
      <div class="info-item">
        <span class="info-label">Party Name:</span>
        <span class="info-value">${displayPartyName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Jersey Type:</span>
        <span class="info-value">${jerseyType}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Fabrics:</span>
        <span class="info-value">${fabricsType}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Sleeve:</span>
        <span class="info-value">${analysis.sleeveInfo}</span>
      </div>
      <div class="info-item">
        <span class="info-label">RIB:</span>
        <span class="info-value">${analysis.ribInfo}</span>
      </div>
    </div>
  `;

  html += generateSummaryTable(analysis);
  html += '</div><div class="right-column">';
  html += generateDetailTable(analysis);
  html += '</div></div>';

  return html;
};

/* ================= MAIN FUNCTIONS ================= */

const formatOrders = () => {
  const text = document.getElementById("inputText").value;
  const partyName = document.getElementById("partyName").value || "";
  const jerseyType = document.getElementById("jerseyType").value || "POLO";
  const fabricsType = document.getElementById("fabricsType").value || "PP";
  currentFormat = document.querySelector('input[name="format"]:checked').value;

  processText(text);

  if (!validRows.length) {
    showToast('No data to format', 'error');
    return;
  }

  localStorage.setItem(STORAGE_KEYS.ORDER_DATA, text);

  const analysis = analyzeSummary();
  const output = document.getElementById("output");

  if (currentFormat === 'format5') {
    output.innerHTML = generateSplitLayout(partyName, jerseyType, fabricsType, analysis);
  } else {
    output.innerHTML = generateTopInfo(partyName, jerseyType, fabricsType, analysis) + generateDetailTable(analysis);
  }

  document.getElementById('inputPage').style.display = 'none';
  document.getElementById('outputPage').style.display = 'block';

  showToast('Formatted successfully', 'success');

  initColumnResize();
};

const goBackToInput = () => {
  document.getElementById('inputPage').style.display = 'block';
  document.getElementById('outputPage').style.display = 'none';
};

const regenerateOutput = () => {
  const partyName = document.getElementById("partyName").value || "";
  const jerseyType = document.getElementById("jerseyType").value || "POLO";
  const fabricsType = document.getElementById("fabricsType").value || "PP";

  const analysis = analyzeSummary();
  const output = document.getElementById("output");

  if (currentFormat === 'format5') {
    output.innerHTML = generateSplitLayout(partyName, jerseyType, fabricsType, analysis);
  } else {
    output.innerHTML = generateTopInfo(partyName, jerseyType, fabricsType, analysis) + generateDetailTable(analysis);
  }

  initColumnResize();
};

const copyAsJSON = () => {
  const filteredRows = validRows.filter(r => !r.MISSED);
  if (!filteredRows.length) {
    showToast('No valid data', 'error');
    return;
  }

  const grouped = {};
  sortSizes([...new Set(filteredRows.map(r => r.SIZE))]).forEach(size => {
    grouped[size] = filteredRows
      .filter(r => r.SIZE === size)
      .map(r => ({
        NAME: r.NAME,
        NO: r.NUMBER,
        SLEEVE: r.SLEEVE,
        RIB: r.RIB,
        PANT: r.PANT === "YES"
      }));
  });

  navigator.clipboard.writeText(JSON.stringify(grouped)).then(() => {
    showToast('JSON copied', 'success');
  }).catch(() => {
    showToast('Failed to copy', 'error');
  });
};

const printTables = () => {
  window.print();
};

const toggleShowIndex = (checked) => {
  showIndex = checked;
  regenerateOutput();
};

/* ================= COLUMN RESIZING ================= */

const initColumnResize = () => {
  const tables = document.querySelectorAll('.resizable-table');

  tables.forEach(table => {
    const ths = table.querySelectorAll('th');

    ths.forEach((th) => {
      const resizer = document.createElement('div');
      resizer.style.position = 'absolute';
      resizer.style.top = '0';
      resizer.style.right = '0';
      resizer.style.width = '5px';
      resizer.style.height = '100%';
      resizer.style.cursor = 'col-resize';
      resizer.style.userSelect = 'none';
      resizer.style.zIndex = '1';

      let startX, startWidth, nextStartWidth;

      resizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.pageX;
        startWidth = th.offsetWidth;

        const mouseMoveHandler = (e) => {
          const diff = e.pageX - startX;
          th.style.width = (startWidth + diff) + 'px';
        };

        const mouseUpHandler = () => {
          document.removeEventListener('mousemove', mouseMoveHandler);
          document.removeEventListener('mouseup', mouseUpHandler);
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
      });

      th.appendChild(resizer);
    });
  });
};

/* ================= KEYBOARD SHORTCUTS ================= */

const handleKeyboardShortcuts = (event) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'i':
        event.preventDefault();
        document.getElementById('imageInput').click();
        break;
      case 'f':
        event.preventDefault();
        if (document.getElementById('inputPage').style.display !== 'none') {
          formatOrders();
        }
        break;
      case 'c':
        event.preventDefault();
        if (document.getElementById('outputPage').style.display !== 'none') {
          copyAsJSON();
        }
        break;
      case 'p':
        event.preventDefault();
        if (document.getElementById('outputPage').style.display !== 'none') {
          printTables();
        }
        break;
    }
  }
};

/* ================= INITIALIZATION ================= */

const init = () => {
  const lastData = localStorage.getItem(STORAGE_KEYS.ORDER_DATA);
  if (lastData) {
    document.getElementById('inputText').value = lastData;
  }

  document.getElementById('imageInput').addEventListener('change', handleImageUpload);
  document.getElementById('imageSelectBtn').addEventListener('click', () => document.getElementById('imageInput').click());
  document.getElementById('removeImageBtn').addEventListener('click', removeImage);
  document.getElementById('formatBtn').addEventListener('click', formatOrders);
  document.getElementById('backBtn').addEventListener('click', goBackToInput);
  document.getElementById('copyBtnOutput').addEventListener('click', copyAsJSON);
  document.getElementById('printBtnOutput').addEventListener('click', printTables);
  document.getElementById('showIndexCheckbox').addEventListener('change', (e) => toggleShowIndex(e.target.checked));
  document.addEventListener('paste', handlePaste);
  document.addEventListener('keydown', handleKeyboardShortcuts);

  showToast('Ready', 'info');
};


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


// const text = `
// M---Himel---47---SHORT---NO---NO
// XXL---Fuad---14---SHORT---NO---NO
// L---Sanjid---02---SHORT---NO---NO
// XL---Rahat---77---SHORT---NO---NO
// L---Shahadat---08---SHORT---NO---NO
// XL---Rasel---70---SHORT---NO---NO
// S---Nihal---99---SHORT---NO---NO
// L---Al-Farabi---75---SHORT---NO---NO
// XL---Sumon---16---SHORT---NO---NO
// M---Siam---28---SHORT---NO---NO
// XL---Jahid---22---SHORT---NO---NO
// XL---Rayhan---33---SHORT---NO---NO
// XL---Sany---69---SHORT---NO---NO
// M---A. Ahad---17---SHORT---NO---NO
// L---Mehedi---45---SHORT---NO---NO
// L---Mridul---13---SHORT---NO---NO
// XL---Shamim---75---SHORT---NO---NO
// XL---Asif---31---SHORT---NO---NO
// L---Parvej---25---SHORT---NO---NO
// M---Maruf---18---SHORT---NO---NO
// XL---Rifu---23---SHORT---NO---NO
// XL---EP Adnan---74---SHORT---NO---NO
// M---Siam---01---SHORT---NO---NO
// XL---Nahidul---15---SHORT---NO---NO
// M---Siyam---90---SHORT---NO---NO
// XL---Rohoman---70---SHORT---NO---NO
// XL---Ashik---21---SHORT---NO---NO
// XL---Janu---444---SHORT---NO---NO
// Z---Sumon---90---SHORT---NO---NO
// L---Rony---29---SHORT---NO---NO
// XL---NH Shawon---30---SHORT---NO---NO
// L------17---SHORT---NO---NO
// `

// const z = processText(text);

// analyzeSummary();

// const er = ""