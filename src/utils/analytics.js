// Google Analytics utility functions

export const pageView = (title) => {
    if (!window.gtag) return;
    
    window.gtag('event', 'page_view', {
      page_title: title,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  };
  
  export const trackEvent = (eventName, params = {}) => {
    if (!window.gtag) return;
    
    window.gtag('event', eventName, params);
  };