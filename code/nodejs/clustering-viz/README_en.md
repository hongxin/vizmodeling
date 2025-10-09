# Data Clustering Visualization

[中文](./README.md)

An interactive web application for visualizing and comparing three classic clustering algorithms: K-Means, Mean-Shift, and MOG (Mixture of Gaussians).

## Overview

This project is a Node.js and D3.js based web application designed to help understand the characteristics and use cases of different clustering algorithms through interactive visualizations.

### Key Features

- **Three Clustering Algorithms**
  - **K-Means**: Fast and efficient partitioning clustering, suitable for spherical clusters
  - **Mean-Shift**: Density-based clustering, automatically discovers number of clusters, suitable for arbitrary shapes
  - **MOG (Mixture of Gaussians)**: Probabilistic mixture model, supports soft clustering, suitable for overlapping data

- **Two Dimensionality Reduction Methods** ✨ NEW
  - **PCA (Principal Component Analysis)**: Fast linear reduction, suitable for quick preview
  - **UMAP (Manifold Learning)**: Non-linear reduction, better preserves local structure
  - Real-time switching between methods, intelligent handling of small samples

- **Multiple Datasets**
  - MNIST Handwritten Digits (Small - 1000 samples)
  - MNIST Handwritten Digits (Medium - 3000 samples)
  - Iris Dataset (150 samples, 4 features)
  - Wine Dataset (178 samples, 13 features)

- **Bilingual Support**: Switch between Chinese and English interface

- **Visualization Features**
  - Single method view: Detailed results for one algorithm
  - Comparison mode: Side-by-side visualization of all three algorithms
  - Real-time parameter adjustment: Tune clusters, bandwidth, etc.
  - Performance metrics: Display computation time, number of clusters, etc.
  - Clean design: No axis clutter, focus on clustering results ✨ NEW

## Tech Stack

### Backend
- **Node.js** + **Express**: Web server
- **ml-kmeans**: K-Means clustering implementation
- **ml-pca**: PCA dimensionality reduction (for visualization)
- **umap-js**: UMAP non-linear dimensionality reduction ✨ NEW
- **ml-matrix**: Matrix operations
- **mnist**: MNIST dataset loader

### Frontend
- **D3.js v7**: Data visualization
- **HTML/CSS/JavaScript**: Interface development

### Algorithm Implementation
- **K-Means**: Using ml-kmeans library (v6.0.0)
- **Mean-Shift**: Custom implementation with automatic bandwidth estimation
- **MOG**: Custom EM algorithm implementation with diagonal covariance matrices
- **Dimensionality Reduction**: PCA (ml-pca) and UMAP (umap-js) ✨ NEW
- **Visualization Helpers**: Centroid computation in reduced space (server/visualization.js) ✨ NEW

## Installation and Running

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation Steps

1. Clone or download this project

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
npm start
```

4. Open your browser and visit
```
http://localhost:3001
```

## Usage Guide

### Basic Operations

1. **Select Dataset**: Choose a dataset from the dropdown menu
2. **Select Dimensionality Reduction Method** ✨ NEW: Click PCA or UMAP button to choose reduction algorithm
   - **PCA**: Fast, suitable for quick preview and linear data
   - **UMAP**: Slower, better preserves local structure, suitable for complex data
3. **Select Clustering Method**: Click K-Means, Mean-Shift, MOG, or "Compare" button
4. **Adjust Parameters**: Tune algorithm-specific parameters as needed
   - K-Means: Number of clusters K (2-15)
   - Mean-Shift: Bandwidth (0 for automatic estimation)
   - MOG: Number of components K (2-15)
5. **View Results**: Visualization and performance metrics update automatically

### Visualization Elements

- **Data Points**: Small circles represent samples, colored by cluster assignment
- **Centroids**: Large circles (with × mark) represent cluster centers
- **Legend**: Shows sample count for each cluster
- **Metrics**: Displays computation time and number of clusters

### Algorithm Parameters

#### K-Means
- **Number of Clusters K**: Pre-specified number of clusters
- Use Case: Data with relatively uniform distribution and spherical clusters

#### Mean-Shift
- **Bandwidth**: Key parameter affecting clustering granularity
  - Set to 0: Automatic optimal bandwidth estimation
  - Smaller value: More fine-grained clusters
  - Larger value: Fewer coarse-grained clusters
- Use Case: Unknown number of clusters, irregular cluster shapes

#### MOG (Mixture of Gaussians)
- **Number of Components K**: Number of Gaussian components
- Feature: Soft clustering with probabilistic assignments
- Use Case: Overlapping data requiring probabilistic assignment

## Project Structure

```
clustering-viz/
├── server/
│   ├── index.js          # Express server entry point
│   ├── clustering.js     # Clustering algorithms and dimensionality reduction
│   ├── visualization.js  # Visualization helpers (centroids in reduced space) ✨ NEW
│   └── datasets.js       # Dataset loading and processing
├── public/
│   ├── index.html        # Main page
│   ├── css/
│   │   └── style.css     # Stylesheet
│   └── js/
│       └── app.js        # Frontend logic and visualization
├── test/
│   └── kmeans-test.js    # Test suite
├── CHANGELOG.md          # Version changelog ✨ NEW
├── UMAP_FEATURE.md       # UMAP feature documentation ✨ NEW
├── REVIEW_REPORT.md      # Technical review report
├── package.json
└── README.md
```

## API Endpoints

### GET /api/datasets
Get list of all available datasets

**Response Example**:
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
Get detailed information for a specific dataset

### POST /api/cluster
Perform clustering with a single algorithm

**Request Body**:
```json
{
  "datasetId": "mnist-small",
  "method": "kmeans",
  "options": { "k": 10 },
  "dimReduction": "pca",
  "dimReductionOptions": {}
}
```

**Parameters**:
- `dimReduction`: Reduction method, either `"pca"` or `"umap"` (default `"pca"`) ✨ NEW
- `dimReductionOptions`: Additional parameters for reduction method (optional) ✨ NEW

### POST /api/compare
Batch comparison of multiple clustering methods

**Request Body**:
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

**Parameters**:
- `dimReduction`: Reduction method, either `"pca"` or `"umap"` (default `"pca"`) ✨ NEW
- `dimReductionOptions`: UMAP parameters (optional) ✨ NEW
  - `nNeighbors`: Number of neighbors (default 15)
  - `minDist`: Minimum distance (default 0.1)
  - `nEpochs`: Training epochs (default 200)

## Algorithm Details

### K-Means
Classic partitioning clustering algorithm that minimizes within-cluster sum of squares through iteration.

**Advantages**:
- Simple and efficient, O(nki) time complexity
- Suitable for large-scale datasets
- Easy to interpret results

**Disadvantages**:
- Requires pre-specifying K
- Sensitive to initialization
- Only suitable for convex clusters

### Mean-Shift
Kernel density estimation-based clustering that discovers clusters by finding density peaks.

**Advantages**:
- Automatically discovers number of clusters
- No assumption about cluster shape
- Robust to outliers

**Disadvantages**:
- Higher computational complexity O(n²)
- Bandwidth parameter affects results
- Performance degrades with high dimensions

### MOG (Mixture of Gaussians)
Probabilistic generative model optimized using EM algorithm.

**Advantages**:
- Soft clustering with probability assignments
- Solid theoretical foundation
- Can model complex distributions

**Disadvantages**:
- Requires specifying number of components
- May converge to local optima
- Sensitive to initialization

## Performance Optimizations

- **Mean-Shift**: Uses sampling for large datasets (max 300 samples)
- **Visualization Reduction**: Supports both PCA and UMAP
  - **PCA**: ~2ms (Iris) / ~2.8s (MNIST-1000), suitable for quick preview
  - **UMAP**: ~150ms (Iris) / ~1.2s (MNIST-1000), faster for high-dimensional data
  - Intelligent fallback: Automatically uses PCA when samples < 10
- **Centroids**: Recomputed in reduced 2D space to ensure visualization accuracy ✨ NEW
- **Caching**: Datasets pre-loaded at server startup

## Developer Information

### Dataset Details

- **MNIST**: 28×28 pixel handwritten digit images, flattened to 784-dimensional vectors
- **Iris**: Classic iris flower dataset with 4 features
- **Wine**: Wine chemical composition dataset with 13 features

### Extension Development

Adding new datasets:
1. Add data loading function in `server/datasets.js`
2. Register new dataset in `initDatasets()`
3. Ensure data format is 2D array

Adding new algorithms:
1. Implement algorithm function in `server/clustering.js`
2. Add handling logic in `server/index.js` API routes
3. Update frontend interface and parameter controls

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for complete version history.

### Latest Update (v1.2.0 - 2025-10-09)
- ✨ Added UMAP dimensionality reduction support
- 🐛 Fixed centroid visualization representativeness issue
- 🎨 Clean visualization design (removed axes)
- 📚 Added `server/visualization.js` module

For detailed feature documentation, see [UMAP_FEATURE.md](./UMAP_FEATURE.md)

## License

ISC

## Related Projects

- [Dimensionality Reduction Visualization](../dimreduction-viz/README_en.md) - Compare PCA, t-SNE, and UMAP methods
