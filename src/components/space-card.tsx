import Image from "next/image";
import {
  AMENITY_LABELS,
  DOG_SIZE_LABELS,
  SPACE_TYPE_LABELS,
  STAY_FEATURE_LABELS,
  TIME_SLOT_LABELS,
  USE_TYPE_LABELS,
  type Space,
} from "@/lib/domain/catalog";
import { isOvernightIntent, type StayIntent } from "@/lib/domain/stay";
import { TrackedSpaceLink } from "./tracked-space-link";

type SpaceCardProps = {
  space: Space;
  /** Intenção com que o tutor chegou, para o card falar a língua certa. */
  intent?: StayIntent;
};

export function SpaceCard({ space, intent }: SpaceCardProps) {
  const stayUse = isOvernightIntent(intent) ? intent : undefined;
  // Só os sinais que este espaço tem: o metadado de estadia é opcional.
  const highlights =
    stayUse && space.stayFeatures?.length
      ? space.stayFeatures.slice(0, 3).map((feature) => STAY_FEATURE_LABELS[feature])
      : space.amenities.slice(0, 2).map((amenity) => AMENITY_LABELS[amenity]);
  const uses = stayUse
    ? [stayUse, ...space.allowedUses.filter((use) => use !== stayUse)].slice(0, 2)
    : space.allowedUses.slice(0, 2);
  const href = stayUse ? `/espacos/${space.slug}?uso=${stayUse}` : `/espacos/${space.slug}`;

  return (
    <article className="group overflow-hidden rounded-3xl border border-emerald-950/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <TrackedSpaceLink ariaLabel={`Conhecer ${space.name}`} className="block" href={href} spaceSlug={space.slug} zone={space.zone}>
        <div className="relative aspect-[4/3] overflow-hidden bg-emerald-100">
          <Image
            alt={space.imageAlt}
            className="object-cover transition duration-500 group-hover:scale-105"
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            src={space.imageUrl}
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-950">
            {stayUse ? "Recebe para estadia" : SPACE_TYPE_LABELS[space.spaceType]}
          </span>
        </div>
        <div className="grid gap-3 p-4 sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              {space.neighborhoodLabel} · {space.zone}
            </p>
            <h2 className="mt-1 text-lg font-black leading-tight text-emerald-950 sm:text-xl">{space.name}</h2>
          </div>
          {stayUse && space.stayNote ? <p className="text-sm leading-6 text-stone-600">{space.stayNote}</p> : null}
          <div className="flex flex-wrap gap-2">
            {uses.map((useType) => (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700" key={useType}>
                {USE_TYPE_LABELS[useType]}
              </span>
            ))}
          </div>
          <p className="text-sm text-stone-600">
            Até {space.maxDogs} {space.maxDogs === 1 ? "cão" : "cães"} ·{" "}
            {space.dogSizes.map((size) => DOG_SIZE_LABELS[size].replace(" porte", "")).join(", ")}
          </p>
          <p className="text-xs font-medium text-emerald-800">
            {space.availableSlots.map((slot) => TIME_SLOT_LABELS[slot]).join(" · ")}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-stone-100 pt-3 text-xs font-medium text-stone-500">
            {highlights.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </TrackedSpaceLink>
    </article>
  );
}
