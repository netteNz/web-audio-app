// utils/analytics.js
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-0L5LLER0MH');
};

export const pageView = (title = 'Web Audio App') => {
  ReactGA.send({
    hitType: 'pageview',
    page: window.location.pathname,
    title,
    // DebugView only in dev — GA4 excludes debug traffic from standard reports
    ...(import.meta.env.DEV && { debug_mode: true }),
  });
};

export const trackEvent = (eventName, params = {}) => {
  ReactGA.gtag('event', eventName, {
    ...params,
    ...(import.meta.env.DEV && { debug_mode: true }),
  });
};
