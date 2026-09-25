// Єдина точка реєстрації плагінів GSAP.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
gsap.defaults({ ease: 'power3.out', duration: 0.8 });

export { gsap, ScrollTrigger, useGSAP };

// Для налагодження в dev-режимі
if (import.meta.env.DEV) window.gsap = gsap;
