import {
  differenceInMinutes,
  eachHourOfInterval,
  eachMinuteOfInterval,
  eachDayOfInterval,
  format,
} from "date-fns";

export enum ZoomLevel {
  Minute = 1,
  FiveMinutes = 2,
  QuarterHour = 3,
  Hour = 4,
  Day = 5,
  Week = 6,
  Month = 7,
}

// Get interval in minutes based on zoom level
export function getIntervalMinutes(zoomLevel: ZoomLevel): number {
  switch (zoomLevel) {
    case ZoomLevel.Minute:
      return 1;
    case ZoomLevel.FiveMinutes:
      return 5;
    case ZoomLevel.QuarterHour:
      return 15;
    case ZoomLevel.Hour:
      return 60;
    case ZoomLevel.Day:
      return 60 * 24;
    case ZoomLevel.Week:
      return 60 * 24 * 7;
    case ZoomLevel.Month:
      return 60 * 24 * 30;
    default:
      return 15;
  }
}

/**
 * Returns a [startDate, endDate] pairs for timeline columns given a startDate, endDate and zoomLevel.
 *
 * @param  {Date}      startDate Timeline start date.
 * @param  {Date}      endDate   Timeline end date.
 * @param  {ZoomLevel} zoomLevel Timeline zoom level.
 * @return {Date[]}              Timeline column intervals.
 */
function getTimelineColumns(
  startDate: Date,
  endDate: Date,
  zoomLevel: ZoomLevel,
): Date[] {
  const intervalMinutes = getIntervalMinutes(zoomLevel);

  if (zoomLevel <= ZoomLevel.Hour) {
    // For minute-based intervals
    return eachMinuteOfInterval(
      { start: startDate, end: endDate },
      { step: intervalMinutes },
    );
  }

  if (zoomLevel === ZoomLevel.Day) {
    // For hourly intervals
    return eachHourOfInterval({ start: startDate, end: endDate }, { step: 1 });
  }

  // For daily intervals
  return eachDayOfInterval(
    { start: startDate, end: endDate },
    { step: zoomLevel === ZoomLevel.Week ? 1 : 1 },
  );
}

/**
 * Returns timeline intervals for the given startDate, endDate and zoomLevel.
 *
 * @param {Date}      startDate Timeline start date.
 * @param {Date}      endDate   Timeline end date.
 * @param {ZoomLevel} zoomLevel Timeline zoom level.
 */
export function getTimelineIntervals(
  startDate: Date,
  endDate: Date,
  zoomLevel: ZoomLevel,
) {
  const columns = getTimelineColumns(startDate, endDate, zoomLevel);
  const divideBy = {
    [ZoomLevel.Minute]: 12,
    [ZoomLevel.FiveMinutes]: 12,
    [ZoomLevel.QuarterHour]: 12,
    [ZoomLevel.Hour]: 12,
    [ZoomLevel.Day]: 7,
    [ZoomLevel.Week]: 7,
    [ZoomLevel.Month]: 6,
  }[zoomLevel];
  const labelInterval = Math.floor(columns.length / divideBy);

  return columns.map((column, index) => {
    let label = "";

    if (index % labelInterval === 0 || index === columns.length - 1) {
      if (
        [
          ZoomLevel.Minute,
          ZoomLevel.FiveMinutes,
          ZoomLevel.QuarterHour,
          ZoomLevel.Hour,
        ].includes(zoomLevel)
      ) {
        label = format(column, "HH:mm");
      }

      if (
        [ZoomLevel.Day, ZoomLevel.Week, ZoomLevel.Month].includes(zoomLevel) ||
        label === "00:00"
      ) {
        label = format(column, "MMM d");
      }
    }

    return {
      column,
      index,
      label,
      position: (index / (columns.length - 1)) * 100,
    };
  });
}

// Calculate position percentage for a job on the timeline
export function calculatePositionPercentage(
  jobTime: Date,
  startDate: Date,
  endDate: Date,
): number {
  const totalMinutes = differenceInMinutes(endDate, startDate);
  const jobMinutes = differenceInMinutes(jobTime, startDate);
  return (jobMinutes / totalMinutes) * 100;
}
