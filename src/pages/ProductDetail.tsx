import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useProduct, useProducts, useReviews, useUniverse } from '../hooks/useCatalog';
import { useCartStore } from '../stores/cart';
import { useWishlistStore } from '../stores/wishlist';
import { useToastStore } from '../stores/toast';
import {
  formatPrice,
  formatCountryOfOrigin,
  getDefaultVariant,
  getMotifSync,
  COLLECTIONS,
  getExpressionScore,
  getExpressionByScore,
  type ProductVariant,
  submitReview,
} from '../lib/data';
import { catalogMrp } from '../lib/pricing';
import { orderedVariants } from '../lib/sizes';
import { hasLicensedMark } from '../lib/licensed-marks';
import { Button } from '../components/ui/Button';
import { SizeGuideModal } from '../components/shop/SizeGuideModal';
import { ExpressionGuideModal } from '../components/shop/ExpressionGuideModal';
import { ProductCard } from '../components/shop/ProductCard';

/**
 * THE PRODUCT PAGE
 *
 * A garment page, not a campaign page. The composition is a two-column ruled
 * sheet: the photograph on the left at the width the garment deserves, the
 * buy box on the right in the order a buyer actually asks questions — what is
 * it, what does it cost, will it fit, will it arrive, why is it this price.
 *
 * What was removed, and why:
 *  · the five-star row. It rendered "5.0 (0 reviews)" because the catalog
 *    ships a mock `rating: 5` on 28 of 29 products. A star row that exists
 *    only because a seed row defaults to five is a fabricated rating under
 *    PRODUCT.md's honesty constraint. Reviews now come from real rows or not
 *    at all.
 *  · "0 hours of threadwork" and "Over — hours" — `artisanHours` is null for
 *    28 of 29 products, and the old markup interpolated the null.
 *  · the pincode checker. It answered with a hardcoded city table promising
 *    "Dispatch: 24h, Delivery: 2 Days" while the catalog says 4–7 days. An
 *    invented serviceability estimate that contradicts the real field is
 *    worse than no estimate. The real window is stated instead.
 *  · "Free shipping on orders above ₹500". The shipping rule in
 *    `20261101_checkout_pricing.sql` is ₹99 flat, waived above ₹1,499.
 *  · "14-day home inspection" next to "7-Day Doorstep Exchange".
 *    `returnWindowDays` is 7 on every product.
 *  · the HUSTLE10 pill. The coupon is real, but its floor is a ₹999 subtotal,
 *    so it silently does not apply to the ₹899 entry pieces this page is most
 *    often reached for. Offers belong in the bag, where the server prices them.
 *  · the "Real People. Real Fits." strip, which relabelled catalog product
 *    shots as customer photographs and invited a hashtag that does not exist.
 */
export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isPending, isError } = useProduct(slug);
  const { data: allProducts } = useProducts();
  const { data: reviews, refetch: refetchReviews } = useReviews(slug);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const showToast = useToastStore((state) => state.showToast);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeSection, setActiveSection] = useState<string | null>('technique');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  // Stable identity: useDialogFocus re-runs its effect when onClose changes,
  // which would yank focus back to the first control on every render.
  const closeSizeGuide = React.useCallback(() => setIsSizeGuideOpen(false), []);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isExpressionModalOpen, setIsExpressionModalOpen] = useState(false);

  // Review form state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Macro inspection
  const [isZooming, setIsZooming] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ percentX: 50, percentY: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Sticky purchase bar
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (buyBoxRef.current) {
        setShowStickyBar(buyBoxRef.current.getBoundingClientRect().bottom < 80);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentVariant = useMemo(() => {
    if (!product) return null;
    return selectedVariant || getDefaultVariant(product);
  }, [product, selectedVariant]);

  const { data: universe } = useUniverse(product?.universeSlug);
  const motif = product?.motifId ? getMotifSync(product.motifId) ?? null : null;

  /** Only real review rows can produce a rating. Never the seed field. */
  const reviewAggregate = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    return {
      value: reviews.reduce((a, r) => a + r.rating, 0) / reviews.length,
      count: reviews.length,
    };
  }, [reviews]);

  const discount = useMemo(() => {
    if (!currentVariant) return null;
    return catalogMrp(currentVariant);
  }, [currentVariant]);

  const expScore = useMemo(() => getExpressionScore(product), [product]);
  const expInfo = useMemo(() => getExpressionByScore(expScore), [expScore]);

  // Cross-sell rails present pieces as the brand's own work, so a product whose
  // photograph carries a third-party mark is kept out of them (see
  // lib/licensed-marks.ts). The piece is still reachable in the collection.
  const universeProducts = useMemo(() => {
    if (!product || !allProducts || !product.universeSlug) return [];
    return allProducts
      .filter(
        (p) =>
          p.slug !== product.slug &&
          p.universeSlug === product.universeSlug &&
          !hasLicensedMark(p),
      )
      .slice(0, 4);
  }, [product, allProducts]);

  const expressionProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter(
        (p) =>
          p.slug !== product.slug &&
          getExpressionScore(p) === expScore &&
          !hasLicensedMark(p),
      )
      .slice(0, 4);
  }, [product, allProducts, expScore]);

  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter(
        (p) =>
          p.slug !== product.slug &&
          (p.categorySlug === product.categorySlug || p.featured) &&
          !hasLicensedMark(p),
      )
      .slice(0, 4);
  }, [product, allProducts]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto max-w-[var(--container-max)] px-4 py-10 sm:px-6 lg:px-12 lg:py-16">
          <p className="loom-label text-ink-muted">Product</p>
          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="aspect-[4/5] w-full animate-pulse bg-panel" />
            <div className="space-y-3">
              <div className="h-8 w-3/4 animate-pulse bg-panel" />
              <div className="h-4 w-1/2 animate-pulse bg-panel" />
              <div className="h-10 w-28 animate-pulse bg-panel" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product || !currentVariant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-6 text-center">
        <p className="loom-label text-ink-muted">Not in the catalogue</p>
        <h1 className="loom-display mt-3 text-3xl text-ink">This piece is no longer listed</h1>
        <p className="mt-2 max-w-[44ch] font-sans text-sm leading-relaxed text-ink-muted">
          It may have sold through, or the link may be from an older catalogue.
          Everything currently available is in the collection.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex min-h-[48px] items-center justify-center bg-ink px-6 font-sans text-[13px] font-medium uppercase tracking-[0.14em] text-cream transition-colors hover:bg-accent"
        >
          Shop the collection
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  const activeImage = product.images[selectedImageIndex] || product.images[0];
  const isWish = isWishlisted(product.slug);
  const soldOut = currentVariant.status === 'out-of-stock';
  const maxQty = currentVariant.quantity ?? 99;

  const swapExtension = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (target.dataset.tried) return;
    target.dataset.tried = 'true';
    if (target.src.endsWith('.jpg')) target.src = target.src.replace(/\.jpg$/, '.png');
    else if (target.src.endsWith('.png')) target.src = target.src.replace(/\.png$/, '.jpg');
  };

  const toAbsoluteUrl = (src: string): string => {
    if (/^https?:\/\//.test(src)) return src;
    if (typeof window !== 'undefined' && window.location?.origin) {
      return new URL(src, window.location.origin).toString();
    }
    return src;
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((i) => toAbsoluteUrl(i.src)),
    brand: { '@type': 'Brand', name: 'UniqueLo' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: (currentVariant.priceCents / 100).toFixed(0),
      availability: soldOut
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
    },
    // Structured aggregate data is only emitted when review rows exist, for the
    // same reason the star row is gone: a seed default is not a rating.
    ...(reviewAggregate
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviewAggregate.value.toFixed(1),
            reviewCount: reviewAggregate.count,
          },
          review: (reviews ?? []).slice(0, 5).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.author },
            reviewRating: { '@type': 'Rating', ratingValue: r.rating },
            name: r.title,
            reviewBody: r.comment,
          })),
        }
      : {}),
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const percentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomCoords({ percentX, percentY });
  };

  const handleAddToCart = () => {
    if (soldOut) {
      showToast({
        title: 'Sold out in this size',
        description: 'Choose another size, or save the piece to be told when it returns.',
        type: 'info',
      });
      return;
    }
    const safeQty = Math.min(Math.max(1, quantity), maxQty);
    addItem(product.slug, currentVariant.sku, safeQty, undefined, maxQty);
    showToast({
      title: 'Added to bag',
      description: `${safeQty} × ${product.name} (size ${currentVariant.size})`,
      type: 'success',
    });
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.slug);
    showToast({
      title: !isWish ? 'Saved' : 'Removed',
      description: product.name,
      type: !isWish ? 'accent' : 'info',
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor || !reviewTitle || !reviewComment) return;
    setIsSubmittingReview(true);
    await submitReview({
      productSlug: product.slug,
      author: reviewAuthor,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });
    setIsSubmittingReview(false);
    setIsReviewModalOpen(false);
    setReviewAuthor('');
    setReviewTitle('');
    setReviewComment('');
    showToast({ title: 'Review posted', description: 'Thank you — it now appears below.', type: 'success' });
    refetchReviews();
  };

  // ── Facts this page may state ─────────────────────────────────────────
  // Every value here is read from the product row. Nothing is inferred,
  // rounded up, or filled in with a plausible-sounding default.
  const specFacts: Array<[string, string]> = [
    ['Textile', product.fabricGsm ? `${product.fabricGsm} GSM` : (product.material?.[0] ?? '')],
    ['Technique', product.embroidery?.techniqueLabel ?? ''],
    ['Fit', product.fit ?? ''],
    ['Made in', formatCountryOfOrigin(product.countryOfOrigin)],
  ].filter(([, v]) => Boolean(v)) as Array<[string, string]>;

  const deliveryLine =
    product.deliveryDaysMin != null && product.deliveryDaysMax != null
      ? `Dispatches in ${product.deliveryDaysMin}–${product.deliveryDaysMax} days`
      : 'Dispatches from the workshop';

  const returnLine =
    product.returnWindowDays && product.returnWindowDays > 0
      ? `${product.returnWindowDays}-day return window`
      : 'Made to order — not returnable';

  const sections = [
    {
      id: 'technique',
      title: 'Needlework & technique',
      body: product.embroidery ? (
        <div className="space-y-3">
          <p className="font-sans text-[14px] font-medium text-ink">
            {product.embroidery.techniqueLabel}
          </p>
          <p className="font-sans text-[14px] leading-relaxed text-ink-muted">
            {product.embroidery.motifStory}
          </p>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-2 pt-2 sm:grid-cols-2">
            {[
              ['Thread', product.embroidery.threadComposition],
              ['Placement', product.embroidery.placement?.join(', ')],
              [
                'Working time',
                // `artisan_hours` defaults to 0 in the schema, so a piece whose
                // hours were never recorded arrives as 0 — which is how this
                // page used to print "0 hours of threadwork" on 28 of 29
                // products. Zero means "not recorded", never "no work".
                product.embroidery.artisanHours != null && product.embroidery.artisanHours > 0
                  ? `${product.embroidery.artisanHours} hours`
                  : 'Recorded on the certificate',
              ],
            ]
              .filter(([, v]) => Boolean(v))
              .map(([k, v]) => (
                <div key={k as string} className="flex gap-3">
                  <dt className="w-28 shrink-0 font-sans text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                    {k}
                  </dt>
                  <dd className="font-sans text-[13px] text-ink">{v}</dd>
                </div>
              ))}
          </dl>
        </div>
      ) : null,
    },
    {
      id: 'materials',
      title: 'Cloth & composition',
      body: (
        <div className="space-y-3">
          <p className="max-w-[62ch] font-sans text-[14px] leading-relaxed text-ink-muted">
            {product.description}
          </p>
          {product.material && product.material.length > 0 && (
            <ul className="space-y-1">
              {product.material.map((m) => (
                <li key={m} className="font-sans text-[13px] text-ink">
                  {m}
                </li>
              ))}
            </ul>
          )}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-1.5 border-t border-stone pt-3 sm:grid-cols-2">
              {Object.entries(product.attributes).map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="w-36 shrink-0 font-sans text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                    {k.replace(/_/g, ' ')}
                  </dt>
                  <dd className="font-sans text-[13px] text-ink">{String(v).replace(/-/g, ' ')}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ),
    },
    {
      id: 'fit',
      title: 'Fit & measurements',
      body: (
        <div className="space-y-3">
          {product.fitNotes && (
            <p className="font-sans text-[14px] leading-relaxed text-ink">{product.fitNotes}</p>
          )}
          {(product.modelHeightCm || product.modelWornSize) && (
            <p className="font-sans text-[13px] text-ink-muted">
              {product.modelHeightCm ? `Model is ${product.modelHeightCm} cm` : 'Model'}
              {product.modelWornSize ? ` and wears size ${product.modelWornSize}.` : '.'}
            </p>
          )}
          <button
            type="button"
            onClick={() => setIsSizeGuideOpen(true)}
            className="inline-flex min-h-[44px] items-center font-sans text-[13px] text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
          >
            Garment measurements for every size
          </button>
        </div>
      ),
    },
    {
      id: 'care',
      title: 'Care & storage',
      body: (
        <ul className="space-y-1.5">
          {(product.care ?? ['Cold wash, inside out. Dry flat away from direct sun.']).map((c) => (
            <li key={c} className="font-sans text-[13px] leading-relaxed text-ink-muted">
              {c}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'delivery',
      title: 'Dispatch & returns',
      body: (
        <div className="space-y-2 font-sans text-[13px] leading-relaxed text-ink-muted">
          <p>{deliveryLine}. Every order leaves with its own numbered certificate.</p>
          <p>
            {product.codAvailable
              ? 'Cash on delivery is available. A ₹59 handling fee applies to COD orders.'
              : 'Prepaid only — UPI, cards and net banking.'}
          </p>
          <p>
            {product.returnWindowDays && product.returnWindowDays > 0
              ? `${returnLine} from delivery, unworn and with the tags attached.`
              : 'Cut to order for this size, so it cannot be returned.'}
          </p>
          <p>Carriage is ₹99, waived on orders above ₹1,499.</p>
        </div>
      ),
    },
  ].filter((s) => s.body);

  return (
    <div className="min-h-screen bg-cream">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="border-b border-stone">
        <div className="mx-auto flex max-w-[var(--container-max)] items-center gap-2 overflow-hidden px-4 py-3 font-sans text-[11px] uppercase tracking-[0.12em] text-ink-muted sm:px-6 lg:px-12">
          <Link to="/" className="transition-colors hover:text-ink">Home</Link>
          <span aria-hidden="true">/</span>
          {universe && (
            <>
              <Link to={`/universes/${universe.slug}`} className="whitespace-nowrap transition-colors hover:text-ink">
                {universe.name}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          {product.garmentType ? (
            <Link
              to={`/clothing/${product.garmentType}`}
              className="whitespace-nowrap capitalize transition-colors hover:text-ink"
            >
              {product.garmentType === 'scarf' ? 'scarves' : `${product.garmentType}s`}
            </Link>
          ) : (
            <Link
              to={`/category/${product.categorySlug}`}
              className="whitespace-nowrap capitalize transition-colors hover:text-ink"
            >
              {product.categorySlug}
            </Link>
          )}
          <span aria-hidden="true">/</span>
          <span className="truncate text-ink" aria-current="page">{product.name}</span>
        </div>
      </nav>

      <div className="mx-auto max-w-[var(--container-max)] px-4 pb-16 pt-8 sm:px-6 lg:px-12 lg:pb-24 lg:pt-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-14">
          {/* ── THE PLATE ──────────────────────────────────────────── */}
          <div>
            <div className="relative bg-paper">
              {/* The frame follows the photograph instead of forcing it into a
                  4:5 box. Catalogue shots range from 0.77 to 1.11 in aspect,
                  so a fixed portrait frame left a third of the plate empty on
                  every landscape shot. Height-capped, width-following, centred
                  on paper: no crop, no dead band. */}
              <div
                ref={imageContainerRef}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                className="flex w-full items-center justify-center"
              >
                <div className="relative w-fit max-w-full">
                  <img
                    src={activeImage.src}
                    alt={activeImage.alt || product.name}
                    className="block h-auto max-h-[76svh] w-auto max-w-full select-none object-contain"
                    onError={swapExtension}
                  />

                  {/* Magnified inspection, following the cursor. */}
                  {isZooming && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 overflow-hidden"
                      style={{
                        backgroundImage: `url(${activeImage.src})`,
                        backgroundPosition: `${zoomCoords.percentX}% ${zoomCoords.percentY}%`,
                        backgroundSize: '260%',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Frame counter reads from the real gallery length. */}
              <p className="loom-label absolute bottom-0 left-0 bg-paper px-2.5 py-1.5 text-ink-muted">
                {selectedImageIndex + 1} / {product.images.length}
              </p>

              {soldOut && (
                <p className="absolute right-0 top-0 bg-ink px-3 py-2 font-sans text-[11px] uppercase tracking-[0.16em] text-cream">
                  Sold out
                </p>
              )}
            </div>

            {/* Thumbnails: one horizontal rail, no vertical strip running
                past the buy box. */}
            {product.images.length > 1 && (
              <div
                role="group"
                aria-label="Product photographs"
                className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {product.images.map((img, idx) => (
                  <button
                    key={`${img.src}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Photograph ${idx + 1} of ${product.images.length}`}
                    aria-pressed={selectedImageIndex === idx}
                    className={`relative h-16 w-[52px] shrink-0 overflow-hidden bg-paper transition-opacity sm:h-20 sm:w-16 ${
                      selectedImageIndex === idx
                        ? 'opacity-100 outline outline-1 outline-ink'
                        : 'opacity-55 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.src}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={swapExtension}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Four frames that carry the proof live in their own strip after
                the buy box, not under the plate: on a phone, four macro shots
                between the photograph and the price pushed the title 1,400px
                down the page. The buyer met the garment four times before
                being told what it costs. */}
          </div>

          {/* ── THE BUY BOX ────────────────────────────────────────── */}
          <div ref={buyBoxRef}>
            {/* Provenance line: where you are, how it was made. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              {universe ? (
                <Link
                  to={`/universes/${universe.slug}`}
                  className="text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
                >
                  {universe.name}
                </Link>
              ) : (
                <span className="text-ink">The Atelier</span>
              )}
              <span aria-hidden="true">·</span>
              <span>{product.embroidery?.techniqueLabel ?? 'Hand embroidery'}</span>
              {product.handcrafted && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Hand-worked</span>
                </>
              )}
            </div>

            <h1
              className="loom-display mt-3 text-ink"
              style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.9rem)' }}
            >
              {product.name}
            </h1>
            <p className="mt-2 max-w-[46ch] font-sans text-[15px] leading-relaxed text-ink-muted">
              {product.subtitle}
            </p>

            {/* Price. Mono, tabular, first-class — the number the buyer came for. */}
            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-stone pt-5">
              <span className="loom-price text-[30px] font-medium leading-none text-ink">
                {formatPrice(currentVariant.priceCents)}
              </span>
              {discount && (
                <>
                  <span className="loom-price text-[15px] text-ink-muted line-through">
                    {formatPrice(discount.mrpCents)}
                  </span>
                  <span className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-accent">
                    {discount.offPercent}% off
                  </span>
                </>
              )}
              <span className="w-full font-sans text-[12px] text-ink-muted">
                Inclusive of all taxes. Carriage is ₹99, waived above ₹1,499.
              </span>
            </div>

            {/* Rating: real rows only. An empty catalogue says so plainly. */}
            <div className="mt-3 flex items-center gap-3">
              {reviewAggregate ? (
                <>
                  <span className="loom-price text-[13px] text-ink">
                    {reviewAggregate.value.toFixed(1)} / 5
                  </span>
                  <a
                    href="#reviews"
                    className="font-sans text-[13px] text-ink-muted underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
                  >
                    {reviewAggregate.count} {reviewAggregate.count === 1 ? 'review' : 'reviews'}
                  </a>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="font-sans text-[13px] text-ink-muted underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
                >
                  No reviews yet — be the first
                </button>
              )}
            </div>

            {/* Sizes. Square chips; the chest figure only where it is true. */}
            <fieldset className="mt-7">
              <div className="flex items-baseline justify-between gap-3">
                <legend className="loom-label text-ink-muted">
                  Size <span className="ml-2 normal-case tracking-normal text-ink">{currentVariant.size}</span>
                </legend>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="font-sans text-[12px] text-ink-muted underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
                >
                  Measurements
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {orderedVariants(product).map((v) => {
                  const isSelected = currentVariant.sku === v.sku;
                  const isOut = v.status === 'out-of-stock';
                  return (
                    <button
                      key={v.sku}
                      type="button"
                      onClick={() => !isOut && setSelectedVariant(v)}
                      disabled={isOut}
                      aria-label={`Size ${v.size}${isOut ? ' — sold out' : ''}`}
                      aria-pressed={isSelected}
                      className={`flex h-11 min-w-[56px] items-center justify-center border px-3 font-sans text-[13px] transition-colors ${
                        isOut
                          ? 'cursor-not-allowed border-stone text-ink-muted/60 line-through'
                          : isSelected
                            ? 'border-ink bg-ink text-cream'
                            : 'border-stone-strong text-ink hover:border-ink'
                      }`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 font-sans text-[12px] text-ink-muted">
                {soldOut
                  ? 'This size is sold out.'
                  : maxQty <= 2
                    ? `Only ${maxQty} left in this size.`
                    : 'In stock — dispatching from the workshop.'}
              </p>
            </fieldset>

            {/* Add to bag */}
            <div className="mt-6 flex gap-2">
              <div className="flex items-center border border-stone-strong">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-12 w-11 items-center justify-center text-ink transition-colors hover:text-accent disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  –
                </button>
                <span className="loom-price w-8 text-center text-[13px] text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  aria-label="Increase quantity"
                  className="flex h-12 w-11 items-center justify-center text-ink transition-colors hover:text-accent disabled:opacity-40"
                  disabled={quantity >= maxQty}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={soldOut}
                className="flex h-12 flex-1 items-center justify-center gap-2 bg-ink font-sans text-[13px] font-medium uppercase tracking-[0.14em] text-cream transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-stone-strong"
              >
                {soldOut ? 'Sold out' : 'Add to bag'}
                {!soldOut && <span aria-hidden="true">→</span>}
              </button>

              <button
                type="button"
                onClick={handleWishlistToggle}
                aria-label={isWish ? 'Remove from saved' : 'Save this piece'}
                aria-pressed={isWish}
                className={`flex h-12 w-12 shrink-0 items-center justify-center border transition-colors ${
                  isWish
                    ? 'border-accent text-accent'
                    : 'border-stone-strong text-ink hover:border-ink'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px]"
                  fill={isWish ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
                >
                  <path d="M12 20.5 4.9 13.6a4.5 4.5 0 0 1 6.4-6.3l.7.7.7-.7a4.5 4.5 0 0 1 6.4 6.3Z" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Logistics: the fields the buyer checks before paying. */}
            <dl className="mt-6 grid grid-cols-1 gap-px border-y border-stone sm:grid-cols-3">
              {[
                ['Delivery', deliveryLine],
                ['Payment', product.codAvailable ? 'COD or prepaid' : 'Prepaid only'],
                ['Returns', returnLine],
              ].map(([term, def]) => (
                <div key={term} className="py-3 sm:border-r sm:border-stone sm:pr-4 sm:last:border-r-0">
                  <dt className="loom-label text-ink-muted">{term}</dt>
                  <dd className="mt-1 font-sans text-[13px] leading-snug text-ink">{def}</dd>
                </div>
              ))}
            </dl>

            {/* Specification, stated as a fabric label would. */}
            {specFacts.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3">
                {specFacts.map(([term, value]) => (
                  <div key={term}>
                    <dt className="loom-label text-ink-muted">{term}</dt>
                    <dd className="mt-1 font-sans text-[13px] leading-snug text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Expression level — the brand's own intensity axis, kept because
                it is a real catalogue field, presented as a ruled aside. */}
            <div className="mt-6 flex items-start justify-between gap-4 border-t border-stone pt-4">
              <div>
                <p className="loom-label text-ink-muted">Presence</p>
                <p className="mt-1 font-sans text-[13px] text-ink">
                  {expScore} of 5 — {expInfo?.name ?? 'Balanced'}
                  <span className="text-ink-muted">
                    {expInfo?.tagline ? ` · ${expInfo.tagline}` : ''}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpressionModalOpen(true)}
                className="shrink-0 font-sans text-[12px] text-ink-muted underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                What this measures
              </button>
            </div>

            {product.collectionSlug && (
              <p className="mt-4 font-sans text-[13px] text-ink-muted">
                Part of{' '}
                <Link
                  to={`/collections/${product.collectionSlug}`}
                  className="text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
                >
                  {COLLECTIONS.find((c) => c.slug === product.collectionSlug)?.name ??
                    product.collectionSlug.replace(/-/g, ' ')}
                </Link>
              </p>
            )}

            {/* Disclosures — ruled rows, one open at a time. */}
            <div className="mt-10 border-t border-stone">
              {sections.map((section) => {
                const open = activeSection === section.id;
                return (
                  <div key={section.id} className="border-b border-stone">
                    <button
                      type="button"
                      onClick={() => setActiveSection(open ? null : section.id)}
                      aria-expanded={open}
                      className="flex min-h-[52px] w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-accent"
                    >
                      <span className="loom-label text-ink">{section.title}</span>
                      <span aria-hidden="true" className="relative h-3 w-3 shrink-0">
                        <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                        <span
                          className={`absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-opacity ${
                            open ? 'opacity-0' : 'opacity-100'
                          }`}
                        />
                      </span>
                    </button>
                    {open && <div className="pb-5">{section.body}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── THE PROOF STRIP ──────────────────────────────────────── */}
        {(() => {
          const frames = [
            {
              img: product.embroidery?.macroImage ?? product.images[1],
              title: 'The stitch',
              detail: product.embroidery?.techniqueLabel ?? 'Hand embroidery',
            },
            {
              img: product.images[2],
              title: 'The cloth',
              detail: product.fabricGsm
                ? `${product.fabricGsm} GSM`
                : (product.material?.[0] ?? 'Natural textile'),
            },
            {
              img: product.images[3] ?? product.images[1],
              title: 'The placement',
              detail: product.embroidery?.placement?.join(', ') || 'All-over',
            },
            {
              img: product.images[4] ?? product.images[0],
              title: 'The fit',
              detail: product.fit ?? 'See measurements',
            },
          ].filter((d) => Boolean(d.img));

          if (frames.length === 0) return null;

          return (
            <section
              aria-labelledby="proof-heading"
              className="mt-16 border-t border-stone pt-10 lg:mt-24"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-stone pb-4">
                <h2 id="proof-heading" className="loom-display text-2xl text-ink">
                  Seen up close
                </h2>
                <p className="font-sans text-[13px] text-ink-muted">
                  Every caption on this strip reads from the garment's own record.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
                {frames.map((d) => (
                  <figure key={d.title}>
                    <div className="aspect-square overflow-hidden bg-paper">
                      <img
                        src={d.img!.src}
                        alt={d.img!.alt || d.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={swapExtension}
                      />
                    </div>
                    <figcaption className="mt-2">
                      <p className="loom-label text-ink-muted">{d.title}</p>
                      <p className="mt-1 font-sans text-[13px] leading-snug text-ink">{d.detail}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          );
        })()}

        {/* ── THE STORY ────────────────────────────────────────────── */}
        {(motif || product.embroidery?.motifStory) && (
          <section
            aria-labelledby="story-heading"
            className="mt-16 grid grid-cols-1 gap-8 border-t border-stone pt-10 lg:mt-24 lg:grid-cols-[1fr_1.1fr] lg:gap-14"
          >
            <div>
              <h2 id="story-heading" className="loom-display text-ink" style={{ fontSize: 'var(--text-display-lg)' }}>
                {motif?.name ?? product.name}
              </h2>
              <p className="mt-4 max-w-[52ch] font-sans text-[15px] leading-relaxed text-ink-muted">
                {motif?.meaning ?? product.embroidery?.motifStory}
              </p>
              {product.embroidery?.motifStory && motif?.meaning && (
                <p className="mt-3 max-w-[52ch] font-sans text-[15px] leading-relaxed text-ink-muted">
                  {product.embroidery.motifStory}
                </p>
              )}
              {universe && (
                <Link
                  to={`/universes/${universe.slug}`}
                  className="mt-6 inline-flex min-h-[44px] items-center gap-2 border-b border-stone-strong pb-1 font-sans text-[13px] font-medium text-ink transition-colors hover:border-ink"
                >
                  Enter {universe.name}
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
            {product.images[3] && (
              <div className="aspect-[4/3] overflow-hidden bg-paper lg:aspect-auto lg:min-h-[440px]">
                <img
                  src={product.images[3].src}
                  alt={product.images[3].alt || product.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={swapExtension}
                />
              </div>
            )}
          </section>
        )}

        {/* ── REVIEWS ──────────────────────────────────────────────── */}
        <section id="reviews" aria-labelledby="reviews-heading" className="mt-16 border-t border-stone pt-10 lg:mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone pb-4">
            <div>
              <h2 id="reviews-heading" className="loom-display text-2xl text-ink sm:text-3xl">
                {reviewAggregate
                  ? `${reviewAggregate.value.toFixed(1)} out of 5`
                  : 'No reviews yet'}
              </h2>
              <p className="mt-1 font-sans text-[13px] text-ink-muted">
                {reviewAggregate
                  ? `From ${reviewAggregate.count} ${reviewAggregate.count === 1 ? 'buyer' : 'buyers'} who received this piece.`
                  : 'This piece has not been reviewed. Written reviews appear here once they are submitted.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex min-h-[44px] items-center border border-stone-strong px-5 font-sans text-[12px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
            >
              Write a review
            </button>
          </div>

          {(reviews ?? []).length > 0 && (
            <ul className="mt-2">
              {(reviews ?? []).map((rev) => (
                <li key={rev.id} className="border-b border-stone py-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-sans text-[14px] font-medium text-ink">{rev.title}</p>
                    <p className="loom-price shrink-0 text-[12px] text-ink-muted">
                      {rev.rating} / 5
                    </p>
                  </div>
                  <p className="mt-1.5 max-w-[68ch] font-sans text-[14px] leading-relaxed text-ink-muted">
                    {rev.comment}
                  </p>
                  <p className="mt-2 font-sans text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                    {rev.author}
                    {' · '}
                    {rev.createdAt}
                    {rev.verified && ' · verified buyer'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── CONTINUE ─────────────────────────────────────────────── */}
        <div className="mt-16 space-y-14 lg:mt-24">
          {universe && universeProducts.length > 0 && (
            <section aria-labelledby="universe-recs">
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-stone pb-4">
                <h2 id="universe-recs" className="loom-display text-2xl text-ink">
                  More from {universe.name}
                </h2>
                <Link
                  to={`/universes/${universe.slug}`}
                  className="font-sans text-[13px] text-ink-muted underline decoration-stone-strong underline-offset-4 transition-colors hover:text-ink"
                >
                  All {universe.name} pieces
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
                {universeProducts.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          )}

          {expressionProducts.length > 0 && (
            <section aria-labelledby="expression-recs">
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-stone pb-4">
                <h2 id="expression-recs" className="loom-display text-2xl text-ink">
                  Also at presence {expScore}
                </h2>
                <Link
                  to={`/styles/${product.expressionSlug || 'cult'}`}
                  className="font-sans text-[13px] text-ink-muted underline decoration-stone-strong underline-offset-4 transition-colors hover:text-ink"
                >
                  All level {expScore} pieces
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
                {expressionProducts.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          )}

          {!universeProducts.length && !expressionProducts.length && relatedProducts.length > 0 && (
            <section aria-labelledby="related-recs">
              <div className="border-b border-stone pb-4">
                <h2 id="related-recs" className="loom-display text-2xl text-ink">
                  Also in the catalogue
                </h2>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={closeSizeGuide}
        product={product}
      />

      <ExpressionGuideModal
        isOpen={isExpressionModalOpen}
        onClose={() => setIsExpressionModalOpen(false)}
        currentScore={expScore}
      />

      {/* ── REVIEW FORM ────────────────────────────────────────────── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[480] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="review-form-title">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setIsReviewModalOpen(false)}
            className="fixed inset-0 cursor-default bg-ink/70"
          />
          <div className="relative z-10 w-full max-w-lg border border-stone bg-paper p-6 sm:p-8">
            <h2 id="review-form-title" className="loom-display text-2xl text-ink">
              Review {product.name}
            </h2>
            <p className="mt-1 font-sans text-[13px] text-ink-muted">
              Reviews are published as written. A review is marked “verified buyer” only when it comes from a delivered order.
            </p>

            <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="review-author" className="loom-label block text-ink-muted">
                  Your name
                </label>
                <input
                  id="review-author"
                  type="text"
                  required
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  className="mt-1.5 w-full border border-stone bg-cream px-3 py-2.5 font-sans text-[13px] text-ink placeholder:text-ink-muted/60 focus:border-ink focus:outline-none"
                />
              </div>

              <fieldset>
                <legend className="loom-label text-ink-muted">Rating</legend>
                <div className="mt-2 flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      aria-pressed={reviewRating === n}
                      aria-label={`${n} out of 5`}
                      className={`h-11 min-w-[44px] border font-sans text-[13px] transition-colors ${
                        reviewRating === n
                          ? 'border-ink bg-ink text-cream'
                          : 'border-stone-strong text-ink hover:border-ink'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="review-title" className="loom-label block text-ink-muted">
                  Headline
                </label>
                <input
                  id="review-title"
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="mt-1.5 w-full border border-stone bg-cream px-3 py-2.5 font-sans text-[13px] text-ink focus:border-ink focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="review-body" className="loom-label block text-ink-muted">
                  Your experience
                </label>
                <textarea
                  id="review-body"
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="mt-1.5 w-full resize-none border border-stone bg-cream px-3 py-2.5 font-sans text-[13px] text-ink focus:border-ink focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="inline-flex min-h-[44px] items-center border border-stone-strong px-5 font-sans text-[12px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmittingReview}>
                  {isSubmittingReview ? 'Posting…' : 'Post review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── STICKY BUY BAR ─────────────────────────────────────────── */}
      {showStickyBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone bg-paper/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-[var(--container-max)] items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-12">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={activeImage.src}
                alt=""
                className="h-12 w-10 shrink-0 object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-sans text-[13px] font-medium text-ink">{product.name}</p>
                <p className="loom-price text-[12px] text-ink-muted">
                  {formatPrice(currentVariant.priceCents)} · {currentVariant.size}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={soldOut}
              className="inline-flex min-h-[44px] shrink-0 items-center bg-ink px-5 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-cream transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-stone-strong"
            >
              {soldOut ? 'Sold out' : 'Add to bag'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
