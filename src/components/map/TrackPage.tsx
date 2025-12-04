import { useQuery } from "@tanstack/react-query";
import { Camera, Clock, Download, Globe, Link2, Map, MapPin, Search, Star } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useTheme } from "@/components/common/theme-provider";
import ExportMapDialog from "@/components/map/ExportMapDialog";
import TrackMapView from "@/components/map/TrackMapView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { apiService } from "@/services/api";

// 城市数据类型
interface CityData {
  id: number;
  country: string;
  city: string;
  photoCount: number;
  firstVisitAt: string;
  lastVisitAt: string;
  lng?: number;
  lat?: number;
}

// 旅行统计数据类型
interface TravelStats {
  totalCities: number;
  totalPhotos: number;
  totalCountries: number;
  recentCities: CityData[];
  topCities: CityData[];
  countryBreakdown: Array<{
    country: string;
    cityCount: number;
    photoCount: number;
  }>;
}

interface TrackPageProps {
  userId?: number;
  isOwnProfile?: boolean;
}

const TrackPage: React.FC<TrackPageProps> = ({ userId: propUserId, isOwnProfile = false }) => {
  const { user } = useIsAuthenticated();
  const { theme } = useTheme();

  // 判断是否为深色模式
  const isDark = useMemo(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    // system 模式下检查系统偏好
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, [theme]);

  // 如果传入了 userId，则查看其他用户的轨迹；否则查看当前用户的
  const targetUserId = propUserId || user?.id;
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [sortBy, setSortBy] = useState<"photoCount" | "lastVisitAt" | "firstVisitAt">("photoCount");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showExportDialog, setShowExportDialog] = useState(false);

  // 获取用户旅行统计
  const { data: travelStatsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ["user-travel-stats", targetUserId],
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error("User not found");
      }
      return apiService.getUserTravelStats(targetUserId);
    },
    enabled: !!targetUserId,
  });

  const travelStats = travelStatsResponse?.result as TravelStats;

  // 获取用户访问过的城市
  const { data: citiesResponse, isLoading: citiesLoading } = useQuery({
    queryKey: ["user-cities", targetUserId, sortBy, sortOrder, countryFilter],
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error("User not found");
      }
      return apiService.getUserCities(targetUserId, {
        page: 1,
        limit: 100,
        sortBy,
        sortOrder,
        country: countryFilter || undefined,
      });
    },
    enabled: !!targetUserId,
  });

  const citiesData = citiesResponse?.result?.data as CityData[];

  const isLoading = statsLoading || citiesLoading;

  const handleCityClick = (city: CityData) => {
    setSelectedCity(city);
  };

  // 打开导出配置对话框
  const handleOpenExportDialog = () => {
    setShowExportDialog(true);
  };

  // 复制分享链接
  const handleCopyShareLink = useCallback(() => {
    const secUid = user?.secUid;
    if (!secUid) {
      toast.error("无法生成链接，请稍后再试");
      return;
    }
    const shareUrl = `${window.location.origin}/map/${secUid}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success("链接已复制到剪贴板");
      })
      .catch(() => {
        toast.error("复制失败，请手动复制链接");
      });
  }, [user?.secUid]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "今天";
    }
    if (diffInDays === 1) {
      return "昨天";
    }
    if (diffInDays < 7) {
      return `${diffInDays}天前`;
    }
    if (diffInDays < 30) {
      return `${Math.floor(diffInDays / 7)}周前`;
    }
    if (diffInDays < 365) {
      return `${Math.floor(diffInDays / 30)}个月前`;
    }
    return `${Math.floor(diffInDays / 365)}年前`;
  };

  const getCityFlag = (country: string) => {
    const flags: Record<string, string> = {
      中国: "🇨🇳",
      美国: "🇺🇸",
      日本: "🇯🇵",
      韩国: "🇰🇷",
      英国: "🇬🇧",
      法国: "🇫🇷",
      德国: "🇩🇪",
      意大利: "🇮🇹",
      西班牙: "🇪🇸",
      澳大利亚: "🇦🇺",
      加拿大: "🇨🇦",
      新加坡: "🇸🇬",
      泰国: "🇹🇭",
      马来西亚: "🇲🇾",
    };
    return flags[country] || "🌍";
  };

  // 城市坐标映射（用于地图显示）
  const getCityCoordinates = (city: string): [number, number] | null => {
    const cityCoords: Record<string, [number, number]> = {
      // 中国主要城市
      北京市: [116.4074, 39.9042],
      上海市: [121.4737, 31.2304],
      广州市: [113.2644, 23.1291],
      深圳市: [114.0579, 22.5431],
      杭州市: [120.1551, 30.2741],
      南京市: [118.7969, 32.0603],
      成都市: [104.0668, 30.5728],
      重庆市: [106.5516, 29.563],
      西安市: [108.9402, 34.3416],
      武汉市: [114.3054, 30.5931],
      天津市: [117.1901, 39.1235],
      苏州市: [120.6197, 31.3017],
      青岛市: [120.3826, 36.0671],
      大连市: [121.6147, 38.914],
      厦门市: [118.1689, 24.4797],
      昆明市: [102.8329, 24.8801],
      长沙市: [112.9388, 28.2282],
      福州市: [119.3063, 26.0745],
      郑州市: [113.6254, 34.7466],
      石家庄市: [114.5149, 38.0428],
      济南市: [117.1205, 36.6519],
      沈阳市: [123.4315, 41.8057],
      长春市: [125.3245, 43.8171],
      哈尔滨市: [126.5358, 45.8023],
      南昌市: [115.8921, 28.6765],
      合肥市: [117.2272, 31.8206],
      太原市: [112.5489, 37.8706],
      南宁市: [108.3669, 22.817],
      海口市: [110.3312, 20.0311],
      贵阳市: [106.7135, 26.5783],
      兰州市: [103.8236, 36.0581],
      西宁市: [101.7782, 36.6171],
      银川市: [106.2309, 38.4872],
      乌鲁木齐市: [87.6168, 43.8256],
      拉萨市: [91.1409, 29.6456],
      呼和浩特市: [111.7519, 40.8414],

      // 国际城市
      纽约: [-74.006, 40.7128],
      洛杉矶: [-118.2437, 34.0522],
      芝加哥: [-87.6298, 41.8781],
      旧金山: [-122.4194, 37.7749],
      西雅图: [-122.3321, 47.6062],
      波士顿: [-71.0589, 42.3601],
      华盛顿: [-77.0369, 38.9072],
      迈阿密: [-80.1918, 25.7617],
      拉斯维加斯: [-115.1398, 36.1699],

      东京: [139.6917, 35.6895],
      大阪: [135.5023, 34.6937],
      京都: [135.7681, 35.0116],
      横滨: [139.638, 35.4437],
      名古屋: [136.9066, 35.1815],

      首尔: [126.978, 37.5665],
      釜山: [129.0756, 35.1796],

      伦敦: [-0.1276, 51.5074],
      曼彻斯特: [-2.2426, 53.4808],
      爱丁堡: [-3.1883, 55.9533],

      巴黎: [2.3522, 48.8566],
      马赛: [5.3698, 43.2965],
      里昂: [4.8357, 45.764],

      柏林: [13.405, 52.52],
      慕尼黑: [11.582, 48.1351],
      汉堡: [9.9937, 53.5511],

      罗马: [12.4964, 41.9028],
      米兰: [9.19, 45.4642],
      威尼斯: [12.3155, 45.4408],
      佛罗伦萨: [11.2558, 43.7696],

      马德里: [-3.7038, 40.4168],
      巴塞罗那: [2.1734, 41.3851],

      悉尼: [151.2093, -33.8688],
      墨尔本: [144.9631, -37.8136],
      布里斯班: [153.0251, -27.4698],
      珀斯: [115.8605, -31.9505],

      多伦多: [-79.3832, 43.6532],
      温哥华: [-123.1207, 49.2827],
      蒙特利尔: [-73.5673, 45.5017],

      新加坡: [103.8198, 1.3521],

      曼谷: [100.5018, 13.7563],
      清迈: [98.9817, 18.7883],

      吉隆坡: [101.6869, 3.139],
    };

    const key = `${city}`;
    return cityCoords[key] || null;
  };

  // 为城市数据添加坐标并进行搜索过滤
  const citiesWithCoords = useMemo(() => {
    let cities =
      citiesData?.map((city) => ({
        ...city,
        lng: city.lng || getCityCoordinates(city.city)?.[0],
        lat: city.lat || getCityCoordinates(city.city)?.[1],
      })) || [];

    // 搜索过滤
    if (searchQuery.trim()) {
      cities = cities.filter(
        (city) =>
          city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.country.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return cities;
  }, [citiesData, searchQuery, getCityCoordinates]);

  // 获取所有国家列表
  const availableCountries = useMemo(() => {
    const countries = new Set(citiesData?.map((city) => city.country) || []);
    return Array.from(countries).sort();
  }, [citiesData]);

  // 计算一些统计数据

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!travelStats || travelStats.totalCities === 0) {
    return (
      <div className="min-h-[500px] rounded-2xl border border-gray-100 bg-white">
        <div className="p-6">
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
              <Map className="text-blue-600" size={24} />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 text-xl">开始你的旅行足迹</h3>
            <p className="mb-6 text-gray-500 text-sm">
              上传带有GPS信息的照片，记录你走过的每一个地方
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-blue-600 text-sm">
              <Camera size={16} />
              <span>拍照记录足迹</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 旅行统计概览 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-600">
              <Globe className="text-white" size={20} />
            </div>
            <div>
              <CardTitle className="text-xl">我的足迹地图</CardTitle>
              <p className="text-muted-foreground text-sm">探索世界，记录美好</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
                <MapPin className="text-slate-600" size={24} />
              </div>
              <div className="mb-1 font-bold text-3xl text-slate-700">
                {travelStats.totalCities}
              </div>
              <div className="text-muted-foreground text-sm">个城市</div>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
                <Camera className="text-slate-600" size={24} />
              </div>
              <div className="mb-1 font-bold text-3xl text-slate-700">
                {travelStats.totalPhotos}
              </div>
              <div className="text-muted-foreground text-sm">张照片</div>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
                <Globe className="text-slate-600" size={24} />
              </div>
              <div className="mb-1 font-bold text-3xl text-slate-700">
                {travelStats.totalCountries}
              </div>
              <div className="text-muted-foreground text-sm">个国家</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 城市足迹控制面板 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Map className="text-slate-600" size={20} />
                足迹地图
              </CardTitle>
              <p className="mt-1 text-muted-foreground text-sm">
                探索 {citiesWithCoords.length} 个城市的足迹
              </p>
            </div>

            {/* 视图切换和导出按钮 */}
            <div className="flex items-center gap-2">
              {isOwnProfile && (
                <>
                  <Button className="h-8" onClick={handleCopyShareLink} size="sm" variant="outline">
                    <Link2 className="mr-1" size={14} />
                    生成链接
                  </Button>
                  <Button
                    className="h-8"
                    onClick={handleOpenExportDialog}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="mr-1" size={14} />
                    导出海报
                  </Button>
                </>
              )}
              <div className="flex items-center rounded-lg bg-muted p-1">
                <Button
                  className="h-8"
                  onClick={() => setViewMode("grid")}
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                >
                  网格
                </Button>
                <Button
                  className="h-8"
                  onClick={() => setViewMode("map")}
                  size="sm"
                  variant={viewMode === "map" ? "default" : "ghost"}
                >
                  地图
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和过滤栏 */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {/* 搜索框 */}
            <div className="relative min-w-[200px] flex-1">
              <Search
                className="-translate-y-1/2 absolute top-1/2 left-3 transform text-muted-foreground"
                size={16}
              />
              <Input
                className="pl-10"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索城市或国家..."
                value={searchQuery}
              />
            </div>

            {/* 国家过滤 */}
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(e) => setCountryFilter(e.target.value)}
              value={countryFilter}
            >
              <option value="">所有国家</option>
              {availableCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>

            {/* 排序控制 */}
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              value={sortBy}
            >
              <option value="photoCount">按照片数量</option>
              <option value="lastVisitAt">按最近访问</option>
              <option value="firstVisitAt">按首次访问</option>
            </select>

            <Button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              size="sm"
              title={sortOrder === "desc" ? "降序" : "升序"}
              variant="outline"
            >
              {sortOrder === "desc" ? "↓" : "↑"}
            </Button>
          </div>

          {/* 城市内容 - 根据视图模式显示 */}
          {viewMode === "grid" ? (
            /* 城市网格 */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {citiesWithCoords?.map((city) => {
                return (
                  <Card
                    className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    key={city.id}
                    onClick={() => handleCityClick(city)}
                  >
                    <CardContent className="p-4">
                      {/* 城市头部 */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{getCityFlag(city.country)}</div>
                          <div>
                            <h4 className="font-bold text-foreground text-lg transition-colors group-hover:text-slate-700">
                              {city.city}
                            </h4>
                            <p className="text-muted-foreground text-sm">{city.country}</p>
                          </div>
                        </div>

                        <Badge variant="secondary">{city.photoCount} 张</Badge>
                      </div>

                      {/* 访问时间信息 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Star size={14} />
                            <span>首次访问</span>
                          </div>
                          <span className="font-medium">{formatDate(city.firstVisitAt)}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock size={14} />
                            <span>最近访问</span>
                          </div>
                          <span className="font-medium">
                            {formatRelativeTime(city.lastVisitAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* 地图视图 */
            <div style={{ height: "600px", overflow: "hidden", borderRadius: "0.5rem" }}>
              <TrackMapView userId={targetUserId} isDark={isDark} showGallery={true} />
            </div>
          )}

          {/* 空状态 */}
          {citiesWithCoords?.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                {searchQuery || countryFilter ? (
                  <Search className="text-muted-foreground" size={24} />
                ) : (
                  <MapPin className="text-muted-foreground" size={24} />
                )}
              </div>
              <h3 className="mb-2 font-semibold text-lg">
                {searchQuery || countryFilter ? "没有找到匹配的城市" : "还没有访问过任何城市"}
              </h3>
              <p className="mb-4 text-muted-foreground">
                {searchQuery || countryFilter
                  ? "尝试调整搜索条件或过滤器"
                  : "开始拍摄带有GPS信息的照片来记录你的足迹"}
              </p>
              {(searchQuery || countryFilter) && (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setCountryFilter("");
                  }}
                >
                  清除筛选条件
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 国家统计 */}
      {travelStats.countryBreakdown && travelStats.countryBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="text-slate-600" size={20} />
              国家分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {travelStats.countryBreakdown.map((country) => (
                <div
                  className="flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-sm"
                  key={country.country}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCityFlag(country.country)}</span>
                    <div>
                      <h4 className="font-medium">{country.country}</h4>
                      <p className="text-muted-foreground text-sm">{country.cityCount} 个城市</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg">{country.photoCount}</div>
                    <div className="text-muted-foreground text-xs">张照片</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 导出配置对话框 */}
      <ExportMapDialog
        cities={citiesWithCoords}
        onOpenChange={setShowExportDialog}
        open={showExportDialog}
      />

      {/* 选中城市的详细信息弹窗 */}
      <Dialog onOpenChange={() => setSelectedCity(null)} open={!!selectedCity}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{selectedCity && getCityFlag(selectedCity.country)}</span>
              <div>
                <div className="font-bold text-xl">{selectedCity?.city}</div>
                <div className="font-normal text-muted-foreground text-sm">
                  {selectedCity?.country}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedCity && (
            <div className="space-y-6">
              {/* 统计信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <div className="mb-1 font-bold text-2xl">{selectedCity.photoCount}</div>
                  <div className="text-muted-foreground text-xs">张照片</div>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <div className="mb-1 font-bold text-2xl">
                    {Math.ceil(
                      (new Date(selectedCity.lastVisitAt).getTime() -
                        new Date(selectedCity.firstVisitAt).getTime()) /
                        (1000 * 60 * 60 * 24),
                    ) || 1}
                  </div>
                  <div className="text-muted-foreground text-xs">天跨度</div>
                </div>
              </div>

              {/* 访问记录 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Star className="text-muted-foreground" size={16} />
                    <span className="text-sm">首次访问</span>
                  </div>
                  <span className="font-medium text-sm">
                    {formatDate(selectedCity.firstVisitAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="text-muted-foreground" size={16} />
                    <span className="text-sm">最近访问</span>
                  </div>
                  <span className="font-medium text-sm">
                    {formatRelativeTime(selectedCity.lastVisitAt)}
                  </span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-2">
                <Button className="w-full" onClick={() => {}}>
                  <Camera className="mr-2" size={16} />
                  查看城市照片
                </Button>

                {selectedCity.lng && selectedCity.lat && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setViewMode("map");
                      setSelectedCity(null);
                    }}
                    variant="outline"
                  >
                    <MapPin className="mr-2" size={16} />
                    在地图上查看
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrackPage;
