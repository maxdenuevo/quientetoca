import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';

// Register Spanish locale for Chilean format
registerLocale('es', es);

const ChileanDatePicker = ({ selected, onChange, className, ...props }) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      locale="es"
      calendarStartDay={1} // Monday = 1, Sunday = 0
      className={className}
      {...props}
    />
  );
};

export default ChileanDatePicker;
