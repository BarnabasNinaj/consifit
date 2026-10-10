import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ProgressionPoint } from '../types';

interface ProgressionChartProps {
  data: ProgressionPoint[];
  exerciseName: string;
}

export function ProgressionChart({ data, exerciseName }: ProgressionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-4 text-center text-sm text-zinc-500">
        Finish workouts to see {exerciseName} progression.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
      <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
        Last {data.length} workout{data.length === 1 ? '' : 's'}
      </p>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(value) => (
                <span className="text-zinc-400">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="bodyweightReps"
              name="Bodyweight"
              stroke="#34d399"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#34d399' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="bandReps"
              name="Band-Assisted"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#38bdf8' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
