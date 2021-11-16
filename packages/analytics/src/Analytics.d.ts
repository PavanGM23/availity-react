export interface AnalyticsEvent {
  [key: string]: any;
  url: string;
}

export interface AnalyticsPlugin {
  isEnabled: () => boolean;
  init: () => void;
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (url: string) => void;
}

export interface AnalyticsProps {
  plugins?: AnalyticsPlugin[];
  pageTracking?: boolean;
  autoTrack?: boolean;
  recursive?: boolean;
  attributePrefix?: string;
  eventModifiers?: string | string[];
}

export interface TrackEventOptions {
  [key: string]: any;
  level: string;
}
export interface AnalyticsContext {
  trackEvent(trackEventOptions: TrackEventOptions): Promise<void>;
}

declare const Analytics: React.FC<AnalyticsProps>;

declare const useAnalytics: () => AnalyticsContext;

export { useAnalytics };

export default Analytics;