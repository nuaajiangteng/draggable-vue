<template>
  <a-button>撤销</a-button>
  <a-button>重做</a-button>
  <a-button>插入图片</a-button>
  <a-button type="primary">保存</a-button>
  <a-button type="danger">清空画布</a-button>
  <span style="margin-left: 10px">画布大小: </span>
  <a-input-number :min="1" :precision="0" />
  <span> * </span>
  <a-input-number :min="1" :precision="0" />
</template>

<script>
import {  } from "vue"

export default {
  name: "Header",
  setup(props, content) {
    
    return {
      
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
