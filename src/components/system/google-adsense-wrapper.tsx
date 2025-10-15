"use client";

import GoogleAdsense from "./google-adsense";
import AnalyticsErrorBoundary from "./analytics-error-boundary";

type Props = {
  pId: string;
};

const GoogleAdsenseWrapper: React.FC<Props> = ({ pId }) => {
  if (!pId || process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <AnalyticsErrorBoundary>
      <GoogleAdsense pId={pId} />
    </AnalyticsErrorBoundary>
  );
};

export default GoogleAdsenseWrapper;
