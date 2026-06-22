import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { formatDate } from "./dates";
import { formatMoney } from "./money";
import { quoteSubtotal, quoteTotal } from "./quote";
import type { Company, Quote } from "../types/domain";

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatQuoteDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const brDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (brDate) return trimmed;

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoDate) return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;

  const formatted = formatDate(trimmed);
  return formatted || trimmed;
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
          <td>${formatMoney(item.unitPrice)}</td>
          <td>${formatMoney(itemTotal)}</td>
        </tr>`;
    })
    .join("");
}

export function quoteHtml(company: Company, quote: Quote): string {
  const rows = quoteRows(quote);

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <style>
          body { color: #111827; font-family: Arial, sans-serif; margin: 32px; }
          .header { border-bottom: 4px solid #0B3D91; display: flex; justify-content: space-between; padding-bottom: 18px; }
          .title { color: #0B3D91; font-size: 30px; font-weight: 800; }
          .muted { color: #6B7280; }
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
          <div>
            <div class="title">Orcamento</div>
            <strong>${escapeHtml(company.businessName || "Sua empresa")}</strong>
            <p class="muted">${escapeHtml(company.whatsapp || "")} ${company.email ? `- ${escapeHtml(company.email)}` : ""}</p>
          </div>
          <div>
            <strong>${escapeHtml(quote.id)}</strong>
            <p class="muted">${formatDate(quote.createdAt)}</p>
          </div>
        </div>
        <p><strong>Cliente:</strong> ${escapeHtml(quote.clientName || "Nao informado")}</p>
        <p><strong>Servico:</strong> ${escapeHtml(quote.vehicle || "Nao informado")}</p>
        <p><strong>Informacoes:</strong> ${escapeHtml(quote.plate || "Nao informado")}</p>
        <table>
          <thead>
            <tr><th>Descricao</th><th>Qtd.</th><th>Unitario</th><th>Total</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        ${quote.validUntil ? `<p><strong>Validade:</strong> ${escapeHtml(formatQuoteDate(quote.validUntil))}</p>` : ""}
        ${quote.warranty ? `<p><strong>Garantia:</strong> ${escapeHtml(quote.warranty)}</p>` : ""}
        ${quote.notes ? `<p><strong>Observacoes:</strong> ${escapeHtml(quote.notes)}</p>` : ""}
        <div class="summary">
          <div class="summary-row"><span>Subtotal</span><strong>${formatMoney(quoteSubtotal(quote))}</strong></div>
          <div class="summary-row"><span>Desconto</span><strong>${formatMoney(quote.discount)}</strong></div>
          <div class="total">Total: ${formatMoney(quoteTotal(quote))}</div>
        </div>
      </body>
    </html>`;
}

export async function createQuotePdf(company: Company, quote: Quote): Promise<{ uri: string }> {
  const { uri } = await Print.printToFileAsync({ html: quoteHtml(company, quote), base64: false });
  const safeName = quote.id.replace(/[^a-zA-Z0-9_-]/g, "-");
  const shareUri = FileSystem.cacheDirectory ? `${FileSystem.cacheDirectory}${safeName}.pdf` : uri;

  if (shareUri !== uri) {
    await FileSystem.copyAsync({ from: uri, to: shareUri });
  }

  return { uri: shareUri };
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
