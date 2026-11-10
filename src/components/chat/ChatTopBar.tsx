import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Info, X } from "lucide-react"
import { useSelectedUser } from "@/store/useSelectedUser"
import { getInitials } from "@/lib/utils"

const ChatTopBar = () => {
    const { selectedUser, setSelectedUser } = useSelectedUser()
    return (
        <div className="flex h-16 w-full shrink-0 items-center justify-between gap-3 border-b px-4">
            <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-9">
                    <AvatarImage
                        src={selectedUser?.image || "/user-placeholder.png"}
                        alt=""
                        className="object-cover"
                    />
                    <AvatarFallback>{getInitials(selectedUser?.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="truncate font-semibold leading-tight">{selectedUser?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{selectedUser?.email}</p>
                </div>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
                <Button variant="ghost" size="icon-sm" aria-label="Conversation info" title="Info">
                    <Info />
                </Button>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Close conversation"
                    title="Close (Esc)"
                    onClick={() => setSelectedUser(null)}
                >
                    <X />
                </Button>
            </div>
        </div>
    )
}
export default ChatTopBar
