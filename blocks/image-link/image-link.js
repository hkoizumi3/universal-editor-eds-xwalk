/**
 * Create a responsive picture element with desktop and mobile sources
 * @param {Element} desktopPicture - Desktop picture element
 * @param {Element} mobilePicture - Mobile picture element
 * @param {string} alt - Alt text for the image
 * @returns {Element} Responsive picture element
 */
function createResponsivePicture(desktopPicture, mobilePicture, alt) {
  const picture = document.createElement('picture');

  const desktopImg = desktopPicture?.querySelector('img');
  const mobileImg = mobilePicture?.querySelector('img');

  // Use desktop image if available, otherwise use mobile image
  const fallbackImg = desktopImg || mobileImg;

  if (!fallbackImg) {
    return picture;
  }

  // If both images are provided, create responsive sources
  if (desktopImg && mobileImg && desktopImg.src !== mobileImg.src) {
    // Mobile source (for screens < 768px)
    const mobileSource = document.createElement('source');
    mobileSource.media = '(max-width: 767px)';
    mobileSource.srcset = mobileImg.src;
    picture.appendChild(mobileSource);

    // Desktop source (for screens >= 768px)
    const desktopSource = document.createElement('source');
    desktopSource.media = '(min-width: 768px)';
    desktopSource.srcset = desktopImg.src;
    picture.appendChild(desktopSource);

    // Fallback img (defaults to desktop)
    const img = document.createElement('img');
    img.src = desktopImg.src;
    img.alt = alt || desktopImg.alt || '';
    img.loading = 'lazy';
    picture.appendChild(img);
  } else {
    // Only one image provided, use it directly
    const img = fallbackImg.cloneNode(true);
    img.alt = alt || img.alt || '';
    img.loading = 'lazy';
    picture.appendChild(img);
  }

  return picture;
}

/**
 * Create a link element wrapping the picture
 * @param {string} href - Link URL
 * @param {string} title - Link title (tooltip)
 * @param {string} target - Link target (_self or _blank)
 * @param {Element} picture - Picture element to wrap
 * @returns {Element} Link element
 */
function createLink(href, title, target, picture) {
  const link = document.createElement('a');
  link.href = href;
  link.target = target;

  if (title) {
    link.title = title;
  }

  // Add security attributes for external links
  if (target === '_blank') {
    link.rel = 'noopener noreferrer';
  }

  link.appendChild(picture);
  return link;
}

/**
 * Image Link Block
 * Displays a clickable image with responsive desktop/mobile versions
 *
 * Structure expected from Universal Editor (with Field Collapse):
 * <div class="image-link">
 *   <div><div><picture>Desktop Image</picture></div></div>
 *   <div><div><picture>Mobile Image</picture></div></div>
 *   <div><div>Alt Text</div></div>
 *   <div><div><a href="..." title="...">Link</a></div></div>
 *   <div><div>Link Target (_self or _blank)</div></div>
 * </div>
 *
 * Note: linkTitle is collapsed into the link element's title attribute.
 * linkTarget remains as a separate row.
 *
 * @param {Element} block - The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Extract data from block structure
  // Fields: desktop, mobile, alt, link (with title attribute), linkTarget
  const desktopPicture = rows[0]?.querySelector('picture');
  const mobilePicture = rows[1]?.querySelector('picture');
  const alt = rows[2]?.textContent.trim();
  const linkElement = rows[3]?.querySelector('a');

  // linkTitle is collapsed into link element's title attribute
  const linkTitle = linkElement?.title || '';
  // linkTarget is a separate row
  const linkTarget = rows[4]?.textContent.trim() || '_self';

  // Validate required elements
  if (!desktopPicture && !mobilePicture) {
    block.textContent = 'Image Link: Please add at least one image';
    return;
  }

  // Clear the block
  block.textContent = '';

  // Create responsive picture element
  const picture = createResponsivePicture(
    desktopPicture,
    mobilePicture,
    alt,
  );

  // Wrap with link if provided
  if (linkElement && linkElement.href) {
    const link = createLink(linkElement.href, linkTitle, linkTarget, picture);
    block.appendChild(link);
  } else {
    block.appendChild(picture);
  }
}
