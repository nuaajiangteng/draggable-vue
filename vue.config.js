const path = require("path")

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  chainWebpack: config => {
    // 移除 prefetch 插件, 防止首屏加载全部文件
    config.plugins.delete("prefetch")
    
    config.resolve.alias
      .set("@$", resolve("src"))
      .set("@api", resolve("src/api"))
      .set("@assets", resolve("src/assets"))
      .set("@comp", resolve("src/components"))
      .set("@views", resolve("src/views"))
      .set("@layout", resolve("src/layout"))
      .set("@static", resolve("src/static"))
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */
          "@primary-color": "#20c5b9",
          "@link-color": "#20c5b9",
          "@border-radius-base": "2px",
          "@font-size-base": "12px"
        },
        javascriptEnabled: true
      }
    }
  }
}
