// utils/analytics.js
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-379487672'); // ✅ Make sure this matches your GA4 ID
};

export const pageView = (title = 'Web Audio App') => {
  ReactGA.send({
    hitType: 'pageview',
    page: window.location.pathname,
    title,
    debug_mode: true, // Ensures it shows in DebugView
  });
};

export const trackEvent = (eventName, params = {}) => {
  ReactGA.gtag('event', eventName, {
    ...params,
    debug_mode: true, // Forces events to appear in DebugView
  });
};
