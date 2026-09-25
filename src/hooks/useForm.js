import { useState } from 'react';

// Невеликий хук для керування формою та валідації на чистому JS.
export default function useForm(initial, validate) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    const next = { ...values, [name]: type === 'checkbox' ? checked : value };
    setValues(next);
    if (touched[name]) setErrors(validate(next));
  };

  const onBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(values));
  };

  const setValue = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = (onValid) => (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched(Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    if (Object.keys(found).length === 0) {
      onValid(values);
    } else {
      const first = e.target.querySelector(`[name="${Object.keys(found)[0]}"]`);
      first?.focus();
    }
  };

  const reset = () => {
    setValues(initial);
    setErrors({});
    setTouched({});
  };

  const fieldError = (name) => (touched[name] ? errors[name] : undefined);

  return { values, errors, onChange, onBlur, setValue, handleSubmit, reset, fieldError };
}
