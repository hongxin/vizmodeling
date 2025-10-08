# 机器学习可视化演示项目集

[English](./README_en.md)

本仓库包含两个交互式的机器学习可视化演示应用，旨在通过直观的可视化帮助理解经典的降维和聚类算法。

## 项目列表

### 1. [降维可视化演示](./dimreduction-viz)
对比展示 PCA、t-SNE 和 UMAP 三种降维方法的效果。

**特性**:
- **算法**: PCA (线性)、t-SNE (非线性)、UMAP (非线性)
- **数据集**: MNIST 手写数字（小/中/大）、Iris 鸢尾花、Wine 葡萄酒
- **功能**: 单一方法展示、横向对比、参数调节、性能指标
- **端口**: `http://localhost:3000`

**快速开始**:
```bash
cd dimreduction-viz
npm install
npm start
```

### 2. [聚类可视化演示](./clustering-viz)
对比展示 K-Means、Mean-Shift 和 MOG 三种聚类方法的效果。

**特性**:
- **算法**: K-Means、Mean-Shift、MOG (高斯混合模型)
- **数据集**: MNIST 手写数字（小/中）、Iris 鸢尾花、Wine 葡萄酒
- **功能**: 单一方法展示、横向对比、参数调节、性能指标
- **端口**: `http://localhost:3001`

**快速开始**:
```bash
cd clustering-viz
npm install
npm start
```

## 共同特性

### 技术栈
- **后端**: Node.js + Express
- **前端**: D3.js + HTML/CSS/JavaScript
- **机器学习**: ml-matrix, ml-pca, ml-kmeans, tsne-js, umap-js
- **数据**: MNIST, Iris, Wine 数据集

### 界面功能
- ✅ 中英文双语支持（默认中文）
- ✅ 实时参数调节
- ✅ 交互式可视化
- ✅ 性能指标展示
- ✅ 横向对比模式
- ✅ 响应式设计

## 算法对比

### 降维算法

| 算法 | 类型 | 特点 | 适用场景 | 计算复杂度 |
|------|------|------|----------|-----------|
| **PCA** | 线性 | 保持全局结构，快速 | 线性可分数据 | O(min(n²d, nd²)) |
| **t-SNE** | 非线性 | 保持局部结构，强调簇 | 聚类可视化 | O(n²) |
| **UMAP** | 非线性 | 平衡全局和局部结构 | 通用降维 | O(n^1.14) |

### 聚类算法

| 算法 | 类型 | 需要指定K | 特点 | 适用场景 |
|------|------|----------|------|----------|
| **K-Means** | 划分式 | 是 | 快速高效，球形簇 | 均匀分布数据 |
| **Mean-Shift** | 密度式 | 否 | 自动发现簇数 | 任意形状簇 |
| **MOG** | 概率式 | 是 | 软聚类，概率分配 | 重叠数据 |

## 数据集说明

### MNIST 手写数字
- **描述**: 28×28 像素的手写数字 0-9 图像
- **维度**: 784 维（28×28 展平）
- **规模**: 小 (1000)、中 (3000)、大 (5000)
- **用途**: 演示高维数据降维和聚类

### Iris 鸢尾花
- **描述**: 经典的植物分类数据集
- **维度**: 4 维（花萼长宽、花瓣长宽）
- **规模**: 150 样本，3 类
- **用途**: 演示低维数据的算法效果

### Wine 葡萄酒
- **描述**: 葡萄酒化学成分数据集
- **维度**: 13 维（酒精度、酸度等）
- **规模**: 178 样本，3 类
- **用途**: 演示中等维度数据分析

## 项目结构

```
nodejs/
├── dimreduction-viz/          # 降维可视化项目
│   ├── server/                # 后端服务器
│   │   ├── index.js          # Express 服务器
│   │   ├── dimensionality-reduction.js  # 降维算法
│   │   └── datasets.js       # 数据集加载
│   ├── public/               # 前端静态资源
│   │   ├── index.html
│   │   ├── css/style.css
│   │   └── js/app.js
│   ├── package.json
│   └── README.md
│
├── clustering-viz/           # 聚类可视化项目
│   ├── server/               # 后端服务器
│   │   ├── index.js         # Express 服务器
│   │   ├── clustering.js    # 聚类算法
│   │   └── datasets.js      # 数据集加载
│   ├── public/              # 前端静态资源
│   │   ├── index.html
│   │   ├── css/style.css
│   │   └── js/app.js
│   ├── package.json
│   └── README.md
│
└── README.md                # 本文件
```

## 使用场景

### 教育用途
- 机器学习课程教学演示
- 算法原理可视化讲解
- 学生实验和参数调优练习

### 研究用途
- 快速原型验证
- 算法性能对比
- 数据探索性分析

### 开发参考
- 学习 D3.js 可视化
- 理解降维和聚类算法实现
- Node.js Web 应用开发示例

## 开发说明

### 环境要求
- Node.js v14 或更高版本
- npm 包管理器
- 现代浏览器（支持 ES6+）

### 同时运行两个项目

1. 终端 1 - 运行降维演示:
```bash
cd dimreduction-viz
npm install
npm start
# 访问 http://localhost:3000
```

2. 终端 2 - 运行聚类演示:
```bash
cd clustering-viz
npm install
npm start
# 访问 http://localhost:3001
```

### 扩展开发

#### 添加新数据集
在 `server/datasets.js` 中添加：
```javascript
function prepareMyDataset() {
  return {
    name: '数据集名称',
    nameEn: 'Dataset Name',
    description: '中文描述',
    descriptionEn: 'English description',
    data: [[...], [...]],  // 二维数组
    labels: [...],          // 标签数组
    features: n,            // 特征数
    samples: m              // 样本数
  };
}
```

#### 添加新算法
在相应的算法文件中实现：
```javascript
function performNewMethod(data, options = {}) {
  const startTime = Date.now();

  // 算法实现
  const result = ...;

  return {
    points: result,       // 降维结果 或
    labels: result,       // 聚类标签
    time: Date.now() - startTime
  };
}
```

## 性能优化建议

### 大数据集处理
- **降维**: t-SNE 限制 1000 样本，UMAP 限制 2000 样本
- **聚类**: Mean-Shift 采样 500 样本
- **可视化**: 使用 canvas 而非 SVG（数据点 > 1000）

### 计算优化
- 预加载数据集到内存
- 使用 Web Workers 进行后台计算
- 实现结果缓存机制

## 已知限制

1. **高维数据**: 某些算法在超高维数据（>1000维）上性能下降
2. **大规模数据**: t-SNE 和 Mean-Shift 在大数据集上计算缓慢
3. **浏览器兼容**: 需要支持 ES6+ 和 D3.js v7 的现代浏览器
4. **内存限制**: 大数据集可能导致内存不足

## 常见问题

**Q: 两个项目可以同时运行吗？**
A: 可以，它们使用不同的端口（3000 和 3001）。

**Q: 为什么 t-SNE 计算很慢？**
A: t-SNE 时间复杂度为 O(n²)，对大数据集建议使用采样或选择 UMAP。

**Q: 如何更改默认参数？**
A: 修改前端 `app.js` 中的默认值或后端 `options` 默认参数。

**Q: 数据集可以自定义吗？**
A: 可以，在 `server/datasets.js` 中添加新的数据加载函数。

## 贡献指南

欢迎提交问题和改进建议！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

ISC

## 参考资源

### 算法论文
- **PCA**: Pearson, K. (1901). "On Lines and Planes of Closest Fit to Systems of Points in Space"
- **t-SNE**: van der Maaten, L., & Hinton, G. (2008). "Visualizing Data using t-SNE"
- **UMAP**: McInnes, L., et al. (2018). "UMAP: Uniform Manifold Approximation and Projection"
- **K-Means**: MacQueen, J. (1967). "Some methods for classification and analysis of multivariate observations"
- **Mean-Shift**: Comaniciu, D., & Meer, P. (2002). "Mean Shift: A Robust Approach Toward Feature Space Analysis"
- **MOG**: Dempster, A. P., et al. (1977). "Maximum likelihood from incomplete data via the EM algorithm"

### 相关工具
- [D3.js Documentation](https://d3js.org/)
- [scikit-learn](https://scikit-learn.org/) - Python 机器学习库（参考实现）
- [TensorFlow.js](https://www.tensorflow.org/js) - JavaScript 机器学习库

## 联系方式

如有问题或建议，欢迎提交 Issue。

---

**享受探索机器学习算法的可视化之旅！** 🚀
