import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApproximateMap } from "@/components/approximate-map";
import { BrandLogo } from "@/components/brand-logo";
import { SpaceViewTracker } from "@/components/space-view-tracker";
import {
  AMENITY_LABELS,
  DOG_SIZE_LABELS,
  SPACE_TYPE_LABELS,
  STAY_FEATURE_LABELS,
  TIME_SLOT_LABELS,
  USE_TYPES,
  USE_TYPE_LABELS,
  getSpaceBySlug,
  type UseType,
} from "@/lib/domain/catalog";
import { intentForUseType, isOvernightIntent, isStayIntent, type StayIntent } from "@/lib/domain/stay";

type SpaceDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SpaceDetailPage({ params, searchParams }: SpaceDetailPageProps) {
  const space = getSpaceBySlug((await params).slug);
  if (!space) notFound();

  const query = (await searchParams) ?? {};
  const rawUse = typeof query.uso === "string" ? query.uso : undefined;
  const rawIntent = typeof query.intencao === "string" ? query.intencao : undefined;
  const urlUse = (USE_TYPES as readonly string[]).includes(rawUse ?? "") ? (rawUse as UseType) : undefined;

  /**
   * A intenção vem da URL; sem ela, estadia é o padrão de quem recebe estadia.
   * É o cerne do produto — lazer só assume quando o espaço não acolhe à noite.
   */
  const intent: StayIntent =
    intentForUseType(urlUse) ??
    (isStayIntent(rawIntent) ? rawIntent : undefined) ??
    (space.allowedUses.includes("hospedagem")
      ? "hospedagem"
      : space.allowedUses.includes("pernoite")
        ? "pernoite"
        : "lazer");

  const stayFocus = isOvernightIntent(intent) && space.allowedUses.includes(intent);
  const requestedUse = stayFocus ? intent : space.allowedUses[0];

  // O formulário só aceita bairros da lista, então mandamos o nome sem o prefixo.
  const requestParams = new URLSearchParams({
    space: space.slug,
    zona: space.zone,
    bairro: space.neighborhood,
    uso: requestedUse,
    periodo: space.availableSlots[0],
  });
  const reserveHref = `/reservar?kind=reservation_request&${requestParams.toString()}`;

  return (
    <main className="min-h-screen bg-[#f8f4eb] px-5 py-6 sm:px-8 lg:px-12">
      <SpaceViewTracker spaceSlug={space.slug} zone={space.zone} />
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <BrandLogo />
        <Link className="text-sm font-bold text-emerald-900 underline underline-offset-4" href="/espacos">
          ← Todos os espaços
        </Link>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 py-8 sm:py-10 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-emerald-100 sm:rounded-[2rem]">
            <Image alt={space.imageAlt} className="object-cover" fill priority sizes="(min-width: 1024px) 55vw, 100vw" src={space.imageUrl} />
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-950">
              {SPACE_TYPE_LABELS[space.spaceType]}
            </span>
          </div>

          <div className="mt-7">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">{space.neighborhoodLabel} · {space.zone}</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">{space.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">{space.description}</p>
          </div>

          <div className="mt-7 grid gap-5 rounded-3xl bg-white p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Ideal para</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {space.allowedUses.map((useType) => (
                  <span className="rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-emerald-950" key={useType}>{USE_TYPE_LABELS[useType]}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Cães</p>
              <p className="mt-3 text-sm text-emerald-950">
                Até {space.maxDogs} {space.maxDogs === 1 ? "cão" : "cães"} · {space.dogSizes.map((size) => DOG_SIZE_LABELS[size]).join(", ")}
              </p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Períodos que recebe</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {space.availableSlots.map((slot) => (
                  <span className="rounded-full border border-emerald-950/15 px-3 py-1 text-sm text-emerald-950" key={slot}>{TIME_SLOT_LABELS[slot]}</span>
                ))}
              </div>
            </div>
            {space.stayFeatures?.length ? (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-stone-400">Como acolhe</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {space.stayFeatures.map((feature) => (
                    <span
                      className="rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-emerald-950"
                      key={feature}
                    >
                      {STAY_FEATURE_LABELS[feature]}
                    </span>
                  ))}
                </div>
                {space.stayNote ? <p className="mt-3 text-sm leading-6 text-stone-600">{space.stayNote}</p> : null}
              </div>
            ) : null}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-400">Recursos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {space.amenities.map((amenity) => (
                  <span className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-700" key={amenity}>{AMENITY_LABELS[amenity]}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="grid content-start gap-5 lg:pt-2">
          <ApproximateMap areaLabel={space.approximateMapArea} zone={space.zone} />

          {/* Ação principal: pedir uma data concreta. */}
          <section className="rounded-3xl bg-emerald-950 p-6 text-white sm:p-7">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-lime-300">
              {stayFocus ? "Quer deixar seu cão aqui?" : "Quer usar este espaço?"}
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight">
              {stayFocus
                ? "Conte as datas da estadia e o que seu cão precisa."
                : "Escolha a data e o período que combinam com vocês."}
            </h2>
            <p className="mt-3 text-sm leading-6 text-emerald-50/75">
              Você envia a solicitação e confirma seu e-mail. Nossa equipe responde confirmando a disponibilidade.
            </p>
            <Link
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-lime-300 px-5 py-4 text-base font-black text-emerald-950 transition hover:bg-lime-200"
              href={reserveHref}
            >
              {stayFocus ? "Solicitar estadia" : "Solicitar uso do espaço"}
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
