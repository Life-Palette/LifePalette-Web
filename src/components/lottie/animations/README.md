# Lottie 动画文件目录

此目录用于存放自定义的 Lottie 动画 JSON 文件。

## 如何添加新动画

1. **下载动画文件**
   - 访问 [LottieFiles](https://lottiefiles.com/free-animations)
   - 选择合适的动画
   - 下载 JSON 格式文件

2. **将文件放入此目录**
   ```
   animations/
   ├── loading-spinner.json
   ├── empty-box.json
   ├── success-check.json
   └── error-cross.json
   ```

3. **在组件中使用**
   ```tsx
   import loadingSpinner from '@/components/lottie/animations/loading-spinner.json';
   import { LottieAnimation } from '@/components/lottie';
   
   <LottieAnimation animationData={loadingSpinner} />
   ```

## 推荐的动画资源

### 加载动画
- [Simple Loading](https://lottiefiles.com/animations/simple-loading-Wqge8sH6u5)
- [Gradient Loading](https://lottiefiles.com/animations/gradient-loading-TUq8cRBa0H)

### 空状态动画
- [Empty State](https://lottiefiles.com/animations/empty-state-file-mYCVvQKZw4)
- [No Data](https://lottiefiles.com/animations/no-data-lKJQrQXfnj)

### 成功/错误动画
- [Success Check](https://lottiefiles.com/animations/success-SfLqFgtfmF)
- [Error Cross](https://lottiefiles.com/animations/error-xZhw1QXFkB)

## 优化建议

1. **文件大小**: 尽量选择小于 100KB 的动画文件
2. **帧率**: 选择 30fps 或更低的动画以提高性能
3. **复杂度**: 避免过于复杂的动画，特别是在移动设备上
4. **压缩**: 使用在线工具压缩 JSON 文件

## 文件命名规范

- 使用小写字母和连字符: `loading-spinner.json`
- 描述性命名: `empty-shopping-cart.json`
- 避免特殊字符和空格
