import { ArcGISOptions } from '@/config';
import * as urlUtils from '@arcgis/core/core/urlUtils';
export const mapProxy = {
  bd: () => {
    urlUtils.addProxyRule({
      urlPrefix: (window as any).BDParams.urlPrefix,
      proxyUrl: ArcGISOptions.proxy
    });
  },
  other: () => {
    if ((window as any).isBD) {
      urlUtils.addProxyRule({
        urlPrefix: (window as any).BDParams.urlPrefix,
        proxyUrl: ArcGISOptions.proxy
      });
    } else {
      urlUtils.addProxyRule({
        urlPrefix: ArcGISOptions.urlPrefix,
        proxyUrl: ArcGISOptions.proxy
      });
    }
  }
};
