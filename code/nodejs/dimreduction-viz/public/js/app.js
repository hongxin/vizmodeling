// API基础URL
const API_BASE = 'http://localhost:3000/api';

// 全局状态
let currentDataset = null;
let currentDatasetId = null;
let datasets = [];
let currentMethod = null;
let currentLang = 'zh'; // 默认中文

// 颜色方案 - 为不同的类别分配颜色
const colorSchemes = {
    10: d3.schemeCategory10,
    categorical: d3.schemePaired
};

// 多语言文本映射
const i18n = {
    zh: {
        'title': '高维数据降维可视化演示',
        'main-title': '高维数据降维可视化演示',
        'subtitle': '对比PCA、t-SNE、UMAP三种降维方法',
        'select-dataset': '选择数据集:',
        'loading': '加载中...',
        'reduction-method': '降维方法:',
        'compare-display': '对比显示',
        'tsne-params-title': 't-SNE 参数',
        'learning-rate': '学习率',
        'umap-params-title': 'UMAP 参数',
        'n-neighbors': '邻居数',
        'min-distance': '最小距离',
        'computing': '计算中...',
        'pca-desc': '(线性降维)',
        'tsne-desc': '(非线性降维)',
        'umap-desc': '(非线性降维)',
        'comparison-title': '方法对比说明',
        'pca-note': '<strong>PCA</strong>: 线性降维方法，保持全局结构，计算速度快',
        'tsne-note': '<strong>t-SNE</strong>: 非线性降维，擅长保持局部结构，聚类效果好',
        'umap-note': '<strong>UMAP</strong>: 非线性降维，同时保持局部和全局结构，速度较快',
        'select-dataset-placeholder': '-- 选择数据集 --',
        'samples': '样本',
        'dimensions': '维',
        'dataset-info-template': '<strong>{name}</strong><br>{description}<br>样本数: {samples} | 特征维度: {features}',
        'select-dataset-first': '请先选择一个数据集',
        'load-dataset-error': '加载数据集失败，请确保服务器正在运行',
        'load-dataset-failed': '加载数据集失败',
        'reduction-error': '降维计算失败',
        'comparison-error': '对比计算失败',
        'computing-time': '计算时间',
        'explained-variance': '解释方差',
        'category': '类别',
        'coordinates': '坐标'
    },
    en: {
        'title': 'High-Dimensional Data Reduction Visualization',
        'main-title': 'High-Dimensional Data Reduction Visualization',
        'subtitle': 'Compare PCA, t-SNE, and UMAP Dimensionality Reduction Methods',
        'select-dataset': 'Select Dataset:',
        'loading': 'Loading...',
        'reduction-method': 'Reduction Method:',
        'compare-display': 'Compare',
        'tsne-params-title': 't-SNE Parameters',
        'learning-rate': 'Learning Rate',
        'umap-params-title': 'UMAP Parameters',
        'n-neighbors': 'N Neighbors',
        'min-distance': 'Min Distance',
        'computing': 'Computing...',
        'pca-desc': '(Linear)',
        'tsne-desc': '(Non-linear)',
        'umap-desc': '(Non-linear)',
        'comparison-title': 'Method Comparison',
        'pca-note': '<strong>PCA</strong>: Linear dimensionality reduction, preserves global structure, fast computation',
        'tsne-note': '<strong>t-SNE</strong>: Non-linear dimensionality reduction, preserves local structure, excellent clustering',
        'umap-note': '<strong>UMAP</strong>: Non-linear dimensionality reduction, balances local and global structure, relatively fast',
        'select-dataset-placeholder': '-- Select Dataset --',
        'samples': ' samples',
        'dimensions': ' dims',
        'dataset-info-template': '<strong>{name}</strong><br>{description}<br>Samples: {samples} | Features: {features}',
        'select-dataset-first': 'Please select a dataset first',
        'load-dataset-error': 'Failed to load datasets. Please ensure the server is running',
        'load-dataset-failed': 'Failed to load dataset',
        'reduction-error': 'Dimensionality reduction failed',
        'comparison-error': 'Comparison failed',
        'computing-time': 'Time',
        'explained-variance': 'Variance Explained',
        'category': 'Category',
        'coordinates': 'Coordinates'
    }
};

// 获取翻译文本
function t(key) {
    return i18n[currentLang][key] || key;
}

// 切换语言
function switchLanguage(lang) {
    currentLang = lang;

    // 更新HTML语言属性
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    // 更新所有带有data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const text = t(key);

        if (element.tagName === 'OPTION') {
            element.textContent = text;
        } else if (element.innerHTML.includes('<strong>')) {
            element.innerHTML = text;
        } else {
            element.textContent = text;
        }
    });

    // 更新标题
    document.title = t('title');

    // 更新语言按钮状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // 如果已加载数据集，重新加载下拉选项
    if (datasets.length > 0) {
        updateDatasetSelect();
    }

    // 如果有当前数据集，更新数据集信息
    if (currentDataset) {
        updateDatasetInfo();
    }
}

// 更新数据集下拉框
function updateDatasetSelect() {
    const select = document.getElementById('dataset-select');
    const currentValue = select.value;

    select.innerHTML = `<option value="">${t('select-dataset-placeholder')}</option>`;

    datasets.forEach(dataset => {
        const option = document.createElement('option');
        option.value = dataset.id;
        const displayName = currentLang === 'en' ? dataset.nameEn : dataset.name;
        option.textContent = `${displayName} (${dataset.samples}${t('samples')}, ${dataset.features}${t('dimensions')})`;
        select.appendChild(option);
    });

    select.value = currentValue;
}

// 更新数据集信息
function updateDatasetInfo() {
    if (!currentDataset) return;

    const infoBox = document.getElementById('dataset-info');
    const template = t('dataset-info-template');
    const displayName = currentLang === 'en' ? currentDataset.nameEn : currentDataset.name;
    const displayDesc = currentLang === 'en' ? currentDataset.descriptionEn : currentDataset.description;
    infoBox.innerHTML = template
        .replace('{name}', displayName)
        .replace('{description}', displayDesc)
        .replace('{samples}', currentDataset.samples)
        .replace('{features}', currentDataset.features);
}

// 初始化应用
async function init() {
    // 设置默认语言为中文
    switchLanguage('zh');

    await loadDatasets();
    setupEventListeners();
}

// 加载数据集列表
async function loadDatasets() {
    try {
        const response = await fetch(`${API_BASE}/datasets`);
        datasets = await response.json();
        updateDatasetSelect();
    } catch (error) {
        console.error('Error loading datasets:', error);
        alert(t('load-dataset-error'));
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 语言切换
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchLanguage(btn.dataset.lang);
        });
    });

    // 数据集选择
    document.getElementById('dataset-select').addEventListener('change', async (e) => {
        const datasetId = e.target.value;
        if (datasetId) {
            await loadDataset(datasetId);
        }
    });

    // 方法按钮
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const method = btn.dataset.method;

            if (!currentDataset) {
                alert(t('select-dataset-first'));
                return;
            }

            // 更新按钮状态
            document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 显示/隐藏参数控制
            document.getElementById('tsne-params').style.display = method === 'tsne' ? 'block' : 'none';
            document.getElementById('umap-params').style.display = method === 'umap' ? 'block' : 'none';

            currentMethod = method;

            if (method === 'compare') {
                await compareAllMethods();
            } else {
                await performReduction(method);
            }
        });
    });

    // t-SNE参数滑块
    ['perplexity', 'epsilon'].forEach(param => {
        const slider = document.getElementById(param);
        const valueSpan = document.getElementById(`${param}-value`);

        slider.addEventListener('input', (e) => {
            valueSpan.textContent = e.target.value;
        });

        slider.addEventListener('change', async () => {
            if (currentMethod === 'tsne') {
                await performReduction('tsne');
            }
        });
    });

    // UMAP参数滑块
    ['nNeighbors', 'minDist'].forEach(param => {
        const slider = document.getElementById(param);
        const valueSpan = document.getElementById(`${param}-value`);

        slider.addEventListener('input', (e) => {
            valueSpan.textContent = e.target.value;
        });

        slider.addEventListener('change', async () => {
            if (currentMethod === 'umap') {
                await performReduction('umap');
            }
        });
    });
}

// 加载特定数据集
async function loadDataset(datasetId) {
    try {
        const response = await fetch(`${API_BASE}/dataset/${datasetId}`);
        currentDataset = await response.json();
        currentDatasetId = datasetId;
        updateDatasetInfo();
    } catch (error) {
        console.error('Error loading dataset:', error);
        alert(t('load-dataset-failed'));
    }
}

// 执行降维
async function performReduction(method) {
    showLoading(true);

    try {
        const options = {};

        if (method === 'tsne') {
            options.perplexity = parseInt(document.getElementById('perplexity').value);
            options.epsilon = parseInt(document.getElementById('epsilon').value);
        } else if (method === 'umap') {
            options.nNeighbors = parseInt(document.getElementById('nNeighbors').value);
            options.minDist = parseFloat(document.getElementById('minDist').value);
        }

        const response = await fetch(`${API_BASE}/reduce`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                datasetId: currentDatasetId,
                method: method,
                options: options
            })
        });

        const result = await response.json();

        // 显示单个方法的可视化
        document.getElementById('single-view').style.display = 'block';
        document.getElementById('compare-view').style.display = 'none';

        const displayName = currentLang === 'en' ? currentDataset.nameEn : currentDataset.name;
        document.getElementById('single-title').textContent =
            `${method.toUpperCase()} - ${displayName}`;

        let metricsHtml = `${t('computing-time')}: ${result.result.time}ms`;
        if (result.result.variance) {
            const totalVar = result.result.variance.reduce((a, b) => a + b, 0);
            metricsHtml += ` | ${t('explained-variance')}: ${(totalVar * 100).toFixed(2)}%`;
        }
        document.getElementById('single-metrics').innerHTML = metricsHtml;

        visualize('single-viz', result.result.points, result.result.labels);
        createLegend('single-legend', result.result.labels);

    } catch (error) {
        console.error('Error performing reduction:', error);
        alert(t('reduction-error') + ': ' + error.message);
    } finally {
        showLoading(false);
    }
}

// 对比所有方法
async function compareAllMethods() {
    showLoading(true);

    try {
        const tsneOptions = {
            perplexity: parseInt(document.getElementById('perplexity').value),
            epsilon: parseInt(document.getElementById('epsilon').value)
        };

        const umapOptions = {
            nNeighbors: parseInt(document.getElementById('nNeighbors').value),
            minDist: parseFloat(document.getElementById('minDist').value)
        };

        const response = await fetch(`${API_BASE}/compare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                datasetId: currentDatasetId,
                methods: ['pca', 'tsne', 'umap'],
                options: {
                    tsne: tsneOptions,
                    umap: umapOptions
                }
            })
        });

        const result = await response.json();

        // 显示对比视图
        document.getElementById('single-view').style.display = 'none';
        document.getElementById('compare-view').style.display = 'block';

        // 可视化每个方法
        ['pca', 'tsne', 'umap'].forEach(method => {
            const data = result.results[method];

            let metricsHtml = `${t('computing-time')}: ${data.time}ms`;
            if (data.variance) {
                const totalVar = data.variance.reduce((a, b) => a + b, 0);
                metricsHtml += ` | ${t('explained-variance')}: ${(totalVar * 100).toFixed(2)}%`;
            }
            document.getElementById(`${method}-metrics`).innerHTML = metricsHtml;

            visualize(`${method}-viz`, data.points, result.labels, 350);
        });

        createLegend('compare-legend', result.labels);

    } catch (error) {
        console.error('Error comparing methods:', error);
        alert(t('comparison-error') + ': ' + error.message);
    } finally {
        showLoading(false);
    }
}

// D3.js 可视化
function visualize(svgId, points, labels, height = 600) {
    const svg = d3.select(`#${svgId}`);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = parseInt(svg.style('width')) - margin.left - margin.right;
    const adjustedHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // 获取x和y的范围
    const xExtent = d3.extent(points, d => d[0]);
    const yExtent = d3.extent(points, d => d[1]);

    // 添加padding
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1;

    const xScale = d3.scaleLinear()
        .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
        .range([adjustedHeight, 0]);

    // 颜色比例尺
    const uniqueLabels = [...new Set(labels)];
    const colorScale = d3.scaleOrdinal()
        .domain(uniqueLabels)
        .range(uniqueLabels.length <= 10 ? d3.schemeCategory10 : d3.schemePaired);

    // 创建tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute');

    // 绘制点
    g.selectAll('circle')
        .data(points)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d[0]))
        .attr('cy', d => yScale(d[1]))
        .attr('r', 4)
        .attr('fill', (d, i) => colorScale(labels[i]))
        .attr('opacity', 0.7)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', function (event, d) {
            const i = points.indexOf(d);
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 6)
                .attr('opacity', 1);

            tooltip
                .classed('show', true)
                .html(`${t('category')}: ${labels[i]}<br>${t('coordinates')}: (${d[0].toFixed(2)}, ${d[1].toFixed(2)})`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function () {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 4)
                .attr('opacity', 0.7);

            tooltip.classed('show', false);
        });
}

// 创建图例
function createLegend(legendId, labels) {
    const legendDiv = document.getElementById(legendId);
    legendDiv.innerHTML = '';

    const uniqueLabels = [...new Set(labels)].sort((a, b) => a - b);
    const colorScale = d3.scaleOrdinal()
        .domain(uniqueLabels)
        .range(uniqueLabels.length <= 10 ? d3.schemeCategory10 : d3.schemePaired);

    uniqueLabels.forEach(label => {
        const item = document.createElement('div');
        item.className = 'legend-item';

        const color = document.createElement('div');
        color.className = 'legend-color';
        color.style.backgroundColor = colorScale(label);

        const text = document.createElement('span');
        text.textContent = `${t('category')} ${label}`;

        item.appendChild(color);
        item.appendChild(text);
        legendDiv.appendChild(item);
    });
}

// 显示/隐藏加载动画
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// 启动应用
init();
