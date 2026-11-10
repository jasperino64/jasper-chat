import ChatLayout from "@/components/chat/ChatLayout"
import PreferencesTab from "@/components/PreferencesTab"
import { User } from "@/db/dummy"
import { redis } from "@/lib/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { MessagesSquare } from "lucide-react"

async function getUsers(): Promise<User[]> {
    const userKeys: string[] = []
    let cursor = "0"

    do {
        const [nextCursor, keys] = await redis.scan(cursor, {
            match: "user:*",
            type: "hash",
            count: 1000,
        })
        cursor = nextCursor
        userKeys.push(...keys)
    } while (cursor !== "0")

    const { getUser } = getKindeServerSession()
    const currentUser = await getUser()

    const pipeline = redis.pipeline()
    if (userKeys.length > 0) {
        userKeys.forEach((key) => pipeline.hgetall(key))
        const results = (await pipeline.exec()) as User[]

        const users: User[] = []
        for (const user of results) {
            if (user.id !== currentUser?.id) {
                users.push(user)
            }
        }

        return users
    } else {
        return []
    }
}
export default async function Home() {
    const { isAuthenticated } = await getKindeServerSession()
    if (!(await isAuthenticated())) {
        redirect("/auth")
    }

    const layoutCookie = (await cookies()).get("react-resizable-panels:layout")
    let defaultLayout: number[] | undefined
    try {
        defaultLayout = layoutCookie ? JSON.parse(layoutCookie.value) : undefined
    } catch {
        defaultLayout = undefined
    }

    const users = await getUsers()

    return (
        <main className="relative isolate flex h-dvh flex-col gap-3 p-2 sm:p-4 md:p-6">
            {/* soft brand glow + faded dot grid */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(75%_100%_at_50%_0%,hsl(var(--primary)/0.32),hsl(var(--primary)/0.08)_55%,transparent)] dark:bg-[radial-gradient(75%_100%_at_50%_0%,hsl(var(--primary)/0.26),hsl(var(--primary)/0.06)_55%,transparent)]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(hsl(var(--foreground)/0.07)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
            />

            <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                    <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
                        <MessagesSquare className="size-4" />
                    </div>
                    <span className="text-base font-semibold tracking-tight">Redis Chat</span>
                </div>
                <PreferencesTab />
            </header>

            <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 overflow-hidden rounded-2xl border bg-card text-sm shadow-xl shadow-black/[0.04] dark:shadow-black/40">
                <ChatLayout defaultLayout={defaultLayout} users={users} />
            </div>
        </main>
    )
}
