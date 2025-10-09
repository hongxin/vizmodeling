# Python 可视化建模工具集

中文 | [English](./README_en.md)

本目录包含用于可视化建模的 Python 演示程序，通过命令行工具展示数学建模和机器学习的核心概念。

## 程序列表

### 1. 三次埃尔米特插值 (hermite_inter.py)
基于两点两切线约束的三次埃尔米特插值算法。

**特性**:
- 命令行参数输入约束条件
- 支持单点和批量计算（区间、文件）
- 灵活的输出选项（屏幕/文件）

**快速开始**:
```bash
python hermite_inter.py --f0 0 --f1 1 --fd0 1 --fd1 2 --t 0.5
```

### 2. 多项式拟合演示 (polynomial_fit.py)
演示拟合、过拟合及其矫正的专业工具。

**特性**:
- 三种模式：正常拟合、过拟合、岭回归矫正
- 可视化拟合曲线和误差分析
- 支持参数调节和结果输出

**快速开始**:
```bash
python polynomial_fit.py --demo fit --npoints 10 --degree 3
```

### 3. 宋代五行色彩 (song_color.py)
传统中国美学配色方案展示。

**特性**:
- 五行理论色彩体系
- 宋代美学风格可视化
- 中文字体支持

**快速开始**:
```bash
python song_color.py
```

## 详细使用

### 埃尔米特插值
```bash
# 单点计算
python hermite_inter.py --f0 0 --f1 1 --fd0 1 --fd1 2 --t 0.5

# 区间批量计算
python hermite_inter.py --f0 0 --f1 1 --fd0 1 --fd1 2 --trange 0,1,0.01

# 文件批量计算
python hermite_inter.py --f0 0 --f1 1 --fd0 1 --fd1 2 --tfile t_values.txt

# 输出到文件
python hermite_inter.py --f0 0 --f1 1 --fd0 1 --fd1 2 --trange 0,1,0.1 --output result.txt
```

### 多项式拟合
```bash
# 正常拟合（合理阶数）
python polynomial_fit.py --demo fit --npoints 10 --degree 3

# 过拟合演示（高阶多项式）
python polynomial_fit.py --demo overfit --npoints 10 --degree 9

# 过拟合矫正（岭回归）
python polynomial_fit.py --demo correct --npoints 10 --degree 9 --alpha 1.0

# 保存可视化结果
python polynomial_fit.py --demo correct --alpha 10 --output fitting_result.png
```

## 技术栈

### 核心依赖
- **numpy**: 数值计算
- **matplotlib**: 可视化绘图
- **scikit-learn**: 机器学习算法
- **argparse**: 命令行解析 (内置)

### 算法实现
- **埃尔米特插值**: 三次多项式基函数
- **多项式拟合**: numpy.polyfit + 岭回归正则化
- **可视化**: matplotlib + 中文字体支持

## 数学原理

### 埃尔米特插值
给定两点 $(x_0, f_0), (x_1, f_1)$ 和对应切线斜率 $f'_0, f'_1$，构造三次多项式：

$$H(t) = h_0(t)f_0 + h_1(t)f_1 + h_2(t)f'_0 + h_3(t)f'_1$$

其中基函数：
- $h_0(t) = 2t^3 - 3t^2 + 1$
- $h_1(t) = -2t^3 + 3t^2$  
- $h_2(t) = t^3 - 2t^2 + t$
- $h_3(t) = t^3 - t^2$

### 多项式拟合与正则化
- **拟合**: 最小化 $\sum_i (y_i - p(x_i))^2$
- **岭回归**: 添加正则项 $\lambda \sum_j \theta_j^2$
- **目标**: 平衡拟合精度与模型复杂度

## 应用场景

### 教学演示
- 数值分析课程插值方法讲解
- 机器学习过拟合概念演示
- 传统文化与数学可视化结合

### 研究用途
- 插值算法性能测试
- 正则化参数调优
- 数据拟合质量评估

### 实际应用
- 曲线重建和平滑
- 数据预处理和清洗
- 美学设计色彩方案

## 扩展开发

### 添加新插值方法
```python
def new_interpolation(f0, f1, fd0, fd1, t):
    # 实现新的插值算法
    return result
```

### 自定义数据集
```python
# 在 polynomial_fit.py 中修改数据生成
def custom_data_generator(npoints, noise_std):
    x = np.linspace(0, 10, npoints)
    y = your_function(x) + noise
    return x, y
```

### 新增正则化方法
```python
from sklearn.linear_model import Lasso, ElasticNet
# 实现其他正则化方法
```

## 性能优化

### 计算效率
- 使用 numpy 向量化操作
- 避免循环计算大数组
- 缓存重复计算结果

### 内存管理
- 大数据集分批处理
- 及时释放临时变量
- 优化图像显示参数

## 常见问题

**Q: 埃尔米特插值结果异常？**
A: 检查约束条件是否合理，切线斜率不宜过大。

**Q: 多项式拟合过拟合严重？**
A: 减少多项式阶数或增加正则化强度 `--alpha`。

**Q: 中文字体显示问题？**
A: 确保 `fonts/` 目录包含字体文件，检查字体路径。

**Q: 批量计算速度慢？**
A: 减少计算点数或使用更高效的数值库。

## 许可证

MIT License - 详见项目根目录 LICENSE 文件。

---

**探索数学之美，感受算法魅力！** ✨