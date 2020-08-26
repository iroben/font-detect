(function () {
  'use strict';

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
      this.fontContainer = document.createElement("div");
      this.fontContainer.style.position = "absolute";
      this.fontContainer.style.right = "4000px";
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
      this.initBaseFontInfo();
    }
    reset() {
      /**
       * 将要计算的字体元素用文档碎片先暂存，减少DOM操作
       */
      this.documentFragment = document.createDocumentFragment();
    }
    createSpanWithFontFamily(fontFamily) {
      let span = document.createElement("span");
      span.style.fontFamily = fontFamily;
      span.style.display = "inline-block";
      span.style.fontSize = this.testFontSize;
      if (this.isSupportTextContent) {
        span.textContent = this.testString;
      } else {
        span.innerText = this.testString;
      }
      return span;
    }
    initBaseFontInfo() {
      this.reset();
      this.baseFont.forEach((v) => {
        this.documentFragment.appendChild(this.createSpanWithFontFamily(v));
      });
      let single = this.tempSpan.single;
      single.appendChild(this.documentFragment);
      this.baseFont.forEach((v, i) => {
        this.baseInfo[v] = {
          w: single.children[i].offsetWidth,
          h: single.children[i].offsetHeight,
        };
      });
    }

    detect(fontName) {
      this.reset();
      let single = this.tempSpan.single;
      this.baseFont.forEach((v, i) => {
        single.children[i].style.fontFamily = fontName + "," + v;
      });

      for (var i = this.baseFont.length - 1; i >= 0; i--) {
        if (
          single.children[i].offsetWidth !== this.baseInfo[this.baseFont[i]].w ||
          single.children[i].offsetHeight !== this.baseInfo[this.baseFont[i]].h
        ) {
          return true;
        }
      }
      return false;
    }

    detects(fontNames) {
      if (!fontNames || (fontNames.length && fontNames.length == 0)) {
        return [];
      }
      let multiDom = this.tempSpan.multi;
      // 延迟删除DOM
      if (multiDom) {
        this.fontContainer.removeChild(multiDom);
        this.tempSpan.multi = document.createElement("span");
        multiDom = this.tempSpan.multi;
      }
      this.reset();
      fontNames.forEach((fontName) => {
        this.baseFont.forEach((v) => {
          this.documentFragment.appendChild(
            this.createSpanWithFontFamily(fontName + "," + v)
          );
        });
      });
      multiDom.appendChild(this.documentFragment);
      this.fontContainer.appendChild(multiDom);
      let supportFonts = [];
      for (let i = 0; i < multiDom.children.length; i += 3) {
        for (let j = 0; j < this.baseFont.length; j++) {
          if (
            multiDom.children[i + j].offsetWidth !==
              this.baseInfo[this.baseFont[j]].w ||
            multiDom.children[i + j].offsetHeight !==
              this.baseInfo[this.baseFont[j]].h
          ) {
            supportFonts.push(fontNames[parseInt(Math.ceil(i / 3))]);
            break;
          }
        }
      }
      return supportFonts;
    }
  }

  return FontDetect;

}());
