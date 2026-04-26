import MapboxLanguage from "@mapbox/mapbox-gl-language";
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DEFAULT_CENTER, MAPBOX_TOKEN } from "@/config/mapbox";
import "./MapCard.css";

interface LocationPickerProps {
  initialLocation?: { lat: number; lng: number };
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
}

interface SearchResult {
  center: [number, number];
  id: string;
  place_name: string;
}

export function LocationPicker({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(initialLocation || null);

  // 反向地理编码（获取地址）
  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=zh-CN`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        setSelectedLocation({
          lat,
          lng,
          address: data.features[0].place_name,
        });
      }
    } catch (error) {
      console.error("反向地理编码失败:", error);
    }
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // 延迟初始化，确保 Dialog 已完全渲染
    const timer = setTimeout(() => {
      if (!mapContainer.current || map.current) {
        return;
      }

      mapboxgl.accessToken = MAPBOX_TOKEN;

      const initialLng = initialLocation?.lng || DEFAULT_CENTER[0];
      const initialLat = initialLocation?.lat || DEFAULT_CENTER[1];

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [initialLng, initialLat],
          zoom: 12,
        });

        // 添加中文语言支持
        map.current.addControl(new MapboxLanguage({ defaultLanguage: "zh-Hans" }));

        // 添加导航控件
        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        // 添加标记
        marker.current = new mapboxgl.Marker({
          draggable: true,
          color: "#000000",
        })
          .setLngLat([initialLng, initialLat])
          .addTo(map.current);

        // 监听标记拖拽
        marker.current.on("dragend", () => {
          if (!marker.current) {
            return;
          }
          const lngLat = marker.current.getLngLat();
          setSelectedLocation({
            lat: lngLat.lat,
            lng: lngLat.lng,
          });
          reverseGeocode(lngLat.lng, lngLat.lat);
        });

        // 监听地图点击
        map.current.on("click", (e) => {
          if (!marker.current) {
            return;
          }
          marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
          setSelectedLocation({
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
          });
          reverseGeocode(e.lngLat.lng, e.lngLat.lat);
        });
      } catch (error) {
        console.error("地图初始化失败:", error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      marker.current = null;
    };
  }, [isOpen, initialLocation, reverseGeocode]);

  // 搜索地点
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&language=zh-CN&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error("搜索失败:", error);
      setSearchResults([]);
    }
  }, []);

  // 选择搜索结果
  const handleSelectSearchResult = (result: SearchResult) => {
    const [lng, lat] = result.center;
    setSelectedLocation({
      lat,
      lng,
      address: result.place_name,
    });

    // 移动地图和标记
    if (map.current && marker.current) {
      map.current.flyTo({ center: [lng, lat], zoom: 14 });
      marker.current.setLngLat([lng, lat]);
    }

    setSearchResults([]);
    setSearchQuery("");
  };

  // 确认选择
  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="flex h-[600px] max-w-4xl flex-col p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <MapPin size={20} />
            选择地理位置
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 搜索栏 */}
          <div className="border-b px-6 py-3">
            <div className="relative">
              <Search
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                className="pr-10 pl-10"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索地点..."
                value={searchQuery}
              />
              {searchQuery && (
                <button
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  type="button"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* 搜索结果 */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-2 max-h-60 w-[calc(100%-3rem)] overflow-y-auto rounded-lg border bg-white shadow-lg">
                {searchResults.map((result) => (
                  <button
                    className="w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                    key={result.id}
                    onClick={() => handleSelectSearchResult(result)}
                    type="button"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-1 flex-shrink-0 text-gray-400" size={16} />
                      <span className="text-sm">{result.place_name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 地图容器 */}
          <div className="relative flex-1">
            <div className="map-temp-box h-full w-full" ref={mapContainer} />
          </div>

          {/* 选中的位置信息 */}
          {selectedLocation && (
            <div className="border-t bg-gray-50 px-6 py-3">
              <div className="text-gray-600 text-sm">
                <div className="mb-1 flex items-center gap-2">
                  <MapPin size={14} />
                  <span className="font-medium">选中位置</span>
                </div>
                {selectedLocation.address && (
                  <p className="mb-1 text-gray-700">{selectedLocation.address}</p>
                )}
                <p className="text-gray-500 text-xs">
                  经度: {selectedLocation.lng.toFixed(6)}, 纬度: {selectedLocation.lat.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <Button onClick={onClose} variant="outline">
            取消
          </Button>
          <Button disabled={!selectedLocation} onClick={handleConfirm}>
            确认选择
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
