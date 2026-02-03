// src/htmlGenerator.ts
import {
  AnalysisResult,
  SummaryData,
  OrderRow,
  TableBaseHeads,
  OrderKeywords,
} from "./types";
import { formatSizeForDisplay, sortSizes } from "./utils";

export class HTMLGenerator {
  constructor(
    private validRows: OrderRow[],
    private summaryData: Record<string, SummaryData>,
    private missedCount: number,
    private showIndex: boolean,
  ) {}

  generateTopInfo(
    pName: string,
    jType: string,
    fType: string,
    analysis: AnalysisResult,
    imgSrc: string,
  ): string {
    const dName = pName.trim() || "________";
    return `<div class="top-info-grid">
      <div class="image-side"><img src="${imgSrc}" alt="Design" /></div>
      <div class="info-grid">
        <div class="info-item"><span class="info-label">Party Name</span><span class="info-value">${dName}</span></div>
        <div class="info-item"><span class="info-label">Jersey Type</span><span class="info-value">${jType}</span></div>
        <div class="info-item"><span class="info-label">Fabrics</span><span class="info-value">${fType}</span></div>
        <div class="info-item"><span class="info-label">Sleeve</span><span class="info-value">${analysis.sleeveInfo}</span></div>
        <div class="info-item"><span class="info-label">RIB</span><span class="info-value">${analysis.ribInfo}</span></div>
        <div class="info-item"><span class="info-label">PANT</span><span class="info-value">${analysis.pantInfo}</span></div>
      </div>
      <div class="summary-side">${this.generateSummaryTable(analysis)}</div>
    </div>`;
  }

  generateSummaryTable(analysis: AnalysisResult): string {
    let tb = 0,
      tl = 0,
      ts = 0,
      tp = 0;
    let html =
      '<table class="resizable-table"><thead><tr><th>SIZE</th><th>TOTAL</th>';
    if (analysis.hasLongInSummary) html += "<th>LONG</th>";
    if (analysis.hasShortInSummary) html += "<th>SHORT</th>";
    if (analysis.hasPantInSummary) html += "<th>PANT</th>";
    html += "</tr></thead><tbody>";

    sortSizes(Object.keys(this.summaryData)).forEach((size) => {
      const s = this.summaryData[size];
      tb += s.TOTAL;
      tl += s.LONG;
      ts += s.SHORT;
      tp += s.PANT;
      html += `<tr><td>${formatSizeForDisplay(size)}</td><td>${s.TOTAL}</td>`;
      if (analysis.hasLongInSummary) html += `<td>${s.LONG}</td>`;
      if (analysis.hasShortInSummary) html += `<td>${s.SHORT}</td>`;
      if (analysis.hasPantInSummary) html += `<td>${s.PANT}</td>`;
      html += "</tr>";
    });

    html += `<tr class="summary-footer"><td>TOTAL</td><td>${tb}</td>`;
    if (analysis.hasLongInSummary) html += `<td>${tl}</td>`;
    if (analysis.hasShortInSummary) html += `<td>${ts}</td>`;
    if (analysis.hasPantInSummary) html += `<td>${tp}</td>`;
    html += "</tr>";

    if (this.missedCount) {
      const cs =
        2 +
        (analysis.hasLongInSummary ? 1 : 0) +
        (analysis.hasShortInSummary ? 1 : 0) +
        (analysis.hasPantInSummary ? 1 : 0);
      html += `<tr class="warn-row"><td colspan="${cs}">Invalid Rows: ${this.missedCount}</td></tr>`;
    }

    return html + "</tbody></table>";
  }

  generateDetailTable(analysis: AnalysisResult): string {
    let serial = 1;

    const finalTableHeads = TableBaseHeads.filter(
      (head) => analysis.hasItems[head],
    );

    let html =
      '<div class="section-header"><h2>Detail List</h2></div><table class="resizable-table"><thead><tr>';

    if (this.showIndex) html += "<th>SN</th>";
    finalTableHeads.forEach((head) => (html += `<th>${head}</th>`));

    html += "</tr></thead><tbody>";

    sortSizes([
      ...new Set(this.validRows.filter((r) => r.VALID).map((r) => r.SIZE)),
    ]).forEach((size) => {
      this.validRows
        .filter((r) => r.SIZE === size && r.VALID)
        .forEach((r) => {
          const isLong = r.SLEEVE === "LONG";
          const rowClass = isLong ? "long-sleeve" : "";

          html += `<tr class="${rowClass}">`;

          if (this.showIndex) html += `<td>${serial++}</td>`;

          finalTableHeads.forEach((head) => {
            let mainValue = r[head];
            let fallbackValue = "-";

            if (head === "SIZE") {
              mainValue = formatSizeForDisplay(mainValue);
            }

            if (head === "SLEEVE") {
              fallbackValue = "SHORT";
            }

            if (
              head !== "NAME" &&
              head !== "NUMBER" &&
              head !== "SLEEVE" &&
              head !== "SIZE" &&
              mainValue === "NO"
            ) {
              mainValue = "";
            }

            html += `<td>${mainValue || fallbackValue}</td>`;
          });
          html += "</tr>";
        });
    });

    this.validRows
      .filter((r) => !r.VALID)
      .forEach((r) => {
        const reasonHead = r.REASON;

        if (
          (reasonHead as TableBaseHeads | `${OrderKeywords.STRUCTURE}`) ===
          "STRUCTURE"
        ) {
          html += `<tr class="error-row">Invalid Structure</tr>`;
          return;
        }

        html += `<tr class="warn-row">`;

        if (this.showIndex) html += `<td>${serial++}</td>`;
        finalTableHeads.forEach((head) => {
          let mainValue = r[head];
          let fallbackValue = "-";

          if (head === "SIZE" && reasonHead !== "SIZE") {
            mainValue = formatSizeForDisplay(mainValue);
          }

          if (head === "SLEEVE") {
            fallbackValue = "SHORT";
          }

          if (
            head !== "NAME" &&
            head !== "NUMBER" &&
            head !== "SLEEVE" &&
            head !== "SIZE" &&
            mainValue === "NO"
          ) {
            mainValue = "";
          }

          html += `<td class="${head === reasonHead ? "invalid-ceil" : ""}">${mainValue || fallbackValue}</td>`;
        });

        html += "</tr>";
      });

    return html + "</tbody></table>";
  }

  generateSplitLayout(
    pName: string,
    jType: string,
    fType: string,
    analysis: AnalysisResult,
    imgSrc: string,
  ): string {
    const dName = pName.trim() || "________";
    return `<div class="split-layout"><div class="left-column">
      <div class="image-container"><img src="${imgSrc}" alt="Design" /></div>
      <div class="info-block">
        <div class="info-item"><span class="info-label">Party Name:</span><span class="info-value">${dName}</span></div>
        <div class="info-item"><span class="info-label">Jersey Type:</span><span class="info-value">${jType}</span></div>
        <div class="info-item"><span class="info-label">Fabrics:</span><span class="info-value">${fType}</span></div>
        <div class="info-item"><span class="info-label">Sleeve:</span><span class="info-value">${analysis.sleeveInfo}</span></div>
        <div class="info-item"><span class="info-label">RIB:</span><span class="info-value">${analysis.ribInfo}</span></div>
        <div class="info-item"><span class="info-label">PANT:</span><span class="info-value">${analysis.pantInfo}</span></div>
      </div>
      ${this.generateSummaryTable(analysis)}
    </div><div class="right-column">
      ${this.generateDetailTable(analysis)}
    </div></div>`;
  }
}
