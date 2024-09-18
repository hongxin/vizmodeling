# cubic Hermite interpolation of a set of points
# input: f0, f1, fd0, fd1, t
# output: interpolated value at t
# ref: https://github.com/hongxin/vizmodeling/blob/master/2024/vizmodeling-1.pdf page 49
# ref: https://en.wikipedia.org/wiki/Cubic_Hermite_spline 
def hermite_inter(f0, f1, fd0, fd1, t):
    t2 = t*t
    t3 = t2*t
    h0 = 2*t3 - 3*t2 + 1
    h1 = -2*t3 + 3*t2
    h2 = t3 - 2*t2 + t
    h3 = t3 - t2
    return h0*f0 + h1*f1 + h2*fd0 + h3*fd1

def test_hermite_inter():
    f0 = 0.0
    f1 = 0.0
    fd0= 1.0
    fd1= 1.0
    for t2 in range(0, 101):
        t = t2/100
        f  = hermite_inter(f0, f1, fd0, fd1, t)
        print("t = {0}, \t f = {1}".format(round(t,3), round(f, 3)))
    
test_hermite_inter()

# TODO: plot the curve

