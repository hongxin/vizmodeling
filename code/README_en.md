# Visualization Modeling Demos

[中文](./README.md) | English

This directory contains code examples and interactive demos for the Visualization Modeling course.

---

## 📁 Directory Structure

### `python/` - Python Numerical Computing Examples

**Demos:**

- **`hermite_inter.py`** - Hermite Interpolation
  Cubic Hermite interpolation with support for single point, range, and batch computation

- **`song_color.py`** - Song Dynasty Aesthetic Color Palette
  Visualization of Song Dynasty color scheme based on Five Elements theory

- **`polynomial_fit.py`** - Polynomial Fitting
  Polynomial curve fitting demonstration

**Example Usage:**
```bash
cd python
# Hermite interpolation
python hermite_inter.py --f0 0 --f1 1 --fd0 0 --fd1 0 --trange 0,1,0.1
# Song Dynasty color palette
python song_color.py
```

---

### `nodejs/` - Node.js Interactive Visualizations

#### 1. **clustering-viz** - Clustering Algorithms Visualization

Interactive comparison of three classic clustering algorithms.

**Algorithms:**
- **K-Means** - Fast partitioning clustering, suitable for spherical clusters
- **Mean-Shift** - Density-based clustering, automatically discovers cluster count
- **MOG (EM)** - Gaussian Mixture Model, supports soft clustering

**Datasets:**
- MNIST Handwritten Digits (1000/3000 samples)
- Iris Flowers (150 samples, 4 features)
- Wine Quality (178 samples, 13 features)

**Launch:**
```bash
cd nodejs/clustering-viz
npm install
npm start
# Visit http://localhost:3001
```

**Key Features:**
- Single/comparison view toggle
- Real-time parameter adjustment (cluster count, bandwidth, etc.)
- Bilingual interface (中文/English)
- Performance metrics display

---

#### 2. **dimreduction-viz** - Dimensionality Reduction Visualization

Interactive comparison of three dimensionality reduction methods for high-dimensional data visualization.

**Methods:**
- **PCA** - Linear reduction, preserves global structure, fast computation
- **t-SNE** - Nonlinear reduction, excellent clustering effect, preserves local structure
- **UMAP** - Nonlinear reduction, balances local and global structure

**Datasets:**
- MNIST Handwritten Digits (784D → 2D)
- Iris Flowers (4D → 2D)
- Wine Quality (11D → 2D)

**Launch:**
```bash
cd nodejs/dimreduction-viz
npm install
npm start
# Visit http://localhost:3000
```

**Key Features:**
- Side-by-side comparison of three methods
- Adjustable algorithm parameters (perplexity, n_neighbors, etc.)
- Interactive hover for details
- Color legend and cluster analysis

---

## 🚀 Quick Start

### Python Environment
```bash
# Requires Python 3.x
pip install matplotlib numpy
cd python
python song_color.py
```

### Node.js Environment
```bash
# Requires Node.js >= 14.0
cd nodejs/clustering-viz    # or dimreduction-viz
npm install
npm start
```

---

## 📊 Algorithm Comparison

### Clustering Algorithms

| Algorithm | Time Complexity | Needs Predefined K | Use Cases |
|-----------|----------------|-------------------|-----------|
| K-Means | O(nki) | ✓ | Spherical clusters, large-scale data |
| Mean-Shift | O(n²) | ✗ | Arbitrary shapes, auto cluster count |
| MOG | O(nki) | ✓ | Overlapping data, soft clustering |

### Dimensionality Reduction Methods

| Method | Type | Speed | Global Structure | Local Structure | Use Cases |
|--------|------|-------|-----------------|-----------------|-----------|
| PCA | Linear | Fast | ★★★ | ★☆☆ | Quick exploration |
| t-SNE | Nonlinear | Slow | ★☆☆ | ★★★ | Cluster visualization |
| UMAP | Nonlinear | Medium | ★★☆ | ★★☆ | Balanced reduction |

---

## 📚 Tech Stack

**Python:**
- NumPy, Matplotlib
- Numerical computing and scientific visualization

**Node.js:**
- Express (Web server)
- D3.js (Data visualization)
- ml-kmeans, ml-pca (Machine learning libraries)
- tsne-js, umap-js (Dimensionality reduction algorithms)

---

## 📖 Related Resources

- Clustering visualization full docs: [clustering-viz/README.md](nodejs/clustering-viz/README.md)
- Dimensionality reduction full docs: [dimreduction-viz/README.md](nodejs/dimreduction-viz/README.md)
- Course materials: https://github.com/hongxin/vizmodeling

---

## 👤 Author

Hongxin Zhang (hongxin.zhang@gmail.com)
Zhejiang University

## 📄 License

ISC
