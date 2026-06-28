test("parseMoneyInput interpreta formato brasileiro com milhares e decimais", () => {
  const { money } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(money.parseMoneyInput("1.234,56")).toBe(1234.56);
});

test("parseMoneyInput interpreta moeda brasileira com símbolo", () => {
  const { money } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(money.parseMoneyInput("R$ 10,50")).toBe(10.5);
});

test("parseMoneyInput retorna zero para vazio e texto inválido", () => {
  const { money } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(money.parseMoneyInput("")).toBe(0);
  expect(money.parseMoneyInput("abc")).toBe(0);
});

test("parseMoneyInput interpreta número com ponto decimal", () => {
  const { money } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(money.parseMoneyInput("1234.56")).toBe(1234.56);
});

test("formatNumberInput formata número para edição com vírgula decimal", () => {
  const { money } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(money.formatNumberInput(1234.56)).toBe("1234,56");
  expect(money.formatNumberInput(0)).toBe("");
  expect(money.formatNumberInput(Number.NaN)).toBe("");
});
