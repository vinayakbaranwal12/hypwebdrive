import lazyLoader from '../../../utils/http/lazy-loader';
import {useSettings} from '@common/core/settings/use-settings';
import {RefObject, useCallback, useEffect, useRef} from 'react';
import {useThemeSelector} from '@common/ui/themes/theme-selector-context';
import {themeValueToHex} from '@common/ui/themes/utils/theme-value-to-hex';
import {useTrans} from '@common/i18n/use-trans';
import {message} from '@common/i18n/message';
import {LocationDatasetItem} from '@common/admin/analytics/report-metric';

const loaderUrl = 'https://www.gstatic.com/charts/loader.js';

interface UseGoogleGeoChartProps {
  placeholderRef: RefObject<HTMLDivElement>;
  data: LocationDatasetItem[];
}
export function useGoogleGeoChart({
  placeholderRef,
  data,
}: UseGoogleGeoChartProps) {
  const {trans} = useTrans();
  const {analytics} = useSettings();
  const apiKey = analytics?.gchart_api_key;
  const {selectedTheme} = useThemeSelector();
  const geoChartRef = useRef<google.visualization.GeoChart>();
  const drawGoogleChart = useCallback(() => {
    if (typeof google === 'undefined') return;

    const seedData = data.map(location => [location.label, location.value]);
    seedData.unshift([trans(message('Country')), trans(message('Clicks'))]);

    const backgroundColor = `${themeValueToHex(
      selectedTheme.colors['--be-paper']
    )}`;
    const chartColor = `${themeValueToHex(
      selectedTheme.colors['--be-primary']
    )}`;
    const options: google.visualization.GeoChartOptions = {
      colorAxis: {colors: [chartColor]},
      backgroundColor,
    };

    if (
      !geoChartRef.current &&
      placeholderRef.current &&
      google?.visualization?.GeoChart
    ) {
      geoChartRef.current = new google.visualization.GeoChart(
        placeholderRef.current
      );
    }
    geoChartRef.current?.draw(
      google.visualization.arrayToDataTable(seedData),
      options
    );
  }, [selectedTheme, data, placeholderRef]);

  const initGoogleGeoChart = useCallback(() => {
    if (lazyLoader.alreadyLoading(loaderUrl)) return;
    lazyLoader.loadAsset(loaderUrl, {type: 'js'}).then(() => {
      google.charts.load('current', {
        packages: ['geochart'],
        // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
        mapsApiKey: apiKey,
      });
      google.charts.setOnLoadCallback(() => {
        drawGoogleChart();
      });
    });
  }, [apiKey, drawGoogleChart]);

  // on component load: load chart library then draw, otherwise just draw
  useEffect(() => {
    initGoogleGeoChart();
  }, [initGoogleGeoChart]);

  // redraw chart if data or theme changes
  useEffect(() => {
    drawGoogleChart();
  }, [selectedTheme, drawGoogleChart, data]);

  return {drawGoogleChart};
}
