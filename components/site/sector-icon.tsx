import {
  Calculator,
  Factory,
  HardHat,
  Laptop,
  Stethoscope,
  Storefront,
  Student,
  Tractor,
  Truck,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon, IconWeight } from "@phosphor-icons/react";
import type { Sector } from "@/types";

const icons: Record<Sector["icon"], Icon> = {
  Tractor,
  Student,
  Stethoscope,
  HardHat,
  Factory,
  Truck,
  Storefront,
  Wrench,
  Calculator,
  Laptop,
};

/**
 * Sector icons. Regular weight for UI; duotone only on the large tiles and
 * empty states, where the secondary layer is primary red at 20% alpha.
 */
export function SectorIcon({
  icon,
  size = 24,
  weight = "regular",
  className,
}: {
  icon: Sector["icon"];
  size?: 16 | 20 | 24 | 32 | 40;
  weight?: Extract<IconWeight, "regular" | "duotone">;
  className?: string;
}) {
  const Component = icons[icon];
  return <Component size={size} weight={weight} className={className} aria-hidden="true" />;
}
