import { cn, formatTime, getInitials } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useSelectedUser } from "@/store/useSelectedUser"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { useQuery } from "@tanstack/react-query"
import { getMessages } from "@/actions/message.actions"
import { useEffect, useRef } from "react"
import MessageSkeleton from "../skeletons/MessageSkeleton"
import { Message } from "@/db/dummy"

const MessageList = () => {
    const { selectedUser } = useSelectedUser()
    const { user: currentUser, isLoading: isUserLoading } = useKindeBrowserClient()
    const messageContainerRef = useRef<HTMLDivElement>(null)

    // Fetch messages for the selected user using query keys
    const { data: messages, isLoading: isMessagesLoading } = useQuery({
        queryKey: ["messages", selectedUser?.id],
        queryFn: async () => {
            if (selectedUser && currentUser) {
                return await getMessages(selectedUser?.id, currentUser?.id)
            }
        },
        enabled: !!selectedUser && !!currentUser && !isUserLoading,
    })

    // Keep the newest message in view
    useEffect(() => {
        const el = messageContainerRef.current
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    }, [messages])

    const isEmpty = !isMessagesLoading && (messages?.length ?? 0) === 0

    return (
        <div
            ref={messageContainerRef}
            className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-5"
        >
            {isMessagesLoading && (
                <div className="flex flex-col gap-4">
                    <MessageSkeleton />
                    <MessageSkeleton />
                    <MessageSkeleton />
                </div>
            )}

            {isEmpty && (
                <div className="m-auto flex flex-col items-center gap-3 text-center">
                    <Avatar className="size-16">
                        <AvatarImage src={selectedUser?.image || "/user-placeholder.png"} alt="" className="object-cover" />
                        <AvatarFallback>{getInitials(selectedUser?.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{selectedUser?.name}</p>
                        <p className="text-muted-foreground">No messages yet. Say hi 👋</p>
                    </div>
                </div>
            )}

            {/* push short conversations to the bottom, like a real chat */}
            {!isMessagesLoading && !isEmpty && <div className="flex-1" />}

            <AnimatePresence initial={false}>
                {!isMessagesLoading &&
                    messages?.map((message: Message, index) => {
                        const isMine = message.senderId === currentUser?.id
                        const prev = messages[index - 1]
                        const next = messages[index + 1]
                        const startsGroup = prev?.senderId !== message.senderId
                        const endsGroup = next?.senderId !== message.senderId

                        return (
                            <motion.div
                                key={`${message.timestamp ?? ""}-${index}`}
                                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className={cn(
                                    "flex items-end gap-2",
                                    isMine ? "justify-end" : "justify-start",
                                    startsGroup && index > 0 ? "mt-3" : "mt-0.5"
                                )}
                            >
                                {!isMine && (
                                    <div className="size-7 shrink-0">
                                        {endsGroup && (
                                            <Avatar className="size-7">
                                                <AvatarImage
                                                    src={selectedUser?.image || "/user-placeholder.png"}
                                                    alt=""
                                                    className="object-cover"
                                                />
                                                <AvatarFallback>{getInitials(selectedUser?.name)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                )}

                                {message.messageType === "text" ? (
                                    <div
                                        title={formatTime(message.timestamp)}
                                        className={cn(
                                            "max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 leading-relaxed",
                                            isMine
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-foreground",
                                            // tail on the last bubble of a run
                                            endsGroup && (isMine ? "rounded-br-md" : "rounded-bl-md")
                                        )}
                                    >
                                        {message.content}
                                    </div>
                                ) : (
                                    <img
                                        src={message.content}
                                        alt="Shared image"
                                        title={formatTime(message.timestamp)}
                                        className="max-h-64 max-w-[75%] cursor-zoom-in rounded-2xl border object-cover shadow-sm transition hover:opacity-90"
                                        onClick={() => window.open(message.content, "_blank")}
                                    />
                                )}
                            </motion.div>
                        )
                    })}
            </AnimatePresence>
        </div>
    )
}
export default MessageList
