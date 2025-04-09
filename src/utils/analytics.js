// Google Analytics utility functions
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-379487672');
};

export const pageView = (title) => {
  ReactGA.send({
    hitType: 'pageview',
    page: window.location.pathname,
    title: title,
  });
};

export const trackEvent = (eventName, params = {}) => {
  ReactGA.event(eventName, params);
};