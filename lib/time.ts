import type { PaceParams } from "./types";

/** 集合、整隊、出發前的固定緩衝（分鐘） */
const FIXED_BUFFER_MIN = 15;

/**
 * 騎乘時間 = 距離/平路均速 + 爬升/爬升速率
 * 休息時間 = 騎乘小時數 × 每小時休息 + 固定緩衝
 * 總時間四捨五入到 15 分鐘
 */
export function estimateRideTime(distanceKm: number, elevationM: number, p: PaceParams): string {
  if (!isFinite(distanceKm) || !isFinite(elevationM) || distanceKm <= 0) return "";
  const rideHours = distanceKm / p.flatSpeed + Math.max(0, elevationM) / p.climbRate;
  const restMin = rideHours * p.restPerHour + FIXED_BUFFER_MIN;
  const totalMin = Math.round((rideHours * 60 + restMin) / 15) * 15;
  return formatMinutes(totalMin);
}

export function formatMinutes(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `約 ${m} 分鐘`;
  if (m === 0) return `約 ${h} 小時`;
  return `約 ${h} 小時 ${m} 分`;
}
