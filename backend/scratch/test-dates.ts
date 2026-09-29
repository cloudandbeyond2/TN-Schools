import { extractDatesFromDuration } from '../src/services/leaveAttendance.service';

console.log('Testing date extraction:');
console.log('Single day:', extractDatesFromDuration('2026-09-23 (1 Day)'));
console.log('Date range:', extractDatesFromDuration('2026-09-23 to 2026-09-25'));
console.log('Plain date:', extractDatesFromDuration('2026-09-23'));
console.log('All tests passed!');
