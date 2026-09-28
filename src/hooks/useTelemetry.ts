import { useState, useEffect } from 'react';

export interface TelemetryData {
  labMode: 'ACTIVE_PROTOTYPING' | 'AUTONOMOUS_RUN' | 'STANDBY_CHARGING' | 'BENCH_TESTING';
  labModeLabel: string;
  activePlatform: string;
  batteryLevel: number; // percentage
  batteryVoltage: number; // volts
  currentDraw: number; // amps
  imu: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  wifiRssi: number; // dBm
  rosNodes: {
    active: number;
    total: number;
  };
  cpuTemp: number; // Celsius
  safetyState: 'NOMINAL' | 'CAUTION' | 'RESTRICTED';
  tournament: {
    title: string;
    targetDate: string; // ISO string
    daysLeft: number;
    hoursLeft: number;
    minutesLeft: number;
    secondsLeft: number;
  };
}

export function useTelemetry(targetDateStr: string = '2026-11-15T09:00:00Z') {
  const [telemetry, setTelemetry] = useState<TelemetryData>(() => ({
    labMode: 'ACTIVE_PROTOTYPING',
    labModeLabel: 'Active Prototyping // Lab Zone A',
    activePlatform: 'ARES-IV Heavy Autonomous Rover',
    batteryLevel: 94,
    batteryVoltage: 24.6,
    currentDraw: 4.2,
    imu: { pitch: 1.2, roll: -0.4, yaw: 112.5 },
    wifiRssi: -52,
    rosNodes: { active: 22, total: 22 },
    cpuTemp: 38.4,
    safetyState: 'NOMINAL',
    tournament: calculateCountdown(targetDateStr, 'National Autonomous Robotics Championship 2026'),
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
