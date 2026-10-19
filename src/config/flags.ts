/**
 * Feature Flags Configuration
 *
 * Centralized feature toggles for UniqueLo.
 */

export interface FeatureFlags {
  /**
   * SHOW_APP_DOWNLOAD_QR
   * Controls visibility of the floating "Download our app" QR card in the Hero Carousel.
   * Default: false (behind flag until mobile app launches).
   * Can be previewed anytime via URL query parameter: ?showAppQR=true or ?appQR=1
   */
  SHOW_APP_DOWNLOAD_QR: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = {
  SHOW_APP_DOWNLOAD_QR: false,
};

/**
 * Checks whether the "Download our app" QR banner is enabled.
 * Supports URL override via ?showAppQR=true or ?appQR=1 for testing/previewing.
 */
export function isAppDownloadQREnabled(): boolean {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('showAppQR') === 'true' || params.get('appQR') === '1') {
      return true;
    }
  }
  return FEATURE_FLAGS.SHOW_APP_DOWNLOAD_QR;
}
