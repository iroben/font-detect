# JavaScript / CSS 字体检测器
参考[fontdetect.js](https://github.com/f2ex/fontdetect.js)修改的，主要是在操作`DOM`的时候，用了文档碎片，和复用`DOM`，减少`reflow`

# 使用
## 安装
```
npm i web-font-detect
```
## 单一检测字体

```
 import FontDetect from "web-font-detect";
 var fontDetect = new FontDetect();
 fontDetect.detect('$fontFamily'); // 返回 boolean值
```

## 检测一组字体（推荐用，减少`reflow`）
```
import FontDetect from "web-font-detect";
var fonts = ["PingFang SC", "Hiragino Sans GB", "microsoft yahei"]
var fontDetect = new FontDetect();
 fontDetect.detects(fonts)； // 返回支持的字体
```

## 测试数据和结果
```
var fonts = ["PingFang SC", "Hiragino Sans GB", "microsoft yahei", "simsun", "cursive", "monospace", "serif", "sans-serif", "fantasy", "default", "Arial", "Arial Black", "Arial Narrow", "Arial Rounded MT Bold", "Bookman Old Style", "Bradley Hand ITC", "Century", "Century Gothic", "Comic Sans MS", "Courier", "Courier New", "Georgia", "Gentium", "Impact", "King", "Lucida Console", "Lalit", "Modena", "Monotype Corsiva", "Papyrus", "Tahoma", "TeX", "Times", "Times New Roman", "Trebuchet MS", "Verdana", "Verona", "Wingdings", "Wingdings 2", "Wingdings 3", "Webdings", "Segoe MDL2 Assets", "Segoe UI Emoji", "Marlett", "Symbol", "HoloLens MDL2 Assets", "Apple Braille", "Apple Color Emoji", "STIXIntegralsD", "STIXIntegralsSm", "STIXIntegralsUpD", "STIXIntegralsUpSm", "STIXNonUnicode", "STIXSizeFiveSym", "STIXSizeFourSym", "STIXSizeOneSym", "STIXSizeThreeSym", "STIXSizeTwoSym", "STIXVariants", "Bodoni Ornaments", "AppleGothic", "Apple SD Gothic Neo", "AppleMyungjo", "GungSeo", "HeadLineA", "Nanum Brush Script", "Nanum Gothic", "Nanum Myeongjo", "Nanum Pen Script", "PCMyungjo", "PilGi"]

```

![](https://github.com/iroben/font-detect/blob/master/images/1.png?raw=true)

循环调用`detect`和[fontdetect.js](https://github.com/f2ex/fontdetect.js)花费的时间差不多，但用`detects`，很明显快了很多，所以`推荐用`

![](https://github.com/iroben/font-detect/blob/master/images/2.png?raw=true)
循环调用`detect`，因为改变了字体，所以导致了重排`reflow`

![](https://github.com/iroben/font-detect/blob/master/images/3.png?raw=true)
调用`detects`，因为用了文档碎片，只重排了一次