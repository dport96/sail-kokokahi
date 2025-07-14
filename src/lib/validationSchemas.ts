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
  signupReq: Yup.boolean().default(false),
});
