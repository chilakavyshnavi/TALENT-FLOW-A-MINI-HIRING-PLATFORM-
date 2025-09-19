"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

const ChartConfig = React.createContext({})

const useChart = () => {
  const context = React.useContext(ChartConfig)
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  return context
}

const ChartContainer = React.forwardRef(({ children, config, className, ...props }, ref) => {
  return (
    <ChartConfig.Provider value={config}>
      <div
        ref={ref}
        data-chart="container"
        className={`flex justify-center text-xs ${className || ""}`}
        style={{ width: '100%', height: '100%' }}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartConfig.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = ({ active, payload, labelKey, nameKey, hideLabel, hideIndicator, indicator = "dot", content: Content, ...props }) => {
  const config = useChart()

  if (!active || !payload?.length) {
    return null
  }

  if (Content) {
    return <Content {...props} active={active} payload={payload} />
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && (
        <div className="font-medium text-foreground">
          {payload[0]?.payload?.[labelKey] || payload[0]?.label}
        </div>
      )}
      <div className="grid gap-2">
        {payload.map((item, index) => {
          const key = `${nameKey || item.dataKey || item.name || "value"}`
          const itemConfig = config[key] || {}
          const indicatorColor = item.color || itemConfig.color || "hsl(var(--muted-foreground))"

          return (
            <div key={index} className="flex w-full items-stretch gap-2 text-xs">
              {!hideIndicator && (
                <div
                  className={`shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg] ${
                    indicator === "line" ? "w-1" : "w-2 h-2"
                  }`}
                  style={{
                    "--color-bg": indicatorColor,
                    "--color-border": indicatorColor,
                  }}
                />
              )}
              <div className="flex w-full justify-between leading-none">
                <div className="grid gap-1.5">
                  <span className="text-muted-foreground">
                    {itemConfig.label || key}
                  </span>
                </div>
                <span className="font-mono font-medium text-foreground">
                  {item.value}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartTooltipContent = React.forwardRef(({ active, payload, className, indicator = "dot", hideLabel = false, hideIndicator = false, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey, ...props }, ref) => {
  return (
    <ChartTooltip
      ref={ref}
      active={active}
      payload={payload}
      hideLabel={hideLabel}
      hideIndicator={hideIndicator}
      labelKey={labelKey}
      nameKey={nameKey}
      indicator={indicator}
      className={className}
      {...props}
    />
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
}