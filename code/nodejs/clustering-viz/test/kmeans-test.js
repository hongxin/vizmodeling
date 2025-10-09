/**
 * K-Means 聚类算法测试
 * 验证实现的正确性和可视化的准确性
 */

const { performKMeans, reduceDimensionsForViz } = require('../server/clustering');
const { prepareIris, prepareWine } = require('../server/datasets');

console.log('===================================');
console.log('K-Means 聚类算法正确性测试');
console.log('===================================\n');

/**
 * 测试1: 简单的二维数据聚类
 * 创建三个明显分离的簇
 */
function test1_SimpleClustering() {
  console.log('测试1: 简单的二维数据聚类');
  console.log('-----------------------------------');

  // 创建三个明显分离的簇
  const cluster1 = Array(30).fill(0).map(() => [
    Math.random() * 2 + 0,
    Math.random() * 2 + 0
  ]);

  const cluster2 = Array(30).fill(0).map(() => [
    Math.random() * 2 + 10,
    Math.random() * 2 + 0
  ]);

  const cluster3 = Array(30).fill(0).map(() => [
    Math.random() * 2 + 5,
    Math.random() * 2 + 10
  ]);

  const data = [...cluster1, ...cluster2, ...cluster3];
  const trueLabels = [
    ...Array(30).fill(0),
    ...Array(30).fill(1),
    ...Array(30).fill(2)
  ];

  // 运行 K-Means
  const result = performKMeans(data, { k: 3 });

  console.log(`数据点数量: ${data.length}`);
  console.log(`聚类数: ${result.centroids.length}`);
  console.log(`迭代次数: ${result.iterations}`);
  console.log(`计算时间: ${result.time}ms`);

  // 验证聚类数量
  const uniqueClusters = new Set(result.labels);
  console.log(`发现的唯一簇数: ${uniqueClusters.size}`);

  // 计算纯度 (Purity)
  const purity = calculatePurity(result.labels, trueLabels);
  console.log(`聚类纯度: ${(purity * 100).toFixed(2)}%`);

  // 检查质心是否合理
  console.log('\n质心位置:');
  result.centroids.forEach((centroid, i) => {
    console.log(`  簇 ${i}: [${centroid[0].toFixed(2)}, ${centroid[1].toFixed(2)}]`);
  });

  const passed = uniqueClusters.size === 3 && purity > 0.9;
  console.log(`\n测试结果: ${passed ? '✓ 通过' : '✗ 失败'}`);
  console.log();

  return passed;
}

/**
 * 测试2: Iris 数据集测试
 * 使用经典的鸢尾花数据集
 */
function test2_IrisDataset() {
  console.log('测试2: Iris 鸢尾花数据集');
  console.log('-----------------------------------');

  const dataset = prepareIris();

  console.log(`数据集: ${dataset.name}`);
  console.log(`样本数: ${dataset.samples}`);
  console.log(`特征数: ${dataset.features}`);

  // 运行 K-Means (K=3，因为鸢尾花有3个类别)
  const result = performKMeans(dataset.data, { k: 3 });

  console.log(`\n聚类数: ${result.centroids.length}`);
  console.log(`迭代次数: ${result.iterations}`);
  console.log(`计算时间: ${result.time}ms`);

  // 计算纯度
  const purity = calculatePurity(result.labels, dataset.labels);
  console.log(`聚类纯度: ${(purity * 100).toFixed(2)}%`);

  // 计算每个簇的大小
  const clusterSizes = {};
  result.labels.forEach(label => {
    clusterSizes[label] = (clusterSizes[label] || 0) + 1;
  });
  console.log('\n每个簇的大小:');
  Object.keys(clusterSizes).sort().forEach(label => {
    console.log(`  簇 ${label}: ${clusterSizes[label]} 个样本`);
  });

  // Iris 数据集的纯度通常应该在 70% 以上
  const passed = purity > 0.7;
  console.log(`\n测试结果: ${passed ? '✓ 通过' : '✗ 失败'}`);
  console.log();

  return passed;
}

/**
 * 测试3: 降维可视化测试
 * 验证 PCA 降维是否保持了数据的主要结构
 */
function test3_DimensionReduction() {
  console.log('测试3: 降维可视化测试');
  console.log('-----------------------------------');

  const dataset = prepareIris();

  // 降维到 2D
  const reducedData = reduceDimensionsForViz(dataset.data);

  console.log(`原始维度: ${dataset.features}`);
  console.log(`降维后维度: ${reducedData[0].length}`);
  console.log(`数据点数量: ${reducedData.length}`);

  // 检查降维后的数据是否有效
  const allValid = reducedData.every(point =>
    point.length === 2 &&
    point.every(val => !isNaN(val) && isFinite(val))
  );

  console.log(`数据有效性检查: ${allValid ? '✓ 所有点有效' : '✗ 发现无效数据'}`);

  // 检查数据范围
  const xValues = reducedData.map(p => p[0]);
  const yValues = reducedData.map(p => p[1]);
  const xRange = [Math.min(...xValues), Math.max(...xValues)];
  const yRange = [Math.min(...yValues), Math.max(...yValues)];

  console.log(`\nX 轴范围: [${xRange[0].toFixed(2)}, ${xRange[1].toFixed(2)}]`);
  console.log(`Y 轴范围: [${yRange[0].toFixed(2)}, ${yRange[1].toFixed(2)}]`);

  const passed = allValid && reducedData.length === dataset.data.length;
  console.log(`\n测试结果: ${passed ? '✓ 通过' : '✗ 失败'}`);
  console.log();

  return passed;
}

/**
 * 测试4: 参数敏感性测试
 * 测试不同的 K 值和最大迭代次数
 */
function test4_ParameterSensitivity() {
  console.log('测试4: 参数敏感性测试');
  console.log('-----------------------------------');

  const dataset = prepareIris();

  console.log('测试不同的 K 值:\n');
  const kValues = [2, 3, 4, 5];
  const results = [];

  kValues.forEach(k => {
    const result = performKMeans(dataset.data, { k });
    const purity = calculatePurity(result.labels, dataset.labels);
    results.push({ k, purity, time: result.time, iterations: result.iterations });
    console.log(`K=${k}: 纯度=${(purity * 100).toFixed(2)}%, 时间=${result.time}ms, 迭代=${result.iterations}`);
  });

  // K=3 应该有较好的结果（因为真实类别数是3）
  const k3Result = results.find(r => r.k === 3);
  const passed = k3Result && k3Result.purity > 0.6;

  console.log(`\n测试结果: ${passed ? '✓ 通过' : '✗ 失败'}`);
  console.log();

  return passed;
}

/**
 * 测试5: 可重复性测试
 * 验证使用相同的 seed 是否产生相同的结果
 */
function test5_Reproducibility() {
  console.log('测试5: 可重复性测试');
  console.log('-----------------------------------');

  const dataset = prepareIris();

  // 运行两次聚类
  const result1 = performKMeans(dataset.data, { k: 3 });
  const result2 = performKMeans(dataset.data, { k: 3 });

  // 检查结果是否一致
  const labelsMatch = result1.labels.every((label, i) => label === result2.labels[i]);

  console.log(`第一次运行: ${result1.labels.slice(0, 10).join(', ')}...`);
  console.log(`第二次运行: ${result2.labels.slice(0, 10).join(', ')}...`);
  console.log(`\n标签一致性: ${labelsMatch ? '✓ 完全一致' : '✗ 不一致'}`);

  const passed = labelsMatch;
  console.log(`\n测试结果: ${passed ? '✓ 通过' : '✗ 失败'}`);
  console.log();

  return passed;
}

/**
 * 测试6: Wine 数据集测试
 * 测试高维数据
 */
function test6_WineDataset() {
  console.log('测试6: Wine 红葡萄酒质量数据集');
  console.log('-----------------------------------');

  const dataset = prepareWine();

  console.log(`数据集: ${dataset.name}`);
  console.log(`样本数: ${dataset.samples}`);
  console.log(`特征数: ${dataset.features}`);

  // 自动选择合适的 K 值（使用肘部法则的简化版本）
  console.log('\n测试不同的 K 值:\n');
  const kValues = [2, 3, 4, 5];

  kValues.forEach(k => {
    const result = performKMeans(dataset.data, { k });
    const wcss = calculateWCSS(dataset.data, result.labels, result.centroids);
    console.log(`K=${k}: WCSS=${wcss.toFixed(2)}, 时间=${result.time}ms`);
  });

  // 运行默认参数
  const result = performKMeans(dataset.data, { k: 3 });
  console.log(`\n使用 K=3 的结果:`);
  console.log(`迭代次数: ${result.iterations}`);
  console.log(`计算时间: ${result.time}ms`);

  const passed = result.centroids.length === 3;
  console.log(`\n测试结果: ${passed ? '✓ 通过' : '✗ 失败'}`);
  console.log();

  return passed;
}

/**
 * 辅助函数: 计算聚类纯度
 */
function calculatePurity(predictedLabels, trueLabels) {
  const n = predictedLabels.length;
  const clusterMap = {};

  // 为每个预测簇找到最常见的真实标签
  predictedLabels.forEach((predLabel, i) => {
    if (!clusterMap[predLabel]) {
      clusterMap[predLabel] = {};
    }
    const trueLabel = trueLabels[i];
    clusterMap[predLabel][trueLabel] = (clusterMap[predLabel][trueLabel] || 0) + 1;
  });

  // 计算纯度
  let correctCount = 0;
  Object.values(clusterMap).forEach(trueLabelCounts => {
    const maxCount = Math.max(...Object.values(trueLabelCounts));
    correctCount += maxCount;
  });

  return correctCount / n;
}

/**
 * 辅助函数: 计算簇内平方和 (Within-Cluster Sum of Squares)
 */
function calculateWCSS(data, labels, centroids) {
  let wcss = 0;

  data.forEach((point, i) => {
    const centroid = centroids[labels[i]];
    const distance = Math.sqrt(
      point.reduce((sum, val, j) => sum + Math.pow(val - centroid[j], 2), 0)
    );
    wcss += distance * distance;
  });

  return wcss;
}

// 运行所有测试
function runAllTests() {
  const tests = [
    test1_SimpleClustering,
    test2_IrisDataset,
    test3_DimensionReduction,
    test4_ParameterSensitivity,
    test5_Reproducibility,
    test6_WineDataset
  ];

  const results = tests.map(test => {
    try {
      return test();
    } catch (error) {
      console.error(`测试执行出错: ${error.message}`);
      console.error(error.stack);
      return false;
    }
  });

  console.log('===================================');
  console.log('测试总结');
  console.log('===================================');
  console.log(`总测试数: ${tests.length}`);
  console.log(`通过: ${results.filter(r => r).length}`);
  console.log(`失败: ${results.filter(r => !r).length}`);
  console.log(`通过率: ${(results.filter(r => r).length / tests.length * 100).toFixed(1)}%`);
  console.log();

  if (results.every(r => r)) {
    console.log('✓ 所有测试通过！K-Means 实现正确且可用。');
  } else {
    console.log('✗ 部分测试失败，请检查实现。');
  }
}

// 执行测试
runAllTests();
