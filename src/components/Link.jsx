import { url } from '../utils/url.js';

// Звичайне посилання з урахуванням базової адреси сайту
export default function Link({ to, children, ...props }) {
  return (
    <a href={url(to)} {...props}>
      {children}
    </a>
  );
}
