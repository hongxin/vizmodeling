const express = require('express');
const cors = require('cors');
const path = require('path');

const { prepareMNISTSmall, prepareMNISTMedium, prepareIris, prepareWine } = require('./datasets');
const { performKMeans, performMeanShift, performMOG, reduceDimensionsForViz } = require('./clustering');

const app = express();
const PORT = 3001;

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

// 执行聚类
app.post('/api/cluster', async (req, res) => {
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
      case 'kmeans':
        result = performKMeans(dataset.data, options);
        break;
      case 'meanshift':
        result = performMeanShift(dataset.data, options);
        break;
      case 'mog':
        result = performMOG(dataset.data, options);
        break;
      default:
        return res.status(400).json({ error: 'Invalid method' });
    }

    // 降维用于可视化
    const reducedData = reduceDimensionsForViz(dataset.data);

    res.json({
      method: method,
      dataset: {
        id: datasetId,
        name: dataset.name,
        samples: dataset.samples,
        features: dataset.features
      },
      result: {
        points: reducedData,
        labels: result.labels,
        predictedLabels: result.labels,
        trueLabels: dataset.labels,
        centroids: result.centroids ? reduceDimensionsForViz(result.centroids) : null,
        time: result.time,
        numClusters: result.centroids ? result.centroids.length : new Set(result.labels).size
      }
    });

  } catch (error) {
    console.error('Error during clustering:', error);
    res.status(500).json({ error: error.message });
  }
});

// 批量对比聚类方法
app.post('/api/compare', async (req, res) => {
  try {
    const { datasetId, methods = ['kmeans', 'meanshift', 'mog'], options = {} } = req.body;

    if (!datasetId) {
      return res.status(400).json({ error: 'Missing datasetId' });
    }

    const dataset = datasets[datasetId];
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    console.log(`\nComparing methods for ${dataset.name}:`, methods);

    const reducedData = reduceDimensionsForViz(dataset.data);
    const results = {};

    for (const method of methods) {
      console.log(`Processing ${method.toUpperCase()}...`);
      let result;

      switch (method.toLowerCase()) {
        case 'kmeans':
          result = performKMeans(dataset.data, options.kmeans || {});
          break;
        case 'meanshift':
          result = performMeanShift(dataset.data, options.meanshift || {});
          break;
        case 'mog':
          result = performMOG(dataset.data, options.mog || {});
          break;
        default:
          continue;
      }

      results[method] = {
        labels: result.labels,
        centroids: result.centroids ? reduceDimensionsForViz(result.centroids) : null,
        time: result.time,
        numClusters: result.centroids ? result.centroids.length : new Set(result.labels).size
      };
    }

    res.json({
      dataset: {
        id: datasetId,
        name: dataset.name,
        samples: dataset.samples,
        features: dataset.features
      },
      points: reducedData,
      trueLabels: dataset.labels,
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
  console.log(`Clustering Visualization Server`);
  console.log(`=================================`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`\nInitializing...`);

  initDatasets();

  console.log(`\nReady! Open http://localhost:${PORT} in your browser\n`);
});
