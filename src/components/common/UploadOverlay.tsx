import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface UploadOverlayProps {
  isUploading: boolean;
  progress: number;
  stageText: string;
  isComplete?: boolean;
}

export function UploadOverlay({ isUploading, progress, stageText, isComplete }: UploadOverlayProps) {
  const show = isUploading || isComplete;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* 内容卡片 */}
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-[340px] rounded-2xl bg-white/95 p-8 shadow-2xl dark:bg-zinc-900/95"
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {isComplete ? (
              /* 完成状态 */
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{ scale: 1 }}
                  initial={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CheckCircle2 className="text-green-500" size={52} strokeWidth={1.5} />
                </motion.div>
                <p className="font-semibold text-base text-zinc-800 dark:text-zinc-100">上传完成</p>
              </div>
            ) : (
              /* 上传中状态 */
              <div className="flex flex-col items-center gap-6">
                {/* 图标 + 进度圆环 */}
                <div className="relative flex items-center justify-center">
                  {/* 背景圆 */}
                  <svg className="absolute" height="96" viewBox="0 0 96 96" width="96">
                    <circle
                      className="text-zinc-100 dark:text-zinc-800"
                      cx="48"
                      cy="48"
                      fill="none"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="6"
                    />
                    {/* 进度圆弧 */}
                    <motion.circle
                      animate={{ strokeDashoffset: 264 - (264 * progress) / 100 }}
                      className="text-primary"
                      cx="48"
                      cy="48"
                      fill="none"
                      initial={false}
                      r="42"
                      stroke="currentColor"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * progress) / 100}
                      strokeLinecap="round"
                      strokeWidth="6"
                      style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </svg>
                  {/* 中心图标 */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="text-primary" size={28} strokeWidth={1.5} />
                  </div>
                </div>

                {/* 进度数字 */}
                <div className="flex flex-col items-center gap-1">
                  <motion.span
                    animate={{ opacity: 1 }}
                    className="font-bold text-4xl tabular-nums text-zinc-800 dark:text-zinc-100"
                    initial={{ opacity: 0 }}
                    key={progress}
                  >
                    {progress}
                    <span className="ml-0.5 font-normal text-xl text-zinc-400">%</span>
                  </motion.span>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{stageText}</p>
                </div>

                {/* 进度条 */}
                <div className="w-full space-y-1.5">
                  <Progress className="h-1.5" value={progress} />
                </div>

                {/* 提示文字 */}
                <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                  上传过程中请勿关闭页面
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
