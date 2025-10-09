# Copyright (c) Hongxin Zhang. All rights reserved.
# Licensed under the MIT License. See LICENSE in the project root for license information.
# 专业多项式拟合命令行工具，支持演示拟合、过拟合、过拟合矫正

import numpy as np
import matplotlib.pyplot as plt
import argparse
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error

def gen_data(npoints, noise_std, seed=12):
	np.random.seed(seed)
	x = np.random.uniform(0, 2*np.pi, npoints)
	y = np.sin(x) + np.random.normal(0, noise_std, npoints)
	return x, y

def polyfit(x, y, degree):
	z = np.polyfit(x, y, degree)
	p = np.poly1d(z)
	return p, z

def ridgefit(x, y, degree, alpha):
	# 构造多项式特征
	X = np.vander(x, N=degree+1, increasing=True)
	model = Ridge(alpha=alpha, fit_intercept=False)
	model.fit(X, y)
	def pr(t):
		T = np.vander(t, N=degree+1, increasing=True)
		return model.predict(T)
	return pr, model.coef_

def plot_all(x, y, p, degree, mode, mse, output=None):
	t = np.linspace(0, 2*np.pi, 200)
	plt.figure(figsize=(8,5))
	plt.plot(t, np.sin(t), color='green', label='True curve: sin(x)')
	plt.scatter(x, y, edgecolor='blue', facecolors='none', marker='o', label=f'Data Points: {len(x)}')
	if callable(p):
		yfit = p(t)
	else:
		yfit = p(t)
	plt.plot(t, yfit, color='red', label=f'Fitted (degree={degree}, {mode})')
	plt.title(f'{mode.capitalize()} | MSE={mse:.4f}')
	plt.legend()
	if output:
		plt.savefig(output)
	else:
		plt.show()

def main():
	parser = argparse.ArgumentParser(description='Polynomial fitting demo: fit, overfit, and overfit correction.')
	parser.add_argument('--npoints', type=int, default=10, help='Number of data points')
	parser.add_argument('--noise', type=float, default=0.1, help='Noise standard deviation')
	parser.add_argument('--degree', type=int, default=3, help='Polynomial degree')
	parser.add_argument('--demo', type=str, choices=['fit','overfit','correct'], default='fit', help='Demo mode: fit/overfit/correct')
	parser.add_argument('--alpha', type=float, default=1.0, help='Regularization strength for correction')
	parser.add_argument('--output', type=str, help='Output image file')
	args = parser.parse_args()

	x, y = gen_data(args.npoints, args.noise)

	if args.demo == 'fit':
		degree = min(args.degree, max(1, args.npoints//2))
		p, coef = polyfit(x, y, degree)
		y_pred = p(x)
		mse = mean_squared_error(y, y_pred)
		print(f'拟合（合理阶数={degree}）系数:', coef)
		print(f'MSE: {mse:.4f}')
		plot_all(x, y, p, degree, 'fit', mse, args.output)
	elif args.demo == 'overfit':
		degree = max(args.degree, args.npoints-1)
		p, coef = polyfit(x, y, degree)
		y_pred = p(x)
		mse = mean_squared_error(y, y_pred)
		print(f'过拟合（高阶={degree}）系数:', coef)
		print(f'MSE: {mse:.4f}')
		plot_all(x, y, p, degree, 'overfit', mse, args.output)
	elif args.demo == 'correct':
		degree = max(args.degree, args.npoints-1)
		pr, coef = ridgefit(x, y, degree, args.alpha)
		y_pred = pr(x)
		mse = mean_squared_error(y, y_pred)
		print(f'过拟合矫正（岭回归，阶数={degree}, alpha={args.alpha}）系数:', coef)
		print(f'MSE: {mse:.4f}')
		plot_all(x, y, pr, degree, f'correct (alpha={args.alpha})', mse, args.output)

if __name__ == '__main__':
	main()