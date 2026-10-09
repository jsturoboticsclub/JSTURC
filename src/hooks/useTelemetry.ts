import { useState, useEffect } from 'react';

export interface TelemetryConfig {
  show?: boolean;
  status_label?: string;
  status_color?: 'amber' | 'emerald' | 'cyan' | 'rose' | 'blue';
  active_platform?: string;
  sub_badge?: string;
  battery_voltage?: number | string;
  current_draw?: number | string;
  imu_pitch?: number | string;
  imu_roll?: number | string;
  wifi_rssi?: number | string;
  sys_health?: string;
  tournament_title?: string;
  tournament_date?: string;
  show_countdown?: boolean;
}

export interface TelemetryData {
  labMode: 'ACTIVE_PROTOTYPING' | 'AUTONOMOUS_RUN' | 'STANDBY_CHARGING' | 'BENCH_TESTING';
  labModeLabel: string;
  activePlatform: string;
  subBadge: string;
  statusColor: 'amber' | 'emerald' | 'cyan' | 'rose' | 'blue';
  batteryLevel: number;
  batteryVoltage: number;
  currentDraw: number;
  imu: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  wifiRssi: number;
  rosNodes: {
    active: number;
    total: number;
  };
  cpuTemp: number;
  safetyState: 'NOMINAL' | 'CAUTION' | 'RESTRICTED';
  tournament: {
    title: string;
    targetDate: string;
    daysLeft: number;
    hoursLeft: number;
    minutesLeft: number;
    secondsLeft: number;
  };
  showCountdown: boolean;
}

export function useTelemetry(config?: TelemetryConfig, fallbackDate: string = '2026-11-15T09:00:00Z') {
  const targetDateStr = config?.tournament_date || fallbackDate;
  const targetTitle = config?.tournament_title || "ROBOSUMMIT '26";

  const [telemetry, setTelemetry] = useState<TelemetryData>(() => ({
    labMode: 'ACTIVE_PROTOTYPING',
    labModeLabel: config?.status_label || 'Active Prototyping · Lab Zone A',
    activePlatform: config?.active_platform || 'ARES-IV Heavy Autonomous Rover',
    subBadge: config?.sub_badge || 'ROS2 Humble · 22 Nodes',
    statusColor: config?.status_color || 'amber',
    batteryLevel: 94,
    batteryVoltage: config?.battery_voltage ? parseFloat(String(config.battery_voltage)) || 24.6 : 24.6,
    currentDraw: config?.current_draw ? parseFloat(String(config.current_draw)) || 4.2 : 4.2,
    imu: {
      pitch: config?.imu_pitch !== undefined ? parseFloat(String(config.imu_pitch)) || 1.2 : 1.2,
      roll: config?.imu_roll !== undefined ? parseFloat(String(config.imu_roll)) || -0.4 : -0.4,
      yaw: 112.5
    },
    wifiRssi: config?.wifi_rssi !== undefined ? parseInt(String(config.wifi_rssi), 10) || -52 : -52,
    rosNodes: { active: 22, total: 22 },
    cpuTemp: 38.4,
    safetyState: 'NOMINAL',
    tournament: calculateCountdown(targetDateStr, targetTitle),
    showCountdown: config?.show_countdown !== false,
  }));

  function calculateCountdown(dateStr: string, title: string) {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      title,
      targetDate: dateStr,
      daysLeft: days,
      hoursLeft: hours,
      minutesLeft: minutes,
      secondsLeft: seconds,
    };
  }

  // Sync state if config changes
  useEffect(() => {
    setTelemetry(prev => ({
      ...prev,
      labModeLabel: config?.status_label || prev.labModeLabel,
      activePlatform: config?.active_platform || prev.activePlatform,
      subBadge: config?.sub_badge || prev.subBadge,
      statusColor: config?.status_color || prev.statusColor,
      tournament: calculateCountdown(targetDateStr, targetTitle),
      showCountdown: config?.show_countdown !== false,
      wifiRssi: config?.wifi_rssi !== undefined ? parseInt(String(config.wifi_rssi), 10) || prev.wifiRssi : prev.wifiRssi,
    }));
  }, [config, targetDateStr, targetTitle]);

  useEffect(() => {
    // Dynamic stochastic physics ticker simulating active robot telemetry
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const jitter = (Math.random() - 0.5) * 0.1;
        const newVoltage = parseFloat((prev.batteryVoltage + jitter * 0.05).toFixed(2));
        const newPitch = parseFloat((prev.imu.pitch + (Math.random() - 0.5) * 0.3).toFixed(1));
        const newRoll = parseFloat((prev.imu.roll + (Math.random() - 0.5) * 0.2).toFixed(1));
        const newYaw = parseFloat(((prev.imu.yaw + (Math.random() * 0.4)) % 360).toFixed(1));
        const newTemp = parseFloat((38.0 + Math.sin(Date.now() / 10000) * 1.5).toFixed(1));

        return {
          ...prev,
          batteryVoltage: Math.max(22.0, Math.min(25.6, newVoltage)),
          currentDraw: parseFloat((4.0 + (Math.random() - 0.5) * 0.8).toFixed(1)),
          imu: { pitch: newPitch, roll: newRoll, yaw: newYaw },
          cpuTemp: newTemp,
          tournament: calculateCountdown(targetDateStr, prev.tournament.title),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateStr]);

  return telemetry;
}
