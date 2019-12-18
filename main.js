let _options = null
const trim = str => {
  let trimLeft = /^\s+/
  let trimRight = /\s+$/
  return str.replace(trimLeft, '').replace(trimRight, '')
}
const fs = require('fs')
const path = require('path')
const readLine = require('readline')
let files = null
let filePath = null
let contents = null
const writeFile = (contents) => {
  fs.writeFileSync(_options.output, contents, err => {
    if (err) throw err
  })
  console.log('语言编译完成')
}
const findFiles = (__files, index) => {
  if (index === 0) {
    console.log('语言开始编译...')
  }
  if (index === __files.length) {
    contents = trim(contents)
    contents = contents.substr(0, contents.length - 1)
    contents += `
  }
}
export default i18n
`
    writeFile(contents)
    return
  }
  let filename = __files[index]
  let filedir = path.join(filePath, filename)
  fs.stat(filedir, (eror, stats) => {
    if (eror) {
      console.warn('获取文件stats失败')
    } else {
      if (stats.isFile()) {
        const readObj = readLine.createInterface({
          input: fs.createReadStream(filedir)
        })
        let startIndexOf = 0
        let endIndexOf = 0
        let iNum = 0
        let moduleNames = filename.replace(/\.\w+/, '')
        if (__files[index] === '.DS_Store') {
          index++
          findFiles(__files, index)
          return
        }
        contents += `    ${moduleNames}: {
`
        readObj.on('line', function (line) {
          if (line && line.indexOf("'zh-CN': {") >= 0) {
            startIndexOf = iNum
          }
          if (line && line.indexOf("'zh-TW': {") >= 0) {
            endIndexOf = iNum
          }
          if (startIndexOf > 0 && iNum > startIndexOf && endIndexOf === 0) {
            if (line && line.length !== 0) {
              contents += `  ${line}\r`
            }
          }
          iNum++
        })
        readObj.on('close', function () {
          console.log(`编译中: ${__files[index]}`)
          index++
          findFiles(__files, index)
        })
      } else {
        index += 1
        findFiles(__files, index)
      }
    }
  })
}

function MergeI18n (options) {
  _options = options
  filePath = options.entry
  try {
    fs.unlinkSync(options.output)
  } catch (_) {
  }
  files = fs.readdirSync(filePath)
}

const travel = (dir, callback) => {
  fs.readdirSync(dir).forEach(function (file) {
    var pathname = path.join(dir, file)
    if (fs.statSync(pathname).isDirectory()) {
      travel(pathname, callback)
    } else {
      callback(pathname)
    }
  })
}

let modifyList = []
MergeI18n.prototype.apply = function (compiler) {
  compiler.plugin('done', function () {
    contents = `const i18n = {
  zh_CN: {
`
    modifyList = []
    fs.access(_options.output, error => {
      if (error) {
        findFiles(files, 0)
      } else {
        travel(_options.entry, localFile => {
          fs.stat(localFile, (eror, stats) => {
            modifyList.push(stats.mtimeMs)
          })
        })
        fs.stat(_options.output, (eror, stats) => {
          if (stats.mtimeMs < Math.max.apply(null, modifyList)) {
            findFiles(files, 0)
          }
        })
      }
    })
  })
}

module.exports = MergeI18n
