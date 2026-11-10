import { Skeleton } from "../ui/skeleton"

const MessageSkeleton = () => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-end gap-2">
                <Skeleton className="size-7 shrink-0 rounded-full" />
                <Skeleton className="h-9 w-48 rounded-2xl rounded-bl-md" />
            </div>
            <div className="flex justify-end">
                <Skeleton className="h-9 w-36 rounded-2xl rounded-br-md" />
            </div>
        </div>
    )
}
export default MessageSkeleton
