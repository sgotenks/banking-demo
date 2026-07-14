/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: UniCredit site-wide cleanup.
 *
 * Removes non-authorable page chrome (header, footer, navigation, cookie
 * consent, back-to-top, breadcrumbs, search) and leftover technical elements
 * so the import contains only page-level authorable content.
 *
 * Selectors are taken from the UniCredit page shell surrounding the
 * authorable content under `#accessibility-content` (see page-templates.json
 * section selectors) and standard non-authorable chrome tags.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie/consent, overlays and widgets that block or pollute parsing.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '.optanon-alert-box-wrapper',
      '[id*="CookieConsent"]',
      '[class*="cookie"]',
      '.modal-backdrop',
      '.pws_overlay',
      // Header chrome that is not page content: the top banner (logo + primary
      // menu) and the "Passa a" accessibility skip bar. These belong to the
      // site header, not the imported page body.
      '#header',
      '[role="banner"]',
      '#pageInfo',
      '.accessibilityTab__link',
      // Carousel navigation controls ("Precedente" / "Successivo" arrows).
      // The single-slide CPI note is imported as plain text, so the swiper
      // arrow buttons carry no content value and would otherwise leak their
      // sr-only labels into the output.
      '.mySwiper__arrowIcontainer',
      'button.icon-back',
      'button.icon-forth',
    ]);

    // Collapse redundant nested single-child spans if present.
    element.querySelectorAll('span > span:only-child').forEach((span) => {
      span.replaceWith(span.textContent);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome and leftover technical elements.
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav',
      '.pws_header',
      '.pws_footer',
      '.pws_nav',
      '[class*="breadcrumb"]',
      '.pws_breadcrumb',
      '.pws_search',
      '.site-search',
      '.back-to-top',
      '.pws_backtotop',
      '.skip-link',
      'script',
      'style',
      'noscript',
      'iframe',
      'link',
      'source',
    ]);

    // Strip tracking / behavioural attributes left on remaining elements.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-tracking');
      el.removeAttribute('data-analytics');
    });
  }
}
