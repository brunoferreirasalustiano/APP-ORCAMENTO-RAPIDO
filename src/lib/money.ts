export function formatMoney(value: number): string {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function parseMoneyInput(value: string): number {
  const input = value.trim();
  if (input === "") return 0;

  const lastComma = input.lastIndexOf(",");
  const lastDot = input.lastIndexOf(".");
  const decimalSeparator = lastComma > lastDot ? "," : lastDot > -1 ? "." : null;
  const digitsOnly = input.replace(/[^\d,.]/g, "");
  const normalized =
    decimalSeparator === null
      ? digitsOnly.replace(/[^\d]/g, "")
      : `${digitsOnly.slice(0, digitsOnly.lastIndexOf(decimalSeparator)).replace(/[^\d]/g, "")}.${digitsOnly
          .slice(digitsOnly.lastIndexOf(decimalSeparator) + 1)
          .replace(/[^\d]/g, "")}`;

  if (normalized === "") return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumberInput(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "";
  return String(value).replace(".", ",");
}
