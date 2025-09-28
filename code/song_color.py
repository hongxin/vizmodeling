import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties

import numpy as np
import os

font_path = os.path.join(os.getcwd(), "fonts", "simhei.ttf")  # 项目内字体目录
font_prop = FontProperties(fname=font_path)

# 五行色值定义
colors = {
    "木": (115/255, 130/255, 105/255),
    "火": (180/255, 70/255, 65/255),
    "土": (150/255, 110/255, 80/255),
    "金": (245/255, 245/255, 230/255),
    "水": (70/255, 100/255, 120/255)
}

# 宋代美学调色板展示
fig, ax = plt.subplots(figsize=(10, 2))
for i, (element, rgb) in enumerate(colors.items()):
    ax.add_patch(plt.Rectangle((i*0.2, 0), 0.18, 1, color=rgb))
    ax.text(i*0.2 + 0.09, 0.5, element, 
            ha='center', va='center', fontsize=12, fontproperties=font_prop,
            color='white' if element in ["火","水"] else 'black')

# 设置宋代风格背景
ax.set_facecolor((0.96, 0.95, 0.94))  # 宋代宣纸底色[11](@ref)
ax.set_xlim(0, 1)
ax.set_axis_off()
ax.set_title("五行五色·宋代美学范式", fontsize=14, pad=20, 
             # fontproperties='SimHei', 
             fontproperties=font_prop,
             color=(0.4, 0.4, 0.4))

plt.show()
