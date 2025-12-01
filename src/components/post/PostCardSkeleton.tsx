import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostCardSkeleton() {
  return (
    <Card className="w-full overflow-hidden rounded-2xl border transition-all duration-500">
      {/* 图片骨架 */}
      <Skeleton className="h-48 w-full rounded-t-2xl" />

      {/* 内容骨架 */}
      <CardContent className="p-5">
        {/* 标题骨架 */}
        <Skeleton className="mb-3 h-6 w-3/4" />

        {/* 内容骨架 */}
        <div className="mb-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* 标签骨架 */}
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>

        {/* 用户信息骨架 */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-1 h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>

      {/* 互动按钮骨架 */}
      <CardFooter className="flex items-center justify-between border-border border-t px-5 pt-4 pb-5">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </CardFooter>
    </Card>
  );
}
