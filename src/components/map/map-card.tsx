import type { ComponentProps } from "react";
import MapCardLarge from "./map-card-large";
export default function MapCard(props: ComponentProps<typeof MapCardLarge>) {
  return <MapCardLarge {...props} className="h-40 w-40" />;
}
