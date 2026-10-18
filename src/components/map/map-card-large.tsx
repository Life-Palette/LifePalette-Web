import MapEmbed from "./map-embed";
export default function MapCardLarge({
  data = {},
  isDark = false,
  className = "h-64 w-full",
}: {
  data?: Record<string, unknown>;
  isDark?: boolean;
  className?: string;
}) {
  return (
    <div className={`${className} overflow-hidden rounded-xl`}>
      <MapEmbed isDark={isDark} mode="point" pointData={data} />
    </div>
  );
}
