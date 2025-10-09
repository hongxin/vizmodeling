# Machine Learning Visualization Project Collection

[中文](./README.md) | English

This repository contains two interactive machine learning visualization applications designed to help understand classic dimensionality reduction and clustering algorithms through intuitive visualizations.

## Project List

### 1. [Dimensionality Reduction Visualization](./dimreduction-viz)
Compare and visualize the effects of PCA, t-SNE, and UMAP dimensionality reduction methods.

**Features**:
- **Algorithms**: PCA (linear), t-SNE (non-linear), UMAP (non-linear)
- **Datasets**: MNIST Digits (small/medium/large), Iris, Wine
- **Functions**: Single method view, side-by-side comparison, parameter tuning, performance metrics
- **Port**: `http://localhost:3000`

**Quick Start**:
```bash
cd dimreduction-viz
npm install
npm start
```

### 2. [Clustering Visualization](./clustering-viz)
Compare and visualize the effects of K-Means, Mean-Shift, and MOG clustering methods.

**Features**:
- **Algorithms**: K-Means, Mean-Shift, MOG (Mixture of Gaussians)
- **Datasets**: MNIST Digits (small/medium), Iris, Wine
- **Functions**: Single method view, side-by-side comparison, parameter tuning, performance metrics
- **Port**: `http://localhost:3001`

**Quick Start**:
```bash
cd clustering-viz
npm install
npm start
```

## Common Features

### Tech Stack
- **Backend**: Node.js + Express
- **Frontend**: D3.js + HTML/CSS/JavaScript
- **Machine Learning**: ml-matrix, ml-pca, ml-kmeans, tsne-js, umap-js
- **Data**: MNIST, Iris, Wine datasets

### Interface Features
- ✅ Bilingual support (Chinese/English, default: Chinese)
- ✅ Real-time parameter adjustment
- ✅ Interactive visualization
- ✅ Performance metrics display
- ✅ Side-by-side comparison mode
- ✅ Responsive design

## Algorithm Comparison

### Dimensionality Reduction Algorithms

| Algorithm | Type | Characteristics | Use Case | Complexity |
|-----------|------|-----------------|----------|------------|
| **PCA** | Linear | Preserves global structure, fast | Linearly separable data | O(min(n²d, nd²)) |
| **t-SNE** | Non-linear | Preserves local structure, emphasizes clusters | Cluster visualization | O(n²) |
| **UMAP** | Non-linear | Balances global and local structure | General-purpose reduction | O(n^1.14) |

### Clustering Algorithms

| Algorithm | Type | Requires K | Characteristics | Use Case |
|-----------|------|------------|-----------------|----------|
| **K-Means** | Partitioning | Yes | Fast and efficient, spherical clusters | Uniformly distributed data |
| **Mean-Shift** | Density-based | No | Automatically discovers clusters | Arbitrary cluster shapes |
| **MOG** | Probabilistic | Yes | Soft clustering, probability assignment | Overlapping data |

## Dataset Description

### MNIST Handwritten Digits
- **Description**: 28×28 pixel images of handwritten digits 0-9
- **Dimensions**: 784 (28×28 flattened)
- **Scale**: Small (1000), Medium (3000), Large (5000)
- **Purpose**: Demonstrate high-dimensional data reduction and clustering

### Iris Flowers
- **Description**: Classic plant classification dataset
- **Dimensions**: 4 (sepal length/width, petal length/width)
- **Scale**: 150 samples, 3 classes
- **Purpose**: Demonstrate algorithm effects on low-dimensional data

### Wine
- **Description**: Wine chemical composition dataset
- **Dimensions**: 13 (alcohol, acidity, etc.)
- **Scale**: 178 samples, 3 classes
- **Purpose**: Demonstrate analysis of medium-dimensional data

## Project Structure

```
nodejs/
├── dimreduction-viz/          # Dimensionality reduction project
│   ├── server/                # Backend server
│   │   ├── index.js          # Express server
│   │   ├── dimensionality-reduction.js  # Reduction algorithms
│   │   └── datasets.js       # Dataset loading
│   ├── public/               # Frontend static resources
│   │   ├── index.html
│   │   ├── css/style.css
│   │   └── js/app.js
│   ├── package.json
│   └── README.md
│
├── clustering-viz/           # Clustering project
│   ├── server/               # Backend server
│   │   ├── index.js         # Express server
│   │   ├── clustering.js    # Clustering algorithms
│   │   └── datasets.js      # Dataset loading
│   ├── public/              # Frontend static resources
│   │   ├── index.html
│   │   ├── css/style.css
│   │   └── js/app.js
│   ├── package.json
│   └── README.md
│
└── README.md                # This file
```

## Use Cases

### Educational Purposes
- Machine learning course teaching demonstrations
- Algorithm principle visualization
- Student experiments and parameter tuning practice

### Research Purposes
- Rapid prototyping and validation
- Algorithm performance comparison
- Exploratory data analysis

### Development Reference
- Learning D3.js visualization
- Understanding dimensionality reduction and clustering implementations
- Node.js web application development examples

## Development Guide

### Requirements
- Node.js v14 or higher
- npm package manager
- Modern browser (ES6+ support)

### Running Both Projects Simultaneously

1. Terminal 1 - Run dimensionality reduction demo:
```bash
cd dimreduction-viz
npm install
npm start
# Visit http://localhost:3000
```

2. Terminal 2 - Run clustering demo:
```bash
cd clustering-viz
npm install
npm start
# Visit http://localhost:3001
```

### Extension Development

#### Adding New Datasets
Add to `server/datasets.js`:
```javascript
function prepareMyDataset() {
  return {
    name: '数据集名称',
    nameEn: 'Dataset Name',
    description: '中文描述',
    descriptionEn: 'English description',
    data: [[...], [...]],  // 2D array
    labels: [...],          // Label array
    features: n,            // Number of features
    samples: m              // Number of samples
  };
}
```

#### Adding New Algorithms
Implement in the corresponding algorithm file:
```javascript
function performNewMethod(data, options = {}) {
  const startTime = Date.now();

  // Algorithm implementation
  const result = ...;

  return {
    points: result,       // Reduction result or
    labels: result,       // Cluster labels
    time: Date.now() - startTime
  };
}
```

## Performance Optimization Tips

### Large Dataset Processing
- **Reduction**: t-SNE limited to 1000 samples, UMAP to 2000 samples
- **Clustering**: Mean-Shift sampling to 500 samples
- **Visualization**: Use canvas instead of SVG (data points > 1000)

### Computation Optimization
- Pre-load datasets into memory
- Use Web Workers for background computation
- Implement result caching mechanism

## Known Limitations

1. **High-dimensional data**: Some algorithms degrade on very high-dimensional data (>1000 dims)
2. **Large-scale data**: t-SNE and Mean-Shift are slow on large datasets
3. **Browser compatibility**: Requires modern browsers supporting ES6+ and D3.js v7
4. **Memory constraints**: Large datasets may cause out-of-memory issues

## FAQ

**Q: Can both projects run simultaneously?**
A: Yes, they use different ports (3000 and 3001).

**Q: Why is t-SNE computation slow?**
A: t-SNE has O(n²) time complexity. For large datasets, consider using sampling or UMAP.

**Q: How to change default parameters?**
A: Modify default values in frontend `app.js` or backend `options` default parameters.

**Q: Can datasets be customized?**
A: Yes, add new data loading functions in `server/datasets.js`.

## Contributing

Issues and improvement suggestions are welcome!

1. Fork this project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

ISC

## References

### Algorithm Papers
- **PCA**: Pearson, K. (1901). "On Lines and Planes of Closest Fit to Systems of Points in Space"
- **t-SNE**: van der Maaten, L., & Hinton, G. (2008). "Visualizing Data using t-SNE"
- **UMAP**: McInnes, L., et al. (2018). "UMAP: Uniform Manifold Approximation and Projection"
- **K-Means**: MacQueen, J. (1967). "Some methods for classification and analysis of multivariate observations"
- **Mean-Shift**: Comaniciu, D., & Meer, P. (2002). "Mean Shift: A Robust Approach Toward Feature Space Analysis"
- **MOG**: Dempster, A. P., et al. (1977). "Maximum likelihood from incomplete data via the EM algorithm"

### Related Tools
- [D3.js Documentation](https://d3js.org/)
- [scikit-learn](https://scikit-learn.org/) - Python machine learning library (reference implementation)
- [TensorFlow.js](https://www.tensorflow.org/js) - JavaScript machine learning library

## Contact

Feel free to submit issues for questions or suggestions.

---

**Enjoy your journey exploring machine learning algorithm visualizations!** 🚀
