import { type ReactNode, useMemo } from 'react';

import { TSerializedTimeRanges } from '@/common/message';
import {
  RectHeight,
  RectWidth,
  Space,
  TextHeight,
  TextWidth,
} from './TimeRanges.constants';

type TimeRangesProps = {
  timeRanges: TSerializedTimeRanges;
  duration: number;
  children: (args: { totalPercent: string }) => ReactNode;
};

export function TimeRanges({
  timeRanges,
  duration,
  children,
}: TimeRangesProps) {
  const durationRelation = RectWidth / duration;
  const textY = RectHeight / 2 + TextHeight / 2;
  const { ranges, totalRange } = useMemo(() => {
    let totalRange = 0;
    const ranges: Array<{ start: number; end: number; diff: number }> =
      timeRanges.map((timeRange) => {
        const start = durationRelation * timeRange[0];
        const end = durationRelation * timeRange[1];
        const diff = end - start;
        totalRange += timeRange[1] - timeRange[0];
        return { start, end, diff };
      });
    return { ranges, totalRange };
  }, []);
  const TotalWidth = TextWidth + Space + RectWidth;

  const childProps = useMemo(() => {
    return { totalPercent: Number((totalRange / duration) * 100).toFixed(2) };
  }, [totalRange]);

  return (
    <>
      {children(childProps)}
      <svg
        width={TotalWidth * 2}
        height={RectHeight * 2}
        viewBox={`0 0 ${TotalWidth} ${RectHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={TextWidth + Space}
          y={0}
          width={RectWidth}
          height={RectHeight}
          fill="black"
          fill-opacity="0.1"
        />
        {ranges.map(({ start, diff }) => {
          return (
            <rect
              x={TextWidth + Space + start}
              y={0}
              width={diff}
              height={RectHeight}
              fill="green"
            />
          );
        })}
      </svg>
    </>
  );
}
