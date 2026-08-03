import * as Yup from 'yup';

export const DeleteEventSchema = Yup.object({
  id: Yup.number().required(),
});

export const AddEventSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  date: Yup
    .mixed()
    .required('Date is required')
    .test('is-date', 'Please select a valid date', (value) => value instanceof Date || typeof value === 'string'),
  location: Yup.string().required('Location is required'),
  hours: Yup.number().positive().required('Hours is required'),
  time: Yup
    .mixed()
    .required('Time is required')
    .test('is-time', 'Please select a valid time', (value) => value instanceof Date || typeof value === 'string'),
  pin: Yup.string()
    .optional()
    .test('is-optional-pin', 'PIN must be blank, "auto", or exactly 4 digits', (value) => {
      if (!value || value.trim() === '') return true;
      const normalizedValue = value.trim().toLowerCase();
      if (normalizedValue === 'auto') return true;
      return /^\d{4}$/.test(normalizedValue);
    }),
  signupReq: Yup.boolean().default(false),
});
