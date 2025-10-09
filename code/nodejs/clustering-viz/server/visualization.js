/**
 * 可视化辅助函数
 * 在降维后的空间中计算聚类中心，确保代表性
 */

/**
 * 在降维后的 2D 空间中重新计算聚类中心
 * @param {Array<Array<number>>} reducedPoints - 降维后的数据点 (2D)
 * @param {Array<number>} labels - 聚类标签
 * @returns {Array<Array<number>>} 降维空间中的聚类中心
 */
function computeReducedCentroids(reducedPoints, labels) {
  // 找出所有唯一的标签
  const uniqueLabels = [...new Set(labels)].sort((a, b) => a - b);

  const centroids = uniqueLabels.map(label => {
    // 找到属于当前簇的所有点
    const clusterPoints = reducedPoints.filter((_, i) => labels[i] === label);

    if (clusterPoints.length === 0) {
      return [0, 0]; // 空簇，返回原点
    }

    // 计算均值
    const sum = clusterPoints.reduce(
      (acc, point) => [acc[0] + point[0], acc[1] + point[1]],
      [0, 0]
    );

    return [
      sum[0] / clusterPoints.length,
      sum[1] / clusterPoints.length
    ];
  });

  return centroids;
}

/**
 * 计算降维质量指标
 * @param {Array<Array<number>>} originalData - 原始高维数据
 * @param {Array<Array<number>>} reducedData - 降维后的 2D 数据
 * @param {Array<number>} labels - 聚类标签
 * @returns {Object} 质量指标
 */
function computeVisualizationQuality(originalData, reducedData, labels) {
  // TODO: 实现 trustworthiness 和 continuity 指标
  // 这里暂时返回占位符
  return {
    trustworthiness: null,
    continuity: null
  };
}

module.exports = {
  computeReducedCentroids,
  computeVisualizationQuality
};
