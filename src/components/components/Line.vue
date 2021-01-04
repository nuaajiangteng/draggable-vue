<template>
  <div
    v-for="(line, index) in lines"
    :key="line"
    v-show="lineStatus[line]"
    :class="{ lineX: index < 3, lineY: index >= 3 }"
    :style="{ top: `${tops[index]}px`, left: `${lefts[index-3]}px` }"
  />
</template>

<script>
import { ref, computed, reactive, onMounted } from "vue"

const lines = ["xt", "xc", "xb", "yl", "yc", "yr"]
export default {
  props: ["components", "curIndex"],
  name: "Line",
  setup(props, context) {
    const up = () => {
      lines.forEach(line => lineStatus[line] = false)
    }
    onMounted(() => window.addEventListener("mouseup", up))
    const tops = computed(
      () => {
        const { top, height } = props.components?.[props.curIndex]?.style || {}
        const _top = parseInt(top)
        const _height = parseInt(height)
        return [_top, _top + _height/2, _top + _height]
      }
    )
    const lefts = computed(
      () => {
        const { left, width } = props.components?.[props.curIndex]?.style || {}
        const _left = parseInt(left)
        const _width = parseInt(width)
        return [_left, _left + _width/2, _left + _width]
      }
    )
    let lineStatus = reactive({
      xt: false,
      xc: false,
      xb: false,
      yl: false,
      yc: false,
      yr: false,
    })
    // 显示线条
    const changeShowLine = (nearTopIndex, nearLeftIndex) => {
      lines.forEach((line , index) => {
        if (index < 3) {
          lineStatus[line] = nearTopIndex === index
        } else {
          lineStatus[line] = nearLeftIndex === index - 3
        }
      })
    }
    return {
      lines,
      tops,
      lefts,
      lineStatus,
      changeShowLine
    }
  }
}
</script>

<style lang="less" scoped>
.lineX {
  position: absolute;
  width: 100%;
  height: 1px;
  background: #59c7f9;
}
.lineY {
  position: absolute;
  width: 1px;
  height: 100%;
  background: #59c7f9;
}
</style>
