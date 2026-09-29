import { schedule, scheduleNote } from '../data/prices.js';

// Графік роботи музею (один для підвалу, «Контактів» і «Про музей»)
export default function Schedule({ className = '' }) {
  return (
    <div className={`schedule ${className}`}>
      {schedule.map((s) => (
        <p key={s.days} className="schedule__row">
          <span>{s.days}</span>
          <strong>{s.hours}</strong>
        </p>
      ))}
      <p className="schedule__note">{scheduleNote}</p>
    </div>
  );
}
