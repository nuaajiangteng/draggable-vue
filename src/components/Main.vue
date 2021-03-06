<template>
  <div @contextmenu.prevent class="canvas">
    <div class="header">
      <Header
        @preview="previewCanvas"
        @addImg="addImg"
        @clear="clear"
        @save="save"
        :canvas="canvas"
      />
    </div>
    <div class="content">
      <div class="content-left">
        <UnitList @showDragCopy="value => showDragCopy = value" />
      </div> 
      <div class="content-center">
        <div class="top-line" :style="{ width: `${canvas.canvasWidth}px` }" />
        <div class="bottom-line" :style="{ width: `${canvas.canvasWidth}px` }" />
        <div class="draggable" @mousedown="rangeDown" :style="{ width: `${canvas.canvasWidth}px`, height: `${canvas.canvasHeight}px` }" @dragover="handleDragOver" @drop="handleDrop">
          <!-- draggable-copy 用于拖拽时候作为定位参考(穿透问题) -->
          <div class="draggable-copy" v-show="showDragCopy" :style="{ width: `${canvas.canvasWidth}px`, height: `${canvas.canvasHeight}px` }"></div>

          <div class="range" @mousedown="moveRange" v-show="showRange" :style="{ width: `${range.width}px`, height: `${range.height}px`, left: `${range.left}px`, top: `${range.top}px` }"></div>
          <div @contextmenu="contextmenu($event, component, index)" @mousedown="mousedown($event, index)" :key="index" v-for="(component, index) in components" :class="[curIndex === index ? 'activated' : '','common-class']" :style="handleStyle(component.style, component.type)">
            <Dot :canvas="canvas" @changeStyle="changeStyle" :showDot="curIndex === index && ![5, 6].includes(component.type)" :style="component.style">
              <LockOutlined class="lock" v-show="component.isLock" />
              <img :draggable="false" v-if="component.type === 1" :src="component.text" :style="handleStyle(component.style)" />
              <span v-if="[2, 3].includes(component.type)">{{ component.text }}</span>
              <span v-if="component.type === 4" />
              <div class="table" v-if="component.type === 5">
                <span v-show="!component.isLock" @click="addColumn('left', index)" class="left-icon"><CaretLeftOutlined /></span>
                <table :style="handleStyle(component.style)" border="1">
                  <tr>
                    <td :style="{ width: `${child.width}px` }" :key="_index" v-for="(child, _index) in component.children" @drop="handleDropTable(index, _index, $event)">
                      {{ child.title }}
                      <div class="actions" v-show="!component.isLock">
                        <MinusCircleOutlined class="minus" @click="changeWidth(index, _index, -1)" />
                        <DeleteOutlined @click="deleteColumn(index, _index)" class="delete-icon" />
                        <PlusCircleOutlined class="plus" @click="changeWidth(index, _index, 1)" />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td :style="{ width: `${child.width}px` }" :key="_index" v-for="(child, _index) in component.children" @drop="handleDropTable(index, _index, $event)">{{ child.field }}</td>
                  </tr>
                </table>
                <span v-show="!component.isLock" @click="addColumn('right', index)" class="right-icon"><CaretRightOutlined /></span>
              </div>
              <svg :id="`${component.text}-${index}`" v-if="component.type === 6" />
              <div :draggable="false" :id="`${component.text}-${index}`" v-if="component.type === 7" />
            </Dot>
          </div>

          <Line ref="line" :components="components" :curIndex="curIndex" />
        </div>
      </div>
      <div class="content-right">
        <UnitInfo
          :canvas="canvas"
          :components="components"
          :curIndex="curIndex"
          @barcode="barcode"
          @qrCode="qrCode"
        />
      </div>
    </div>
    <RightMenu
      ref="rightMenu"
      @deleteComponent="deleteComponent"
      @placeTop="placeTop"
      @placeBottom="placeBottom"
      @placeUpDown="placeUpDown"
      @lock="lock"
      @clearActivated="clearActivated"
      @copyComponent="copyComponent"
    />
    <Preview
      ref="preview"
      :components="components"
      :canvas="canvas"
    />
  </div>
</template>

<script>
import { reactive, toRefs, ref, computed, watch, onMounted } from "vue"
import { CaretLeftOutlined, CaretRightOutlined, DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined, LockOutlined } from "@ant-design/icons-vue"
import JsBarcode from "jsbarcode"
import QRCode from "qrcodejs2"

import UnitList from "./components/UnitList"
import UnitInfo from "./components/UnitInfo"
import RightMenu from "./components/RightMenu"
import Dot from "./components/Dot"
import Line from "./components/Line"
import Header from "./components/Header"
import Preview from "./components/Preview"
import { handleNewLeft, handleNewWidth, handleNewTop, handleNewHeight } from "./components/handleStyle"

const ADSORPTION = 3 // 吸附补偿像素
let time
let rangeIndexs = []
let min_max_left = []
let min_max_top = []

const getLeft = (left, width, canvasWidth, flag) => {
  if (flag) {
    if (left < min_max_left[0]) {
      return min_max_left[0]
    } else if (left > min_max_left[1]) {
      return min_max_left[1]
    } else {
      return left
    }
  }
  if (left < 0) {
    return 0
  } else if (left + width > canvasWidth) {
    return canvasWidth - width
  } else {
    return left
  }
}

const getTop = (top, height, canvasHeight, flag) => {
  if (flag) {
    if (top < min_max_top[0]) {
      return min_max_top[0]
    } else if (top > min_max_top[1]) {
      return min_max_top[1]
    } else {
      return top
    }
  }
  if (top < 0) {
    return 0
  } else if (top + height > canvasHeight) {
    return canvasHeight - height
  } else {
    return top
  }
}

const getHeightOrWidth = (nearIndex, number) => {
  const divisor = 2/nearIndex
  return nearIndex === 0 ? 0 : number/divisor
}

const borders = {
  2: "1px solid #e8e8e8",
  3: "1px dashed #e8e8e8"
}

const handleStyle = (style, type) => {
  if (!style) {
    return
  }
  let param = {}
  Object.entries(style).forEach(ele => {
    if (typeof ele[1] === "number") {
      param[ele[0]] = `${ele[1]}px`
    } else {
      param[ele[0]] = ele[1]
    }
  })
  if ([2, 3].includes(type)) {
    param.border = borders[type]
  }
  return param
}

const getStyle = (left, top, type, border) => {
  switch(type) {
    case 2: // 字段信息和纯文本
    case 3:
      return {
        width: 100,
        height: 32,
        left,
        top,
        textAlign: "left",
        fontSize: 12
      }
    case 4: // 线框
      return {
        width: 100,
        height: 32,
        left,
        top,
        textAlign: "left",
        fontSize: 12,
        border
      }
    case 5: // 表格
      return {
        width: 100,
        height: 64,
        left,
        top,
        textAlign: "center"
      }
  }
  
}

export default {
  name: "Main",
  components: {
    UnitList,
    UnitInfo,
    RightMenu,
    Dot,
    Line,
    Header,
    Preview,
    CaretLeftOutlined,
    CaretRightOutlined,
    DeleteOutlined,
    MinusCircleOutlined,
    PlusCircleOutlined,
    LockOutlined
  },
  setup() {
    const canvas = reactive({
      canvasWidth: 500,
      canvasHeight: 500
    })
    const showDragCopy = ref(false)
    const showRange = ref(false)
    const rightMenu = ref()
    const preview = ref()
    const line = ref()

    const obj = reactive({
      components: [], // 当前拥有的拖动控件
      curIndex: null, // 当前左击选中控件下标
      rightIndex: null, // 当前右击选中控件下标
      range: {}
    })

    onMounted(() => {
      obj.components = JSON.parse(window.localStorage.getItem("components") || "[]")
      renderComponents()
    })

    watch(() => obj.components[obj.curIndex]?.style?.displayValue, (value) => {
      if (obj.components[obj.curIndex]?.type === 6) { // 条形码
        const { text } = obj.components[obj.curIndex]
        setTimeout(() => {
          JsBarcode(`#${text}-${obj.curIndex}`, text, {
            width: 1,
            height: 32,
            margin: 0,
            displayValue: value
          })
        })
      }
    })

    watch([() => obj.components[obj.curIndex]?.style?.width, () => obj.components[obj.curIndex]?.style?.height], ([width, height]) => {
      if (obj.components[obj.curIndex]?.type === 7) { // 二维码
        clearInterval(time)
        const { text } = obj.components[obj.curIndex]
        time = setTimeout(() => {
          const qrcodeEL = document.getElementById(`${text}-${obj.curIndex}`)
          qrcodeEL.innerHTML = ""
          new QRCode(qrcodeEL, {
            text,
            width,
            height
          })
          const imgEl = qrcodeEL.getElementsByTagName("img")[0]
          imgEl.setAttribute("draggable", false)
        }, 100)
      }
    })
    // {
    //     type: 1,
    //     text: "https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2370333706,3894132172&fm=26&gp=0.jpg",
    //     style: {
    //       width: 100,
    //       height: 32,
    //       left: 0,
    //       top: 0
    //     }
    //   }
    const handleDropTable = (fatherIndex, childIndex, e) => {
      if (Number(e.dataTransfer.getData("type")) !== 1) { // 表格字段信息才有用
        return
      }
      obj.components[fatherIndex].children[childIndex] = {
        title: e.dataTransfer.getData("title"),
        field: e.dataTransfer.getData("field"),
        width: obj.components[fatherIndex].children[childIndex].width
      }
    }
    
    const handleDrop = (e) => {
      if (Number(e.dataTransfer.getData("type")) === 1) { // 不是表格字段信息没用
        return
      }
      e.preventDefault()
      e.stopPropagation()
      const offsetX = e.dataTransfer.getData("offsetX")
      const offsetY = e.dataTransfer.getData("offsetY")

      const { layerX, layerY } = e
      const left = e.layerX - offsetX > 0 ? getLeft(e.layerX - offsetX, 100, canvas.canvasWidth) : 0
      const top = e.layerY - offsetY > 0 ? getTop(e.layerY - offsetY, 32, canvas.canvasHeight) : 0

      const temp = {
        isScroll: 0,
        type: Number(e.dataTransfer.getData("type")),
        text: e.dataTransfer.getData("title"),
        style: getStyle(left, top, Number(e.dataTransfer.getData("type")), e.dataTransfer.getData("border"))
      }

      if (Number(e.dataTransfer.getData("type")) === 5) { // 表格
        Object.assign(temp, { children: [{ width: 100 }] })
      }
      obj.components.push(temp)
    }
    const handleDragOver = (e) => {
      e.preventDefault() // 没有这样handleDrop不生效
      e.dataTransfer.dropEffect = "copy" // 鼠标进入目标div, 改变鼠标样式, 提示用户
    }
    const mousedown = (e, index) => {
      showRange.value = false
      if (e.which !== 1) { // 只有左击才有效
        return
      }
      if (obj.components[index].isLock) { // 锁定了就不能选中
        return
      }
      const brotherComponents = obj.components.filter((component, _index) => _index !== index)
      obj.curIndex = index
      const startclientX = e.clientX
      const startclientY = e.clientY
      const { left, top, width, height } = obj.components[index].style
      const move = (moveEvent) => {
        let nearTopIndex = -1
        let brotherTopIndex
        let nearLeftIndex = -1
        let brotherLeftIndex

        const _left = getLeft(moveEvent.clientX - startclientX + left, width, canvas.canvasWidth)
        const _top = getTop(moveEvent.clientY - startclientY + top, height, canvas.canvasHeight)
        obj.components[index].style.left = _left
        obj.components[index].style.top = _top

        for (let i=0; i<brotherComponents.length; i++) {
          const { width: bWidth, height: bHeight, left: bLeft, top: bTop } = brotherComponents[i].style
          const curTops = [_top, _top + height/2, _top + height]
          const curLefts = [_left, _left + width/2, _left + width]
          const brotherTops = [bTop, bTop + bHeight/2, bTop + bHeight]
          const brotherLefts = [bLeft, bLeft + bWidth/2, bLeft + bWidth]
          // 获取3条水平线和当前元素top的差值
          const _nearTopIndex = curTops.findIndex((e, index) => {
            brotherTopIndex = brotherTops.findIndex(brother =>  Math.abs(e - brother) <= ADSORPTION)
            return brotherTopIndex !== -1
          })
          nearTopIndex = _nearTopIndex !== -1 ? _nearTopIndex : nearTopIndex
          if (brotherTopIndex !== -1) { // 吸附
            const _height = getHeightOrWidth(nearTopIndex, height)
            obj.components[index].style.top = brotherTops[brotherTopIndex] - _height
          }

          // 获取3条垂直线和当前元素left的差值
          const _nearLeftIndex = curLefts.findIndex((e, index) => {
            brotherLeftIndex = brotherLefts.findIndex(brother =>  Math.abs(e - brother) <= ADSORPTION)
            return brotherLeftIndex !== -1
          })
          nearLeftIndex = _nearLeftIndex !== -1 ? _nearLeftIndex : nearLeftIndex
          if (brotherLeftIndex !== -1) { // 吸附
            const _width = getHeightOrWidth(nearLeftIndex, width)
            obj.components[index].style.left = brotherLefts[brotherLeftIndex] - _width
          }
          if (nearTopIndex !== -1 && nearLeftIndex !== -1) {
            break
          }
        }
        // 展示隐藏线条
        line.value.changeShowLine(nearTopIndex, nearLeftIndex)
      }

      const up = () => {
        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
      }
      window.addEventListener("mousemove", move)
      window.addEventListener("mouseup", up)
    }

    const contextmenu = (e, component, index) => {
      e.preventDefault()
      obj.rightIndex = index
      rightMenu.value.showRightMenu(e, component)
    }

    // 删除元素
    const deleteComponent = () => {
      obj.components.splice(obj.rightIndex, 1)
      obj.curIndex = null
      renderComponents()
    }

    // 复制元素
    const copyComponent = () => {
      const temp = obj.components[obj.rightIndex]
      obj.components.push({
        ...temp,
        isLock: 0,
        style: {
          ...temp.style,
          left: temp.style.left + 10,
          top: temp.style.top + 10
        }
      })
      renderComponents()
    }

    // 置顶元素
    const placeTop = () => {
      const temp = obj.components[obj.rightIndex]
      obj.components.splice(obj.rightIndex, 1)
      obj.components.push(temp)
      if (!temp.isLock) {
        obj.curIndex = obj.components.length - 1
      }
      renderComponents()
    }

    // 置底元素
    const placeBottom = () => {
      const temp = obj.components[obj.rightIndex]
      obj.components.splice(obj.rightIndex, 1)
      obj.components.unshift(temp)
      if (!temp.isLock) {
        obj.curIndex = 0
      }
      renderComponents()
    }

     // 上移或下移
     const placeUpDown = (number) => {
      if (obj.rightIndex === 0 && number === -1) { // 已经是最下面的不要下移
        return
      }
      if (obj.rightIndex === obj.components.length - 1 && number === 1) { // 已经是最上面的不要上移
        return
      }
      const temp = obj.components[obj.rightIndex]
      obj.components.splice(obj.rightIndex, 1)
      obj.components.splice(obj.rightIndex + number, 0, temp)
      if (!temp.isLock) {
        obj.curIndex = obj.curIndex + number
      }
      renderComponents()
    }

    const lock = () => {
      obj.components[obj.rightIndex].isLock = Number(!obj.components[obj.rightIndex].isLock)
      obj.curIndex = null
    }

    const changeStyle = ({ width, height, left, top }) => {
      obj.components[obj.curIndex].style = {
        ...obj.components[obj.curIndex].style,
        width,
        height,
        left,
        top
      }
    }

    const clearActivated = () => {
      obj.curIndex = null
      showRange.value = false
    }

    const addColumn = (flag, fatherIndex) => {
      if (flag === "left") {
        obj.components[fatherIndex].children.unshift({ width: 100 })
      } else {
        obj.components[fatherIndex].children.push({ width: 100 })
      }
      obj.components[fatherIndex].style.width += 100
    }

    const deleteColumn = (fatherIndex, childIndex) => {
      const width = obj.components[fatherIndex].children[childIndex].width
      obj.components[fatherIndex].children.splice(childIndex, 1)
      obj.components[fatherIndex].style.width -= width
      if (!obj.components[fatherIndex].children.length) {
        obj.components.splice(obj.curIndex, 1)
      }
    }

    const changeWidth = (fatherIndex, childIndex, number) => {
      obj.components[fatherIndex].children[childIndex].width += number
      obj.components[fatherIndex].style.width += number
    }

    const barcode = () => {
      const { text, style: { left, top } } = obj.components[obj.curIndex]
      obj.components[obj.curIndex] = {
        type: 6,
        text,
        isScroll: 0,
        style: {
          width: 1,
          height: 32,
          left,
          top,
          displayValue: 1
        }
      }
    }

    const qrCode = () => {
      const { text, style: { left, top } } = obj.components[obj.curIndex]
      obj.components[obj.curIndex] = {
        type: 7,
        text,
        isScroll: 0,
        style: {
          width: 100,
          height: 100,
          left,
          top
        }
      }
    }

    // 删除、复制、置顶、置底、上移、下移后需要重新渲染条码和二维码
    const renderComponents = () => {
      setTimeout(() => {
        obj.components.map((com, index) => ({ ...com, index })).filter(com => [6, 7].includes(com.type)).forEach(com => {
          const { type, text, index, style: { width, height, displayValue } } = com
          if (type === 6) { // 条形码
            JsBarcode(`#${text}-${index}`, text, {
              width: 1,
              height: 32,
              displayValue
            })
          }

          if (type === 7) { // 二维码
            const qrcodeEL = document.getElementById(`${text}-${index}`)
            qrcodeEL.innerHTML = ""
            new QRCode(qrcodeEL, {
              text,
              width,
              height
            })
            const imgEl = qrcodeEL.getElementsByTagName("img")[0]
            imgEl.setAttribute("draggable", false)
          }
        })
      })
    }

    const addImg = (imgUrl, height) => {
      obj.components.push({
        type: 1,
        isScroll: 0,
        text: imgUrl,
        style: {
          width: 100,
          height,
          left: 0,
          top: 0
        }
      })
    }

    const clear = () => {
      window.localStorage.setItem("components", JSON.stringify(obj.components))
      obj.components = []
      obj.curIndex = null
    }
    
    const save = () => {
      window.localStorage.setItem("components", JSON.stringify(obj.components))
    }

    // 预览
    const previewCanvas = () => {
      preview.value.preview()
    }
 
    // 范围选择
    const rangeDown = (e) => {
      const { layerX, layerY, clientX, clientY } = e
      if (e.target.className === "draggable") {
        const move = (moveEvent) => {
          showRange.value = true
          const left = moveEvent.clientX - clientX > 0 ? layerX : layerX - Math.abs(moveEvent.clientX - clientX)
          const top = moveEvent.clientY - clientY > 0 ? layerY : layerY - Math.abs(moveEvent.clientY - clientY)
          const width = Math.abs(moveEvent.clientX - clientX)
          const height = Math.abs(moveEvent.clientY - clientY)

          obj.range = {
            left: handleNewLeft(width, left, 0, layerX),
            top: handleNewTop(height, top, 0, layerY),
            width: handleNewWidth(width, left, 0, layerX, canvas.canvasWidth),
            height: handleNewHeight(height, top, 0, layerY, canvas.canvasHeight)
          }
        }
        const up = () => {
          let minLeft = -Infinity, maxLeft = 0, minTop = -Infinity, maxTop = 0
          const indexs = []
          const { left, top, width, height } = obj.range
          obj.components.forEach((component, index) => {
            const { left: _left, top: _top, width: _width, height: _height } = component.style
            if (!component.isLock && Math.abs((_left + _width) - (width + left)) + Math.abs(_left - left) < (width + _width) &&
                Math.abs((_top + _height) - (height + top)) + Math.abs(_top - top) < (height + _height)) { 
                //区域接触即为选中   
                indexs.push(index) 
                if (minLeft <= left - _left) {
                  minLeft = left - _left
                }
                if (!maxLeft || maxLeft > canvas.canvasWidth - _width - (_left - left)) {
                  maxLeft = canvas.canvasWidth - _width - (_left - left)
                }

                if (minTop < top - _top) {
                  minTop = top - _top
                }
                if (!maxTop || maxTop > canvas.canvasHeight - _height - (_top - top)) {
                  maxTop = canvas.canvasHeight - _height - (_top - top)
                }
            }
            rangeIndexs = indexs
          })

          min_max_left = [minLeft, maxLeft]
          min_max_top = [minTop, maxTop]

          if (!indexs.length) {
            showRange.value = false
          }

          window.removeEventListener("mousemove", move)
          window.removeEventListener("mouseup", up)
        }
        window.addEventListener("mousemove", move)
        window.addEventListener("mouseup", up)
      }
    }

    // 多元素拖动
    const moveRange = (e) => {
      const { left, top } = obj.range
      const { clientX, clientY } = e
      const inRangeComponents = obj.components.filter((component, index) => rangeIndexs.includes(index))
                                              .map((component, index) => ({
                                                left: component.style.left,
                                                top: component.style.top,
                                                index: rangeIndexs[index],
                                                diffLeft: component.style.left - left,
                                                diffTop: component.style.top - top
                                              }))
      const move = (moveEvent) => {
        const cal_left = getLeft(left + moveEvent.clientX - clientX, "", "", "min_max_left")
        const cal_top = getTop(top + moveEvent.clientY - clientY, "", "", "min_max_top")
        obj.range = { ...obj.range, left: cal_left, top: cal_top }
        inRangeComponents.forEach(component => {
          obj.components[component.index].style.left = cal_left + component.diffLeft
          obj.components[component.index].style.top = cal_top + component.diffTop
        })
      }

      const up = () => {
        window.removeEventListener("mousemove", move)
        window.removeEventListener("mouseup", up)
      }

      window.addEventListener("mousemove", move)
      window.addEventListener("mouseup", up)
    }

    return {
      ...toRefs(obj),
      canvas,
      handleDrop,
      handleDropTable,
      handleDragOver,
      mousedown,
      contextmenu,
      rightMenu,
      line,
      deleteComponent,
      copyComponent,
      placeTop,
      placeBottom,
      lock,
      placeUpDown,
      clearActivated,
      changeStyle,
      handleStyle,
      addColumn,
      deleteColumn,
      changeWidth,
      barcode,
      qrCode,
      preview,
      previewCanvas,
      addImg,
      clear,
      save,
      showDragCopy,
      rangeDown,
      showRange,
      moveRange
    }
  }

}
</script>

<style lang="less" scoped>
 @import url("./index.less");
</style>
