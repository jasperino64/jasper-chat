"use client"

import { SmileIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { useTheme } from "next-themes"

interface EmojiPickerProps {
    onChange: (emoji: string) => void
}

const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
    const { resolvedTheme } = useTheme()

    return (
        <Popover>
            <PopoverTrigger
                aria-label="Insert emoji"
                className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <SmileIcon className="size-5" />
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="end"
                sideOffset={10}
                className="w-auto border-0 bg-transparent p-0 shadow-none"
            >
                <Picker
                    emojiSize={18}
                    data={data}
                    maxFrequentRows={1}
                    previewPosition="none"
                    theme={resolvedTheme === "dark" ? "dark" : "light"}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onEmojiSelect={(emoji: any) => onChange(emoji.native)}
                />
            </PopoverContent>
        </Popover>
    )
}
export default EmojiPicker
