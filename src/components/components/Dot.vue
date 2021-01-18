<template>
  <div class="dot">
    <span
      :class="{ showDot }"
      @mousedown="mousedownPoint(index)"
      class="point"
      :key="point"
      v-for="(point, index) in pointList"
      :style="getStyle(point, index)"
    />
    <slot></slot>
  </div>
</template>

<script>
import { computed } from "vue"
import { handleNewLeft, handleNewWidth, handleNewTop, handleNewHeight } from "./handleStyle"

const pointList = ["nw", "n", "ne", "w", "e", "sw", "s", "se"]
const COMPENSATION = 4 // 偏移量补偿

export default {
  name: "Dot",
  props: ["canvas", "style", "showDot"],
  setup(props, context) {
    const showDot = computed(() => props.showDot)
    const getStyle = (point, index) => {
      const { width, height } = props.style
      if (index < 3) {
        const left = `${width/2 * index - COMPENSATION}px`
        const top =  `${-COMPENSATION}px`
        return { left, top, cursor: `${point}-resize` }
      }
      if (index >= 3 && index <=4) {
        const left = `${width * (index - 3) - COMPENSATION}px`
        const top = `${height/2 - COMPENSATION}px`
        return { left, top, cursor: `${point}-resize` }
      }

      if (index > 4) {
        const left = `${width/2 * (index - 5) - COMPENSATION}px`
        const top = `${height - COMPENSATION}px`
        return { left, top, cursor: `${point}-resize` }
      }
    }

    const mousedownPoint = (index) => {
      const downEvent = window.event
      downEvent.stopPropagation()
      downEvent.preventDefault()
      const startclientX = downEvent.clientX
      const startclientY = downEvent.clientY
      const { left, top, width, height } = props.style
      const move = (moveEvent) => {
        const difX = moveEvent.clientX - startclientX
        const difY = moveEvent.clientY - startclientY
        // console.log("偏差", difX, difY)
        const _offsetX = [0, 3, 5].includes(index) ? -1 : [2, 4, 7].includes(index) ? 1 : 0 // 判断水平偏移量是正累加还是负累加
        const _offsetY = [0, 1, 2].includes(index) ? -1 : [5, 6, 7].includes(index) ? 1 : 0 // 判断垂直偏移量是正累加还是负累加
        const _offsetL = [0, 3, 5].includes(index) ? 1 : 0 // 判断left偏移量是正累加还是负累加
        const _offsetT = [0, 1, 2].includes(index) ? 1 : 0 // 判断top偏移量是正累加还是负累加
       
        const newLeft = handleNewLeft(width + difX * _offsetX, left + difX * _offsetL, width, left)
        const newWidth = handleNewWidth(width + difX * _offsetX, left + difX * _offsetL, width, left, props.canvas.canvasWidth)
        const newTop = handleNewTop(height + difY * _offsetY, top + difY * _offsetT, height, top)
        const newHeight = handleNewHeight(height + difY * _offsetY, top + difY * _offsetT, height, top, props.canvas.canvasHeight)
        context.emit("changeStyle", {
          width: newWidth,
          left: newLeft,
          height: newHeight,
          top: newTop
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
      pointList,
      getStyle,
      mousedownPoint,
      showDot
    }
  }
}
</script>

<style lang="less" scoped>
  .dot {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .point {
    position: absolute;
  }

  .showDot {
    width: 6px;
    height: 6px;
    border: 1px solid #20c5b9;
    background: white;
    border-radius: 100%;
  }
</style>
