define(function () { 'use strict';

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
      this.tempSpan = {
        single: document.createElement("span"), //判断单个字体用，对应 detect 方法
        multi: document.createElement("span"), //判断多个字体用，对应 detects 方法
      };

      this.fontContainer.appendChild(this.tempSpan.single);
      this.fontContainer.appendChild(this.tempSpan.multi);
      document.body.appendChild(this.fontContainer);
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
        span.innerHTML = this.testString;
      }
      return span;
    }
    _initBaseFontInfo() {
      this._reset();
      this.baseFont.forEach((v) => {
        this.documentFragment.appendChild(this._createSpanWithFontFamily(v));
      });
      let single = this.tempSpan.single;
      single.appendChild(this.documentFragment);
      this.baseFont.forEach((v, i) => {
        this.baseInfo[v] = {
          w: single.children[i].offsetWidth,
          h: single.children[i].offsetHeight,
        };
      });
      this.fontContainer.removeChild(single);
      this.tempSpan.single = null;
    }

    detect(fontName) {
      return this.detects([fontName]).length > 0;
    }

    _detectAndCache(unCacheFontNames) {
      let multiDom = this.tempSpan.multi;
      let fontCache = FontDetect.fontCache;
      let baseFontLength = this.baseFont.length;
      let supportFonts = [];
      multiDom.appendChild(this.documentFragment);
      this.fontContainer.appendChild(multiDom);
      for (let i = 0; i < unCacheFontNames.length; i++) {
        let isSupport = false;
        for (let j = 0; j < baseFontLength; j++) {
          let child = multiDom.children[i * baseFontLength + j];
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
      if (multiDom) {
        this.fontContainer.removeChild(multiDom);
        this.tempSpan.multi = document.createElement("span");
      }
      return supportFonts;
    }

    detects(fontNames) {
      if (!fontNames || (fontNames.length && fontNames.length === 0)) {
        return [];
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
      if (unCacheFontNames.length === 0) {
        // 所有字体从缓存中获取了，就不用创建DOM检测了
        return supportFonts;
      }
      return supportFonts.concat(this._detectAndCache(unCacheFontNames));
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

  return FontDetect;

});
