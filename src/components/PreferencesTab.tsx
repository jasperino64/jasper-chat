"use client"
import React from "react"
import { Button } from "./ui/button"
import { MoonIcon, SunIcon, Volume2, VolumeX } from "lucide-react"
import { useTheme } from "next-themes"
import { usePreferences } from "@/store/usePreferences"
import useSound from "use-sound"

function PreferencesTab() {
    const { resolvedTheme, setTheme } = useTheme()
    const { soundEnabled, setSoundEnabled } = usePreferences()
    const [playMouseClick] = useSound("/sounds/mouse-click.mp3", { volume: 0.3 })
    const [playSoundOn] = useSound("/sounds/sound-on.mp3", { volume: 0.3 })
    const [playSoundOff] = useSound("/sounds/sound-off.mp3", { volume: 0.3 })

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
        if (soundEnabled) playMouseClick()
    }

    const toggleSound = () => {
        if (soundEnabled) playSoundOff()
        else playSoundOn()
        setSoundEnabled(!soundEnabled)
    }

    return (
        <div className="flex items-center gap-1 rounded-full border bg-card/80 p-1 shadow-sm backdrop-blur">
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title="Toggle theme"
            >
                {/* CSS-driven so the icon is correct on first paint, even with the system theme */}
                <SunIcon className="dark:hidden" />
                <MoonIcon className="hidden dark:block" />
            </Button>
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSound}
                aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
                title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
            >
                {soundEnabled ? <Volume2 /> : <VolumeX />}
            </Button>
        </div>
    )
}

export default PreferencesTab
