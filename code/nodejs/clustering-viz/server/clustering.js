const { kmeans } = require('ml-kmeans');
const { Matrix } = require('ml-matrix');
const { PCA } = require('ml-pca');

// K-Means聚类
function performKMeans(data, options = {}) {
  console.log(`K-Means: Processing ${data.length} samples...`);
  const startTime = Date.now();

  const {
    k = 10,
    maxIterations = 100,
    initialization = 'kmeans++'
  } = options;

  const result = kmeans(data, k, {
    maxIterations,
    initialization,
    seed: 42
  });

  const endTime = Date.now();
  console.log(`K-Means completed in ${endTime - startTime}ms, clusters: ${result.centroids.length}`);

  return {
    labels: result.clusters,
    centroids: result.centroids,
    iterations: result.iterations,
    time: endTime - startTime
  };
}

// Mean-Shift聚类（简化实现）
function performMeanShift(data, options = {}) {
  console.log(`Mean-Shift: Processing ${data.length} samples...`);
  const startTime = Date.now();

  const {
    bandwidth = null,
    maxIterations = 100
  } = options;

  // 对高维数据先降维（避免维度灾难）
  let workingData = data;
  const d = data[0].length;
  if (d > 50) {
    console.log(`  Reducing dimensions from ${d} to 50 for Mean-Shift...`);
    const matrix = new Matrix(data);
    const pca = new PCA(matrix);
    const reduced = pca.predict(matrix, { nComponents: 50 });
    workingData = reduced.to2DArray();
  }

  // 自动估计bandwidth（如果未提供）
  const bw = bandwidth || estimateBandwidth(workingData);
  console.log(`  Using bandwidth: ${bw.toFixed(4)}`);

  // 对于大数据集，使用采样以提高性能
  const sampleSize = Math.min(workingData.length, 300);
  const sampledData = workingData.length > sampleSize ?
    sampleData(workingData, sampleSize) : workingData;

  const centers = [];
  const processed = new Set();

  // 为每个采样点寻找模式中心
  for (let i = 0; i < sampledData.length; i++) {
    if (processed.has(i)) continue;

    let current = [...sampledData[i]];
    let converged = false;
    let iter = 0;

    while (!converged && iter < maxIterations) {
      const neighbors = findNeighbors(sampledData, current, bw);
      if (neighbors.length === 0) break;

      const newCenter = computeMean(neighbors);
      const shift = euclideanDistance(current, newCenter);

      current = newCenter;
      converged = shift < 0.01;
      iter++;
    }

    // 合并相近的中心（使用更大的阈值）
    let merged = false;
    const mergeThreshold = bw * 0.5;
    for (let j = 0; j < centers.length; j++) {
      if (euclideanDistance(current, centers[j]) < mergeThreshold) {
        merged = true;
        break;
      }
    }

    if (!merged) {
      centers.push(current);
    }
    processed.add(i);
  }

  // 为工作数据分配标签
  const labels = workingData.map(point => {
    let minDist = Infinity;
    let label = 0;
    centers.forEach((center, idx) => {
      const dist = euclideanDistance(point, center);
      if (dist < minDist) {
        minDist = dist;
        label = idx;
      }
    });
    return label;
  });

  const endTime = Date.now();
  console.log(`Mean-Shift completed in ${endTime - startTime}ms, clusters: ${centers.length}`);

  return {
    labels: labels,
    centroids: centers,
    bandwidth: bw,
    time: endTime - startTime
  };
}

// MOG (Mixture of Gaussians) 聚类使用EM算法
function performMOG(data, options = {}) {
  console.log(`MOG: Processing ${data.length} samples...`);
  const startTime = Date.now();

  const {
    k = 10,
    maxIterations = 100,
    tolerance = 1e-6
  } = options;

  const n = data.length;
  const d = data[0].length;

  // 初始化：使用K-Means初始化
  const kmeansResult = kmeans(data, k, { maxIterations: 10, seed: 42 });

  // 初始化参数
  let weights = new Array(k).fill(1 / k);
  let means = kmeansResult.centroids.map(c => [...c]);
  let covariances = initializeCovariances(data, means, kmeansResult.clusters, d, k);

  let prevLogLikelihood = -Infinity;

  // EM迭代
  for (let iter = 0; iter < maxIterations; iter++) {
    // E-step: 计算后验概率（使用对数空间避免下溢）
    const responsibilities = new Array(n).fill(null).map(() => new Array(k));

    for (let i = 0; i < n; i++) {
      // 计算对数概率
      const logProbs = new Array(k);
      for (let j = 0; j < k; j++) {
        logProbs[j] = Math.log(weights[j] + 1e-10) + gaussianLogPDF(data[i], means[j], covariances[j]);
      }

      // log-sum-exp 技巧避免下溢
      const maxLogProb = Math.max(...logProbs);
      const sumExp = logProbs.reduce((sum, lp) => sum + Math.exp(lp - maxLogProb), 0);
      const logSumExp = maxLogProb + Math.log(sumExp);

      // 归一化后验概率
      for (let j = 0; j < k; j++) {
        responsibilities[i][j] = Math.exp(logProbs[j] - logSumExp);
      }
    }

    // M-step: 更新参数
    for (let j = 0; j < k; j++) {
      const Nj = responsibilities.reduce((sum, r) => sum + r[j], 0);

      // 更新权重
      weights[j] = Nj / n;

      // 更新均值
      const newMean = new Array(d).fill(0);
      for (let i = 0; i < n; i++) {
        for (let dim = 0; dim < d; dim++) {
          newMean[dim] += responsibilities[i][j] * data[i][dim];
        }
      }
      means[j] = newMean.map(v => v / (Nj + 1e-10));

      // 更新协方差（简化为对角协方差）
      const newCov = new Array(d).fill(0);
      for (let i = 0; i < n; i++) {
        for (let dim = 0; dim < d; dim++) {
          const diff = data[i][dim] - means[j][dim];
          newCov[dim] += responsibilities[i][j] * diff * diff;
        }
      }
      covariances[j] = newCov.map(v => Math.max(v / (Nj + 1e-10), 1e-6));
    }

    // 计算对数似然
    const logLikelihood = computeLogLikelihood(data, weights, means, covariances);

    if (Math.abs(logLikelihood - prevLogLikelihood) < tolerance) {
      console.log(`MOG converged at iteration ${iter + 1}`);
      break;
    }
    prevLogLikelihood = logLikelihood;
  }

  // 分配标签（使用对数概率）
  const labels = data.map(point => {
    let maxLogProb = -Infinity;
    let label = 0;
    for (let j = 0; j < k; j++) {
      const logProb = Math.log(weights[j] + 1e-10) + gaussianLogPDF(point, means[j], covariances[j]);
      if (logProb > maxLogProb) {
        maxLogProb = logProb;
        label = j;
      }
    }
    return label;
  });

  const endTime = Date.now();
  console.log(`MOG completed in ${endTime - startTime}ms, clusters: ${k}`);

  return {
    labels: labels,
    centroids: means,
    covariances: covariances,
    weights: weights,
    time: endTime - startTime
  };
}

// 辅助函数
function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

function estimateBandwidth(data) {
  // 使用Scott's rule估计bandwidth
  const n = data.length;
  const d = data[0].length;

  // 计算每个维度的标准差
  const stds = new Array(d).fill(0);
  const means = new Array(d).fill(0);

  for (let dim = 0; dim < d; dim++) {
    means[dim] = data.reduce((sum, point) => sum + point[dim], 0) / n;
    stds[dim] = Math.sqrt(
      data.reduce((sum, point) => sum + Math.pow(point[dim] - means[dim], 2), 0) / n
    );
  }

  const avgStd = stds.reduce((sum, std) => sum + std, 0) / d;
  return avgStd * Math.pow(n, -1 / (d + 4));
}

function findNeighbors(data, center, bandwidth) {
  return data.filter(point => euclideanDistance(point, center) < bandwidth);
}

function computeMean(points) {
  const d = points[0].length;
  const mean = new Array(d).fill(0);
  points.forEach(point => {
    point.forEach((val, dim) => {
      mean[dim] += val;
    });
  });
  return mean.map(v => v / points.length);
}

function sampleData(data, size) {
  const sampled = [];
  const indices = new Set();
  while (sampled.length < size) {
    const idx = Math.floor(Math.random() * data.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      sampled.push(data[idx]);
    }
  }
  return sampled;
}

function initializeCovariances(data, means, labels, d, k) {
  const covariances = new Array(k).fill(null).map(() => new Array(d).fill(1.0));

  for (let j = 0; j < k; j++) {
    const clusterPoints = data.filter((_, i) => labels[i] === j);
    if (clusterPoints.length > 0) {
      for (let dim = 0; dim < d; dim++) {
        const variance = clusterPoints.reduce((sum, point) => {
          return sum + Math.pow(point[dim] - means[j][dim], 2);
        }, 0) / clusterPoints.length;
        covariances[j][dim] = Math.max(variance, 0.01);
      }
    }
  }

  return covariances;
}

// 计算高斯分布的对数概率密度（避免数值下溢）
function gaussianLogPDF(x, mean, cov) {
  const d = x.length;
  let exponent = 0;
  let logDet = 0;

  for (let i = 0; i < d; i++) {
    const diff = x[i] - mean[i];
    exponent += (diff * diff) / cov[i];
    logDet += Math.log(cov[i]);
  }

  const logCoefficient = -0.5 * (d * Math.log(2 * Math.PI) + logDet);
  return logCoefficient - 0.5 * exponent;
}

// 保留原函数用于兼容，但改用对数空间
function gaussianPDF(x, mean, cov) {
  return Math.exp(gaussianLogPDF(x, mean, cov));
}

function computeLogLikelihood(data, weights, means, covariances) {
  return data.reduce((logLike, point) => {
    // 使用对数空间计算
    const logProbs = weights.map((w, j) =>
      Math.log(w + 1e-10) + gaussianLogPDF(point, means[j], covariances[j])
    );

    // log-sum-exp
    const maxLogProb = Math.max(...logProbs);
    const sumExp = logProbs.reduce((sum, lp) => sum + Math.exp(lp - maxLogProb), 0);
    const logSumExp = maxLogProb + Math.log(sumExp);

    return logLike + logSumExp;
  }, 0);
}

// 使用PCA降维用于可视化
function reduceDimensionsForViz(data) {
  if (data[0].length <= 2) {
    return data;
  }

  const matrix = new Matrix(data);
  const pca = new PCA(matrix);
  const reduced = pca.predict(matrix, { nComponents: 2 });

  return reduced.to2DArray();
}

module.exports = {
  performKMeans,
  performMeanShift,
  performMOG,
  reduceDimensionsForViz
};
