// src/dataProcessor.ts
import { OrderRow, SummaryData, AnalysisResult } from "./types";
import {
  parseLine,
  validateRow,
  sortSizes,
  formatSizeForDisplay,
} from "./utils";

export class DataProcessor {
  public validRows: OrderRow[] = [];
  public summaryData: Record<string, SummaryData> = {};
  public missedCount: number = 0;

  processText(text: string): void {
    this.validRows = [];
    this.summaryData = {};
    this.missedCount = 0;

    text.split("\n").forEach((line) => {
      if (!line.trim()) return;
      const row = parseLine(line);
      const validation = validateRow(row);

      if (!validation.valid) {
        this.validRows.push({
          ...row,
          MISSED: true,
          REASON: validation.reason,
        });
        this.missedCount++;
        return;
      }

      this.validRows.push({ ...row, MISSED: false });

      if (!this.summaryData[row.SIZE]) {
        this.summaryData[row.SIZE] = { TOTAL: 0, LONG: 0, SHORT: 0, PANT: 0 };
      }

      this.summaryData[row.SIZE].TOTAL++;
      if (row.SLEEVE === "LONG") this.summaryData[row.SIZE].LONG++;
      if (row.SLEEVE === "SHORT") this.summaryData[row.SIZE].SHORT++;
      if (row.PANT === "LONG" || row.PANT === "SHORT")
        this.summaryData[row.SIZE].PANT++;
    });
  }

  analyzeSummary(): AnalysisResult {
    const hasName = this.validRows.some(
      (r) => !r.MISSED && r.NAME && r.NAME !== "",
    );
    const hasNumber = this.validRows.some(
      (r) => !r.MISSED && r.NUMBER && r.NUMBER !== "",
    );
    const hasSleeve = this.validRows.some(
      (r) => !r.MISSED && r.SLEEVE && r.SLEEVE !== "",
    );
    const hasRib = this.validRows.some(
      (r) => !r.MISSED && r.RIB && r.RIB !== "" && r.RIB !== "NO",
    );
    const hasPant = this.validRows.some(
      (r) => !r.MISSED && r.PANT && r.PANT !== "" && r.PANT !== "NO",
    );

    const getInfo = (types: Set<string>) => {
      if (types.has("LONG") && types.has("SHORT")) return "Long & Short";
      if (types.has("LONG")) return "Long";
      if (types.has("SHORT")) return "Short";
      return "None";
    };

    const sleeveTypes = new Set(
      this.validRows
        .filter((r) => !r.MISSED && r.SLEEVE && r.SLEEVE !== "")
        .map((r) => r.SLEEVE),
    );
    const ribTypes = new Set(
      this.validRows
        .filter((r) => !r.MISSED && r.RIB && r.RIB !== "" && r.RIB !== "NO")
        .map((r) => r.RIB),
    );
    const pantTypes = new Set(
      this.validRows
        .filter((r) => !r.MISSED && r.PANT && r.PANT !== "" && r.PANT !== "NO")
        .map((r) => r.PANT),
    );

    return {
      hasName,
      hasNumber,
      hasSleeve,
      hasRib,
      hasPant,
      sleeveInfo: getInfo(sleeveTypes),
      ribInfo: getInfo(ribTypes),
      pantInfo: getInfo(pantTypes),
      hasLongInSummary: Object.values(this.summaryData).some((s) => s.LONG > 0),
      hasShortInSummary: Object.values(this.summaryData).some(
        (s) => s.SHORT > 0,
      ),
      hasPantInSummary: Object.values(this.summaryData).some((s) => s.PANT > 0),
    };
  }

  generatePlainText(
    partyName: string,
    jerseyType: string,
    fabricsType: string,
  ): string {
    const analysis = this.analyzeSummary();
    let text = `Party Name: ${partyName || "_______________"}\nJersey Type: ${jerseyType}\nFabrics: ${fabricsType}\n`;
    text += `Sleeve: ${analysis.sleeveInfo}\nRIB: ${analysis.ribInfo}\nPANT: ${analysis.pantInfo}\n\nSUMMARY:\n========\n`;

    let totalBody = 0,
      totalLong = 0,
      totalShort = 0,
      totalPant = 0;

    sortSizes(Object.keys(this.summaryData)).forEach((size) => {
      const s = this.summaryData[size];
      totalBody += s.TOTAL;
      totalLong += s.LONG;
      totalShort += s.SHORT;
      totalPant += s.PANT;
      text += `${formatSizeForDisplay(size)}: ${s.TOTAL} pcs`;
      if (analysis.hasLongInSummary && analysis.hasShortInSummary)
        text += ` (LONG = ${s.LONG}, SHORT = ${s.SHORT})`;
      else if (analysis.hasLongInSummary) text += ` (LONG = ${s.LONG})`;
      else if (analysis.hasShortInSummary) text += ` (SHORT = ${s.SHORT})`;
      if (analysis.hasPantInSummary) text += ` | PANT = ${s.PANT}`;
      text += "\n";
    });

    text += `\nTOTAL: ${totalBody} pcs`;
    if (analysis.hasLongInSummary && analysis.hasShortInSummary)
      text += ` (LONG = ${totalLong}, SHORT = ${totalShort})`;
    else if (analysis.hasLongInSummary) text += ` (LONG = ${totalLong})`;
    else if (analysis.hasShortInSummary) text += ` (SHORT = ${totalShort})`;
    if (analysis.hasPantInSummary) text += ` | PANT = ${totalPant}`;
    text += "\n\nDETAILS:\n========\n\n";

    sortSizes([
      ...new Set(this.validRows.filter((r) => !r.MISSED).map((r) => r.SIZE)),
    ]).forEach((size) => {
      text += `${formatSizeForDisplay(size)}:\n`;
      this.validRows
        .filter((r) => r.SIZE === size && !r.MISSED)
        .forEach((r, idx) => {
          text += `  ${idx + 1}. `;
          if (analysis.hasName && r.NAME) text += `${r.NAME} `;
          if (analysis.hasNumber && r.NUMBER) text += `[${r.NUMBER}]`;
          text += "\n";
        });
      text += "\n";
    });

    if (this.missedCount > 0) text += `\nINVALID ROWS: ${this.missedCount}\n`;
    return text;
  }

  exportToJSON(): string {
    const filtered = this.validRows.filter((r) => !r.MISSED);
    const grouped: Record<string, any[]> = {};
    sortSizes([...new Set(filtered.map((r) => r.SIZE))]).forEach((size) => {
      grouped[size] = filtered
        .filter((r) => r.SIZE === size)
        .map((r) => ({
          NAME: r.NAME,
          NO: r.NUMBER,
          SLEEVE: r.SLEEVE,
          RIB: r.RIB,
          PANT: r.PANT,
        }));
    });
    return JSON.stringify(grouped);
  }
}
