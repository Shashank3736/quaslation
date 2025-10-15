"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import AnalyticsErrorBoundary from "./analytics-error-boundary";

type Props = {
  gaId: string;
};

const GoogleAnalyticsWrapper: React.FC<Props> = ({ gaId }) => {
  if (!gaId || process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <AnalyticsErrorBoundary>
      <GoogleAnalytics gaId={gaId} />
    </AnalyticsErrorBoundary>
  );
};

export default GoogleAnalyticsWrapper;
