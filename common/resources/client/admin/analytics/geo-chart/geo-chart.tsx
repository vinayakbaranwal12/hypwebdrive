import {
  LocationDatasetItem,
  ReportMetric,
} from '@common/admin/analytics/report-metric';
import React, {useMemo, useRef} from 'react';
import {useGoogleGeoChart} from './use-google-geo-chart';
import {ChartLayout, ChartLayoutProps} from '@common/charts/chart-layout';
import {Trans} from '@common/i18n/trans';
import {ChartLoadingIndicator} from '@common/charts/chart-loading-indicator';

interface GeoChartData extends Partial<ChartLayoutProps> {
  data?: ReportMetric<LocationDatasetItem>;
}
export function GeoChart({
  data: metricData,
  isLoading,
  ...layoutProps
}: GeoChartData) {
  const placeholderRef = useRef<HTMLDivElement>(null);

  // memo data to avoid redrawing chart on rerender
  const initialData = metricData?.datasets[0].data;
  const data = useMemo(() => {
    return initialData || [];
  }, [initialData]);
  useGoogleGeoChart({placeholderRef, data});

  return (
    <ChartLayout
      {...layoutProps}
      className="min-w-500"
      title={<Trans message="Top Locations" />}
      contentIsFlex={isLoading}
    >
      {isLoading && <ChartLoadingIndicator />}
      <div className="flex">
        <div
          ref={placeholderRef}
          className="flex-auto w-[480px] min-h-[340px]"
        />
        <div className="text-sm max-h-[370px] w-[170px] flex-initial overflow-y-auto">
          {data.map(location => (
            <div key={location.label} className="flex items-center gap-4 mb-4">
              <div className="max-w-110 whitespace-nowrap overflow-hidden overflow-ellipsis">
                {location.label}
              </div>
              <div>({location.percentage})%</div>
            </div>
          ))}
        </div>
      </div>
    </ChartLayout>
  );
}
