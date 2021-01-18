/*
 * @Description: 
 * @Autor: 江腾
 * @Date: 2021-01-18 17:53:11
 * @LastEditors: 江腾
 * @LastEditTime: 2021-01-18 17:54:22
 */
const handleNewLeft = (width, left, initWidth, initLeft) => {
  if (left === initLeft) {
    return left
  } else if (width <= 1) {
    return initWidth + initLeft - 1
  } else if (left < 0) {
    return 0
  } else {
    return left
  }
}

const handleNewWidth = (width, left, initWidth, initLeft, canvasWidth) => {
  const _left = left !== initLeft ? left : initLeft
  if (width <= 1) {
    return 1
  } else if (left < 0) {
    return initWidth + initLeft
  } else if (width + _left > canvasWidth) { // 宽度超出画布宽度就不变
    return canvasWidth - _left
  } else {
    return width
  }
}

const handleNewTop = (height, top, initHieght, initTop) => {
  if (top === initTop) {
    return top
  } else if (height <= 1) {
    return initHieght + initTop - 1
  } else if (top < 0) {
    return 0
  } else {
    return top
  }
}

const handleNewHeight = (height, top, initHeight, initTop, canvasHeight) => {
  const _top = top !== initTop ? top : initTop
  if (height <= 1) {
    return 1
  } else if (top < 0) {
    return initHeight + initTop
  } else if (height + _top > canvasHeight) { // 高度超出画布高度就不变
    return canvasHeight - _top
  } else {
    return height
  }
}

module.exports = {
  handleNewLeft,
  handleNewWidth,
  handleNewTop,
  handleNewHeight
}