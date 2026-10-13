import { Badge } from './badge.jsx';
import {
  ATTENDANCE_META, EMPLOYEE_STATUS_META, FEE_STATUS_META, LIBRARY_STATUS_META,
  SALARY_STATUS_META, SEAT_STATUS_META, STUDENT_STATUS_META, SOFTWAR_STATUS_META,
} from '../../utils/constants.js';

const MAPS = {
  library: LIBRARY_STATUS_META,
  student: STUDENT_STATUS_META,
  fee: FEE_STATUS_META,
  seat: SEAT_STATUS_META,
  employee: EMPLOYEE_STATUS_META,
  salary: SALARY_STATUS_META,
  attendance: ATTENDANCE_META,
  subscription: SOFTWAR_STATUS_META,
};

/** Single place that turns any status string into a consistent, coloured badge. */
export const StatusBadge = ({ status, kind = 'student', className, showDot = true }) => {
  const meta = (MAPS[kind] || {})[status] || { label: status || '—', tone: 'muted' };
  return (
    <Badge tone={meta.tone} dot={showDot} className={className}>
      {meta.label}
    </Badge>
  );
};
