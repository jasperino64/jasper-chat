import { Image as ImageIcon, Loader, SendHorizontal, ThumbsUp } from "lucide-react"
import Image from "next/image"
import { Textarea } from "../ui/textarea"
import { useEffect, useRef, useState } from "react"
import EmojiPicker from "./EmojiPicker"
import { Button } from "../ui/button"
import useSound from "use-sound"
import { usePreferences } from "@/store/usePreferences"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sendMessageAction } from "@/actions/message.actions"
import { useSelectedUser } from "@/store/useSelectedUser"
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { pusherClient } from "@/lib/pusher"
import { Message } from "@/db/dummy"

const ChatBottomBar = () => {
    const [message, setMessage] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const { selectedUser } = useSelectedUser()
    const { user: currentUser } = useKindeBrowserClient()

    const { soundEnabled } = usePreferences()
    const queryClient = useQueryClient()

    const [imgUrl, setImgUrl] = useState("")

    const [playSound1] = useSound("/sounds/keystroke1.mp3")
    const [playSound2] = useSound("/sounds/keystroke2.mp3")
    const [playSound3] = useSound("/sounds/keystroke3.mp3")
    const [playSound4] = useSound("/sounds/keystroke4.mp3")

    const [playNotificationSound] = useSound("/sounds/notification.mp3")

    const playSoundFunctions = [playSound1, playSound2, playSound3, playSound4]

    const playRandomKeyStrokeSound = () => {
        const randomIndex = Math.floor(Math.random() * playSoundFunctions.length)
        if (soundEnabled) {
            playSoundFunctions[randomIndex]()
        }
    }

    // Mutation to send a message using the sendMessageAction
    // This mutation will be used to send messages to the server
    const { mutate: sendMessage, isPending } = useMutation({
        mutationFn: sendMessageAction,
    })

    const handleSendMessage = () => {
        if (!message.trim()) return

        if (selectedUser?.id) {
            sendMessage({ content: message, messageType: "text", receiverId: selectedUser.id })
        }
        setMessage("")

        textAreaRef.current?.focus()
    }

    // Enter sends; Shift+Enter falls through to the textarea's native newline
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const sendImage = () => {
        if (selectedUser?.id) {
            sendMessage({ content: imgUrl, messageType: "image", receiverId: selectedUser.id })
        }
        setImgUrl("")
    }

    useEffect(() => {
        const client = pusherClient
        if (!client) return

        const sortedIds = [currentUser?.id, selectedUser?.id].sort()
        const channelName = sortedIds.join("__")
        const channel = client.subscribe(channelName)

        // Handle new incoming messages
        const handleNewMessage = (data: { message: Message }) => {
            // Update the messages in the cache using the query key
            queryClient.setQueryData(["messages", selectedUser?.id], (oldMessages: Message[] | undefined) => {
                return [...(oldMessages ?? []), data.message]
            })

            // Play the notification sound if the sound is enabled and the message is not sent by the current user
            if (soundEnabled && data.message.senderId !== currentUser?.id) {
                playNotificationSound()
            }
        }
        
        // Listen for new messages
        channel.bind("newMessage", handleNewMessage)

        // ! Absolutely important, otherwise the event listener will be added multiple times which means you'll see the incoming new message multiple times
        return () => {
            channel.unbind("newMessage", handleNewMessage)
            client.unsubscribe(channelName)
        }
    }, [currentUser?.id, selectedUser?.id, queryClient, playNotificationSound, soundEnabled])

    const hasText = !!message.trim()
    const firstName = selectedUser?.name?.split(" ")[0]

    return (
        <div className="flex w-full shrink-0 items-end gap-2 border-t bg-card px-3 py-3">
            <CldUploadWidget
                signatureEndpoint={"/api/sign-cloudinary-params"}
                onSuccess={(result, { widget }) => {
                    setImgUrl((result.info as CloudinaryUploadWidgetInfo).secure_url)
                    widget.close()
                }}
            >
                {({ open }) => (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 rounded-full text-muted-foreground"
                        aria-label="Attach image"
                        title="Attach image"
                        onClick={() => open()}
                    >
                        <ImageIcon className="!size-5" />
                    </Button>
                )}
            </CldUploadWidget>

            <Dialog open={!!imgUrl} onOpenChange={(open) => !open && setImgUrl("")}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send image</DialogTitle>
                    </DialogHeader>
                    <div className="relative mx-auto h-96 w-full overflow-hidden rounded-xl bg-muted">
                        {imgUrl && <Image src={imgUrl} alt="Image preview" fill className="object-contain" />}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setImgUrl("")}>
                            Cancel
                        </Button>
                        <Button onClick={sendImage}>
                            <SendHorizontal />
                            Send
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex min-w-0 flex-1 items-end rounded-3xl border bg-background pr-1 shadow-sm transition focus-within:border-ring/50 focus-within:ring-4 focus-within:ring-ring/10">
                <Textarea
                    autoComplete="off"
                    placeholder={firstName ? `Message ${firstName}…` : "Message…"}
                    rows={1}
                    className="max-h-40 min-h-0 flex-1 resize-none border-0 bg-transparent px-4 py-2.5 shadow-none [field-sizing:content] focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={message}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => {
                        setMessage(e.target.value)
                        playRandomKeyStrokeSound()
                    }}
                    ref={textAreaRef}
                />
                <div className="py-1">
                    <EmojiPicker
                        onChange={(emoji) => {
                            setMessage(message + emoji)
                            textAreaRef.current?.focus()
                        }}
                    />
                </div>
            </div>

            {hasText ? (
                <Button
                    size="icon"
                    className="shrink-0 rounded-full"
                    aria-label="Send message"
                    title="Send (Enter)"
                    onClick={handleSendMessage}
                >
                    <SendHorizontal className="!size-5" />
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full text-muted-foreground hover:text-primary"
                    aria-label="Send a thumbs up"
                    title="Send 👍"
                    disabled={isPending || !selectedUser?.id}
                    onClick={() => {
                        if (!selectedUser?.id) return
                        sendMessage({ content: "👍", messageType: "text", receiverId: selectedUser.id })
                    }}
                >
                    {isPending ? <Loader className="!size-5 animate-spin" /> : <ThumbsUp className="!size-5" />}
                </Button>
            )}
        </div>
    )
}
export default ChatBottomBar
