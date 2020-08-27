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
    span.style.fontSize = this.testFontSize;
    // span.style.display = "inline-block";
    if (this.isSupportTextContent) {
      span.textContent = this.testString;
    } else {
      span.innerHTML = this.testString;
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
    this.fontContainer.removeChild(single);
    this.tempSpan.single = null;
  }

  detect(fontName) {
    this.reset();
    return this.detects([fontName]).length > 0;
  }

  detects(fontNames) {
    if (!fontNames || (fontNames.length && fontNames.length === 0)) {
      return [];
    }
    let multiDom = this.tempSpan.multi;
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
    let baseFontLength = this.baseFont.length;
    for (let i = 0; i < fontNames.length; i++) {
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
          rectInfo.height = child.height;
        }
        /**
         * 有些字体的高度有1个像素的误差，不知道什么情况
         * 比如：AI Tarikh
         */
        if (
          Math.abs(rectInfo.width - this.baseInfo[this.baseFont[j]].w) > 1 ||
          Math.abs(rectInfo.height - this.baseInfo[this.baseFont[j]].h) > 1
        ) {
          supportFonts.push(fontNames[i]);
          break;
        }
      }
    }

    if (multiDom) {
      this.fontContainer.removeChild(multiDom);
      this.tempSpan.multi = document.createElement("span");
    }
    return supportFonts;
  }
}
export default FontDetect;
