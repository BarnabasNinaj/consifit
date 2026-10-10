import {
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BAND_COLOR, BODY_COLOR } from '../theme/colors';
import type { ProgressionPoint } from '../types';

interface ProgressionChartProps {
  data: ProgressionPoint[];
  exerciseName: string;
  className?: string;
}

const AXIS_TICK = { fill: '#d4d4d8', fontSize: 12, fontWeight: 500 as const };
const AXIS_LINE = { stroke: '#52525b' };

function chartLabel(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '';
  return String(n);
}

export function ProgressionChart({
  data,
  exerciseName,
  className = '',
}: ProgressionChartProps) {
  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 text-center text-sm text-zinc-500 ${className}`}
      >
        Finish workouts to see {exerciseName} progression.
      </div>
    );
  }

  const dense = data.length > 6;

  return (
    <div
      className={`flex min-h-0 flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 ${className}`}
    >
      <p className="mb-2 shrink-0 px-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
        Last {data.length} workout{data.length === 1 ? '' : 's'}
      </p>
      <div className="chart-surface relative min-h-[12rem] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 10, left: 4, bottom: dense ? 8 : 4 }}
          >
            <CartesianGrid
              stroke="#3f3f46"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              axisLine={AXIS_LINE}
              tickLine={false}
              tickMargin={10}
              interval={0}
              angle={dense ? -35 : 0}
              textAnchor={dense ? 'end' : 'middle'}
              height={dense ? 48 : 28}
            />
            <YAxis
              allowDecimals={false}
              tick={AXIS_TICK}
              axisLine={AXIS_LINE}
              tickLine={false}
              tickMargin={8}
              width={40}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                background: '#18181b',
                border: '1px solid #52525b',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: '#e4e4e7', fontWeight: 600 }}
              itemStyle={{ color: '#e4e4e7' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
              iconType="circle"
              formatter={(value) => (
                <span
                  style={{
                    color: value === 'Body' ? BODY_COLOR : BAND_COLOR,
                    fontWeight: 600,
                  }}
                >
                  {value}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="bodyweightReps"
              name="Body"
              stroke={BODY_COLOR}
              strokeWidth={2.75}
              dot={{ r: 3.5, fill: BODY_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: BODY_COLOR, strokeWidth: 0 }}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="bodyweightReps"
                position="top"
                offset={8}
                formatter={chartLabel}
                style={{ fill: BODY_COLOR, fontSize: 11, fontWeight: 700 }}
              />
            </Line>
            <Line
              type="monotone"
              dataKey="bandReps"
              name="Band"
              stroke={BAND_COLOR}
              strokeWidth={2.75}
              dot={{ r: 3.5, fill: BAND_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: BAND_COLOR, strokeWidth: 0 }}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="bandReps"
                position="bottom"
                offset={8}
                formatter={chartLabel}
                style={{ fill: BAND_COLOR, fontSize: 11, fontWeight: 700 }}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
