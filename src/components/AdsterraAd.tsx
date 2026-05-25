import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

type BannerPlacement = {
  kind: 'banner';
  key: string;
  width: number;
  height: number;
  scriptUrl?: string;
};

type NativePlacement = {
  kind: 'native';
  containerId: string;
  scriptUrl: string;
};

type AdPlacement = BannerPlacement | NativePlacement;

type AdsterraAdProps = {
  placement: AdPlacement;
  className?: string;
  visibleClassName?: string;
  label?: string;
};

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: 'iframe';
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
  }
}

const BLOCKED_AD_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/shop',
  '/payment',
  '/ats-check',
  '/tailor-resume',
];

const normalizeScriptUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const bannerScriptUrl = (key: string, override?: string) =>
  normalizeScriptUrl(override || `https://www.highperformanceformat.com/${key}/invoke.js`);

const getPlacementId = (placement: AdPlacement, instanceId: string) =>
  placement.kind === 'native'
    ? `adsterra-native-${placement.containerId}-${instanceId}`
    : `adsterra-banner-${placement.width}x${placement.height}-${placement.key}-${instanceId}`;

const hasRealAdContent = (container: HTMLElement | null) => {
  if (!container) return false;

  if (container.querySelector('iframe, img[src], a[href], video, object, embed')) {
    return true;
  }

  return Array.from(container.children).some((child) => {
    const tagName = child.tagName.toLowerCase();

    if (['script', 'style', 'link'].includes(tagName)) {
      return false;
    }

    return (child.textContent || '').trim().length > 0 || child.childElementCount > 0;
  });
};

const useAdsAllowedOnRoute = () => {
  const { pathname } = useLocation();

  return !BLOCKED_AD_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
};

const AdsterraAd = ({
  placement,
  className,
  visibleClassName,
  label = 'Advertisement',
}: AdsterraAdProps) => {
  const adsAllowed = useAdsAllowedOnRoute();
  const instanceId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [hasAdContent, setHasAdContent] = useState(false);
  const hasPlacementConfig = placement.kind === 'native'
    ? Boolean(placement.containerId && placement.scriptUrl)
    : Boolean(placement.key);

  const placementId = useMemo(() => getPlacementId(placement, instanceId), [placement, instanceId]);
  const scriptUrl = useMemo(() => {
    if (placement.kind === 'native') return normalizeScriptUrl(placement.scriptUrl);
    return bannerScriptUrl(placement.key, placement.scriptUrl);
  }, [placement]);

  useEffect(() => {
    const container = containerRef.current;

    if (!adsAllowed || !hasPlacementConfig || !container || !scriptUrl) {
      return undefined;
    }

    setHasAdContent(hasRealAdContent(container));

    const observer = new MutationObserver(() => {
      if (hasRealAdContent(container)) {
        setHasAdContent(true);
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'href', 'style', 'class'],
    });

    if (placement.kind === 'banner') {
      window.atOptions = {
        key: placement.key,
        format: 'iframe',
        height: placement.height,
        width: placement.width,
        params: {},
      };
    }

    scriptRef.current = null;

    if (!scriptRef.current && !container.querySelector(`script[data-adsterra-placement="${placementId}"]`)) {
      const script = document.createElement('script');
      script.id = placementId;
      script.async = true;
      script.src = scriptUrl;
      script.dataset.adsterraPlacement = placementId;
      script.setAttribute('data-cfasync', 'false');
      scriptRef.current = script;
      container.appendChild(script);
    }

    return () => {
      observer.disconnect();

      const script = scriptRef.current;
      if (script?.parentNode) {
        script.parentNode.removeChild(script);
      }
      scriptRef.current = null;

      if (placement.kind === 'banner' && !document.querySelector('script[data-adsterra-placement^="adsterra-banner-"]')) {
        delete window.atOptions;
      }
    };
  }, [adsAllowed, hasPlacementConfig, placement, placementId, scriptUrl]);

  if (!adsAllowed || !hasPlacementConfig || !scriptUrl) {
    return null;
  }

  const isNative = placement.kind === 'native';
  return (
    <section
      className={hasAdContent
        ? cn('mx-auto my-8 w-full px-4', className)
        : 'fixed bottom-0 left-0 h-px w-px overflow-hidden opacity-0 pointer-events-none'}
      aria-hidden={!hasAdContent}
    >
      <div
        className={cn(
          hasAdContent
            ? 'mx-auto flex w-fit max-w-full flex-col items-center gap-2 rounded-md border border-border/70 bg-white/80 p-3 shadow-soft backdrop-blur-sm'
            : 'h-px w-px overflow-hidden',
          hasAdContent && visibleClassName,
        )}
      >
        <div className={cn(
          'text-[10px] font-medium uppercase tracking-wider text-muted-foreground',
          !hasAdContent && 'hidden',
        )}>
          {label}
        </div>
        <div
          ref={containerRef}
          id={isNative ? placement.containerId : undefined}
          className={cn(
            'mx-auto overflow-hidden',
            placement.kind === 'banner' && placement.width === 320 && 'h-[50px] w-[320px] max-w-full',
            placement.kind === 'banner' && placement.width === 728 && 'h-[90px] w-[728px] max-w-full',
            placement.kind === 'banner' && placement.width === 300 && 'h-[250px] w-[300px] max-w-full',
          )}
        />
      </div>
    </section>
  );
};

export const ADSTERRA_NATIVE_PLACEMENT: NativePlacement = {
  kind: 'native',
  containerId: import.meta.env.VITE_ADSTERRA_NATIVE_CONTAINER_ID || 'container-3e920a4bedec68b97069bfb05b26dd33',
  scriptUrl: import.meta.env.VITE_ADSTERRA_NATIVE_SCRIPT_URL || 'https://poetrywishing.com/3e920a4bedec68b97069bfb05b26dd33/invoke.js',
};

export const ADSTERRA_MOBILE_BANNER_PLACEMENT: BannerPlacement = {
  kind: 'banner',
  key: import.meta.env.VITE_ADSTERRA_320X50_KEY || '69d33627d4b8780c01896d77c590ce30',
  width: 320,
  height: 50,
  scriptUrl: import.meta.env.VITE_ADSTERRA_320X50_SCRIPT_URL || 'https://poetrywishing.com/69d33627d4b8780c01896d77c590ce30/invoke.js',
};

export const ADSTERRA_DESKTOP_BANNER_PLACEMENT: BannerPlacement = {
  kind: 'banner',
  key: import.meta.env.VITE_ADSTERRA_728X90_KEY || '7198dccd204708050c8511b873c75249',
  width: 728,
  height: 90,
  scriptUrl: import.meta.env.VITE_ADSTERRA_728X90_SCRIPT_URL || 'https://poetrywishing.com/7198dccd204708050c8511b873c75249/invoke.js',
};

export const ADSTERRA_RECTANGLE_PLACEMENT: BannerPlacement = {
  kind: 'banner',
  key: import.meta.env.VITE_ADSTERRA_300X250_KEY || 'd47dde82cb7a1999689f20ec188dfd0e',
  width: 300,
  height: 250,
  scriptUrl: import.meta.env.VITE_ADSTERRA_300X250_SCRIPT_URL || 'https://poetrywishing.com/d47dde82cb7a1999689f20ec188dfd0e/invoke.js',
};

export const AdsterraNativeAd = (props: Omit<AdsterraAdProps, 'placement'>) => (
  <AdsterraAd placement={ADSTERRA_NATIVE_PLACEMENT} {...props} />
);

export const AdsterraMobileBanner = (props: Omit<AdsterraAdProps, 'placement'>) => (
  <AdsterraAd placement={ADSTERRA_MOBILE_BANNER_PLACEMENT} {...props} />
);

export const AdsterraDesktopBanner = (props: Omit<AdsterraAdProps, 'placement'>) => (
  <AdsterraAd placement={ADSTERRA_DESKTOP_BANNER_PLACEMENT} {...props} />
);

export const AdsterraRectangleAd = (props: Omit<AdsterraAdProps, 'placement'>) => (
  <AdsterraAd placement={ADSTERRA_RECTANGLE_PLACEMENT} {...props} />
);

export const AdsterraResponsiveBanner = ({ className }: { className?: string }) => (
  <>
    <AdsterraMobileBanner className={cn('md:hidden', className)} />
    <AdsterraDesktopBanner className={cn('hidden md:block', className)} />
  </>
);

export default AdsterraAd;
