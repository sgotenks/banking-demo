/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-product. Base block: hero.
 * Source: https://www.unicredit.it/it/privati/mutui/tutti-i-mutui/per-la-casa/mutuo-unicredit-finalita-acquisto.html
 * Project type: xwalk (field hints required).
 *
 * Model fields (blocks/hero-product/_hero-product.json):
 *   - image (reference)  -> background image cell, field:image
 *   - imageAlt (collapsed -> img alt attribute, no hint)
 *   - text (richtext)    -> heading + subheading + CTA cell, field:text
 *
 * Library convention: 1 column, up to 3 rows (name row, image row, text row).
 *
 * Live DOM notes: the hero image is a CSS background on `.hidden-xs .bg`
 * (desktop) / `.visible-xs .bg` (mobile), not an <img>. We reconstruct an
 * <img> from the desktop background-image URL. The overlay heading lives in
 * `.text_overlay .t h2`, the subtitle in `.visual_bottom p.s`, and the CTA in
 * `.btn_box a.btn`.
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION (validated against live source DOM)

  // Background image: prefer desktop (.hidden-xs), fall back to mobile / any .bg
  const bgEl = element.querySelector('.hidden-xs .bg[style*="background-image"], .bg[style*="background-image"]');
  let image = null;
  if (bgEl) {
    const match = bgEl.getAttribute('style').match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (match && match[1]) {
      image = document.createElement('img');
      image.src = match[1];
    }
  }

  // Overlay content
  const overlay = element.querySelector('.text_overlay') || element;
  const heading = overlay.querySelector('h1, h2, h3');
  const cta = overlay.querySelector('.btn_box a, a.btn, a[class*="btn"]');
  // Subtitle: first non-empty paragraph that does not merely wrap the CTA.
  const subheading = Array.from(overlay.querySelectorAll('.visual_bottom p, p.s, p'))
    .find((p) => p.textContent.trim() && !p.querySelector('a')) || null;

  // Alt text: use the heading text as descriptive alt (imageAlt is collapsed into the img alt attr)
  if (image) {
    const altText = heading ? heading.textContent.trim() : '';
    image.setAttribute('alt', altText);
  }

  // Empty-block guard
  if (!image && !heading && !subheading && !cta) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1 (image): field:image -> reconstructed <img>. imageAlt collapses into the img alt attribute.
  const imageCell = [];
  if (image) {
    imageCell.push(document.createComment(' field:image '));
    imageCell.push(image);
  }
  cells.push([imageCell]);

  // Row 2 (text richtext): field:text -> heading + subheading + CTA
  const textCell = [document.createComment(' field:text ')];
  if (heading) textCell.push(heading);
  if (subheading) textCell.push(subheading);
  if (cta) {
    // Rebuild a clean anchor (source anchor carries noisy inline handlers)
    const cleanCta = document.createElement('a');
    cleanCta.setAttribute('href', cta.getAttribute('href') || '#');
    cleanCta.textContent = cta.textContent.trim();
    const p = document.createElement('p');
    p.appendChild(cleanCta);
    textCell.push(p);
  }
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-product', cells });
  element.replaceWith(block);
}
