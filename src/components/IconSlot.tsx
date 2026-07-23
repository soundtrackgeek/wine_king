import type { ComponentType } from "react";
import {
  ArrowRight,
  ArrowCircleDown,
  ArrowsClockwise,
  Basket,
  Bell,
  CalendarDots,
  Coins,
  CrownSimple,
  CurrencyEur,
  Factory,
  Farm,
  FloppyDisk,
  FolderOpen,
  GearSix,
  HouseLine,
  Leaf,
  Cylinder,
  Plant,
  ShieldChevron,
  Sparkle,
  Storefront,
  Sun,
  Sword,
  Tractor,
  UsersThree,
  Wine,
  X,
  type IconProps,
} from "@phosphor-icons/react";
import type { AssetPack } from "../lib/assetPack";
import { packFileUrl } from "../lib/assetPack";

const registry: Record<string, ComponentType<IconProps>> = {
  ArrowRight,
  ArrowCircleDown,
  ArrowsClockwise,
  Basket,
  Bell,
  CalendarDots,
  Coins,
  CrownSimple,
  CurrencyEur,
  Factory,
  Farm,
  FloppyDisk,
  FolderOpen,
  GearSix,
  HouseLine,
  Leaf,
  Cylinder,
  Plant,
  ShieldChevron,
  Sparkle,
  Storefront,
  Sun,
  Sword,
  Tractor,
  UsersThree,
  Wine,
  X,
};

interface IconSlotProps extends IconProps {
  pack: AssetPack;
  slot: string;
}

export function IconSlot({ pack, slot, ...props }: IconSlotProps) {
  const icon = pack.icons[slot];
  if (icon?.startsWith("asset:")) {
    const size = props.size ?? 20;
    return (
      <img
        aria-hidden="true"
        className={`pack-icon ${props.className ?? ""}`.trim()}
        src={packFileUrl(pack, icon.slice("asset:".length))}
        width={size}
        height={size}
        alt=""
      />
    );
  }
  const Component = registry[icon] ?? HouseLine;
  return <Component aria-hidden="true" weight="duotone" {...props} />;
}
