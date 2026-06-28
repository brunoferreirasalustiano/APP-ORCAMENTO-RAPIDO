test("Validade anterior à emissão é inválida", () => {
  const { dates } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(dates.isQuoteValidUntilBeforeIssueDate("27/06/2026", "2026-06-28T12:00:00.000Z")).toBe(true);
});

test("Validade igual ou posterior à emissão é aceita", () => {
  const { dates } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(dates.isQuoteValidUntilBeforeIssueDate("28/06/2026", "2026-06-28T12:00:00.000Z")).toBe(false);
  expect(dates.isQuoteValidUntilBeforeIssueDate("2026-06-29", "2026-06-28T12:00:00.000Z")).toBe(false);
});

test("Datas inválidas de validade não bloqueiam por falso positivo", () => {
  const { dates } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(dates.isQuoteValidUntilBeforeIssueDate("31/02/2026", "2026-06-28T12:00:00.000Z")).toBe(false);
  expect(dates.isQuoteValidUntilBeforeIssueDate("", "2026-06-28T12:00:00.000Z")).toBe(false);
});
