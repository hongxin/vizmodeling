# polynomial fitting using numpy.polyfit()
# a very rough way to fit a polynomial to the data points

# Importing necessary libraries
import numpy as np  # for mathematical operations
from matplotlib import pyplot as plt  # for plotting graphs

# Set the random seed for reproducibility of results
np.random.seed(12)

# Generating data points from sine curve
# random sample n points from 0 to 2*pi
npoints = 10
x = np.random.uniform(0, 2*np.pi, npoints)  # 10 random points from 0 to 2*pi
y = np.sin(x)  # y = sin(x)
y += np.random.normal(0, 0.1, npoints)  # adding noise to the data points

# Fitting a polynomial of degree ndegree to the data points
ndgree = 9
z = np.polyfit(x, y, ndgree)   # fitting a polynomial of degree ndgree to the data points

p = np.poly1d(z)   # p is the fitted polynomial
print("The fitted polynomial is: ", p)

# Plotting the original sine curve in green
t = np.linspace(0, 2*np.pi, 100)  # 100 points from 0 to 2*pi
plt.plot(t, np.sin(t), color='green', label='Original curve: sin(t)')  # original sine curve


# Plotting the data points in circles in blue
# plt.plot(x, y, 'o', color="blue", label='Data points '+ str(npoints))    # data points
plt.scatter(x, y, edgecolor='blue', facecolors='none', marker='o', label='Data Points: '+ str(npoints))

# Plotting the fitted SMOOTH polynomial curve
t = np.linspace(0, 2*np.pi, 100)  # 100 points from 0 to 2*pi
curve_label = 'Fitted polynomial of degree ' + str(ndgree)
plt.plot(t, p(t), color='red', label=curve_label)   # fitted polynomial

plt.legend()
plt.show()


