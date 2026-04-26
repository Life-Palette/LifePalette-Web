// 地图组件共享的文件数据类型
export interface FileData {
  // 详情接口返回的额外字段
  address?: string;
  blurhash: string;
  createdAt: string;
  deviceMake?: string;
  deviceModel?: string;
  exposureTime?: string;
  fNumber?: string;
  focalLength?: string;
  fromIphone: boolean;
  height: number;
  id: number;
  iso?: number;
  lat: number;
  lensModel?: string;
  lng: number;
  name: string;
  takenAt?: string;
  type: string;
  updatedAt: string;
  url: string;
  videoSrc?: string | null;
  width: number;
}
