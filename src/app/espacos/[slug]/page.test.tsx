import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import SpaceDetailPage from "./page";

const renderDetail = async (slug: string, query: Record<string, string> = {}) =>
  render(await SpaceDetailPage({ params: Promise.resolve({ slug }), searchParams: Promise.resolve(query) }));

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(null, { status: 204 })));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("na intenção de hospedagem o detalhe pede uma estadia", async () => {
  await renderDetail("casa-do-tremembe", { uso: "hospedagem" });

  const cta = screen.getByRole("link", { name: /solicitar estadia/i });

  expect(cta).toHaveAttribute("href", expect.stringContaining("kind=reservation_request"));
  expect(cta).toHaveAttribute("href", expect.stringContaining("uso=hospedagem"));
  expect(screen.getByText(/confirma seu e-mail/i)).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /quero ser avisado/i })).not.toBeInTheDocument();
});

test("na intenção de lazer o detalhe pede o uso do espaço", async () => {
  await renderDetail("campo-do-sol", { intencao: "lazer" });

  const cta = screen.getByRole("link", { name: /solicitar uso do espaço/i });

  expect(cta).toHaveAttribute("href", expect.stringContaining("kind=reservation_request"));
  expect(screen.getByText(/escolha a data e o período/i)).toBeInTheDocument();
});

test("o espaço que recebe estadia mostra como acolhe", async () => {
  await renderDetail("casa-do-tremembe", { uso: "hospedagem" });

  expect(screen.getByText("Como acolhe")).toBeInTheDocument();
  expect(screen.getByText("Canto de descanso")).toBeInTheDocument();
});

test("espaço sem metadado de estadia não mostra a seção de acolhimento", async () => {
  await renderDetail("campo-do-sol");

  expect(screen.queryByText("Como acolhe")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /solicitar uso do espaço/i })).toBeInTheDocument();
});

test("mostra o tipo de espaço e os períodos que ele recebe", async () => {
  render(await SpaceDetailPage({ params: Promise.resolve({ slug: "quintal-da-praca" }) }));

  expect(screen.getByText("Quintal")).toBeInTheDocument();
  expect(screen.getByText("Períodos que recebe")).toBeInTheDocument();
  expect(screen.getByText("Manhã")).toBeInTheDocument();
});

test("abertura do detalhe registra a visualização do espaço", async () => {
  const fetchSpy = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchSpy);

  await renderDetail("quintal-da-praca");

  await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
  const body = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
  expect(body).toMatchObject({
    eventName: "space_viewed",
    context: { spaceSlug: "quintal-da-praca", zone: "Oeste" },
  });
});
