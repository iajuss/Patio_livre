import { buildFunnelEvent } from "./analytics";

test("evento não contém e-mail nem bairro livre", () => {
  const event = buildFunnelEvent("interest_submitted", { email: "teste@example.com", homeNeighborhood: "Moema", zone: "Sul" });
  expect(JSON.stringify(event.payload)).not.toMatch(/teste@example.com|Moema/);
  expect(event.payload).toMatchObject({ zone: "Sul" });
});

test("evento não aceita bairro ou intenção fora do catálogo", () => {
  const event = buildFunnelEvent("filters_changed", {
    neighborhood: "email@exemplo.com",
    stayIntent: "qualquer coisa",
    zone: "Sul",
  });

  expect(event.payload).toEqual({ zone: "Sul" });
});

test("evento de espaço não aceita um identificador fora do catálogo", () => {
  const event = buildFunnelEvent("space_viewed", { spaceSlug: "email@exemplo.com" });

  expect(event.payload).toEqual({});
});

test("evento de espaço exige a zona correspondente ao espaço", () => {
  const event = buildFunnelEvent("space_clicked", { spaceSlug: "campo-do-sol", zone: "Sul" });

  expect(event.payload).toEqual({});
});
