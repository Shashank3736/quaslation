"use client"

import * as React from "react"
import { Computer, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle({ showTheme=false }) {
  const { setTheme, theme } = useTheme()
  const [client, setClient] = React.useState(false)

  React.useEffect(() => {
    setClient(true)
  },[])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex">
          {(client && showTheme && theme) ?(
            <p className="mr-2">{theme[0].toUpperCase()+theme.slice(1)}</p>
          ):(
            <></>
          )}
          {client ? (theme === "system" ? (
            <Computer />
          ):(theme === "dark" ? (
            <Moon />
          ):(
            <Sun />
          ))):(
            <span className="sr-only">Toggle theme</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
