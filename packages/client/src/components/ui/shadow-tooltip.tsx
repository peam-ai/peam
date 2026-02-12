import * as React from "react"
import {
  Tooltip as BaseTooltip,
  TooltipContent,
  TooltipProvider as BaseTooltipProvider,
  TooltipPrimitive,
  TooltipTrigger as BaseTooltipTrigger,
} from "@/components/ui/tooltip"

type ShadowTooltipPortalContainer = Element | DocumentFragment | null

const ShadowTooltipPortalContext = React.createContext<ShadowTooltipPortalContainer>(null)

function ShadowTooltipPortalProvider({
  container,
  children,
}: {
  container: ShadowTooltipPortalContainer
  children?: React.ReactNode
}) {
  return (
    <ShadowTooltipPortalContext.Provider value={container}>
      {children}
    </ShadowTooltipPortalContext.Provider>
  )
}

function ShadowTooltipContent({
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const portalContainer = React.useContext(ShadowTooltipPortalContext) ?? undefined

  return (
    <TooltipPrimitive.Portal container={portalContainer}>
      <TooltipContent {...props}>
        {children}
      </TooltipContent>
    </TooltipPrimitive.Portal>
  )
}

export const ShadowTooltip = BaseTooltip
export const ShadowTooltipTrigger = BaseTooltipTrigger
export const ShadowTooltipProvider = BaseTooltipProvider
export { ShadowTooltipContent, ShadowTooltipPortalProvider }
