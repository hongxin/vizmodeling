# Python Visualization and Modeling Tools

[中文](./README.md) | English

This directory contains Python demonstration programs for visualization and modeling, showcasing core concepts in mathematical modeling and machine learning through command-line tools.

## Program List

### 1. Cubic Hermite Interpolation (hermite_inter.py)
Cubic Hermite interpolation algorithm based on two-point two-tangent constraints.

**Features**:
- Command-line parameter input for constraints
- Support for single-point and batch calculation (range, file)
- Flexible output options (screen/file)

**Quick Start**:
```bash
python hermite_inter.py --f0 0 --f1 1 --fd0 1 --fd1 2 --t 0.5
```

### 2. Polynomial Fitting Demo (polynomial_fit.py)
Professional tool demonstrating fitting, overfitting, and correction.

**Features**:
- Three modes: normal fitting, overfitting, ridge regression correction
- Visualization of fitting curves and error analysis
- Support for parameter tuning and result output

**Quick Start**:
```bash
python polynomial_fit.py --demo fit --npoints 10 --degree 3
```

### 3. Song Dynasty Five Elements Colors (song_color.py)
Traditional Chinese aesthetic color scheme demonstration.

**Features**:
- Five Elements theory color system
- Song Dynasty aesthetic style visualization
- Chinese font support

**Quick Start**:
```bash
python song_color.py
```

## Detailed Usage

### Hermite Interpolation
```bash
# Single point calculation
python hermite_inter.py --f0 0 --f1 1 --fd0 1 --fd1 2 --t 0.5

# Range batch calculation
python hermite_inter.py --f0 0 --f1 1 --fd0 1 --fd1 2 --trange 0,1,0.01

# File batch calculation
python hermite_inter.py --f0 0 --f1 1 --fd0 1 --fd1 2 --tfile t_values.txt

# Output to file
python hermite_inter.py --f0 0 --f1 1 --fd0 1 --fd1 2 --trange 0,1,0.1 --output result.txt
```

### Polynomial Fitting
```bash
# Normal fitting (reasonable degree)
python polynomial_fit.py --demo fit --npoints 10 --degree 3

# Overfitting demo (high-degree polynomial)
python polynomial_fit.py --demo overfit --npoints 10 --degree 9

# Overfitting correction (ridge regression)
python polynomial_fit.py --demo correct --npoints 10 --degree 9 --alpha 1.0

# Save visualization results
python polynomial_fit.py --demo correct --alpha 10 --output fitting_result.png
```

## Tech Stack

### Core Dependencies
- **numpy**: Numerical computation
- **matplotlib**: Visualization plotting
- **scikit-learn**: Machine learning algorithms
- **argparse**: Command-line parsing (built-in)

### Algorithm Implementation
- **Hermite Interpolation**: Cubic polynomial basis functions
- **Polynomial Fitting**: numpy.polyfit + ridge regression regularization
- **Visualization**: matplotlib + Chinese font support

## Mathematical Principles

### Hermite Interpolation
Given two points $(x_0, f_0), (x_1, f_1)$ and corresponding tangent slopes $f'_0, f'_1$, construct cubic polynomial:

$$H(t) = h_0(t)f_0 + h_1(t)f_1 + h_2(t)f'_0 + h_3(t)f'_1$$

Where basis functions are:
- $h_0(t) = 2t^3 - 3t^2 + 1$
- $h_1(t) = -2t^3 + 3t^2$  
- $h_2(t) = t^3 - 2t^2 + t$
- $h_3(t) = t^3 - t^2$

### Polynomial Fitting and Regularization
- **Fitting**: Minimize $\sum_i (y_i - p(x_i))^2$
- **Ridge Regression**: Add regularization term $\lambda \sum_j \theta_j^2$
- **Goal**: Balance fitting accuracy and model complexity

## Use Cases

### Educational Purposes
- Numerical analysis course interpolation method explanation
- Machine learning overfitting concept demonstration
- Traditional culture and mathematical visualization integration

### Research Purposes
- Interpolation algorithm performance testing
- Regularization parameter tuning
- Data fitting quality assessment

### Practical Applications
- Curve reconstruction and smoothing
- Data preprocessing and cleaning
- Aesthetic design color schemes

## Extension Development

### Adding New Interpolation Methods
```python
def new_interpolation(f0, f1, fd0, fd1, t):
    # Implement new interpolation algorithm
    return result
```

### Custom Datasets
```python
# Modify data generation in polynomial_fit.py
def custom_data_generator(npoints, noise_std):
    x = np.linspace(0, 10, npoints)
    y = your_function(x) + noise
    return x, y
```

### New Regularization Methods
```python
from sklearn.linear_model import Lasso, ElasticNet
# Implement other regularization methods
```

## Performance Optimization

### Computational Efficiency
- Use numpy vectorized operations
- Avoid loops for large array calculations
- Cache repeated computation results

### Memory Management
- Process large datasets in batches
- Release temporary variables promptly
- Optimize image display parameters

## FAQ

**Q: Abnormal Hermite interpolation results?**
A: Check if constraints are reasonable, tangent slopes should not be too large.

**Q: Severe overfitting in polynomial fitting?**
A: Reduce polynomial degree or increase regularization strength `--alpha`.

**Q: Chinese font display issues?**
A: Ensure `fonts/` directory contains font files, check font path.

**Q: Slow batch calculation?**
A: Reduce number of calculation points or use more efficient numerical libraries.

## License

MIT License - See LICENSE file in project root for details.

---

**Explore the beauty of mathematics, experience the charm of algorithms!** ✨