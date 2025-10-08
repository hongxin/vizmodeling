
# cubic Hermite interpolation of a set of points
# input: f0, f1, fd0, fd1, t
# output: interpolated value at t
# ref: https://github.com/hongxin/vizmodeling/blob/master/2024/vizmodeling-1.pdf page 49
# ref: https://en.wikipedia.org/wiki/Cubic_Hermite_spline 
import argparse
import sys

def hermite_inter(f0, f1, fd0, fd1, t):
    t2 = t*t
    t3 = t2*t
    h0 = 2*t3 - 3*t2 + 1
    h1 = -2*t3 + 3*t2
    h2 = t3 - 2*t2 + t
    h3 = t3 - t2
    return h0*f0 + h1*f1 + h2*fd0 + h3*fd1

def parse_t_values(args):
    # 支持单点、区间、文件三种模式
    if args.t is not None:
        return [float(args.t)]
    elif args.trange is not None:
        # 格式: start,end,step
        try:
            start, end, step = map(float, args.trange.split(','))
        except Exception:
            print('trange格式错误，应为: start,end,step')
            sys.exit(1)
        t_list = []
        t = start
        while t <= end:
            t_list.append(round(t, 10))
            t += step
        return t_list
    elif args.tfile is not None:
        t_list = []
        with open(args.tfile, 'r') as f:
            for line in f:
                try:
                    t_list.append(float(line.strip()))
                except ValueError:
                    continue
        return t_list
    else:
        print('请指定t、trange或tfile参数')
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Cubic Hermite interpolation with two points and two tangents.')
    parser.add_argument('--f0', type=float, required=True, help='第一个点的函数值')
    parser.add_argument('--f1', type=float, required=True, help='第二个点的函数值')
    parser.add_argument('--fd0', type=float, required=True, help='第一个点的切线斜率')
    parser.add_argument('--fd1', type=float, required=True, help='第二个点的切线斜率')
    parser.add_argument('--t', type=float, help='单个t值')
    parser.add_argument('--trange', type=str, help='t区间，格式: start,end,step')
    parser.add_argument('--tfile', type=str, help='t值文件，每行一个t')
    parser.add_argument('--output', type=str, help='输出文件，若不指定则输出到屏幕')

    args = parser.parse_args()

    t_list = parse_t_values(args)
    results = []
    for t in t_list:
        f = hermite_inter(args.f0, args.f1, args.fd0, args.fd1, t)
        results.append((t, f))

    if args.output:
        with open(args.output, 'w') as fout:
            for t, f in results:
                fout.write(f"{t}\t{f}\n")
    else:
        for t, f in results:
            print(f"t = {round(t, 6)},\tf = {round(f, 6)}")

if __name__ == '__main__':
    main()

