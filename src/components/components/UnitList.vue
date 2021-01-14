<template>
  <div class="handleDragStart" @dragstart="handleDragStart" @dragend="handleDragEnd">
    <h3>表格字段信息</h3>
    <div draggable="true" data-title="商品编码" data-field="productNo" data-type="1" class="unit">商品编码</div>
    <div draggable="true" data-title="商品名称" data-field="productName" data-type="1" class="unit">商品名称</div>
    <div draggable="true" data-title="商品单价" data-field="price" data-type="1" class="unit">商品单价</div>
    <h3>字段信息</h3>
    <div draggable="true" data-title="name" data-type="2" class="unit">姓名</div>
    <div draggable="true" data-title="age" data-type="2" class="unit">年龄</div>
    <div draggable="true" data-title="score" data-type="2" class="unit">分数</div>
    <h3>文本信息</h3>
    <div draggable="true" data-title="纯文本" data-type="3" class="unit">纯文本</div>
    <h3>线框</h3>
    <div draggable="true" :data-border="tool.border" data-type="4" :style="{ border: tool.border }" class="lineCss" v-for="(tool, index) in toolBoxs" :key="tool.title">
      {{ tool.title }}
    </div>
    <h3>表格</h3>
    <table draggable="true" border="1" data-type="5">
      <tr>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td></td>
        <td></td>
      </tr>
    </table>
  </div>
</template>

<script>

const toolBoxs = [
  { title: "矩形实线框", border: "1px solid black" },
  { title: "矩形虚线框", border: "1px dashed black" }
]

export default {
  name: "UnitList",
  setup(props, content) {
    const handleDragStart = (e) => {
      e.dataTransfer.setData("field", e.target.dataset.field)
      e.dataTransfer.setData("type", e.target.dataset.type)
      e.dataTransfer.setData("title", e.target.dataset.title)
      e.dataTransfer.setData("border", e.target.dataset.border)
      e.dataTransfer.setData("offsetX", e.offsetX)
      e.dataTransfer.setData("offsetY", e.offsetY)
      content.emit("showDragCopy", e.target.dataset.type !== "1")
    }
    const handleDragEnd = () => {
      content.emit("showDragCopy", false)
    }
    return {
      handleDragStart,
      handleDragEnd,
      toolBoxs
    }
  }
}
</script>

<style lang="less" scoped>
  .handleDragStart {
    padding: 10px;
  }

  .lineCss{
    padding: 2px 4px;
    margin: 5px;
    cursor: pointer;
    display: inline-block;
    border-width: 1px;
    border-color: #eee;
  }

  .lineCss:hover{
    border-color: #108ee9 !important;
    color: #108ee9;
  }

  .unit {
    width: 100px;
    border: 1px solid #999;
    line-height: 30px;
    text-align: center;
    margin: 10px auto;
    cursor: pointer;
  }

  td {
    width: 40px;
    height: 20px;
  }
</style>
