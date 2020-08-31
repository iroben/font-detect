# JavaScript / CSS 字体检测器

参考[fontdetect.js](https://github.com/f2ex/fontdetect.js)修改的，主要是在操作`DOM`的时候，用了文档碎片，和复用`DOM`，减少`reflow`

# 使用

## 安装

```
npm i web-font-detect
```


## 检测一组字体（推荐用）

```
import FontDetect from "web-font-detect";
var fonts = ["PingFang SC", "Hiragino Sans GB", "microsoft yahei"]
var fontDetect = new FontDetect();
fontDetect.promiseDetects(fonts).then(supportFonts=>{
    console.log(supportFonts)
})； // 返回支持的字体
```


## 检测一组字体

```
import FontDetect from "web-font-detect";
var fonts = ["PingFang SC", "Hiragino Sans GB", "microsoft yahei"]
var fontDetect = new FontDetect();
var supportFonts fontDetect.detects(fonts)； // 返回支持的字体
console.log(supportFonts)
```


## 单一检测字体

```
 import FontDetect from "web-font-detect";
 var fontDetect = new FontDetect();
 fontDetect.detect('$fontFamily'); // 返回 boolean值
```

## `promiseDetects`和`detects`区别

`promiseDetects`在浏览器的`requestAnimationFrame`事件中检测字体

## 测试数据和结果（555个字体）,测试6次

`promiseDetects` 平均耗时：`1345`

```
1383.2529296875ms
1265.2841796875ms
1262.455810546875ms
1499.126953125ms
1222.503173828125ms
1443.22900390625ms
```

`detects` 平均耗时：`1364`

```
1424.771240234375ms
1281.14794921875ms
1318.2998046875ms
1360.218017578125ms
1458.3408203125ms
1348.72314453125ms
```


`detect` 平均耗时：`1749`

```
1778.216064453125ms
1742.853271484375ms
1591.015869140625ms
1761.057861328125ms
1766.262939453125ms
1859.827880859375ms
```