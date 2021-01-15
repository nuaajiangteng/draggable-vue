<template>
  <a-upload
    name="files"
    :show-upload-list="false"
    :before-upload="beforeUpload"
    :customRequest="handleChange"
  >
    <a-button> 插入图片</a-button>
  </a-upload>
  <a-button @click="preview">预览</a-button>
  <a-button type="primary" @click="save">保存</a-button>
  <a-button type="danger" @click="clear">清空画布</a-button>
  <span style="margin-left: 10px">画布大小: </span>
  <a-input-number v-model:value="canvas.canvasWidth" :min="1" :precision="0" />
  <span> * </span>
  <a-input-number v-model:value="canvas.canvasHeight" :min="1" :precision="0" />
</template>

<script>
import { message } from "ant-design-vue"

export default {
  name: "Header",
  props: ["canvas"],
  emits: ["preview", "addImg", "clear", "save"],
  setup(props, context) {
    const preview = () => {
      context.emit("preview")
    }
    const beforeUpload = (file) => {
      const name = file.name.split(".")[file.name.split(".").length - 1]
      const isJpgOrPng = ["jpg", "png"].includes(name)
      if (!isJpgOrPng) {
        message.warning("请选择jpg、png格式图片")
      }
      return isJpgOrPng
    }

    const handleChange = () => {
      const imgUrl = "https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2370333706,3894132172&fm=26&gp=0.jpg"
      const img = new Image()
      img.src = imgUrl
      img.onload = function () {
        const { width, height } = img
        const _height = Math.ceil(100/width * height)
        context.emit("addImg", imgUrl, _height)
      }
    }

    const clear = () => {
      context.emit("clear")
    }

    const save = () => {
      context.emit("save")
    }

    return {
      preview,
      canvas: props.canvas,
      beforeUpload,
      handleChange,
      clear,
      save
    }
  }
}
</script>

<style lang="less" scoped>
  span {
    font-size: 14px;
    
  }
  .ant-btn {
    margin: 15px 5px;
  }
</style>
