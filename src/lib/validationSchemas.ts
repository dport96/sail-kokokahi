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

export const DeleteEventSchema = Yup.object({
  id: Yup.number().required(),
});

export const AddEventSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  date: Yup
    .string()
    .required('Date is required')
    .matches(
      /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/,
      'Please enter a valid date in MM/DD/YYYY format. (ex. 01/01/2022)',
    ),
  location: Yup.string().required('Location is required'),
  hours: Yup.number().positive().required('Hours is required'),
  time: Yup
    .string()
    .required('Time is required')
    .matches(
      /^(0[1-9]|1[0-2]):[0-5][0-9](AM|PM)$/,
      'Please enter a valid time in HH:MM|AM/PM format. (ex. 01:00PM)',
    ),
});
