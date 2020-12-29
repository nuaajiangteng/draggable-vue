<template>
  <teleport to="body">
    <div v-show="show" class="modal">
      <div @click="show = false" class="close">x</div>
      <div class="content">
        <div :key="index" v-for="(component, index) in components" class="common-class" :style="handleStyle(component.style, component.type)">
          
          <img v-if="component.type === 1" :src="component.text" :style="handleStyle(component.style)" />
          <span v-if="component.type === 2">{{ `{ ${component.text} }` }}</span>
          <span v-if="component.type === 3">{{ component.text }}</span>
          <span v-if="component.type === 4" />
          <div class="table" v-if="component.type === 5">
            <table :style="handleStyle(component.style)" border="1">
              <tr>
                <td :style="{ width: `${child.width}px` }" :key="_index" v-for="(child, _index) in component.children" @drop="handleDropTable(index, _index, $event)">
                  {{ child.title }}
                </td>
              </tr>
              <tr>
                <td :style="{ width: `${child.width}px` }" :key="_index" v-for="(child, _index) in component.children" @drop="handleDropTable(index, _index, $event)">{{ child.field }}</td>
              </tr>
            </table>
          </div>
          <svg :id="`${component.text}-${index}`" v-if="component.type === 6" />
          <div :id="`preview-${component.text}-${index}`" v-if="component.type === 7" />

        </div>
      </div>
    </div>
  </teleport>
</template>
<script>
import { computed, ref } from "vue"
import QRCode from "qrcodejs2"

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
  return param
}

export default {
  props: ["components"],
  setup(props) {
    const show = ref(false)
    const components = computed(() => props.components)
    const preview = () => {
      show.value = true
      components.value.map((com, index) => ({ ...com, index })).filter(com => com.type === 7).forEach(com => {
        const { text, index, style: { width, height } } = com
        const qrcodeEL = document.getElementById(`preview-${text}-${index}`)
        qrcodeEL.innerHTML = ""
        new QRCode(qrcodeEL, {
          text,
          width,
          height
        })
        const imgEl = qrcodeEL.getElementsByTagName("img")[0]
        imgEl.setAttribute("draggable", false)
      })
    }
    const hideModal = () => {
      show.value = false
    }
    return {
      components,
      show,
      preview,
      hideModal,
      handleStyle
    }
  }
}
</script>

<style lang="less" scoped>
  .modal {
    position: fixed;
    background: red;
    width: 100%;
    height: 100%;
    top: 0;
    background-color: rgba(0, 0, 0, 0.45);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .content {
    position: relative;
    width: 1200px;
    height: 500px;
    background: white;
  }

  .close {
    position: fixed;
    right: 0;
    top: 0;
    background: white;
    width: 50px;
    height: 50px;
    border-bottom-left-radius: 50px;
    line-height: 40px;
    text-align: center;
    padding-left: 10px;
    font-size: 28px;
    cursor: pointer;
    &:hover {
      color: red;
    }
  }

  .common-class {
    box-sizing: border-box;
    position: absolute;
  }
</style>