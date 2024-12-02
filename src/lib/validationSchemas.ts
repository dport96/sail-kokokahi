import * as Yup from 'yup';

export const AddStuffSchema = Yup.object({
  name: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  condition: Yup.string().oneOf(['excellent', 'good', 'fair', 'poor']).required(),
  owner: Yup.string().required(),
});

export const EditStuffSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  condition: Yup.string().oneOf(['excellent', 'good', 'fair', 'poor']).required(),
  owner: Yup.string().required(),
});

export const AddEventSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  date: Yup
    .string()
    .required('Date is required')
    .matches(
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/,
      'Please enter a valid date in MM/DD format (e.g., 01/01 or 12/31).',
    ),
  location: Yup.string().required('Location is required'),
  hours: Yup.number().positive().required('Hours is required'),
  time: Yup
    .string()
    .required('Time is required')
    .matches(
      /^(0[0-9]|1[0-2]):[0-5][0-9]$/,
      'Please enter a valid time in HH:MM format (e.g., 01:00 or 12:59).',
    ),
});
