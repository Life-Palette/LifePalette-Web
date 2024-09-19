import { completeMul, getUploadId, uploadPart } from '~/api/ossUpload'
import { getFileMD5 } from './md5'

export async function uploadFile(file, callback) {
  return new Promise((resolve, reject) => {
    getFileMD5(file, async (md5, chunkArr) => {
      let kb = (file.size / 1024).toFixed(2)
      kb = Number(kb)
      let chunk = 0 // 当前片数
      const partSize = 1024 * 1024 * 2 // 分片大小（默认2M）
      const size = file.size // 文件大小
      const chunks = Math.ceil(size / partSize) // 分片总数
      const fileSize = chunks * partSize // you need to calculate
      const done = []
      let uploadIdT = null
      const formData = new FormData()
      // 获取上传id
      const uploadIdData = await getUploadId({ name: file.name, fileMd5: md5 })
      const { code: codeT, result: resultT } = uploadIdData
      if (codeT === 200) {
        const { uploadId } = resultT
        if (!uploadId) {
          resolve(uploadIdData)
          return
        }
        uploadIdT = uploadId
        formData.append('uploadId', uploadId)
      }
      else {
        reject(uploadIdData)
      }
      formData.append('fileMd5', md5)
      formData.append('name', `${file.name}`)
      formData.append('chunk', null)
      formData.append('file', null)
      formData.append('start', null)
      formData.append('end', null)

      const onePart = (1 / chunks) * 100
      let percent
      for (let i = 0; i < chunks; i++) {
        const start = partSize * i
        const end = Math.min(start + partSize, fileSize)
        formData.set('file', chunkArr[i].file)
        formData.set('chunk', chunk)
        formData.set('partSize ', partSize)
        formData.set('start', start)
        formData.set('end', end)

        const upPartData = await uploadPart(formData, (res) => {
          const { progress } = res
          percent = (onePart * i + progress * onePart).toFixed(2)
          if (percent >= 100) {
            percent = 100
          }
          callback({
            chunk,
            chunks,

            percent,
            speed: ((chunk / chunks) * kb).toFixed(2),
          })
        })
        const { code, result } = upPartData
        if (code === 200) {
          const { etag } = result
          done.push({ number: chunk + 1, etag })
        }
        else {
          reject(upPartData)
        }
        chunk++
      }
      // console.log(done, "--------done---");
      // const params = {
      // 	name: file.name,
      // 	uploadId: uploadIdT,
      // 	etags: done,
      // }
      const completeMulFormData = new FormData()
      completeMulFormData.append('name', file.name)
      completeMulFormData.append('uploadId', uploadIdT)
      completeMulFormData.append('etags', JSON.stringify(done))
      completeMulFormData.append('file', file)
      completeMulFormData.append('fileMd5', md5)

      const completeMulData = await completeMul(completeMulFormData)

      console.log(completeMulData, '-----合并分片结果--')
      const { code, result } = completeMulData
      if (code === 200) {
        console.log('上传成功', result)
        resolve(completeMulData)
      }
      else {
        reject(completeMulData)
      }
    })
  })
}
