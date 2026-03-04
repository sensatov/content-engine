import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParseResult = { text: string; error?: string };

/**
 * Parse a CSV file to plain text (table-like) for AI consumption.
 */
export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        resolve({ text: "", error: "Empty file" });
        return;
      }
      const parsed = Papa.parse<string[]>(content, { skipEmptyLines: true });
      if (parsed.errors.length) {
        resolve({
          text: "",
          error: parsed.errors.map((err) => err.message).join("; "),
        });
        return;
      }
      const rows = parsed.data as string[][];
      const text = rows.map((row) => row.join("\t")).join("\n");
      resolve({ text: text || "(no data)", error: undefined });
    };
    reader.onerror = () => resolve({ text: "", error: "Failed to read file" });
    reader.readAsText(file, "UTF-8");
  });
}

/**
 * Parse an Excel file (xlsx/xls) to plain text using SheetJS.
 */
export function parseExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data || !(data instanceof ArrayBuffer)) {
          resolve({ text: "", error: "Empty or invalid file" });
          return;
        }
        const workbook = XLSX.read(data, { type: "array" });
        const lines: string[] = [];
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
            header: 1,
            defval: "",
          });
          if (rows.length) {
            lines.push(`[Sheet: ${sheetName}]`);
            rows.forEach((row) => {
              const arr = Array.isArray(row) ? row : Object.values(row);
              lines.push(arr.join("\t"));
            });
            lines.push("");
          }
        }
        resolve({
          text: lines.length ? lines.join("\n").trim() : "(no data)",
          error: undefined,
        });
      } catch (err) {
        resolve({
          text: "",
          error: err instanceof Error ? err.message : "Parse error",
        });
      }
    };
    reader.onerror = () => resolve({ text: "", error: "Failed to read file" });
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse a file based on extension. PDF is not parsed (returns placeholder).
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) return parseCSV(file);
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) return parseExcel(file);
  if (name.endsWith(".pdf")) {
    return {
      text: `[PDF file: ${file.name} — content not extracted. Add key points in Additional Context if needed.]`,
      error: undefined,
    };
  }
  return { text: "", error: "Unsupported file type" };
}

/**
 * Parse multiple files and concatenate results.
 */
export async function parseFiles(files: File[]): Promise<{
  text: string;
  errors: { fileName: string; error: string }[];
}> {
  const errors: { fileName: string; error: string }[] = [];
  const parts: string[] = [];
  for (const file of files) {
    const result = await parseFile(file);
    if (result.error) {
      errors.push({ fileName: file.name, error: result.error });
    } else if (result.text) {
      parts.push(`--- ${file.name} ---\n${result.text}`);
    }
  }
  return {
    text: parts.join("\n\n"),
    errors,
  };
}
