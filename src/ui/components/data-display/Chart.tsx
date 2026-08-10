"use client";

import { type HTMLAttributes, useId, useMemo, useState } from "react";

import type { UIColor } from "@/ui/types/color";
import { fieldColorClasses } from "@/ui/utils/color";
import { cn } from "@/ui/utils/cn";

export type ChartType = "bar" | "line" | "area" | "pie";
export type ChartLineVariant = "smooth" | "straight";

export type ChartDatum = {
  label: string;
  value: number;
};

export type ChartSeries = {
  name: string;
  data: ChartDatum[];
  color?: UIColor;
};

export interface ChartProps extends HTMLAttributes<HTMLDivElement> {
  data?: ChartDatum[];
  series?: ChartSeries[];
  title?: string;
  description?: string;
  type?: ChartType;
  color?: UIColor;
  height?: number;
  lineVariant?: ChartLineVariant;
  valueFormatter?: (value: number) => string;
  emptyText?: string;
  animated?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
}

type ActiveDatum = {
  label: string;
  value: number;
  x: number;
  y: number;
  percentage?: number;
  seriesName?: string;
};

type NormalizedSeries = {
  name: string;
  data: ChartDatum[];
  color: UIColor;
};

const chartPalette: UIColor[] = ["sky", "emerald", "amber", "rose", "violet", "blue", "slate"];

const chartStrokeClasses: Record<UIColor, string> = {
  slate: "stroke-slate-900 dark:stroke-slate-100",
  sky: "stroke-sky-600 dark:stroke-sky-400",
  blue: "stroke-blue-600 dark:stroke-blue-400",
  emerald: "stroke-emerald-600 dark:stroke-emerald-400",
  amber: "stroke-amber-500 dark:stroke-amber-400",
  rose: "stroke-rose-600 dark:stroke-rose-400",
  violet: "stroke-violet-600 dark:stroke-violet-400",
};

const chartFillClasses: Record<UIColor, string> = {
  slate: "fill-slate-900 dark:fill-slate-100",
  sky: "fill-sky-600 dark:fill-sky-400",
  blue: "fill-blue-600 dark:fill-blue-400",
  emerald: "fill-emerald-600 dark:fill-emerald-400",
  amber: "fill-amber-500 dark:fill-amber-400",
  rose: "fill-rose-600 dark:fill-rose-400",
  violet: "fill-violet-600 dark:fill-violet-400",
};

const chartBackgroundClasses: Record<UIColor, string> = {
  slate: "bg-slate-900 dark:bg-slate-100",
  sky: "bg-sky-600 dark:bg-sky-400",
  blue: "bg-blue-600 dark:bg-blue-400",
  emerald: "bg-emerald-600 dark:bg-emerald-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  rose: "bg-rose-600 dark:bg-rose-400",
  violet: "bg-violet-600 dark:bg-violet-400",
};

const chartSoftFillClasses: Record<UIColor, string> = {
  slate: "fill-slate-200/70 dark:fill-slate-700/60",
  sky: "fill-sky-100 dark:fill-sky-500/20",
  blue: "fill-blue-100 dark:fill-blue-500/20",
  emerald: "fill-emerald-100 dark:fill-emerald-500/20",
  amber: "fill-amber-100 dark:fill-amber-500/20",
  rose: "fill-rose-100 dark:fill-rose-500/20",
  violet: "fill-violet-100 dark:fill-violet-500/20",
};

const pieFillClasses = [
  "fill-sky-500",
  "fill-emerald-500",
  "fill-amber-500",
  "fill-rose-500",
  "fill-violet-500",
  "fill-blue-500",
  "fill-slate-500",
];

const pieBackgroundClasses = [
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-blue-500",
  "bg-slate-500",
];

function defaultValueFormatter(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function normalizeDatum(item: ChartDatum): ChartDatum {
  return {
    ...item,
    value: Math.max(0, item.value),
  };
}

function buildLinePath(points: Array<{ x: number; y: number }>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function buildSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length <= 2) {
    return buildLinePath(points);
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const controlOffset = (point.x - previous.x) * 0.45;

    return `${path} C ${previous.x + controlOffset} ${previous.y}, ${point.x - controlOffset} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angle: number) {
  const radians = (angle - 90) * (Math.PI / 180);

  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians),
  };
}

function buildArcPath(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function formatPercentage(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

function getValue(series: NormalizedSeries, label: string) {
  return series.data.find((item) => item.label === label)?.value ?? 0;
}

export function Chart({
  data = [],
  series,
  title = "Chart",
  description,
  type = "bar",
  color = "sky",
  height = 240,
  lineVariant = "smooth",
  valueFormatter = defaultValueFormatter,
  emptyText = "No chart data.",
  animated = true,
  showGrid = true,
  showValues = true,
  className,
  ...props
}: ChartProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [activeDatum, setActiveDatum] = useState<ActiveDatum | null>(null);

  const width = 640;
  const resolvedHeight = Math.max(160, height);
  const padding = { top: 14, right: 18, bottom: 34, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = resolvedHeight - padding.top - padding.bottom;

  const normalizedSeries = useMemo<NormalizedSeries[]>(() => {
    if (series && series.length > 0) {
      return series.map((item, index) => ({
        name: item.name,
        data: item.data.map(normalizeDatum),
        color: item.color ?? chartPalette[index % chartPalette.length],
      }));
    }

    return [
      {
        name: title,
        data: data.map(normalizeDatum),
        color,
      },
    ];
  }, [color, data, series, title]);

  const labels = useMemo(() => {
    const seen = new Set<string>();
    const nextLabels: string[] = [];

    for (const item of normalizedSeries.flatMap((entry) => entry.data)) {
      if (!seen.has(item.label)) {
        seen.add(item.label);
        nextLabels.push(item.label);
      }
    }

    return nextLabels;
  }, [normalizedSeries]);

  const values = normalizedSeries.flatMap((item) => item.data.map((entry) => entry.value));
  const maxValue = Math.max(...values, 0);
  const totalValue = values.reduce((total, value) => total + value, 0);
  const normalizedMax = maxValue > 0 ? maxValue : 1;
  const hasData = labels.length > 0 && totalValue > 0;
  const isMultiSeries = normalizedSeries.length > 1;
  const pieData = useMemo(() => normalizedSeries[0]?.data ?? [], [normalizedSeries]);
  const pieTotalValue = pieData.reduce((total, item) => total + item.value, 0);
  const yTicks = useMemo(() => [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    ratio,
    value: normalizedMax * ratio,
    y: padding.top + chartHeight - ratio * chartHeight,
  })), [chartHeight, normalizedMax, padding.top]);

  const lineSeries = useMemo(() => {
    if (!hasData) {
      return [];
    }

    return normalizedSeries.map((entry) => {
      const points = labels.map((label, index) => {
        const value = getValue(entry, label);
        const x =
          labels.length === 1
            ? padding.left + chartWidth / 2
            : padding.left + (index / (labels.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (value / normalizedMax) * chartHeight;

        return { x, y, item: { label, value }, seriesName: entry.name, color: entry.color };
      });

      const linePath = lineVariant === "straight" ? buildLinePath(points) : buildSmoothPath(points);
      const areaPath = points.length
        ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
        : "";

      return { ...entry, points, linePath, areaPath };
    });
  }, [chartHeight, chartWidth, hasData, labels, lineVariant, normalizedMax, normalizedSeries, padding.left, padding.top]);

  const pieSegments = useMemo(() => {
    if (!hasData || pieTotalValue <= 0) {
      return [];
    }

    let currentAngle = 0;
    const centerX = width / 2;
    const centerY = resolvedHeight / 2 + 6;
    const radius = Math.min(width, resolvedHeight) / 2 - 34;

    return pieData.map((item, index) => {
      const angle = (item.value / pieTotalValue) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const middleAngle = startAngle + angle / 2;
      const labelPoint = polarToCartesian(centerX, centerY, radius * 0.68, middleAngle);

      currentAngle = endAngle;

      return {
        item,
        path: buildArcPath(centerX, centerY, radius, startAngle, endAngle),
        fillClass: pieFillClasses[index % pieFillClasses.length],
        legendClass: pieBackgroundClasses[index % pieBackgroundClasses.length],
        x: labelPoint.x,
        y: labelPoint.y,
        percentage: (item.value / pieTotalValue) * 100,
      };
    });
  }, [hasData, pieData, pieTotalValue, resolvedHeight]);

  function setActive(item: ChartDatum, x: number, y: number, seriesName?: string, percentage?: number) {
    setActiveDatum({ label: item.label, value: item.value, x, y, percentage, seriesName });
  }

  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-4",
        animated && "ui-chart-enter",
        className,
      )}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      {...props}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={titleId} className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          {description ? (
            <p id={descriptionId} className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
        {hasData ? (
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", fieldColorClasses[color].soft)}>
            {valueFormatter(type === "pie" ? pieTotalValue : maxValue)} {type === "pie" ? "total" : "peak"}
          </span>
        ) : null}
      </div>

      {hasData ? (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <div className="relative min-w-[34rem]">
              <svg
                viewBox={`0 0 ${width} ${resolvedHeight}`}
                role="img"
                aria-label={`${title} ${type} chart`}
                onMouseLeave={() => setActiveDatum(null)}
              >
                {showGrid && type !== "pie" ? (
                  <g>
                    {yTicks.map((tick) => (
                      <g key={tick.ratio}>
                        <line
                          x1={padding.left}
                          x2={width - padding.right}
                          y1={tick.y}
                          y2={tick.y}
                          className="stroke-slate-200 dark:stroke-slate-800"
                          strokeWidth="1"
                        />
                        <text
                          x={padding.left - 10}
                          y={tick.y + 4}
                          textAnchor="end"
                          className="fill-slate-500 text-[10px] dark:fill-slate-400"
                        >
                          {valueFormatter(tick.value)}
                        </text>
                      </g>
                    ))}
                    {labels.map((label, index) => {
                      const x =
                        type === "bar"
                          ? padding.left + (index + 0.5) * (chartWidth / labels.length)
                          : labels.length === 1
                            ? padding.left + chartWidth / 2
                            : padding.left + (index / (labels.length - 1)) * chartWidth;

                      return (
                        <line
                          key={`x-grid-${label}`}
                          x1={x}
                          x2={x}
                          y1={padding.top}
                          y2={padding.top + chartHeight}
                          className="stroke-slate-100 dark:stroke-slate-800/70"
                          strokeWidth="1"
                        />
                      );
                    })}
                    <line
                      x1={padding.left}
                      x2={width - padding.right}
                      y1={padding.top + chartHeight}
                      y2={padding.top + chartHeight}
                      className="stroke-slate-300 dark:stroke-slate-700"
                      strokeWidth="1.25"
                    />
                    <line
                      x1={padding.left}
                      x2={padding.left}
                      y1={padding.top}
                      y2={padding.top + chartHeight}
                      className="stroke-slate-300 dark:stroke-slate-700"
                      strokeWidth="1.25"
                    />
                  </g>
                ) : null}

                {type === "bar" ? (
                  <g>
                    {labels.map((label, labelIndex) => {
                      const slotWidth = chartWidth / labels.length;
                      const groupGap = 14;
                      const innerGap = 4;
                      const availableWidth = slotWidth - groupGap;
                      const barWidth = Math.max(
                        8,
                        (availableWidth - innerGap * (normalizedSeries.length - 1)) / normalizedSeries.length,
                      );
                      const labelCenter = padding.left + labelIndex * slotWidth + slotWidth / 2;

                      return (
                        <g key={label}>
                          {normalizedSeries.map((entry, seriesIndex) => {
                            const value = getValue(entry, label);
                            const barHeight = (value / normalizedMax) * chartHeight;
                            const x =
                              padding.left +
                              labelIndex * slotWidth +
                              groupGap / 2 +
                              seriesIndex * (barWidth + innerGap);
                            const y = padding.top + chartHeight - barHeight;

                            return (
                              <g
                                key={`${entry.name}-${label}`}
                                tabIndex={0}
                                role="listitem"
                                aria-label={`${entry.name}, ${label}: ${valueFormatter(value)}`}
                                onMouseEnter={() => setActive({ label, value }, x + barWidth / 2, y, entry.name)}
                                onFocus={() => setActive({ label, value }, x + barWidth / 2, y, entry.name)}
                                onBlur={() => setActiveDatum(null)}
                                className="outline-none"
                              >
                                <rect
                                  x={x}
                                  y={y}
                                  width={barWidth}
                                  height={barHeight}
                                  rx="2"
                                  className={cn(
                                    "transition-opacity hover:opacity-80",
                                    animated && "ui-chart-bar-enter",
                                    chartFillClasses[entry.color],
                                  )}
                                />
                              </g>
                            );
                          })}
                          {showValues && normalizedSeries.length === 1 ? (
                            <text
                              x={labelCenter}
                              y={Math.max(12, padding.top + chartHeight - (getValue(normalizedSeries[0], label) / normalizedMax) * chartHeight - 7)}
                              textAnchor="middle"
                              className="pointer-events-none fill-slate-600 text-[11px] font-medium dark:fill-slate-300"
                            >
                              {valueFormatter(getValue(normalizedSeries[0], label))}
                            </text>
                          ) : null}
                          <text
                            x={labelCenter}
                            y={padding.top + chartHeight + 20}
                            textAnchor="middle"
                            className="pointer-events-none fill-slate-500 text-[11px] dark:fill-slate-400"
                          >
                            {label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                ) : type === "pie" ? (
                  <g>
                    {pieSegments.map((segment) => (
                      <g
                        key={segment.item.label}
                        tabIndex={0}
                        role="listitem"
                        aria-label={`${segment.item.label}: ${valueFormatter(segment.item.value)}, ${formatPercentage(segment.percentage)}`}
                        onMouseEnter={() => setActive(segment.item, segment.x, segment.y, undefined, segment.percentage)}
                        onFocus={() => setActive(segment.item, segment.x, segment.y, undefined, segment.percentage)}
                        onBlur={() => setActiveDatum(null)}
                        className="outline-none"
                      >
                        <path
                          d={segment.path}
                          className={cn(
                            "stroke-white stroke-2 transition-opacity hover:opacity-80 dark:stroke-slate-900",
                            animated && "ui-chart-pie-enter",
                            segment.fillClass,
                          )}
                        />
                        {showValues && segment.percentage >= 8 ? (
                          <text
                            x={segment.x}
                            y={segment.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="pointer-events-none fill-white text-[11px] font-semibold"
                          >
                            {formatPercentage(segment.percentage)}
                          </text>
                        ) : null}
                      </g>
                    ))}
                  </g>
                ) : (
                  <g>
                    {lineSeries.map((entry) => (
                      <g key={entry.name}>
                        {type === "area" ? (
                          <path
                            d={entry.areaPath}
                            className={cn(animated && "ui-chart-area-enter", chartSoftFillClasses[entry.color])}
                          />
                        ) : null}
                        <path
                          d={entry.linePath}
                          fill="none"
                          strokeWidth="2.25"
                          strokeLinecap={lineVariant === "straight" ? "butt" : "round"}
                          strokeLinejoin={lineVariant === "straight" ? "miter" : "round"}
                          className={cn(animated && "ui-chart-line-enter", chartStrokeClasses[entry.color])}
                        />
                        {entry.points.map((point) => (
                          <g
                            key={`${entry.name}-${point.item.label}`}
                            tabIndex={0}
                            role="listitem"
                            aria-label={`${entry.name}, ${point.item.label}: ${valueFormatter(point.item.value)}`}
                            onMouseEnter={() => setActive(point.item, point.x, point.y, entry.name)}
                            onFocus={() => setActive(point.item, point.x, point.y, entry.name)}
                            onBlur={() => setActiveDatum(null)}
                            className="outline-none"
                          >
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="5"
                              className={cn(
                                "stroke-white transition-opacity hover:opacity-80 dark:stroke-slate-900",
                                animated && "ui-chart-point-enter",
                                chartFillClasses[entry.color],
                              )}
                              strokeWidth="2"
                            />
                          </g>
                        ))}
                      </g>
                    ))}

                    {labels.map((label, index) => {
                      const x =
                        labels.length === 1
                          ? padding.left + chartWidth / 2
                          : padding.left + (index / (labels.length - 1)) * chartWidth;

                      return (
                        <text
                          key={label}
                          x={x}
                          y={padding.top + chartHeight + 20}
                          textAnchor="middle"
                          className="pointer-events-none fill-slate-500 text-[11px] dark:fill-slate-400"
                        >
                          {label}
                        </text>
                      );
                    })}
                  </g>
                )}
              </svg>

              {activeDatum ? (
                <div
                  className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 -translate-y-[calc(100%+0.5rem)] rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-950"
                  style={{
                    left: `${(activeDatum.x / width) * 100}%`,
                    top: `${(activeDatum.y / resolvedHeight) * 100}%`,
                  }}
                  role="status"
                >
                  {activeDatum.seriesName ? (
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{activeDatum.seriesName}</p>
                  ) : null}
                  <p className={cn("font-semibold text-slate-900 dark:text-slate-100", activeDatum.seriesName && "mt-1")}>
                    {activeDatum.label}
                  </p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">{valueFormatter(activeDatum.value)}</p>
                  {typeof activeDatum.percentage === "number" ? (
                    <p className="mt-0.5 text-slate-500 dark:text-slate-400">{formatPercentage(activeDatum.percentage)}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {(isMultiSeries && type !== "pie") || type === "pie" ? (
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
              {type === "pie"
                ? pieSegments.map((segment) => (
                  <span key={segment.item.label} className="inline-flex items-center gap-1.5">
                    <span className={cn("h-2.5 w-2.5 rounded-full", segment.legendClass)} aria-hidden="true" />
                    {segment.item.label}
                  </span>
                ))
                : normalizedSeries.map((entry) => (
                  <span key={entry.name} className="inline-flex items-center gap-1.5">
                    <span className={cn("h-2.5 w-2.5 rounded-full", chartBackgroundClasses[entry.color])} aria-hidden="true" />
                    {entry.name}
                  </span>
                ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
          {emptyText}
        </div>
      )}
    </section>
  );
}
