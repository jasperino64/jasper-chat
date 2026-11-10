import React from "react"
import { ScrollArea } from "./ui/scroll-area"
import { User } from "@/db/dummy"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { buttonVariants } from "./ui/button"
import { cn, getInitials } from "@/lib/utils"
import { LogOut } from "lucide-react"
import useSound from "use-sound"
import { usePreferences } from "@/store/usePreferences"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { useSelectedUser } from "@/store/useSelectedUser"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"

interface SidebarProps {
    isCollapsed: boolean
    users: User[]
}

function UserAvatar({ user, className }: { user: User; className?: string }) {
    return (
        <Avatar className={cn("size-10", className)}>
            <AvatarImage src={user.image || "/user-placeholder.png"} alt="" className="object-cover" />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
    )
}

function Sidebar({ isCollapsed, users }: SidebarProps) {
    const { user: currentUser } = useKindeBrowserClient()
    const { soundEnabled } = usePreferences()
    const [playClickSound] = useSound("/sounds/mouse-click.mp3")
    const { selectedUser, setSelectedUser } = useSelectedUser()

    const selectUser = (user: User) => {
        if (soundEnabled) playClickSound()
        setSelectedUser(user)
    }

    const currentName = [currentUser?.given_name, currentUser?.family_name].filter(Boolean).join(" ")

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-full flex-col">
                {!isCollapsed && (
                    <div className="flex items-center justify-between px-4 pb-2 pt-4">
                        <h2 className="text-base font-semibold tracking-tight">Chats</h2>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                            {users.length}
                        </span>
                    </div>
                )}

                <ScrollArea className="min-h-0 flex-1">
                    <nav className={cn("flex flex-col gap-0.5 p-2", isCollapsed && "items-center pt-3")}>
                        {users.length === 0 && !isCollapsed && (
                            <p className="px-3 py-8 text-center text-muted-foreground">
                                No one else is here yet.
                            </p>
                        )}

                        {users.map((user) => {
                            const isSelected = selectedUser?.id === user.id
                            return isCollapsed ? (
                                <Tooltip key={user.id}>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => selectUser(user)}
                                            aria-label={user.name}
                                            aria-current={isSelected || undefined}
                                            className={cn(
                                                "rounded-full p-0.5 ring-2 ring-transparent transition focus-visible:outline-none focus-visible:ring-ring",
                                                isSelected ? "ring-primary" : "hover:ring-border"
                                            )}
                                        >
                                            <UserAvatar user={user} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">{user.name}</TooltipContent>
                                </Tooltip>
                            ) : (
                                <button
                                    key={user.id}
                                    onClick={() => selectUser(user)}
                                    aria-current={isSelected || undefined}
                                    className={cn(
                                        "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        isSelected
                                            ? "bg-background shadow-sm ring-1 ring-border"
                                            : "hover:bg-accent/70"
                                    )}
                                >
                                    <UserAvatar user={user} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{user.name}</p>
                                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </nav>
                </ScrollArea>

                {/* current user + logout */}
                <div
                    className={cn(
                        "flex items-center gap-3 border-t p-3",
                        isCollapsed && "flex-col justify-center"
                    )}
                >
                    <Avatar className="size-8">
                        <AvatarImage
                            src={currentUser?.picture || "/user-placeholder.png"}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="object-cover"
                        />
                        <AvatarFallback>{getInitials(currentName)}</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{currentName || "You"}</p>
                            <p className="truncate text-xs text-muted-foreground">{currentUser?.email}</p>
                        </div>
                    )}
                    <LogoutLink
                        aria-label="Log out"
                        title="Log out"
                        className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-sm" }),
                            "shrink-0 text-muted-foreground"
                        )}
                    >
                        <LogOut />
                    </LogoutLink>
                </div>
            </div>
        </TooltipProvider>
    )
}

export default Sidebar
