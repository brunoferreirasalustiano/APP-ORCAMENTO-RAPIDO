import type { Company, Quote } from "../types/domain";

const company: Company = {
  businessName: "Oficina & Filhos",
  ownerName: "Bruno",
  whatsapp: "5511999999999",
  email: "CONTATO@EXEMPLO.COM",
  address: "Rua <Central>",
  document: "00.000.000/0001-00",
  logoUri: ""
};

const quote: Quote = {
  id: "ORC-0007",
  createdAt: "2026-06-28T12:00:00.000Z",
  clientName: "Cliente <script>",
  clientWhatsapp: "11988887777",
  vehicle: "Troca de óleo",
  plate: "ABC-1234",
  validUntil: "29/06/2026",
  warranty: "90 dias",
  paymentMethod: "Pix",
  notes: "Sem <b>HTML</b>",
  discount: 50,
  items: [
    { id: "1", description: "Peça & serviço", quantity: 2, unitPrice: 100, type: "Servico" },
    { id: "2", description: "Diagnóstico", quantity: 1, unitPrice: 80, type: "Servico" }
  ]
};

test("HTML do PDF inclui totais, desconto, pagamento e escapa dados do usuário", async () => {
  const { pdf } = __TEST_RUNTIME__.loadModules({ dev: false });

  const html = await pdf.quoteHtml(company, quote);

  expect(html).toContain("ORC-0007");
  expect(html).toContain("Subtotal");
  expect(html).toContain("Desconto");
  expect(html).toContain("Pagamento");
  expect(html).toContain("Total:");
  expect(html).toContain("R$");
  expect(html).toContain("Cliente &lt;script&gt;");
  expect(html).toContain("Peça &amp; serviço");
  expect(html).toContain("Sem &lt;b&gt;HTML&lt;/b&gt;");
});

test("HTML do PDF rejeita validade anterior à emissão", async () => {
  const { pdf } = __TEST_RUNTIME__.loadModules({ dev: false });

  try {
    await pdf.quoteHtml(company, { ...quote, validUntil: "27/06/2026" });
    throw new Error("Expected quoteHtml to reject invalid validity date");
  } catch (error) {
    expect(error instanceof Error).toBe(true);
    expect((error as Error).message).toMatch(/validade/i);
  }
});

test("createQuotePdf gera arquivo em pasta dedicada e substitui PDF existente", async () => {
  __TEST_EXPO__.reset();
  const { pdf } = __TEST_RUNTIME__.loadModules({ dev: false });
  __TEST_EXPO__.fileSystem.existingUris.add("file:///documents/Orçamentos Rápidos/");
  __TEST_EXPO__.fileSystem.existingUris.add("file:///documents/Orçamentos Rápidos/ORC-0007.pdf");

  const result = await pdf.createQuotePdf(company, quote);

  expect(result.uri).toBe("file:///documents/Orçamentos Rápidos/ORC-0007.pdf");
  expect(__TEST_EXPO__.print.jobs.length).toBe(1);
  expect(__TEST_EXPO__.fileSystem.deletedUris[0]).toBe("file:///documents/Orçamentos Rápidos/ORC-0007.pdf");
  expect(__TEST_EXPO__.fileSystem.copiedFiles[0]!.to).toBe("file:///documents/Orçamentos Rápidos/ORC-0007.pdf");
});

test("shareQuotePdf retorna shared false quando compartilhamento não está disponível", async () => {
  __TEST_EXPO__.reset();
  __TEST_EXPO__.sharing.available = false;
  const { pdf } = __TEST_RUNTIME__.loadModules({ dev: false });

  const result = await pdf.shareQuotePdf(company, quote);

  expect(result.shared).toBe(false);
  expect(__TEST_EXPO__.sharing.shared.length).toBe(0);
});
