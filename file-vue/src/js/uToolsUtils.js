const preMusic = 'xiaou-file-'
function uToolsUtils () {}
function read (key, onlyData = true) {
  // eslint-disable-next-line no-undef
  const data = utools.db.get(`${preMusic}${key}`)
  console.log(data)
  if (!data) {
    return false
  }
  if (onlyData) {
    return data.data
  } else {
    return data
  }
}
uToolsUtils.playPromptTone = (fileName, pre = false) => {
  const audio = new Audio()
  audio.loop = false
  if (pre) {
    audio.play()
    let fig = true
    audio.addEventListener('ended', function () {
      if (fig) {
        audio.src = `https://xiaou520.gitee.io/sound/${fileName}`
        audio.play()
        fig = false
      }
    }, false)
  } else {
    audio.src = `https://xiaou520.gitee.io/sound/${fileName}`
    audio.play()
  }
}
function update (key, data) {
  const readData = read(key, false)
  let res
  if (!readData) {
    // eslint-disable-next-line no-undef
    res = utools.db.put({
      _id: `${preMusic}${key}`,
      data: data,
      _rev: readData._rev
    })
  } else {
    // eslint-disable-next-line no-undef
    res = utools.db.put({
      _id: `${preMusic}${key}`,
      data: data,
      _rev: readData._rev
    })
  }
  console.log('update' + res.toString())
}
uToolsUtils.isNewVersion = () => {
  // 当前版本
  const pluginInfo = window.pluginInfo
  console.log(pluginInfo)
  // utools 自动更新数据处理
  if (read('version') !== pluginInfo.version) {
    uToolsUtils.playPromptTone('update.wav')
    update('version', pluginInfo.version)
    // 打开更新信息窗口
    window.createUpdateWindow()
    return true
  } else {
    console.log('false')
    return false
  }
}
export default uToolsUtils
