// Клієнт для бекенду на Node.js (server/).
export const API_URL = (import.meta.env.PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, fields = {} } = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError('Сервер недоступний. Перевірте з’єднання або спробуйте пізніше.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'Помилка сервера', { status: res.status, fields: data.fields || {} });
  return data;
}

// Перехід на сторінку оплати: LiqPay — POST-форма, Monobank — звичайне посилання.
export function goToPayment({ method, url, fields = {} }) {
  if (method === 'GET') {
    window.location.assign(url);
    return;
  }
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.acceptCharset = 'utf-8';
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}
