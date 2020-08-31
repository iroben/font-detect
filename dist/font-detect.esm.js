class FontDetect {
  /**
   *
   * @param {Object} options
   */
  constructor(options) {
    options = options || {};
    this.baseFont = options.baseFont || ["monospace", "sans-serif", "serif"];
    this.testFontSize = options.testFontSize || "76px";
    this.testString = options.testString || "mmmmmmmmmmlli";
    /**
     * 保存初始字体渲染尺寸信息
     * {
     *  fontName:{width:1, height:2}
     * }
     */
    this.baseInfo = {};
    this.isSupportTextContent = "textContent" in document.body;
    this.isSupportClientRect = "getBoundingClientRect" in document.body;
    this.fontContainer = document.createElement("div");
    this.fontContainer.style.cssText = "position:absolute;right:4000px";
    /**
     * 将要计算的字体元素放到tempSpan下，方便一次删除，减少DOM操作
     */
    this.tempSpan = document.createElement("span");

    this.fontContainer.appendChild(this.tempSpan);
    document.body.appendChild(this.fontContainer);
    let win = window;
    let raf =
      win.requestAnimationFrame ||
      win.webkitRequestAnimationFrame ||
      win.mozRequestAnimationFrame ||
      win.msRequestAnimationFrame ||
      function (cb) {
        return setTimeout(cb, 16);
      };
    this.raf = raf.bind(win);
    this._initBaseFontInfo();
  }
  _reset() {
    /**
     * 将要计算的字体元素用文档碎片先暂存，减少DOM操作
     */
    this.documentFragment = document.createDocumentFragment();
  }

  _createSpanWithFontFamily(fontFamily) {
    let span = document.createElement("span");
    span.style.cssText = `font-family:${fontFamily};font-size:${this.testFontSize}`;
    if (this.isSupportTextContent) {
      span.textContent = this.testString;
    } else {
      span.innerText = this.testString;
    }
    return span;
  }
  _initBaseFontInfo() {
    this._reset();
    this.baseFont.forEach((v) => {
      this.documentFragment.appendChild(this._createSpanWithFontFamily(v));
    });
    let tempSpan = this.tempSpan;
    tempSpan.appendChild(this.documentFragment);
    this.baseFont.forEach((v, i) => {
      this.baseInfo[v] = {
        w: tempSpan.children[i].offsetWidth,
        h: tempSpan.children[i].offsetHeight,
      };
    });
    this.fontContainer.removeChild(tempSpan);
    this.tempSpan = document.createElement("span");
  }

  detect(fontName) {
    return this.detects([fontName]).length > 0;
  }

  _detectAndCache(unCacheFontNames) {
    let tempSpan = this.tempSpan;
    let fontCache = FontDetect.fontCache;
    let baseFontLength = this.baseFont.length;
    let supportFonts = [];
    tempSpan.appendChild(this.documentFragment);
    this.fontContainer.appendChild(tempSpan);
    for (let i = 0; i < unCacheFontNames.length; i++) {
      let isSupport = false;
      for (let j = 0; j < baseFontLength; j++) {
        let child = tempSpan.children[i * baseFontLength + j];
        let rectInfo = {
          width: 0,
          height: 0,
        };
        if (this.isSupportClientRect) {
          rectInfo = child.getBoundingClientRect();
        } else {
          rectInfo.width = child.offsetWidth;
          rectInfo.height = child.offsetHeight;
        }
        /**
         * 有些字体的高度有1个像素的误差，不知道什么情况
         * 比如：AI Tarikh
         */
        if (
          Math.abs(rectInfo.width - this.baseInfo[this.baseFont[j]].w) > 1 ||
          Math.abs(rectInfo.height - this.baseInfo[this.baseFont[j]].h) > 1
        ) {
          isSupport = true;
          supportFonts.push(unCacheFontNames[i]);
          break;
        }
      }
      if (isSupport) {
        fontCache[this.testFontSize].support.add(unCacheFontNames[i]);
      } else {
        fontCache[this.testFontSize].unsupport.add(unCacheFontNames[i]);
      }
    }
    if (tempSpan) {
      this.fontContainer.removeChild(tempSpan);
      this.tempSpan = document.createElement("span");
    }
    return supportFonts;
  }

  _checkCache(fontNames) {
    if (!fontNames || (fontNames.length && fontNames.length === 0)) {
      return {
        supportFonts: [],
        unCacheFontNames: [],
      };
    }
    let fontCache = FontDetect.fontCache;
    if (!(this.testFontSize in fontCache)) {
      fontCache[this.testFontSize] = {
        support: new Set(),
        unsupport: new Set(),
      };
    }
    this._reset();
    let supportFonts = [];
    let baseFontLength = this.baseFont.length;
    let unCacheFontNames = [];
    for (let i = 0; i < fontNames.length; i++) {
      if (fontCache[this.testFontSize].support.has(fontNames[i])) {
        supportFonts.push(fontNames[i]);
        continue;
      } else if (fontCache[this.testFontSize].unsupport.has(fontNames[i])) {
        continue;
      }
      unCacheFontNames.push(fontNames[i]);
      for (let j = 0; j < baseFontLength; j++) {
        this.documentFragment.appendChild(
          this._createSpanWithFontFamily(fontNames[i] + "," + this.baseFont[j])
        );
      }
    }
    return {
      supportFonts,
      unCacheFontNames,
    };
  }

  detects(fontNames) {
    let { unCacheFontNames, supportFonts } = this._checkCache(fontNames);
    if (unCacheFontNames.length === 0) {
      // 所有字体从缓存中获取了，就不用创建DOM检测了
      return supportFonts;
    }
    return supportFonts.concat(this._detectAndCache(unCacheFontNames));
  }

  promiseDetects(fontNames) {
    let { unCacheFontNames, supportFonts } = this._checkCache(fontNames);
    if (unCacheFontNames.length === 0) {
      // 所有字体从缓存中获取了，就不用创建DOM检测了
      return new Promise((resolve) => {
        resolve(supportFonts);
      });
    }
    return new Promise((resolve) => {
      this.raf(() => {
        resolve(supportFonts.concat(this._detectAndCache(unCacheFontNames)));
      });
    });
  }
}

/**
 * 缓存已经处理过的字体信息
 * {
 *    fontSize:{
 *      support:set,
 *      unsupport:set
 *    }
 * }
 */
FontDetect.fontCache = {};

export default FontDetect;
