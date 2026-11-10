"use client"
import React from "react"
import { MessagesSquare } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable"
import { cn } from "@/lib/utils"
import Sidebar from "../Sidebar"
import MessageContainer from "./MessageContainer"
import { User } from "@/db/dummy"
import { useSelectedUser } from "@/store/useSelectedUser"

interface ChatLayoutProps {
    defaultLayout: number[] | undefined
    users: User[]
}

// Panel sizes are percentages of the group width
const DEFAULT_LAYOUT = [28, 72]

function ChatLayout({ defaultLayout = DEFAULT_LAYOUT, users }: ChatLayoutProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [isMobile, setIsMobile] = React.useState(false)
    const { selectedUser } = useSelectedUser()

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="h-full items-stretch"
            onLayout={(sizes: number[]) => {
                document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}; path=/`
            }}
        >
            <ResizablePanel
                defaultSize={defaultLayout[0]}
                collapsedSize={8}
                collapsible={true}
                minSize={isMobile ? 0 : 22}
                maxSize={isMobile ? 8 : 34}
                onCollapse={() => {
                    setIsCollapsed(true)
                    document.cookie = `react-resizable-panels:collapsed=true; path=/`
                }}
                onExpand={() => {
                    setIsCollapsed(false)
                    document.cookie = `react-resizable-panels:collapsed=false; path=/`
                }}
                className={cn(
                    "bg-muted/30",
                    isCollapsed && "min-w-[72px] transition-all duration-300 ease-in-out"
                )}
            >
                <Sidebar isCollapsed={isCollapsed || isMobile} users={users} />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                {!selectedUser ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-10 text-center">
                        <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                            <MessagesSquare className="size-7" />
                        </div>
                        <h2 className="text-lg font-semibold tracking-tight">Your messages</h2>
                        <p className="max-w-xs text-muted-foreground">
                            Pick a conversation from the sidebar to start chatting.
                        </p>
                    </div>
                ) : (
                    <MessageContainer />
                )}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

export default ChatLayout
