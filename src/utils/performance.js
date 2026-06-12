import { trackEvent } from '../firebase/analytics';

export function measureCoreWebVitals() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      trackEvent('web_vital_lcp', {
        value: Math.round(last.startTime),
        rating: last.startTime < 2500 ? 'good' : last.startTime < 4000 ? 'needs_improvement' : 'poor'
      });
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // FID
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        const delay = entry.processingStart - entry.startTime;
        trackEvent('web_vital_fid', { value: Math.round(delay), rating: delay < 100 ? 'good' : 'poor' });
      });
    }).observe({ type: 'first-input', buffered: true });

    // CLS
    let cls = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach(e => { if (!e.hadRecentInput) cls += e.value; });
    }).observe({ type: 'layout-shift', buffered: true });

    window.addEventListener('pagehide', () => {
      trackEvent('web_vital_cls', { value: Math.round(cls * 1000), rating: cls < 0.1 ? 'good' : 'poor' });
    }, { once: true });

  } catch (e) {
    // PerformanceObserver not available — skip silently
  }

  // Page load timing
  window.addEventListener('load', () => {
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        trackEvent('page_load_time', {
          ttfb: Math.round(nav.responseStart - nav.requestStart),
          dom_complete: Math.round(nav.domComplete),
          load_complete: Math.round(nav.loadEventEnd)
        });
      }
    } catch (e) { /* skip */ }
  }, { once: true });
}
