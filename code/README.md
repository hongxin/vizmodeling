# 可视化建模代码演示

中文 | [English](./README_en.md)

本目录包含可视化建模课程的代码示例和交互式演示。

---

## 📁 目录结构

### `python/` - Python 数值计算示例

**包含演示：**

- **`hermite_inter.py`** - Hermite 插值
  三次 Hermite 插值实现，支持单点、区间、批量计算

- **`song_color.py`** - 宋代美学调色板
  基于五行五色的宋代美学配色方案可视化

- **`polynomial_fit.py`** - 多项式拟合
  多项式曲线拟合演示

**运行示例：**
```bash
cd python
# Hermite 插值
python hermite_inter.py --f0 0 --f1 1 --fd0 0 --fd1 0 --trange 0,1,0.1
# 宋代调色板
python song_color.py
```

---

### `nodejs/` - Node.js 交互式可视化

#### 1. **clustering-viz** - 聚类算法可视化

对比展示三种经典聚类算法的效果。

**算法：**
- **K-Means** - 快速划分式聚类，适合球形簇
- **Mean-Shift** - 基于密度的聚类，自动发现簇数
- **MOG (EM)** - 高斯混合模型，支持软聚类

**数据集：**
- MNIST 手写数字 (1000/3000 样本)
- Iris 鸢尾花 (150 样本, 4 维)
- Wine 葡萄酒 (178 样本, 13 维)

**启动方式：**
```bash
cd nodejs/clustering-viz
npm install
npm start
# 访问 http://localhost:3001
```

**核心功能：**
- 单一/对比视图切换
- 实时参数调节（聚类数、带宽等）
- 双语界面（中文/English）
- 性能指标显示

---

#### 2. **dimreduction-viz** - 降维可视化

对比展示三种降维方法在高维数据可视化中的效果。

**方法：**
- **PCA** - 线性降维，保持全局结构，速度快
- **t-SNE** - 非线性降维，优秀聚类效果，保持局部结构
- **UMAP** - 非线性降维，平衡局部和全局结构

**数据集：**
- MNIST 手写数字 (784 维 → 2 维)
- Iris 鸢尾花 (4 维 → 2 维)
- Wine 红酒质量 (11 维 → 2 维)

**启动方式：**
```bash
cd nodejs/dimreduction-viz
npm install
npm start
# 访问 http://localhost:3000
```

**核心功能：**
- 三种方法并排对比
- 可调节算法参数（perplexity, n_neighbors 等）
- 交互式悬停查看详情
- 彩色图例和聚类分析

---

## 🚀 快速开始

### Python 环境
```bash
# 需要 Python 3.x
pip install matplotlib numpy
cd python
python song_color.py
```

### Node.js 环境
```bash
# 需要 Node.js >= 14.0
cd nodejs/clustering-viz    # 或 dimreduction-viz
npm install
npm start
```

---

## 📊 算法对比

### 聚类算法

| 算法 | 时间复杂度 | 需要预设簇数 | 适用场景 |
|------|-----------|-------------|---------|
| K-Means | O(nki) | ✓ | 球形簇，大规模数据 |
| Mean-Shift | O(n²) | ✗ | 任意形状，自动发现簇数 |
| MOG | O(nki) | ✓ | 重叠数据，软聚类 |

### 降维方法

| 方法 | 类型 | 速度 | 保持全局结构 | 保持局部结构 | 适用场景 |
|------|------|------|------------|------------|---------|
| PCA | 线性 | 快 | ★★★ | ★☆☆ | 快速探索 |
| t-SNE | 非线性 | 慢 | ★☆☆ | ★★★ | 聚类可视化 |
| UMAP | 非线性 | 中 | ★★☆ | ★★☆ | 平衡降维 |

---

## 📚 技术栈

**Python:**
- NumPy, Matplotlib
- 数值计算和科学可视化

**Node.js:**
- Express (Web 服务器)
- D3.js (数据可视化)
- ml-kmeans, ml-pca (机器学习库)
- tsne-js, umap-js (降维算法)

---

## 📖 相关资源

- 聚类可视化完整文档：[clustering-viz/README.md](nodejs/clustering-viz/README.md)
- 降维可视化完整文档：[dimreduction-viz/README.md](nodejs/dimreduction-viz/README.md)
- 课程讲义：https://github.com/hongxin/vizmodeling

---

## 👤 作者

Hongxin Zhang (hongxin.zhang@gmail.com)
Zhejiang University

## 📄 许可证

ISC
