# Lottie 动画组件

## 概述

本文件夹包含基于 `lottie-react` 的统一动画组件，用于在项目中替代传统的空状态和加载动画。

## 组件说明

### LottieAnimation
统一的 Lottie 动画组件，通过 `type` 参数控制显示不同的动画类型：
- `loading`: 加载动画
- `empty`: 空状态动画
- `custom`: 自定义动画

## 快速使用

```tsx
// 导入组件
import { LottieAnimation } from '@/components/lottie';

// 加载动画
<LottieAnimation 
  type="loading"
  loadingText="正在加载..." 
  width={150} 
  height={150} 
/>

// 空状态动画
<LottieAnimation 
  type="empty"
  emptyTitle="暂无数据"
  emptyDescription="快去添加一些内容吧"
  actionButton={<button>添加内容</button>}
/>
```

## 使用自定义 Lottie 动画

### 1. 下载动画文件
从以下网站下载免费的 Lottie JSON 文件：
- [LottieFiles](https://lottiefiles.com/free-animations)
- [Lordicon](https://lordicon.com/free-icons)
- [Drawer](https://drawer.design/products/animation-collections)

### 2. 添加动画文件
将下载的 JSON 文件放在 `animations/` 文件夹中。

### 3. 在组件中使用

```tsx
import { LottieAnimation } from '@/components/lottie';
import customAnimation from './animations/custom-animation.json';

function MyComponent() {
  return (
    <LottieAnimation 
      type="custom"
      animationData={customAnimation}
      width={200}
      height={200}
      loop={true}
      autoplay={true}
    />
  );
}
```

## API 文档

### LottieAnimation Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| type | 'loading' \| 'empty' \| 'custom' | 'loading' | 动画类型 |
| animationData | any | undefined | 自定义动画数据（仅 type='custom' 时需要） |
| width | number \| string | 120 | 动画宽度 |
| height | number \| string | 120 | 动画高度 |
| loop | boolean | true | 是否循环播放 |
| autoplay | boolean | true | 是否自动播放 |
| className | string | '' | 容器类名 |
| style | CSSProperties | undefined | 自定义样式 |
| speed | number | 1 | 播放速度 |
| onClick | function | undefined | 点击事件处理函数 |
| loadingText | string | '加载中...' | 加载动画的文字 |
| emptyTitle | string | '暂无数据' | 空状态标题 |
| emptyDescription | string | '这里空空如也，快去添加一些内容吧' | 空状态描述 |
| actionButton | ReactNode | undefined | 空状态操作按钮 |

## 性能优化建议

1. **按需导入**: 只导入需要的组件，避免打包未使用的代码。
2. **懒加载**: 对于大型动画文件，考虑使用动态导入。
3. **缓存**: Lottie 动画会自动缓存，无需额外处理。
4. **尺寸优化**: 使用合适的动画尺寸，避免过大的动画文件。

## 动画文件说明

本地动画文件位于 `animations/` 目录：
- `loading.json`: 加载动画
- `empty.json`: 空状态动画

## 注意事项

- 动画文件通常较大，建议使用 CDN 或压缩后的版本
- 确保动画的帧率和复杂度适合 Web 环境
- 对于移动设备，考虑使用更简单的动画或降低帧率
