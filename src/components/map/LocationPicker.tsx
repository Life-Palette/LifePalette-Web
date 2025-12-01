import MapboxLanguage from "@mapbox/mapbox-gl-language";
import mapboxgl from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DEFAULT_CENTER, MAPBOX_TOKEN } from "@/config/mapbox";
import "./MapCard.css";

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
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

  // 初始化地图
  useEffect(() => {
    if (!isOpen) return;

    // 延迟初始化，确保 Dialog 已完全渲染
    const timer = setTimeout(() => {
      if (!mapContainer.current || map.current) return;

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
          if (!marker.current) return;
          const lngLat = marker.current.getLngLat();
          setSelectedLocation({
            lat: lngLat.lat,
            lng: lngLat.lng,
          });
          reverseGeocode(lngLat.lng, lngLat.lat);
        });

        // 监听地图点击
        map.current.on("click", (e) => {
          if (!marker.current) return;
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
  }, [isOpen, initialLocation]);

  // 反向地理编码（获取地址）
  const reverseGeocode = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=zh-CN`,
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
  };

  // 搜索地点
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&language=zh-CN&limit=5`,
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error("搜索失败:", error);
      setSearchResults([]);
    }
  };

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
  }, [searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MapPin size={20} />
            选择地理位置
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 搜索栏 */}
          <div className="px-6 py-3 border-b">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="搜索地点..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* 搜索结果 */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-2 w-[calc(100%-3rem)] bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectSearchResult(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                    type="button"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                      <span className="text-sm">{result.place_name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 地图容器 */}
          <div className="flex-1 relative">
            <div ref={mapContainer} className="map-temp-box w-full h-full" />
          </div>

          {/* 选中的位置信息 */}
          {selectedLocation && (
            <div className="px-6 py-3 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} />
                  <span className="font-medium">选中位置</span>
                </div>
                {selectedLocation.address && (
                  <p className="text-gray-700 mb-1">{selectedLocation.address}</p>
                )}
                <p className="text-gray-500 text-xs">
                  经度: {selectedLocation.lng.toFixed(6)}, 纬度: {selectedLocation.lat.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedLocation}>
            确认选择
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
