// 国际化
const i18n = {
  zh: {
    'title': '数据聚类可视化演示',
    'main-title': '数据聚类可视化演示',
    'subtitle': '对比K-Means、Mean-Shift、MOG三种聚类方法',
    'select-dataset': '选择数据集:',
    'loading': '加载中...',
    'clustering-method': '聚类方法:',
    'dim-reduction-method': '降维方法:',
    'compare-display': '对比显示',
    'kmeans-params-title': 'K-Means 参数',
    'meanshift-params-title': 'Mean-Shift 参数',
    'mog-params-title': 'MOG 参数',
    'n-clusters': '聚类数 K',
    'bandwidth': '带宽 (Bandwidth)',
    'n-components': '混合成分数 K',
    'computing': '计算中...',
    'comparison-title': '方法对比说明',
    'kmeans-note': 'K-Means: 快速高效，需指定聚类数，适合球形簇',
    'meanshift-note': 'Mean-Shift: 自动发现聚类数，基于密度，适合任意形状',
    'mog-note': 'MOG: 概率模型，软聚类，适合重叠数据',
    'computing-time': '计算时间',
    'num-clusters': '聚类数',
    'cluster': '簇',
    'samples': '样本',
    'dimensions': '维'
  },
  en: {
    'title': 'Data Clustering Visualization',
    'main-title': 'Data Clustering Visualization',
    'subtitle': 'Compare K-Means, Mean-Shift, and MOG Clustering Methods',
    'select-dataset': 'Select Dataset:',
    'loading': 'Loading...',
    'clustering-method': 'Clustering Method:',
    'dim-reduction-method': 'Dimension Reduction:',
    'compare-display': 'Compare',
    'kmeans-params-title': 'K-Means Parameters',
    'meanshift-params-title': 'Mean-Shift Parameters',
    'mog-params-title': 'MOG Parameters',
    'n-clusters': 'Number of Clusters K',
    'bandwidth': 'Bandwidth',
    'n-components': 'Number of Components K',
    'computing': 'Computing...',
    'comparison-title': 'Method Comparison Notes',
    'kmeans-note': 'K-Means: Fast and efficient, requires specifying number of clusters, suitable for spherical clusters',
    'meanshift-note': 'Mean-Shift: Automatically discovers number of clusters, density-based, suitable for arbitrary shapes',
    'mog-note': 'MOG: Probabilistic model, soft clustering, suitable for overlapping data',
    'computing-time': 'Time',
    'num-clusters': 'Clusters',
    'cluster': 'Cluster',
    'samples': ' samples',
    'dimensions': ' dims'
  }
};

let currentLang = 'zh';

function t(key) {
  return i18n[currentLang][key] || key;
}

function switchLanguage(lang) {
  currentLang = lang;

  // 更新标题
  document.title = t('title');

  // 更新所有带 data-i18n 属性的元素
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });

  // 更新语言按钮状态
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // 重新加载数据集信息
  updateDatasetSelect();
  if (currentDataset) {
    updateDatasetInfo();
  }

  // 重新渲染可视化（如果存在）
  if (currentMethod && currentResult) {
    visualizeResults(currentResult, currentMethod);
  }
}

// 全局变量
let datasets = [];
let currentDataset = null;
let currentMethod = null;
let currentResult = null;
let currentDimReduction = 'pca';  // 当前降维方法

// 颜色方案
const colorScheme = d3.schemeCategory10.concat(d3.schemePaired);

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadDatasets();
  setupEventListeners();
});

// 加载数据集列表
async function loadDatasets() {
  try {
    const response = await fetch('http://localhost:3001/api/datasets');
    datasets = await response.json();
    updateDatasetSelect();
  } catch (error) {
    console.error('Failed to load datasets:', error);
  }
}

// 更新数据集选择器
function updateDatasetSelect() {
  const select = document.getElementById('dataset-select');
  select.innerHTML = datasets.map(ds =>
    `<option value="${ds.id}">${currentLang === 'zh' ? ds.name : ds.nameEn}</option>`
  ).join('');

  if (datasets.length > 0) {
    currentDataset = datasets[0];
    updateDatasetInfo();
  }
}

// 更新数据集信息
function updateDatasetInfo() {
  const infoBox = document.getElementById('dataset-info');
  const desc = currentLang === 'zh' ? currentDataset.description : currentDataset.descriptionEn;
  infoBox.textContent = desc;
}

// 设置事件监听
function setupEventListeners() {
  // 语言切换
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
  });

  // 数据集选择
  document.getElementById('dataset-select').addEventListener('change', (e) => {
    currentDataset = datasets.find(ds => ds.id === e.target.value);
    updateDatasetInfo();

    // 如果已经选择了方法，重新执行聚类
    if (currentMethod) {
      if (currentMethod === 'compare') {
        performComparison();
      } else {
        performClustering(currentMethod);
      }
    }
  });

  // 聚类方法选择
  document.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const method = btn.dataset.method;

      // 更新按钮状态
      document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 显示/隐藏参数控制
      document.getElementById('kmeans-params').style.display =
        method === 'kmeans' ? 'block' : 'none';
      document.getElementById('meanshift-params').style.display =
        method === 'meanshift' ? 'block' : 'none';
      document.getElementById('mog-params').style.display =
        method === 'mog' ? 'block' : 'none';

      // 执行聚类或对比
      currentMethod = method;
      if (method === 'compare') {
        performComparison();
      } else {
        performClustering(method);
      }
    });
  });

  // 降维方法选择
  document.querySelectorAll('.dim-reduction-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dimReduction = btn.dataset.dimreduction;

      // 更新按钮状态
      document.querySelectorAll('.dim-reduction-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 更新当前降维方法
      currentDimReduction = dimReduction;

      // 如果已经选择了聚类方法，重新执行
      if (currentMethod) {
        if (currentMethod === 'compare') {
          performComparison();
        } else {
          performClustering(currentMethod);
        }
      }
    });
  });

  // 参数控制
  const kSlider = document.getElementById('k');
  kSlider.addEventListener('input', (e) => {
    document.getElementById('k-value').textContent = e.target.value;
  });
  kSlider.addEventListener('change', () => {
    if (currentMethod === 'kmeans') performClustering('kmeans');
  });

  const bwSlider = document.getElementById('bandwidth');
  bwSlider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    document.getElementById('bandwidth-value').textContent =
      value === 0 ? (currentLang === 'zh' ? '自动' : 'Auto') : value.toFixed(1);
  });
  bwSlider.addEventListener('change', () => {
    if (currentMethod === 'meanshift') performClustering('meanshift');
  });

  const mogKSlider = document.getElementById('mog-k');
  mogKSlider.addEventListener('input', (e) => {
    document.getElementById('mog-k-value').textContent = e.target.value;
  });
  mogKSlider.addEventListener('change', () => {
    if (currentMethod === 'mog') performClustering('mog');
  });
}

// 执行聚类
async function performClustering(method) {
  if (!currentDataset) return;

  showLoading(true);

  try {
    const options = getMethodOptions(method);

    const response = await fetch('http://localhost:3001/api/cluster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        datasetId: currentDataset.id,
        method: method,
        options: options,
        dimReduction: currentDimReduction
      })
    });

    const result = await response.json();
    currentResult = result;

    // 显示结果
    document.getElementById('single-view').style.display = 'block';
    document.getElementById('compare-view').style.display = 'none';

    visualizeResults(result, method);

  } catch (error) {
    console.error('Clustering failed:', error);
    alert(`${currentLang === 'zh' ? '聚类计算失败' : 'Clustering failed'}: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// 执行对比
async function performComparison() {
  if (!currentDataset) return;

  showLoading(true);

  try {
    const k = parseInt(document.getElementById('k').value);
    const bandwidth = parseFloat(document.getElementById('bandwidth').value);
    const mogK = parseInt(document.getElementById('mog-k').value);

    const response = await fetch('http://localhost:3001/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        datasetId: currentDataset.id,
        methods: ['kmeans', 'meanshift', 'mog'],
        options: {
          kmeans: { k: k },
          meanshift: bandwidth > 0 ? { bandwidth: bandwidth } : {},
          mog: { k: mogK }
        },
        dimReduction: currentDimReduction
      })
    });

    const result = await response.json();

    // 显示对比结果
    document.getElementById('single-view').style.display = 'none';
    document.getElementById('compare-view').style.display = 'block';

    visualizeComparison(result);

  } catch (error) {
    console.error('Comparison failed:', error);
    alert(`${currentLang === 'zh' ? '对比计算失败' : 'Comparison failed'}: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// 获取方法参数
function getMethodOptions(method) {
  switch (method) {
    case 'kmeans':
      return { k: parseInt(document.getElementById('k').value) };
    case 'meanshift':
      const bandwidth = parseFloat(document.getElementById('bandwidth').value);
      return bandwidth > 0 ? { bandwidth: bandwidth } : {};
    case 'mog':
      return { k: parseInt(document.getElementById('mog-k').value) };
    default:
      return {};
  }
}

// 可视化单个结果
function visualizeResults(result, method) {
  const methodNames = {
    'kmeans': 'K-Means',
    'meanshift': 'Mean-Shift',
    'mog': 'MOG'
  };

  document.getElementById('single-title').textContent = methodNames[method];

  // 更新指标
  const metricsHtml = `
    <div class="metric-item">
      <span class="metric-label">${t('computing-time')}:</span>
      <span class="metric-value">${result.result.time}ms</span>
    </div>
    <div class="metric-item">
      <span class="metric-label">${t('num-clusters')}:</span>
      <span class="metric-value">${result.result.numClusters}</span>
    </div>
  `;
  document.getElementById('single-metrics').innerHTML = metricsHtml;

  // 可视化
  const svg = d3.select('#single-viz');
  const width = 900;
  const height = 600;
  svg.attr('width', width).attr('height', height);

  drawScatterPlot(svg, result.result.points, result.result.labels,
                  result.result.centroids, width, height);

  // 更新图例
  updateLegend('single-legend', result.result.labels, result.result.trueLabels);
}

// 可视化对比结果
function visualizeComparison(result) {
  const methods = ['kmeans', 'meanshift', 'mog'];
  const width = 400;
  const height = 350;

  methods.forEach(method => {
    const methodResult = result.results[method];

    // 更新指标
    const metricsHtml = `
      <div class="metric-item">
        <span class="metric-label">${t('computing-time')}:</span>
        <span class="metric-value">${methodResult.time}ms</span>
      </div>
      <div class="metric-item">
        <span class="metric-label">${t('num-clusters')}:</span>
        <span class="metric-value">${methodResult.numClusters}</span>
      </div>
    `;
    document.getElementById(`${method}-metrics`).innerHTML = metricsHtml;

    // 可视化
    const svg = d3.select(`#${method}-viz`);
    svg.attr('width', width).attr('height', height);

    drawScatterPlot(svg, result.points, methodResult.labels,
                    methodResult.centroids, width, height);
  });

  // 更新图例
  updateLegend('compare-legend', result.results.kmeans.labels, result.trueLabels);
}

// 绘制散点图
function drawScatterPlot(svg, points, labels, centroids, width, height) {
  svg.selectAll('*').remove();

  // 计算数据范围
  const xExtent = d3.extent(points, d => d[0]);
  const yExtent = d3.extent(points, d => d[1]);

  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 比例尺
  const xScale = d3.scaleLinear()
    .domain([xExtent[0] - 1, xExtent[1] + 1])
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([yExtent[0] - 1, yExtent[1] + 1])
    .range([innerHeight, 0]);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // 数据点
  g.selectAll('.point')
    .data(points)
    .enter()
    .append('circle')
    .attr('class', 'point')
    .attr('cx', d => xScale(d[0]))
    .attr('cy', d => yScale(d[1]))
    .attr('r', 3)
    .attr('fill', (d, i) => colorScheme[labels[i] % colorScheme.length])
    .attr('opacity', 0.7)
    .attr('stroke', '#fff')
    .attr('stroke-width', 0.5);

  // 中心点
  if (centroids && centroids.length > 0) {
    g.selectAll('.centroid')
      .data(centroids)
      .enter()
      .append('circle')
      .attr('class', 'centroid')
      .attr('cx', d => xScale(d[0]))
      .attr('cy', d => yScale(d[1]))
      .attr('r', 8)
      .attr('fill', (d, i) => colorScheme[i % colorScheme.length])
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    // 十字标记
    g.selectAll('.centroid-mark')
      .data(centroids)
      .enter()
      .append('text')
      .attr('class', 'centroid-mark')
      .attr('x', d => xScale(d[0]))
      .attr('y', d => yScale(d[1]))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '12px')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .text('✕');
  }
}

// 更新图例
function updateLegend(legendId, predictedLabels, trueLabels) {
  const legend = document.getElementById(legendId);
  const uniqueLabels = [...new Set(predictedLabels)].sort((a, b) => a - b);

  legend.innerHTML = uniqueLabels.map(label => {
    const count = predictedLabels.filter(l => l === label).length;
    return `
      <div class="legend-item">
        <div class="legend-color" style="background-color: ${colorScheme[label % colorScheme.length]}"></div>
        <span>${t('cluster')} ${label} (${count}${t('samples')})</span>
      </div>
    `;
  }).join('');
}

// 显示/隐藏加载动画
function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}
