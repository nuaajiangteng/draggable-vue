<template>
  <div class="RightMenu" :style="{ display, top, left }">
    <div @click="deleteComponent">删除</div>
    <div @click="copyComponent">复制</div>
    <div @click="placeTop">置顶</div>
    <div @click="placeBottom">置底</div>
    <div @click="placeUpDown(1)">上移</div>
    <div @click="placeUpDown(-1)">下移</div>
    <div @click="lock">{{ lockName }}</div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, ref } from "vue"

export default {
  name: "RightMenu",
  setup(props, context) {
    const lockName = ref("锁定")
    onMounted(() => {
      // 监听鼠标事件
      window.addEventListener("mousedown", (e) => {
        if (e.target.className) {
          position.display = "none" // 隐藏右键菜单
        }
        if (["content-center", "draggable"].includes(e.target.className)) {
          context.emit("clearActivated") // 激活状态去除
        }
      })
    })
    const position = reactive({
      display: "none",
      left: 0,
      top: 0
    })
    const showRightMenu = (e, component) => {
      context.emit("clearActivated") // 激活状态去除
      position.left = `${e.clientX}px`
      position.top = `${e.clientY}px`
      position.display = "block"
      lockName.value = component.isLock ? "解锁" : "锁定"
    }
    const deleteComponent = () => {
      context.emit("deleteComponent")
      position.display = "none"
    }
    const copyComponent = () => {
      context.emit("copyComponent")
      position.display = "none"
    }
    const placeTop = () => {
      context.emit("placeTop")
      position.display = "none"
    }
    const placeBottom = () => {
      context.emit("placeBottom")
      position.display = "none"
    }
    const placeUpDown = (number) => {
      context.emit("placeUpDown", number)
      position.display = "none"
    }
    const lock = () => {
      context.emit("lock")
      position.display = "none"
    }
    return {
      showRightMenu,
      ...toRefs(position),
      deleteComponent,
      copyComponent,
      placeTop,
      placeBottom,
      placeUpDown,
      lock,
      lockName
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
