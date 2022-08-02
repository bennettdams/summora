import { useEffect, useState } from "react";
import { DateTimeFormat, formatDateTime } from "../util/date-time";

/**
 * Global component to render date-time.
 */
export function DateTime({
  date,
  format,
}: {
  date: Date;
  format: DateTimeFormat;
}): JSX.Element {
  /** We initialize with null to prevent server-render mismatches. */
  const [dateTransformed, setDateTransformed] = useState<{
    dateFormatted: string;
    dateTime: string;
  } | null>(null);

  useEffect(() => {
    setDateTransformed({
      dateFormatted: formatDateTime(date, format),
      dateTime: formatDateTime(date, "UTC YYYY-MM-DD"),
    });
  }, [date, format]);

  return (
    <time dateTime={dateTransformed?.dateTime}>
      {dateTransformed?.dateFormatted}
    </time>
  );
}
