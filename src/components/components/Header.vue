<template>
  <a-button>撤销</a-button>
  <a-button>重做</a-button>
  <a-upload
    name="files"
    :show-upload-list="false"
    action="http://svc.gaowangluo.com/bns/file/uploadFiles"
    :before-upload="beforeUpload"
    @change="handleChange"
  >
    <a-button>插入图片</a-button>
  </a-upload>
  <a-button @click="preview">预览</a-button>
  <a-button type="primary">保存</a-button>
  <a-button type="danger">清空画布</a-button>
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
  emits: ["preview", "addImg"],
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

    const handleChange = (info) => {
      if (info.file.status === "done") {
        const imgUrl = info.file.response.split("message: ")[info.file.response.split("message: ").length - 1]
        const img = new Image()
        img.src = imgUrl
        img.onload = function () {
          const { width, height } = img
          const _height = Math.ceil(100/width * height)
          context.emit("addImg", imgUrl, _height)
        }
      }
    }
    return {
      preview,
      canvas: props.canvas,
      beforeUpload,
      handleChange
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
