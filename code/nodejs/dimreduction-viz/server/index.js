const express = require('express');
const cors = require('cors');
const path = require('path');

const { prepareMNISTSmall, prepareMNISTMedium, prepareMNISTLarge, prepareIris, prepareWine } = require('./datasets');
const { performPCA, performTSNE, performUMAP } = require('./dimensionality-reduction');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 缓存数据集
const datasets = {};

// 初始化数据集
function initDatasets() {
  console.log('Initializing datasets...');
  datasets['mnist-small'] = prepareMNISTSmall();
  datasets['mnist-medium'] = prepareMNISTMedium();
  datasets['mnist-large'] = prepareMNISTLarge();
  datasets.iris = prepareIris();
  datasets.wine = prepareWine();
  console.log('Datasets ready:', Object.keys(datasets));
}

// 获取数据集列表
app.get('/api/datasets', (req, res) => {
  const datasetInfo = Object.keys(datasets).map(key => ({
    id: key,
    name: datasets[key].name,
    nameEn: datasets[key].nameEn,
    description: datasets[key].description,
    descriptionEn: datasets[key].descriptionEn,
    features: datasets[key].features,
    samples: datasets[key].samples
  }));
  res.json(datasetInfo);
});

// 获取特定数据集
app.get('/api/dataset/:id', (req, res) => {
  const datasetId = req.params.id;
  const dataset = datasets[datasetId];

  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found' });
  }

  res.json(dataset);
});

// 执行降维
app.post('/api/reduce', async (req, res) => {
  try {
    const { datasetId, method, options = {} } = req.body;

    if (!datasetId || !method) {
      return res.status(400).json({ error: 'Missing datasetId or method' });
    }

    const dataset = datasets[datasetId];
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    console.log(`\nProcessing: ${dataset.name} with ${method.toUpperCase()}`);

    let result;
    switch (method.toLowerCase()) {
      case 'pca':
        result = performPCA(dataset.data, options.nComponents || 2);
        break;
      case 'tsne':
        result = performTSNE(dataset.data, options);
        break;
      case 'umap':
        result = performUMAP(dataset.data, options);
        break;
      default:
        return res.status(400).json({ error: 'Invalid method' });
    }

    res.json({
      method: method,
      dataset: {
        id: datasetId,
        name: dataset.name,
        samples: dataset.samples,
        features: dataset.features
      },
      result: {
        points: result.points,
        labels: dataset.labels,
        time: result.time,
        variance: result.variance
      }
    });

  } catch (error) {
    console.error('Error during dimension reduction:', error);
    res.status(500).json({ error: error.message });
  }
});

// 批量对比降维方法
app.post('/api/compare', async (req, res) => {
  try {
    const { datasetId, methods = ['pca', 'tsne', 'umap'], options = {} } = req.body;

    if (!datasetId) {
      return res.status(400).json({ error: 'Missing datasetId' });
    }

    const dataset = datasets[datasetId];
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    console.log(`\nComparing methods for ${dataset.name}:`, methods);

    const results = {};

    for (const method of methods) {
      console.log(`Processing ${method.toUpperCase()}...`);
      let result;

      switch (method.toLowerCase()) {
        case 'pca':
          result = performPCA(dataset.data, options.nComponents || 2);
          break;
        case 'tsne':
          result = performTSNE(dataset.data, options.tsne || {});
          break;
        case 'umap':
          result = performUMAP(dataset.data, options.umap || {});
          break;
        default:
          continue;
      }

      results[method] = {
        points: result.points,
        time: result.time,
        variance: result.variance
      };
    }

    res.json({
      dataset: {
        id: datasetId,
        name: dataset.name,
        samples: dataset.samples,
        features: dataset.features
      },
      labels: dataset.labels,
      results: results
    });

  } catch (error) {
    console.error('Error during comparison:', error);
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`Dimensionality Reduction Visualization Server`);
  console.log(`=================================`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`\nInitializing...`);

  initDatasets();

  console.log(`\nReady! Open http://localhost:${PORT} in your browser\n`);
});
