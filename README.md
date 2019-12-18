# webpack-plugin-merge-i18n
合并vue对应语言包文件

## 安装插件
> npm install merge-i18n --save-dev


## 引入插件依赖
> const MergeI18n = require('merge-i18n');


## 插件使用
```
.
.
.
plugins: (
  new MergeI18n({
    // 需要监听的文件入口
    entry: path.resolve(__dirname, 'src/locale/module'),
    // 导出文件目录
    output: path.resolve(__dirname, 'src/locale/i18n.js'),
    // 是的在开始前清除输入文件
    clear: true
  })
)
```