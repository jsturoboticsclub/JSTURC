import React from 'react';
import { useTelemetry } from '../../hooks/useTelemetry';
import { Activity, BatteryCharging, Wifi, Timer, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { CyberBadge } from '../common/CyberPrimitives';

interface TelemetryBarProps {
  className?: string;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ className = '' }) => {
  const data = useTelemetry();

  return (
    <div className={`w-full bg-white/95 dark:bg-[#070B14]/95 border-y border-slate-200 dark:border-indigo-500/20 backdrop-blur-xl text-slate-800 dark:text-slate-200 py-3 px-4 text-xs font-mono shadow-xs dark:shadow-xl transition-colors ${className}`}>
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
        {/* Lab Status Section */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <span className="text-[11px] font-black tracking-wider text-amber-600 dark:text-amber-400 uppercase">
              LAB LIVE
            </span>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-slate-900 dark:text-white">{data.activePlatform}</span>
          </div>

          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
            ROS2 FOXY // 22 NODES
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
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% NOMINAL</span>
          </div>
        </div>

        {/* Tournament Countdown Timer */}
        <div className="flex items-center gap-2.5 w-full xl:w-auto justify-center xl:justify-end bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 px-3.5 py-1.5 rounded-xl shadow-2xs">
          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
            <Timer className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              ROBOSUMMIT '26:
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
      </div>
    </div>
  );
};
