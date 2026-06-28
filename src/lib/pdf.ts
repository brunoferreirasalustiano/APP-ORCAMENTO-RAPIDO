import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { formatDate, isQuoteValidUntilBeforeIssueDate, parseQuoteDate } from "./dates";
import { formatMoney } from "./money";
import { quoteSubtotal, quoteTotal } from "./quote";
import type { Company, Quote } from "../types/domain";

const PDF_FOLDER_NAME = "Orçamentos Rápidos";

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safePdfName(value: string): string {
  const cleanName = value
    .trim()
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\.+$/g, "")
    .slice(0, 80);

  return cleanName || "orçamento";
}

function formatPdfMoney(value: number): string {
  return formatMoney(value).replace(/\u00a0/g, " ");
}

function formatWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "");
  const localDigits = digits.startsWith("55") ? digits.slice(2) : digits;

  if (localDigits.length === 11) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`;
  }

  if (localDigits.length === 10) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`;
  }

  return value.trim();
}

function companyContactLine(company: Company): string {
  const contacts = [
    company.whatsapp ? `WhatsApp: ${formatWhatsapp(company.whatsapp)}` : "",
    company.email ? `E-mail: ${company.email.trim().toLowerCase()}` : "",
    company.document ? `Documento: ${company.document.trim()}` : ""
  ].filter(Boolean);

  return contacts.join(" | ");
}

async function ensurePdfFolder(): Promise<string> {
  const baseDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!baseDirectory) throw new Error("Armazenamento indisponível neste aparelho.");

  const folderUri = `${baseDirectory}${PDF_FOLDER_NAME}/`;
  const folderInfo = await FileSystem.getInfoAsync(folderUri);

  if (!folderInfo.exists) {
    await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
  }

  return folderUri;
}

function formatQuoteDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const parsed = parseQuoteDate(trimmed);
  return parsed ? formatDate(parsed) : trimmed;
}

function quoteRows(quote: Quote): string {
  const billableItems = quote.items.filter((item) => item.description.trim() || Number(item.unitPrice || 0) > 0);
  const rows = billableItems.length ? billableItems : quote.items;

  return rows
    .map((item) => {
      const itemTotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
      return `
        <tr>
          <td>${escapeHtml(item.description || "Item")}</td>
          <td>${escapeHtml(item.quantity)}</td>
          <td>${formatPdfMoney(item.unitPrice)}</td>
          <td>${formatPdfMoney(itemTotal)}</td>
        </tr>`;
    })
    .join("");
}

function logoMimeType(uri: string): string {
  const lowerUri = uri.toLowerCase();
  if (lowerUri.endsWith(".png")) return "image/png";
  if (lowerUri.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function companyLogoDataUri(uri: string): Promise<string> {
  if (!uri) return "";
  if (uri.startsWith("data:image/")) return uri;

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    return `data:${logoMimeType(uri)};base64,${base64}`;
  } catch {
    return "";
  }
}

export async function quoteHtml(company: Company, quote: Quote): Promise<string> {
  if (quote.validUntil && isQuoteValidUntilBeforeIssueDate(quote.validUntil, quote.createdAt)) {
    throw new Error("A validade do orçamento não pode ser anterior à data de emissão.");
  }

  const rows = quoteRows(quote);
  const logoUri = await companyLogoDataUri(company.logoUri);
  const logoHtml = logoUri ? `<img class="logo" src="${logoUri}" />` : "";
  const contactLine = companyContactLine(company);

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style>
          body { color: #111827; font-family: "DejaVu Sans", Arial, Helvetica, sans-serif; margin: 32px; }
          .brand { display: flex; gap: 14px; align-items: center; }
          .header { border-bottom: 4px solid #0B3D91; display: flex; justify-content: space-between; padding-bottom: 18px; }
          .logo { border-radius: 8px; height: 72px; object-fit: contain; width: 72px; }
          .title { color: #0B3D91; font-size: 30px; font-weight: 800; }
          .quote-meta { text-align: right; }
          .muted { color: #6B7280; }
          .section { margin-top: 20px; }
          .section-title { color: #0B3D91; font-size: 14px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
          .info-item { margin: 0; }
          table { border-collapse: collapse; margin-top: 24px; width: 100%; }
          th, td { border-bottom: 1px solid #E5E7EB; padding: 10px; text-align: left; }
          th { color: #6B7280; font-size: 11px; text-transform: uppercase; }
          .summary { margin-top: 20px; margin-left: auto; width: 280px; }
          .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .total { background: #0B3D91; border-radius: 8px; color: white; font-size: 26px; font-weight: 800; margin-top: 12px; padding: 18px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            ${logoHtml}
            <div>
              <div class="title">Proposta comercial</div>
              <strong>${escapeHtml(company.businessName || "Sua empresa")}</strong>
              ${contactLine ? `<p class="muted">${escapeHtml(contactLine)}</p>` : ""}
              ${company.address ? `<p class="muted">${escapeHtml(company.address)}</p>` : ""}
            </div>
          </div>
          <div class="quote-meta">
            <strong>${escapeHtml(quote.id)}</strong>
            <p class="muted">Emissão: ${formatDate(quote.createdAt)}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Dados do atendimento</div>
          <div class="info-grid">
            <p class="info-item"><strong>Cliente:</strong> ${escapeHtml(quote.clientName || "Não informado")}</p>
            <p class="info-item"><strong>WhatsApp:</strong> ${escapeHtml(formatWhatsapp(quote.clientWhatsapp) || "Não informado")}</p>
            <p class="info-item"><strong>Serviço solicitado:</strong> ${escapeHtml(quote.vehicle || "Não informado")}</p>
            <p class="info-item"><strong>Referência/detalhes:</strong> ${escapeHtml(quote.plate || "Não informado")}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr><th>Descrição do item</th><th>Qtd.</th><th>Valor unit.</th><th>Valor total</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="section">
          <div class="section-title">Condições comerciais</div>
          ${quote.validUntil ? `<p><strong>Proposta válida até:</strong> ${escapeHtml(formatQuoteDate(quote.validUntil))}</p>` : ""}
          ${quote.warranty ? `<p><strong>Garantia:</strong> ${escapeHtml(quote.warranty)}</p>` : ""}
          ${quote.paymentMethod ? `<p><strong>Forma de pagamento:</strong> ${escapeHtml(quote.paymentMethod)}</p>` : ""}
          ${quote.notes ? `<p><strong>Observações:</strong> ${escapeHtml(quote.notes)}</p>` : ""}
        </div>

        <div class="summary">
          <div class="summary-row"><span>Subtotal</span><strong>${formatPdfMoney(quoteSubtotal(quote))}</strong></div>
          <div class="summary-row"><span>Desconto</span><strong>${formatPdfMoney(quote.discount)}</strong></div>
          ${quote.paymentMethod ? `<div class="summary-row"><span>Pagamento</span><strong>${escapeHtml(quote.paymentMethod)}</strong></div>` : ""}
          <div class="total">Total: ${formatPdfMoney(quoteTotal(quote))}</div>
        </div>
      </body>
    </html>`;
}

export async function createQuotePdf(company: Company, quote: Quote): Promise<{ uri: string }> {
  const { uri } = await Print.printToFileAsync({ html: await quoteHtml(company, quote), base64: false });
  const folderUri = await ensurePdfFolder();
  const pdfUri = `${folderUri}${safePdfName(quote.id)}.pdf`;
  const existingPdf = await FileSystem.getInfoAsync(pdfUri);

  if (existingPdf.exists) {
    await FileSystem.deleteAsync(pdfUri, { idempotent: true });
  }

  await FileSystem.copyAsync({ from: uri, to: pdfUri });

  return { uri: pdfUri };
}

export async function shareQuotePdf(company: Company, quote: Quote): Promise<{ uri: string; shared: boolean }> {
  const { uri } = await createQuotePdf(company, quote);

  if (!(await Sharing.isAvailableAsync())) {
    return { uri, shared: false };
  }

  await Sharing.shareAsync(uri, {
    dialogTitle: `Compartilhar ${quote.id}`,
    mimeType: "application/pdf",
    UTI: "com.adobe.pdf"
  });

  return { uri, shared: true };
}
