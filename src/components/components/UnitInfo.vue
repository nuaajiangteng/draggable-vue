<template>
  <div class="unitInfo">
    <div v-show="showWidthHeight">
      <span>宽: </span><a-input-number :disabled="curComInfo.type === 5" v-model:value="curComInfo.style.width" :min="1" :max="maxW" :precision="0" />
    </div>
    <div v-show="showWidthHeight">
      <span>高: </span><a-input-number :disabled="curComInfo.type === 5" v-model:value="curComInfo.style.height" :min="1" :max="maxH" :precision="0" />
    </div>
    <div v-show="showFontSize">
      <span>字体大小: </span><a-input-number v-model:value="curComInfo.style.fontSize" :min="12" :precision="0" />
    </div>
    <div>
      <span>x坐标: </span><a-input-number v-model:value="curComInfo.style.left" :min="0" :max="maxL" :precision="0" />
    </div>
    <div>
      <span>y坐标: </span><a-input-number v-model:value="curComInfo.style.top" :min="0" :max="maxT" :precision="0" />
    </div>
    <div v-show="showTextAlign">
      <span>对齐方式: </span>
      <a-select v-model:value="curComInfo.style.textAlign">
        <a-select-option key="left">左对齐</a-select-option>
        <a-select-option key="center">居中</a-select-option>
        <a-select-option key="right">右对齐</a-select-option>
      </a-select>
    </div>
    <div v-show="showText">
      <span>内容: </span><a-textarea v-model:value="curComInfo.text" :autoSize="{ minRows: 4, maxRows: 4 }" />
    </div>
    <div v-show="showBorder">
      <span>线条粗细: </span>
      <a-select v-model:value="curComInfo.style.border">
        <a-select-option :key="`1px ${borderSolid} black`">1px</a-select-option>
        <a-select-option :key="`2px ${borderSolid} black`">2px</a-select-option>
        <a-select-option :key="`3px ${borderSolid} black`">3px</a-select-option>
      </a-select>
    </div>
    <div v-show="showCode">
      <span>条形码: </span>
      <a-button @click="barcode" type="primary">转为条形码</a-button>
    </div>
    <div v-show="showCode">
      <span>二维码: </span>
      <a-button @click="qrCode" type="primary">转为二维码</a-button>
    </div>
    <div v-show="curComInfo.type === 6">
      <span>条码文字: </span>
      <a-select v-model:value="curComInfo.style.displayValue">
        <a-select-option :key="1">显示</a-select-option>
        <a-select-option :key="0">不显示</a-select-option>
      </a-select>
    </div>
    <div v-show="showScroll">
      <span>跟随表格: </span>
      <a-select v-model:value="curComInfo.isScroll">
        <a-select-option :key="1">跟随</a-select-option>
        <a-select-option :key="0">不跟随</a-select-option>
      </a-select>
    </div>
  </div>
</template>

<script>
import { computed, reactive, watch, toRefs } from "vue"

const canvasWidth = 1200
const canvasHeight = 600

export default {
  name: "UnitInfo",
  props: ["components", "curIndex", "canvas"],
  setup(props, context) {
    let curComInfo = computed(() => props.components?.[props.curIndex] || { style: {} })
    const maxValue = reactive({ // 限制宽高左右的最大值
      maxW: 0,
      maxH: 0,
      maxL: 0,
      maxT: 0
    })
    const showFontSize = computed(() => [2, 3].includes(curComInfo.value.type))
    const showText = computed(() => [3].includes(curComInfo.value.type))
    const showTextAlign = computed(() => [2, 3].includes(curComInfo.value.type))
    const showBorder = computed(() => [4].includes(curComInfo.value.type))
    const borderSolid = computed(() => curComInfo.value?.style?.border?.split(" ")[1] || "dashed")
    const showWidthHeight = computed(() => [1, 2, 3, 4, 5, 7].includes(curComInfo.value.type))
    const showCode = computed(() => [2].includes(curComInfo.value.type))
    const showScroll = computed(() => [1, 2, 3, 4, 6, 7].includes(curComInfo.value.type))
    const barcode = () => {
      context.emit("barcode")
    }
    const qrCode = () => {
      context.emit("qrCode")
    }
    watch(curComInfo, (value) => {
      const { canvasWidth, canvasHeight } = props.canvas
      const { width, height, left, top } = value.style
      maxValue.maxW = canvasWidth - left
      maxValue.maxH = canvasHeight - top
      maxValue.maxL = canvasWidth - width
      maxValue.maxT = canvasHeight - height
    }, { deep: true })
    return {
      curComInfo,
      showFontSize,
      showText,
      showTextAlign,
      showBorder,
      showWidthHeight,
      showCode,
      showScroll,
      borderSolid,
      barcode,
      qrCode,
      ...toRefs(maxValue)
    }
  }
}
</script>

<style lang="less" scoped>
  .unitInfo > div {
    margin-top: 10px;
    display: flex;
    align-items: center;
    > span {
      width: 60px;
      margin-right: 10px;
      display: inline-block;
      font-weight: bold;
      text-align: right;
    }
    .ant-input-number, .ant-input, .ant-select {
      width: 170px;
    }
  }
</style>
