import './tailwind.css';
import './custom.less';
import { Button, Input } from 'antd';
import { Component, Fragment } from 'react';
import bgSrc from './assets/bg.png';
import iconBottom from './assets/icon_bottom.svg';
import iconLeft from './assets/icon_left.svg';
import iconRight from './assets/icon_right.svg';
import iconTop from './assets/icon_top.svg';
import iconTriangleToBottom from './assets/icon_triangleToBottom.png';
import iconTriangleToLeft from './assets/icon_triangleToLeft.png';
import iconTriangleToRight from './assets/icon_triangleToRight.png';
import iconTriangleToTop from './assets/icon_triangleToTop.png';
import iconAll from './assets/icon_all.svg';

interface AppProps {
  window?: Window;
  parent?: Window;
  useShowSizeSlice?: boolean;
}
enum CurState {
  Loading,
  NoSelection,
  Initialize,
}
interface MarginData {
  icon: string;
  label: string;
  percentStr: string;
  percent: number;
  pixelStr: string;
  pixel: number;
}
interface SliceLineData {
  baseLeft: number;
  baseTop: number;
  leftOffset: number;
  topOffset: number;
  left: number;
  top: number;
  width: number;
  height: number;
}
interface AppState {
  curState: CurState;
  imgObj: HTMLImageElement;
  imgSrc: string;
  imgWidth: number;
  imgHeight: number;
  marginData: { all: MarginData; left: MarginData; top: MarginData; right: MarginData; bottom: MarginData };
  sliceLineData: { left: SliceLineData; right: SliceLineData; top: SliceLineData; bottom: SliceLineData };
}

export class UI extends Component<AppProps, AppState> {
  //figma中节点数据
  nodeName: string = null;
  showRect: Rect = null;
  originalImageData: ArrayBuffer = null;
  originalNode: SceneNode = null;
  //用来切片的尺寸（如果useShowSizeSlice为真，则会将图像缩放到figma中显示的尺寸后再做切片）
  sliceSize: Rect = null;
  //后缀符号
  percentSuffix: string = '%';
  pixelSuffix: string = '';

  state: AppState = {
    curState: CurState.Loading,
    imgObj: null,
    imgSrc: null,
    imgWidth: 100,
    imgHeight: 100,
    marginData: {
      all: {
        icon: iconAll,
        label: 'Proportional',
        percentStr: '0' + this.percentSuffix,
        percent: 0,
        pixelStr: '0' + this.pixelSuffix,
        pixel: 0,
      },
      left: {
        icon: iconLeft,
        label: 'Left',
        percentStr: '0' + this.percentSuffix,
        percent: 0,
        pixelStr: '0' + this.pixelSuffix,
        pixel: 0,
      },
      top: {
        icon: iconTop,
        label: 'Top',
        percentStr: '0' + this.percentSuffix,
        percent: 0,
        pixelStr: '0' + this.pixelSuffix,
        pixel: 0,
      },
      right: {
        icon: iconRight,
        label: 'Right',
        percentStr: '0' + this.percentSuffix,
        percent: 0,
        pixelStr: '0' + this.pixelSuffix,
        pixel: 0,
      },
      bottom: {
        icon: iconBottom,
        label: 'Bottom',
        percentStr: '0' + this.percentSuffix,
        percent: 0,
        pixelStr: '0' + this.pixelSuffix,
        pixel: 0,
      },
    },
    sliceLineData: null,
  };
  //切线宽度
  sliceLineWidth: number = 2;
  //当前拖拽的切线
  curMoveLine: { key: string; lineData: SliceLineData; startX: number; startY: number } = null;
  lastDownPoint: Vector = { x: 0, y: 0 };

  constructor(props: AppProps) {
    super(props);
    props.window.onmessage = this.onMessage;
    props.window.onmousemove = this.onMouseMove;
    props.window.onmouseup = this.onMouseUp;
  }

  componentDidMount = () => {
    this.props.parent.postMessage({ pluginMessage: { type: 'ONLOAD' } }, '*');
  };

  onMessage = (event) => {
    const eventType: string = event.data.pluginMessage.type;
    switch (eventType) {
      case 'NO_SELECTION':
        this.setState({ curState: CurState.NoSelection });
        break;
      case 'INITIALIZE':
        this.nodeName = event.data.pluginMessage.nodeName;
        this.showRect = event.data.pluginMessage.showRect;
        this.originalImageData = event.data.pluginMessage.data;
        this.originalNode = event.data.pluginMessage.originalNode;
        this.onInitialize(this.originalImageData);
        break;
    }
  };
  /**初始化页面 */
  async onInitialize(data: any) {
    let imgSrc = URL.createObjectURL(new Blob([data]));
    const image: HTMLImageElement = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(null);
      img.src = imgSrc;
    });
    const { useShowSizeSlice } = this.props;
    //初始化切片使用的尺寸
    this.sliceSize = {
      x: 0,
      y: 0,
      width: useShowSizeSlice ? this.showRect.width : image.width,
      height: useShowSizeSlice ? this.showRect.height : image.height,
    };
    //初始化图片按比例放大/缩小后显示的尺寸
    let imgWidth = this.sliceSize.width;
    let imgHeight = this.sliceSize.height;
    if (imgWidth !== 240) {
      imgWidth = 240; //宽度最大300
      imgHeight = (imgWidth / this.sliceSize.width) * this.sliceSize.height;
    }
    if (imgHeight > 192) {
      imgHeight = 192; //高度最大200
      imgWidth = (imgHeight / this.sliceSize.height) * this.sliceSize.width;
    }

    const halfSliceLineWidth = this.sliceLineWidth / 2;
    this.setState({
      curState: CurState.Initialize,
      imgObj: image,
      imgSrc,
      imgWidth,
      imgHeight,
      sliceLineData: {
        //初始化切线位置
        left: {
          baseLeft: 0,
          baseTop: -imgHeight,
          leftOffset: -halfSliceLineWidth,
          topOffset: 0,
          left: 0,
          top: -imgHeight,
          width: this.sliceLineWidth,
          height: imgHeight,
        },
        right: {
          baseLeft: imgWidth,
          baseTop: -imgHeight * 2,
          leftOffset: -halfSliceLineWidth,
          topOffset: 0,
          left: imgWidth,
          top: -imgHeight * 2,
          width: this.sliceLineWidth,
          height: imgHeight,
        },
        top: {
          baseLeft: 0,
          baseTop: -imgHeight * 3,
          leftOffset: 0,
          topOffset: -halfSliceLineWidth,
          left: 0,
          top: -imgHeight * 3,
          width: imgWidth,
          height: this.sliceLineWidth,
        },
        bottom: {
          baseLeft: 0,
          baseTop: -imgHeight * 2 - this.sliceLineWidth,
          leftOffset: 0,
          topOffset: -halfSliceLineWidth,
          left: 0,
          top: -imgHeight * 2 - this.sliceLineWidth,
          width: imgWidth,
          height: this.sliceLineWidth,
        },
      },
    });
  }
  /**点击确定 */
  onConfirm = () => {
    this.startSlice();
  };
  /*开始切片 */
  async startSlice() {
    const { useShowSizeSlice } = this.props;
    const { imgObj } = this.state;
    const { left, top, right, bottom } = this.state.marginData;
    const xArr = [0, left.pixel, this.sliceSize.width - right.pixel];
    const yArr = [0, top.pixel, this.sliceSize.height - bottom.pixel];
    const wArr = [left.pixel, this.sliceSize.width - left.pixel - right.pixel, right.pixel];
    const hArr = [top.pixel, this.sliceSize.height - top.pixel - bottom.pixel, bottom.pixel];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const newImgObj = !useShowSizeSlice
      ? imgObj
      : await this.adjustOriginalImage(canvas, ctx, imgObj, {
          width: this.sliceSize.width,
          height: this.sliceSize.height,
        });
    let fragments = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const clipRect: Rect = { x: xArr[j], y: yArr[i], width: wArr[j], height: hArr[i] };
        const fragment =
          clipRect.width <= 0 || clipRect.height <= 0 ? null : await this.sliceOne(canvas, ctx, newImgObj, clipRect);
        fragments.push({ rect: clipRect, data: fragment });
      }
    }

    this.props.parent.postMessage(
      {
        pluginMessage: {
          type: 'SLICE_COMPLETED',
          sliceData: {
            fragments,
            width: this.sliceSize.width,
            height: this.sliceSize.height,
          },
          showRect: this.showRect,
          nodeName: this.nodeName,
          originalImageData: this.originalImageData,
          originalNode: this.originalNode,
        },
      },
      '*'
    );
  }
  /**把源图片缩放到目前figma中展示的尺寸 */
  async adjustOriginalImage(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    adjustSize: { width: number; height: number }
  ): Promise<HTMLImageElement> {
    canvas.width = adjustSize.width;
    canvas.height = adjustSize.height;
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, adjustSize.width, adjustSize.height);
    const newBytes: ArrayBuffer = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
        reader.onerror = () => reject(null);
        reader.readAsArrayBuffer(blob);
      });
    });
    let imgSrc = URL.createObjectURL(new Blob([newBytes]));
    const newImage: HTMLImageElement = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(null);
      img.src = imgSrc;
    });

    return newImage;
  }
  /**切一片 */
  async sliceOne(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    size: Rect
  ): Promise<ArrayBuffer> {
    canvas.width = size.width;
    canvas.height = size.height;
    ctx.drawImage(image, -size.x, -size.y);
    const newBytes: ArrayBuffer = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
        reader.onerror = () => reject(null);
        reader.readAsArrayBuffer(blob);
      });
    });
    return newBytes;
  }
  /**输入百分比 */
  onPercentChange(e, key) {
    this.state.marginData[key].percentStr = e.target.value;
    this.setState({
      marginData: { ...this.state.marginData },
    });
  }
  /**失去焦点 */
  onInputBlur(key: string, data: MarginData) {
    const percentStr = data.percentStr.replace(this.percentSuffix, '');
    let percent = parseFloat(percentStr);
    percent = Math.floor(percent * 10) / 10; //保留一位小数，后面的不要
    if (isNaN(percent) || percent <= 0 || percent > 100) {
      percent = 0;
    }
    this.setPercent(key, percent);
    this.setSliceLineOffset(key, percent);
  }
  /**输入原始像素 */
  onPixelChange(e, key) {
    this.state.marginData[key].pixelStr = e.target.value;
    this.setState({
      marginData: { ...this.state.marginData },
    });
  }
  /**像素输入完成 */
  onPixelInputBlur(key: string, data: MarginData) {
    const pixelStr = data.pixelStr.replace(this.pixelSuffix, '');
    let pixel = parseFloat(pixelStr);
    pixel = Math.floor(pixel * 10) / 10; //保留一位小数，后面的不要
    if (
      isNaN(pixel) ||
      pixel <= 0 ||
      ((key === 'left' || key === 'right') && pixel > this.sliceSize.width) ||
      ((key === 'top' || key === 'bottom') && pixel > this.sliceSize.height) ||
      (key === 'all' && (pixel > this.sliceSize.width || pixel > this.sliceSize.height))
    ) {
      pixel = 0;
    }
    this.setPixel(key, pixel);
  }
  /**回车确认输入 */
  onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      e.currentTarget.blur();
    }
  };
  /**设置百分比 */
  setPercent(key: string, percent: number) {
    this.computePercents(key, percent);
    const { all, left, right, top, bottom } = this.state.marginData;
    if (key !== 'all') {
      if (
        left.percentStr === right.percentStr &&
        left.percentStr === top.percentStr &&
        left.percentStr === bottom.percentStr
      ) {
        all.percentStr = left.percentStr;
      } else {
        all.percentStr = '-';
      }
    }

    if (left.pixel === right.pixel && left.pixel === top.pixel && left.pixel === bottom.pixel) {
      all.pixelStr = left.pixelStr;
    } else {
      all.pixelStr = '-';
    }

    this.setState({ marginData: { ...this.state.marginData } });
  }
  /**计算百分比以及原始像素 */
  computePercents(key: string, percent: number) {
    const realPercent = percent / 100;
    switch (key) {
      case 'left':
        this.state.marginData.left.pixel = Math.round(realPercent * this.sliceSize.width * 10) / 10;
        break;
      case 'right':
        this.state.marginData.right.pixel = Math.round(realPercent * this.sliceSize.width * 10) / 10;
        break;
      case 'top':
        this.state.marginData.top.pixel = Math.round(realPercent * this.sliceSize.height * 10) / 10;
        break;
      case 'bottom':
        this.state.marginData.bottom.pixel = Math.round(realPercent * this.sliceSize.height * 10) / 10;
        break;
      default:
        for (let k of (Object as any).keys(this.state.marginData)) {
          if (k !== 'all') {
            this.computePercents(k, percent);
          }
        }
        break;
    }
    this.state.marginData[key].percent = realPercent;
    this.state.marginData[key].percentStr = percent + this.percentSuffix;
    this.state.marginData[key].pixelStr = this.state.marginData[key].pixel + this.pixelSuffix;
  }
  /**设置像素值 */
  setPixel(key: string, pixel: number) {
    this.computePixels(key, pixel);
    const { all, left, right, top, bottom } = this.state.marginData;
    if (key !== 'all') {
      if (left.pixel === right.pixel && left.pixel === top.pixel && left.pixel === bottom.pixel) {
        all.pixelStr = left.pixelStr;
      } else {
        all.pixelStr = '-';
      }
    }

    if (
      left.percentStr === right.percentStr &&
      left.percentStr === top.percentStr &&
      left.percentStr === bottom.percentStr
    ) {
      all.percentStr = left.percentStr;
    } else {
      all.percentStr = '-';
    }
    this.setState({ marginData: { ...this.state.marginData } });
  }
  /**计算像素值 */
  computePixels(key: string, pixel: number) {
    switch (key) {
      case 'left':
        this.state.marginData.left.percent = pixel / this.sliceSize.width;
        break;
      case 'right':
        this.state.marginData.right.percent = pixel / this.sliceSize.width;
        break;
      case 'top':
        this.state.marginData.top.percent = pixel / this.sliceSize.height;
        break;
      case 'bottom':
        this.state.marginData.bottom.percent = pixel / this.sliceSize.height;
        break;
      default:
        for (let k of (Object as any).keys(this.state.marginData)) {
          if (k !== 'all') {
            this.computePixels(k, pixel);
          }
        }
        break;
    }
    this.state.marginData[key].pixel = pixel;
    this.state.marginData[key].pixelStr = pixel + this.pixelSuffix;
    const percent = Math.round(this.state.marginData[key].percent * 1000) / 10;
    this.state.marginData[key].percentStr = percent + this.percentSuffix;
    if (key !== 'all') {
      this.setSliceLineOffset(key, percent);
    }
  }
  /**设置切线偏移 */
  setSliceLineOffset(key: string, percent: number) {
    this.computeSliceLineOffsets(key, percent);
    this.setState({ sliceLineData: { ...this.state.sliceLineData } });
  }
  /**计算切线偏移 */
  computeSliceLineOffsets(key: string, percent: number) {
    const realPercent = percent / 100;
    switch (key) {
      case 'left':
        this.state.sliceLineData.left.left = Math.round(realPercent * this.state.imgWidth * 10) / 10;
        break;
      case 'right':
        this.state.sliceLineData.right.left =
          this.state.imgWidth - Math.round(realPercent * this.state.imgWidth * 10) / 10;
        break;
      case 'top':
        this.state.sliceLineData.top.top =
          this.state.sliceLineData.top.baseTop + Math.round(realPercent * this.state.imgHeight * 10) / 10;
        break;
      case 'bottom':
        this.state.sliceLineData.bottom.top =
          this.state.sliceLineData.bottom.baseTop - Math.round(realPercent * this.state.imgHeight * 10) / 10;
        break;
      default:
        for (let k of (Object as any).keys(this.state.marginData)) {
          if (k !== 'all') {
            this.setSliceLineOffset(k, percent);
          }
        }
        break;
    }
  }
  onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, key: string, lineData: SliceLineData) => {
    this.curMoveLine = { key, lineData, startX: lineData.left, startY: lineData.top };
    this.lastDownPoint = { x: e.clientX, y: e.clientY };
  };
  onMouseUp = (e: MouseEvent) => {
    this.curMoveLine = null;
  };
  /**拖拽切线 */
  onMouseMove = (e: MouseEvent) => {
    if (!this.curMoveLine) {
      return;
    }
    const offsetX = e.clientX - this.lastDownPoint.x;
    const offsetY = e.clientY - this.lastDownPoint.y;
    const varX = this.curMoveLine.startX + offsetX;
    const varY = this.curMoveLine.startY + offsetY;
    let curPercent = 0;
    const { imgWidth, imgHeight } = this.state;
    switch (this.curMoveLine.key) {
      case 'left':
        const leftOffsetMax = this.state.sliceLineData.right.left - 4;
        this.curMoveLine.lineData.left = varX < 0 ? 0 : varX > leftOffsetMax ? leftOffsetMax : varX;
        curPercent = Math.round((this.curMoveLine.lineData.left / imgWidth) * 1000) / 10;
        break;
      case 'right':
        const rightOffsetMin = this.state.sliceLineData.left.left + 4;
        this.curMoveLine.lineData.left =
          varX < rightOffsetMin ? rightOffsetMin : varX > this.state.imgWidth ? this.state.imgWidth : varX;
        curPercent = Math.round(((imgWidth - this.curMoveLine.lineData.left) / imgWidth) * 1000) / 10;
        break;
      case 'top':
        const topOffsetMin = this.state.sliceLineData.top.baseTop;
        const topOffsetMax = this.state.sliceLineData.bottom.top + this.sliceLineWidth - 4;
        this.curMoveLine.lineData.top = varY < topOffsetMin ? topOffsetMin : varY > topOffsetMax ? topOffsetMax : varY;
        curPercent =
          Math.round(((this.curMoveLine.lineData.top - this.curMoveLine.lineData.baseTop) / imgHeight) * 1000) / 10;
        break;
      case 'bottom':
        const bottomOffsetMin = this.state.sliceLineData.top.top - this.sliceLineWidth + 4;
        const bottomOffsetMax = this.state.sliceLineData.bottom.baseTop;
        this.curMoveLine.lineData.top =
          varY < bottomOffsetMin ? bottomOffsetMin : varY > bottomOffsetMax ? bottomOffsetMax : varY;
        curPercent =
          Math.round(((-this.curMoveLine.lineData.top + this.curMoveLine.lineData.baseTop) / imgHeight) * 1000) / 10;
        break;
    }

    this.setPercent(this.curMoveLine.key, curPercent);
    this.setState({ sliceLineData: { ...this.state.sliceLineData } });
  };
  /**渲染切线两端三角形 */
  renderTriangle(key: string, index: number): JSX.Element {
    let triangleName = iconTriangleToBottom;
    let left = 0;
    let top = 0;
    let triangleWidth = 11;
    let triangleHeight = 9;
    const offset = 3;
    const { imgWidth, imgHeight } = this.state;
    switch (key) {
      case 'left':
      case 'right':
        left = -Math.floor(triangleWidth / 2);
        if (index == 0) {
          triangleName = iconTriangleToBottom;
          top = -imgHeight - triangleHeight - offset;
        } else {
          triangleName = iconTriangleToTop;
          top = -triangleHeight + offset;
        }
        break;
      case 'top':
      case 'bottom':
        let temp = triangleWidth;
        triangleWidth = triangleHeight;
        triangleHeight = temp;
        top = -Math.ceil(triangleHeight / 2);
        if (index == 0) {
          triangleName = iconTriangleToRight;
          left = -triangleWidth - offset;
        } else {
          triangleName = iconTriangleToLeft;
          left = imgWidth - triangleWidth + offset;
        }
        break;
    }
    return (
      <img
        src={triangleName}
        style={{ position: 'relative', left, top, width: triangleWidth, height: triangleHeight }}
      />
    );
  }

  renderContent(): JSX.Element {
    return (
      <div className="cube-slice-scaling">
        <div className="font-bold mb-2">View</div>
        <div className="imgContainer" style={{ background: `url(${bgSrc})` }}>
          <div style={{ width: this.state.imgWidth, height: this.state.imgHeight }}>
            <img src={this.state.imgSrc} className="img" />
            {(Object as any).entries(this.state.sliceLineData).map((el, index) => {
              const data = el[1] as SliceLineData;
              const key = el[0] as string;
              return (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    left: data.left + data.leftOffset,
                    top: data.top + data.topOffset,
                    width: data.width,
                    height: data.height,
                    cursor:
                      key === 'left'
                        ? 'e-resize'
                        : key === 'right'
                        ? 'w-resize'
                        : key === 'top'
                        ? 's-resize'
                        : 'n-resize',
                  }}
                  onMouseDown={(e) => this.onMouseDown(e, el[0], data)}
                >
                  <div
                    style={{
                      position: 'relative',
                      left: 0,
                      top: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'red',
                    }}
                  />
                  {this.renderTriangle(key, 0)}
                  {this.renderTriangle(key, 1)}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <div className="font-bold mb-2">Setting</div>
          {(Object as any).entries(this.state.marginData).map((el, index) => {
            const data: MarginData = el[1] as MarginData;
            return (
              <div className="marginContainer gap-3" key={index}>
                <img src={data.icon} />
                <div className="flex-1">{data.label}</div>
                <Input
                  className="flex-1"
                  value={data.percentStr}
                  onChange={(e) => this.onPercentChange(e, el[0])}
                  onBlur={() => this.onInputBlur(el[0], data)}
                  onKeyDown={(e) => this.onKeyDown(e)}
                />
                <Input
                  className="flex-1"
                  value={data.pixelStr}
                  onChange={(e) => this.onPixelChange(e, el[0])}
                  onBlur={() => this.onPixelInputBlur(el[0], data)}
                  onKeyDown={(e) => this.onKeyDown(e)}
                />
              </div>
            );
          })}
          <div style={{ textAlign: 'center' }}>
            <Button size="large" type="primary" className="w-full mt-6" onClick={this.onConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    switch (this.state.curState) {
      case CurState.Loading:
        return <div style={{ paddingTop: 100, textAlign: 'center', fontSize: 14 }}>Loading...</div>;
      case CurState.NoSelection:
        return (
          <div style={{ paddingTop: 100, textAlign: 'center', fontSize: 14 }}>
            <div>Please select an image</div>
            <div>before running the plugin.</div>
          </div>
        );
      case CurState.Initialize:
        return this.renderContent();
    }
  }
}
