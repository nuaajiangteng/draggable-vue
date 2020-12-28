<template>
  <div class="RightMenu" :style="{ display, top, left }">
    <div @click="deleteComponent">删除</div>
    <div @click="copyComponent">复制</div>
    <div @click="placeTop">置顶</div>
    <div @click="placeBottom">置底</div>
    <div @click="placeUpDown(1)">上移</div>
    <div @click="placeUpDown(-1)">下移</div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted } from "vue"

export default {
  name: "RightMenu",
  setup(props, content) {
    onMounted(() => {
      // 监听鼠标事件
      window.addEventListener("mousedown", (e) => {
        if (e.target.className) {
          position.display = "none" // 隐藏右键菜单
        }
        if (e.target.className === "content-center") {
          content.emit("clearActivated") // 激活状态去除
        }
      })
    })
    const position = reactive({
      display: "none",
      left: 0,
      top: 0
    })
    const showRightMenu = (e) => {
      position.left = `${e.clientX}px`
      position.top = `${e.clientY}px`
      position.display = "block"
    }
    const deleteComponent = () => {
      content.emit("deleteComponent")
      position.display = "none"
    }
    const copyComponent = () => {
      content.emit("copyComponent")
      position.display = "none"
    }
    const placeTop = () => {
      content.emit("placeTop")
      position.display = "none"
    }
    const placeBottom = () => {
      content.emit("placeBottom")
      position.display = "none"
    }
    const placeUpDown = (number) => {
      content.emit("placeUpDown", number)
      position.display = "none"
    }
    return {
      showRightMenu,
      ...toRefs(position),
      deleteComponent,
      copyComponent,
      placeTop,
      placeBottom,
      placeUpDown
    }
  }
}
</script>

<style lang="less" scoped>
  .RightMenu {
    position: absolute;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    margin: 5px 0;
    padding: 6px 0;
    div {
      cursor: pointer;
      font-size: 14px;
      padding: 0 20px;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #606266;
      height: 34px;
      line-height: 34px;
      box-sizing: border-box;
      &:hover {
        background: #f0f0f0;
      }
    }
  }
</style>
