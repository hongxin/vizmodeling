# 高维数据非线性降维可视化演示应用

这是一个基于Node.js开发的交互式Web应用，用于演示和对比不同的降维方法（PCA、t-SNE、UMAP）在高维数据可视化中的效果。

## 功能特点

### 降维方法
- **PCA (Principal Component Analysis)**: 线性降维方法，保持全局结构，计算速度快
- **t-SNE (t-Distributed Stochastic Neighbor Embedding)**: 非线性降维，擅长保持局部结构，聚类效果好
- **UMAP (Uniform Manifold Approximation and Projection)**: 非线性降维，同时保持局部和全局结构，速度较快

### 数据集
1. **MNIST手写数字数据集**: 28×28像素的手写数字图像（0-9），784维特征，1000个样本
2. **Iris鸢尾花数据集**: 150个样本，4维特征（花萼长宽、花瓣长宽），3个类别
3. **Wine红葡萄酒质量数据集**: 红葡萄酒的11维化学特征（酸度、残糖、pH等）

### 可视化功能
- 单个降维方法的交互式可视化
- 三种方法的并排对比展示
- 可调节的算法参数（t-SNE的perplexity和learning rate，UMAP的n_neighbors和min_distance）
- 鼠标悬停显示详细信息
- 彩色图例显示不同类别

## 项目结构

```
dimreduction-viz/
├── server/                     # 后端代码
│   ├── index.js               # 主服务器文件和API端点
│   ├── datasets.js            # 数据集准备模块
│   └── dimensionality-reduction.js  # 降维算法实现
├── public/                    # 前端代码
│   ├── index.html            # 主页面
│   ├── css/
│   │   └── style.css         # 样式文件
│   └── js/
│       └── app.js            # 前端逻辑和D3.js可视化
├── package.json
└── README.md
```

## 安装和运行

### 前置要求
- Node.js (版本 >= 14.0.0)
- npm

### 安装步骤

1. 克隆或下载项目到本地

2. 安装依赖包:
```bash
npm install
```

3. 启动服务器:
```bash
npm start
```

4. 打开浏览器访问:
```
http://localhost:3000
```

## 使用说明

1. **选择数据集**: 从下拉菜单中选择要分析的数据集

2. **选择降维方法**:
   - 点击 "PCA"、"t-SNE" 或 "UMAP" 按钮查看单个方法的结果
   - 点击 "对比显示" 查看三种方法的并排对比

3. **调整参数**:
   - **t-SNE参数**:
     - Perplexity (5-50): 控制邻域大小，较小的值关注局部结构
     - Learning Rate (1-100): 控制优化步长

   - **UMAP参数**:
     - N Neighbors (5-50): 控制局部邻域大小
     - Min Distance (0.01-0.5): 控制嵌入点之间的最小距离

4. **交互探索**:
   - 鼠标悬停在数据点上查看详细信息
   - 观察不同类别的聚类效果
   - 对比不同方法的可视化结果

## API端点

### GET /api/datasets
获取所有可用数据集的列表

**响应示例**:
```json
[
  {
    "id": "mnist",
    "name": "MNIST手写数字",
    "description": "28×28像素的手写数字图像，784维特征",
    "features": 784,
    "samples": 1000
  }
]
```

### GET /api/dataset/:id
获取特定数据集的详细信息

### POST /api/reduce
执行降维操作

**请求体**:
```json
{
  "datasetId": "mnist",
  "method": "tsne",
  "options": {
    "perplexity": 30,
    "epsilon": 10
  }
}
```

### POST /api/compare
批量对比多种降维方法

**请求体**:
```json
{
  "datasetId": "iris",
  "methods": ["pca", "tsne", "umap"],
  "options": {
    "tsne": {
      "perplexity": 30,
      "epsilon": 10
    },
    "umap": {
      "nNeighbors": 15,
      "minDist": 0.1
    }
  }
}
```

## 技术栈

### 后端
- **Express**: Web服务器框架
- **ml-matrix**: 矩阵运算
- **ml-pca**: PCA算法实现
- **tsne-js**: t-SNE算法实现
- **umap-js**: UMAP算法实现
- **mnist**: MNIST数据集加载

### 前端
- **D3.js**: 数据可视化
- **原生JavaScript**: 交互逻辑
- **HTML5/CSS3**: 界面设计

## 方法对比

| 特性 | PCA | t-SNE | UMAP |
|------|-----|-------|------|
| 类型 | 线性 | 非线性 | 非线性 |
| 计算速度 | 快 | 慢 | 中等 |
| 保持全局结构 | 好 | 差 | 好 |
| 保持局部结构 | 一般 | 很好 | 好 |
| 聚类效果 | 一般 | 很好 | 好 |
| 参数敏感度 | 低 | 高 | 中等 |
| 适用场景 | 快速探索、特征提取 | 聚类可视化 | 平衡的降维 |

## 开发说明

### 添加新数据集

在 `server/datasets.js` 中添加新的数据准备函数:

```javascript
function prepareYourDataset() {
  return {
    name: '数据集名称',
    description: '数据集描述',
    data: [[...], [...]],  // 样本特征数组
    labels: [0, 1, 2, ...], // 样本标签
    features: 特征数,
    samples: 样本数
  };
}
```

### 自定义样式

修改 `public/css/style.css` 来自定义界面外观。

### 扩展功能

- 添加更多降维算法（如MDS、Isomap等）
- 实现3D可视化
- 添加数据预处理选项
- 导出可视化结果

## 许可证

ISC

## 作者
Hongxin Zhang (hongxin.zhang@gmail.com) @ Zhejiang University
Created for educational and research purposes in dimensionality reduction visualization.
