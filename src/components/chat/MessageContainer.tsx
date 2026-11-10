import { useEffect } from "react"
import ChatBottomBar from "./ChatBottomBar"
import ChatTopBar from "./ChatTopBar"
import MessageList from "./MessageList"
import { useSelectedUser } from "@/store/useSelectedUser"

const MessageContainer = () => {
    const { setSelectedUser } = useSelectedUser()

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelectedUser(null)
        }

        document.addEventListener("keydown", handleEscape)

        return () => document.removeEventListener("keydown", handleEscape)
    }, [setSelectedUser])

    return (
        <div className="flex h-full w-full flex-col">
            <ChatTopBar />
            <MessageList />
            <ChatBottomBar />
        </div>
    )
}
export default MessageContainer
