import { TSerializedTimeRanges } from '@/common/message';
import {
  RectHeight,
  RectWidth,
  Space,
  TextHeight,
  TextWidth,
} from './TimeRanges.constants';
import { useMemo } from 'react';

type TimeRangesProps = {
  text: string;
  timeRanges: TSerializedTimeRanges;
  duration: number;
};

export function TimeRanges({ text, timeRanges, duration }: TimeRangesProps) {
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
        console.debug('timeRange', timeRange[0], timeRange[1]);
        return { start, end, diff };
      });
    return { ranges, totalRange };
  }, []);
  const TotalWidth = TextWidth + Space + RectWidth;

  return (
    <svg
      width={TotalWidth * 2}
      height={RectHeight * 2}
      viewBox={`0 0 ${TotalWidth} ${RectHeight}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x={0}
        y={textY}
        width={TextWidth - Space / 2}
        height={TextHeight}
        style={{ fontSize: `${TextHeight}px` }}
      >
        {text} {Number((totalRange / duration) * 100).toFixed(2)}%
      </text>
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
  );
}
