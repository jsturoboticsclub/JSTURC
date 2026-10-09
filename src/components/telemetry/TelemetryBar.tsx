import React from 'react';
import { useTelemetry, TelemetryConfig } from '../../hooks/useTelemetry';
import { Activity, BatteryCharging, Wifi, Timer, Compass, ShieldCheck } from 'lucide-react';

interface TelemetryBarProps {
  className?: string;
  config?: TelemetryConfig;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ className = '', config }) => {
  const data = useTelemetry(config);

  // If explicitly hidden by admin in Superpower settings, don't render
  if (config?.show === false) {
    return null;
  }

  // Dynamic status color styles
  const colorMap = {
    amber: {
      ping: 'bg-amber-400',
      dot: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
    },
    emerald: {
      ping: 'bg-emerald-400',
      dot: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    cyan: {
      ping: 'bg-cyan-400',
      dot: 'bg-cyan-500',
      text: 'text-cyan-600 dark:text-cyan-400',
    },
    rose: {
      ping: 'bg-rose-400',
      dot: 'bg-rose-500',
      text: 'text-rose-600 dark:text-rose-400',
    },
    blue: {
      ping: 'bg-blue-400',
      dot: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
    },
  };

  const statusStyle = colorMap[data.statusColor] || colorMap.amber;

  return (
    <div className={`w-full overflow-hidden bg-white/95 dark:bg-[#070B14]/95 border-y border-slate-200 dark:border-indigo-500/20 backdrop-blur-xl text-slate-800 dark:text-slate-200 py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-mono shadow-xs dark:shadow-xl transition-colors ${className}`}>
      <div className="w-full max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-3 xl:gap-4 overflow-hidden">
        {/* Lab Status Section */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full xl:w-auto justify-between sm:justify-start flex-shrink-0 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusStyle.ping} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusStyle.dot}`} />
            </span>
            <span className={`text-[11px] font-black tracking-wider uppercase ${statusStyle.text}`}>
              {config?.status_label || 'LAB LIVE'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 min-w-0">
            <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none">{data.activePlatform}</span>
          </div>

          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 flex-shrink-0">
            {data.subBadge}
          </span>
        </div>

        {/* Telemetry Metrics Strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2 text-slate-600 dark:text-slate-400 text-[11px] w-full xl:w-auto">
          {/* Battery */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0D1424] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <BatteryCharging className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>PWR:</span>
            <span className="font-bold text-amber-700 dark:text-amber-300">{data.batteryVoltage}V</span>
            <span className="text-slate-400 dark:text-slate-500">({data.currentDraw}A)</span>
          </div>

          {/* IMU Orientation */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0D1424] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>IMU:</span>
            <span className="font-bold text-indigo-700 dark:text-indigo-300">P:{data.imu.pitch}° R:{data.imu.roll}°</span>
          </div>

          {/* Wi-Fi RSSI */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0D1424] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>LINK:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">{data.wifiRssi} dBm</span>
          </div>

          {/* Health */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 dark:bg-[#0D1424] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>SYS:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">{config?.sys_health || '100% NOMINAL'}</span>
          </div>
        </div>

        {/* Tournament Countdown Timer */}
        {data.showCountdown && (
          <div className="flex items-center gap-2 sm:gap-2.5 w-full xl:w-auto justify-center xl:justify-end bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 px-3 sm:px-3.5 py-1.5 rounded-xl shadow-2xs flex-shrink-0">
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
              <Timer className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {data.tournament.title}:
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold font-mono">
              <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-indigo-700 dark:text-indigo-300 shadow-2xs">
                {data.tournament.daysLeft}d
              </span>
              <span className="text-slate-400">:</span>
              <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-indigo-700 dark:text-indigo-300 shadow-2xs">
                {String(data.tournament.hoursLeft).padStart(2, '0')}h
              </span>
              <span className="text-slate-400">:</span>
              <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-indigo-700 dark:text-indigo-300 shadow-2xs">
                {String(data.tournament.minutesLeft).padStart(2, '0')}m
              </span>
              <span className="text-slate-400">:</span>
              <span className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 animate-pulse font-extrabold shadow-2xs">
                {String(data.tournament.secondsLeft).padStart(2, '0')}s
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
