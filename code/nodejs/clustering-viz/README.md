# 数据聚类可视化演示

[English](./README_en.md)

一个交互式的聚类算法可视化演示应用，对比展示 K-Means、Mean-Shift 和 MOG（高斯混合模型）三种经典聚类方法的效果。

## 项目简介

本项目是一个基于 Node.js 和 D3.js 的 Web 应用，旨在帮助理解不同聚类算法的特点和适用场景。通过可视化的方式，直观展示各算法在不同数据集上的聚类效果。

### 主要特性

- **三种聚类算法**
  - **K-Means**: 快速高效的划分式聚类，适合球形簇
  - **Mean-Shift**: 基于密度的聚类，自动发现聚类数，适合任意形状
  - **MOG (Mixture of Gaussians)**: 概率混合模型，支持软聚类，适合重叠数据

- **两种降维方法** ✨ NEW
  - **PCA (主成分分析)**: 快速线性降维，适合快速预览
  - **UMAP (流形学习)**: 非线性降维，更好地保留局部结构
  - 可实时切换降维方法，智能处理小样本量

- **多个数据集**
  - MNIST 手写数字（小规模 1000 样本）
  - MNIST 手写数字（中规模 3000 样本）
  - Iris 鸢尾花数据集（150 样本，4 维特征）
  - Wine 葡萄酒数据集（178 样本，13 维特征）

- **双语支持**: 中文/英文界面切换

- **可视化功能**
  - 单一方法展示：详细查看某一算法的聚类结果
  - 横向对比模式：同时展示三种算法的聚类效果
  - 参数实时调节：可调整聚类数、带宽等参数
  - 计算性能指标：显示计算时间、聚类数等信息
  - 简洁设计：无坐标轴干扰，聚焦聚类结果 ✨ NEW

## 技术栈

### 后端
- **Node.js** + **Express**: Web 服务器
- **ml-kmeans**: K-Means 聚类实现
- **ml-pca**: PCA 降维（用于可视化）
- **umap-js**: UMAP 非线性降维 ✨ NEW
- **ml-matrix**: 矩阵运算
- **mnist**: MNIST 数据集加载

### 前端
- **D3.js v7**: 数据可视化
- **HTML/CSS/JavaScript**: 界面开发

### 算法实现
- **K-Means**: 使用 ml-kmeans 库（v6.0.0）
- **Mean-Shift**: 自实现，包含带宽自动估计
- **MOG**: 自实现 EM 算法，使用对角协方差矩阵
- **降维**: PCA (ml-pca) 和 UMAP (umap-js) ✨ NEW
- **可视化辅助**: 降维空间中心点计算（server/visualization.js）✨ NEW

## 安装和运行

### 前置要求
- Node.js (v14 或更高版本)
- npm

### 安装步骤

1. 克隆或下载本项目

2. 安装依赖
```bash
npm install
```

3. 启动服务器
```bash
npm start
```

4. 打开浏览器访问
```
http://localhost:3001
```

## 使用说明

### 基本操作

1. **选择数据集**: 从下拉菜单中选择要使用的数据集
2. **选择降维方法** ✨ NEW: 点击 PCA 或 UMAP 按钮选择降维算法
   - **PCA**: 快速，适合快速预览和线性数据
   - **UMAP**: 较慢，更好地保留局部结构，适合复杂数据
3. **选择聚类方法**: 点击 K-Means、Mean-Shift、MOG 或"对比显示"按钮
4. **调整参数**: 根据需要调整相应算法的参数
   - K-Means: 聚类数 K (2-15)
   - Mean-Shift: 带宽 (0 表示自动估计)
   - MOG: 混合成分数 K (2-15)
5. **查看结果**: 可视化图表和性能指标会自动更新

### 可视化说明

- **数据点**: 小圆点表示数据样本，颜色表示所属簇
- **中心点**: 大圆点（带 × 标记）表示聚类中心
- **图例**: 显示各簇的样本数量
- **指标**: 显示计算时间和聚类数

### 算法参数说明

#### K-Means
- **聚类数 K**: 需要预先指定的簇数量
- 适用场景：数据分布相对均匀，簇呈球形

#### Mean-Shift
- **带宽 (Bandwidth)**: 影响聚类粒度的关键参数
  - 设为 0：自动估计最优带宽
  - 较小值：产生更多细粒度的簇
  - 较大值：产生较少粗粒度的簇
- 适用场景：不知道簇数量，数据形状不规则

#### MOG (混合高斯模型)
- **混合成分数 K**: 高斯分量的数量
- 特点：软聚类，每个点属于多个簇的概率
- 适用场景：数据有重叠，需要概率性分配

## 项目结构

```
clustering-viz/
├── server/
│   ├── index.js          # Express 服务器入口
│   ├── clustering.js     # 聚类算法和降维实现
│   ├── visualization.js  # 可视化辅助函数（降维空间中心点）✨ NEW
│   └── datasets.js       # 数据集加载和处理
├── public/
│   ├── index.html        # 主页面
│   ├── css/
│   │   └── style.css     # 样式文件
│   └── js/
│       └── app.js        # 前端逻辑和可视化
├── test/
│   └── kmeans-test.js    # 测试套件
├── CHANGELOG.md          # 版本更新日志 ✨ NEW
├── UMAP_FEATURE.md       # UMAP 功能说明文档 ✨ NEW
├── REVIEW_REPORT.md      # 技术审查报告
├── package.json
└── README.md
```

## API 接口

### GET /api/datasets
获取所有可用数据集的列表

**响应示例**:
```json
[
  {
    "id": "mnist-small",
    "name": "MNIST手写数字 (小)",
    "nameEn": "MNIST Digits (Small)",
    "samples": 1000,
    "features": 784
  }
]
```

### GET /api/dataset/:id
获取特定数据集的详细信息

### POST /api/cluster
执行单个聚类算法

**请求体**:
```json
{
  "datasetId": "mnist-small",
  "method": "kmeans",
  "options": { "k": 10 },
  "dimReduction": "pca",
  "dimReductionOptions": {}
}
```

**参数说明**:
- `dimReduction`: 降维方法，可选 `"pca"` 或 `"umap"`（默认 `"pca"`）✨ NEW
- `dimReductionOptions`: 降维方法的额外参数（可选）✨ NEW

### POST /api/compare
批量对比多个聚类方法

**请求体**:
```json
{
  "datasetId": "mnist-small",
  "methods": ["kmeans", "meanshift", "mog"],
  "options": {
    "kmeans": { "k": 10 },
    "meanshift": { "bandwidth": 0 },
    "mog": { "k": 10 }
  },
  "dimReduction": "umap",
  "dimReductionOptions": {
    "nNeighbors": 15,
    "minDist": 0.1,
    "nEpochs": 200
  }
}
```

**参数说明**:
- `dimReduction`: 降维方法，可选 `"pca"` 或 `"umap"`（默认 `"pca"`）✨ NEW
- `dimReductionOptions`: UMAP 参数（可选）✨ NEW
  - `nNeighbors`: 邻居数（默认 15）
  - `minDist`: 最小距离（默认 0.1）
  - `nEpochs`: 训练轮数（默认 200）

## 算法详解

### K-Means
经典的划分式聚类算法，通过迭代优化使簇内平方和最小化。

**优点**:
- 简单高效，时间复杂度 O(nki)
- 适合大规模数据集
- 结果易于解释

**缺点**:
- 需要预先指定 K 值
- 对初始值敏感
- 只适合凸形簇

### Mean-Shift
基于核密度估计的聚类算法，通过寻找密度峰值来发现簇。

**优点**:
- 自动发现聚类数量
- 不假设簇的形状
- 对异常值较鲁棒

**缺点**:
- 计算复杂度较高 O(n²)
- 带宽参数影响结果
- 对高维数据效果下降

### MOG (高斯混合模型)
使用 EM 算法优化的概率生成模型。

**优点**:
- 软聚类，给出概率分配
- 理论基础扎实
- 可以建模复杂分布

**缺点**:
- 需要指定成分数量
- 可能收敛到局部最优
- 对初始化敏感

## 性能优化

- **Mean-Shift**: 对大数据集使用采样（最多 300 样本）
- **可视化降维**: 支持 PCA 和 UMAP 两种降维方法
  - **PCA**: ~2ms (Iris) / ~2.8s (MNIST-1000)，适合快速预览
  - **UMAP**: ~150ms (Iris) / ~1.2s (MNIST-1000)，高维数据反而更快
  - 智能回退：样本数 < 10 时自动使用 PCA
- **聚类中心**: 在降维后的 2D 空间中重新计算，确保可视化准确性 ✨ NEW
- **缓存**: 服务器启动时预加载数据集

## 开发者信息

### 数据集说明

- **MNIST**: 28×28 像素的手写数字图像，展平为 784 维向量
- **Iris**: 经典的鸢尾花数据集，4 个特征
- **Wine**: 葡萄酒化学成分数据集，13 个特征

### 扩展开发

添加新数据集：
1. 在 `server/datasets.js` 中添加数据加载函数
2. 在 `initDatasets()` 中注册新数据集
3. 确保数据格式为二维数组

添加新算法：
1. 在 `server/clustering.js` 中实现算法函数
2. 在 `server/index.js` 的 API 路由中添加处理逻辑
3. 更新前端界面和参数控制

## 更新日志

详见 [CHANGELOG.md](./CHANGELOG.md) 查看完整的版本更新历史。

### 最新更新 (v1.2.0 - 2025-10-09)
- ✨ 新增 UMAP 降维支持
- 🐛 修复聚类中心可视化代表性问题
- 🎨 简洁可视化设计（移除坐标轴）
- 📚 新增 `server/visualization.js` 模块

详细功能说明见 [UMAP_FEATURE.md](./UMAP_FEATURE.md)

## 许可证

ISC

## 相关项目

- [降维可视化演示](../dimreduction-viz/README.md) - 对比 PCA、t-SNE、UMAP 降维方法
