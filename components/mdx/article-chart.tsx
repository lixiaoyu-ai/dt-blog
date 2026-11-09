"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type ArticleChartProps = {
  title: string
  description?: string
  data: Record<string, string | number>[]
  xKey: string
  yKey: string
  xLabel?: string
  yLabel?: string
}

export default function ArticleChart({
  title,
  description,
  data,
  xKey,
  yKey,
  xLabel = "日期",
  yLabel = "数值",
}: ArticleChartProps) {
  return (
    <figure className="not-typeset my-8 min-w-0 rounded-xl border bg-card p-4 text-base text-card-foreground sm:p-6">
      <figcaption>
        <p className="font-medium">{title}</p>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </figcaption>

      <div className="mt-6 h-64 w-full min-w-0 sm:h-72">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          initialDimension={{ width: 600, height: 256 }}
        >
          <LineChart
            data={data}
            margin={{ top: 12, right: 12, bottom: 4, left: 0 }}
            accessibilityLayer
            aria-label={title}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey={xKey}
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              minTickGap={16}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={40}
              allowDecimals={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--popover-foreground)",
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(value) => [
                Number(value).toLocaleString("zh-CN"),
                yLabel,
              ]}
            />
            <Line
              dataKey={yKey}
              name={yLabel}
              type="linear"
              stroke="var(--foreground)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--card)", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "var(--foreground)", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-5 border-t pt-4 text-sm">
        <summary className="w-fit cursor-pointer rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          查看图表数据
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm tabular-nums">
            <caption className="sr-only">{title}的数据表</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-2 font-medium">
                  {xLabel}
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  {yLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-2 text-muted-foreground">{row[xKey]}</td>
                  <td className="py-2 text-right">{row[yKey]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
