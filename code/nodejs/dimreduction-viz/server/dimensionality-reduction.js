const { PCA } = require('ml-pca');
const { Matrix } = require('ml-matrix');
const TSNE = require('tsne-js');
const { UMAP } = require('umap-js');

// PCA降维
function performPCA(data, nComponents = 2) {
  console.log(`PCA: Processing ${data.length} samples...`);
  const startTime = Date.now();

  const matrix = new Matrix(data);
  const pca = new PCA(matrix);
  const result = pca.predict(matrix, { nComponents });

  const endTime = Date.now();
  console.log(`PCA completed in ${endTime - startTime}ms`);

  return {
    points: result.to2DArray(),
    variance: pca.getExplainedVariance().slice(0, nComponents),
    time: endTime - startTime
  };
}

// t-SNE降维
function performTSNE(data, options = {}) {
  console.log(`t-SNE: Processing ${data.length} samples...`);
  const startTime = Date.now();

  const {
    perplexity = 30,
    epsilon = 10,
    dim = 2
  } = options;

  const model = new TSNE({
    dim: dim,
    perplexity: perplexity,
    earlyExaggeration: 4.0,
    learningRate: epsilon,
    nIter: 1000,
    metric: 'euclidean'
  });

  model.init({
    data: data,
    type: 'dense'
  });

  // 运行t-SNE
  model.run();

  const result = model.getOutput();

  const endTime = Date.now();
  console.log(`t-SNE completed in ${endTime - startTime}ms`);

  return {
    points: result,
    time: endTime - startTime
  };
}

// UMAP降维
function performUMAP(data, options = {}) {
  console.log(`UMAP: Processing ${data.length} samples...`);
  const startTime = Date.now();

  const {
    nComponents = 2,
    nNeighbors = 15,
    minDist = 0.1,
    nEpochs = 400
  } = options;

  const umap = new UMAP({
    nComponents: nComponents,
    nNeighbors: nNeighbors,
    minDist: minDist,
    nEpochs: nEpochs
  });

  const embedding = umap.fit(data);

  const endTime = Date.now();
  console.log(`UMAP completed in ${endTime - startTime}ms`);

  return {
    points: embedding,
    time: endTime - startTime
  };
}

module.exports = {
  performPCA,
  performTSNE,
  performUMAP
};
