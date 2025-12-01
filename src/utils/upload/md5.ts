import SparkMD5 from "spark-md5";

/**
 * 计算文件的 MD5 哈希值
 * @param file 文件对象
 * @param onProgress 进度回调函数
 * @returns MD5 哈希值
 */
export async function calculateMD5(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    const chunkSize = 2 * 1024 * 1024; // 2MB per chunk
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();

    fileReader.onload = (e) => {
      if (e.target?.result) {
        spark.append(e.target.result as ArrayBuffer);
        currentChunk++;

        // 更新进度
        if (onProgress) {
          const percent = Math.round((currentChunk / chunks) * 100);
          onProgress(percent);
        }

        // 继续读取下一块或完成
        if (currentChunk < chunks) {
          loadNext();
        } else {
          resolve(spark.end());
        }
      }
    };

    fileReader.onerror = () => {
      reject(new Error("文件读取失败"));
    };

    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const blob = file.slice(start, end);
      fileReader.readAsArrayBuffer(blob);
    }

    loadNext();
  });
}
