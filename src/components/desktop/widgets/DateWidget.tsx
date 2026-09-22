import React from 'react';

interface DateWidgetProps {
  customDate?: Date;
}

export const DateWidget: React.FC<DateWidgetProps> = ({ customDate }) => {
  const date = customDate || new Date();
  
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayName = days[date.getDay()];
  const dayNumber = date.getDate();
  const monthName = months[date.getMonth()];

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '4px 0 2px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 800,
          color: '#475971',
          letterSpacing: '1px',
          lineHeight: 1.15,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          textTransform: 'uppercase',
          margin: 0,
        }}
      >
        {dayName}
      </h2>
      <div
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#7E8F9E',
          marginTop: '3px',
          letterSpacing: '0.2px',
        }}
      >
        {dayNumber} {monthName}
      </div>
    </div>
  );
};
