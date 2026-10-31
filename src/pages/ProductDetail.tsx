import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useProduct, useProducts, useReviews, useUniverse } from '../hooks/useCatalog';
import { useCartStore } from '../stores/cart';
import { useCustomizerStore } from '../stores/customizer';
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
import { Button } from '../components/ui/Button';
import { SizeGuideModal } from '../components/shop/SizeGuideModal';
import { ExpressionGuideModal } from '../components/shop/ExpressionGuideModal';
import { CtaButton } from '../components/ui/Cta';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isPending, isError } = useProduct(slug);
  const { data: allProducts } = useProducts();
  const { data: reviews, refetch: refetchReviews } = useReviews(slug);

  const addItem = useCartStore((state) => state.addItem);
  const openCustomizer = useCustomizerStore((state) => state.openCustomizer);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const showToast = useToastStore((state) => state.showToast);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('technique');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isExpressionModalOpen, setIsExpressionModalOpen] = useState(false);

  // Review Form State
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Interactive Macro Loupe Zoom State
  const [isZooming, setIsZooming] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 0, y: 0, percentX: 0, percentY: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Sticky Purchase Bar State
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (buyBoxRef.current) {
        const rect = buyBoxRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 80);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // India Pincode Delivery ETA State
  const [pincode, setPincode] = useState('');
  const [pincodeEta, setPincodeEta] = useState<string | null>(null);

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeEta('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    const cityMap: Record<string, string> = {
      '11': 'Delhi NCR (Dispatch: 24h, Delivery: 2 Days)',
      '40': 'Mumbai (Dispatch: 24h, Delivery: 2 Days)',
      '56': 'Bengaluru (Dispatch: 24h, Delivery: 3 Days)',
      '70': 'Kolkata (Dispatch: 24h, Delivery: 3 Days)',
      '60': 'Chennai (Dispatch: 24h, Delivery: 3 Days)',
      '30': 'Jaipur (Local Atelier Dispatch: 1 Day)',
      '22': 'Lucknow (Local Atelier Dispatch: 1 Day)',
    };
    const prefix = pincode.substring(0, 2);
    const cityInfo = cityMap[prefix] || 'Pan-India Express (Dispatch: 24h, Delivery: 3–4 Days)';
    setPincodeEta(
      `Estimated serviceability: ${cityInfo}. COD / UPI availability is confirmed at checkout — this is an estimate, not a guarantee.`
    );
  };

  const currentVariant = useMemo(() => {
    if (!product) return null;
    return selectedVariant || getDefaultVariant(product);
  }, [product, selectedVariant]);

  const { data: universe } = useUniverse(product?.universeSlug);

  const motif = product?.motifId ? getMotifSync(product.motifId) ?? null : null;

  // Display rating prefers mock-phase product fields, falls back to review aggregate.
  const productRating = product?.rating;
  const productReviewCount = product?.reviewCount;
  const displayRating = useMemo(() => {
    if (productRating !== undefined) {
      return { value: productRating, count: productReviewCount ?? (reviews?.length ?? 0) };
    }
    if (reviews && reviews.length > 0) {
      return {
        value: reviews.reduce((a, r) => a + r.rating, 0) / reviews.length,
        count: reviews.length,
      };
    }
    return null;
  }, [productRating, productReviewCount, reviews]);

  const discountPct = useMemo(() => {
    const compare = currentVariant?.compareAtPriceCents;
    if (!currentVariant || !compare || compare <= currentVariant.priceCents) return 0;
    return Math.round((1 - currentVariant.priceCents / compare) * 100);
  }, [currentVariant]);

  const expScore = useMemo(() => getExpressionScore(product), [product]);
  const expInfo = useMemo(() => getExpressionByScore(expScore), [expScore]);

  // Universe Recommendations (same world / story)
  const universeProducts = useMemo(() => {
    if (!product || !allProducts || !product.universeSlug) return [];
    return allProducts
      .filter((p) => p.slug !== product.slug && p.universeSlug === product.universeSlug)
      .slice(0, 3);
  }, [product, allProducts]);

  // Expression Recommendations (same visual presence across worlds)
  const expressionProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter((p) => p.slug !== product.slug && getExpressionScore(p) === expScore)
      .slice(0, 3);
  }, [product, allProducts, expScore]);

  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter((p) => p.slug !== product.slug && (p.categorySlug === product.categorySlug || p.featured))
      .slice(0, 3);
  }, [product, allProducts]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-accent animate-pulse">✦</div>
          <p className="font-serif text-xl text-ink mt-2">Unfolding Atelier Piece...</p>
        </div>
      </div>
    );
  }

  if (isError || !product || !currentVariant) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-3xl text-ink">Garment Not Found in Atelier</h2>
        <p className="text-xs text-ink-muted mt-2">This edition may have been retired or moved to the archives.</p>
        <Link to="/shop" className="mt-6">
          <Button variant="primary">Return to Collections</Button>
        </Link>
      </div>
    );
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (y / rect.height) * 100));
    setZoomCoords({ x, y, percentX, percentY });
  };

  const handleAddToCart = () => {
    if (currentVariant.status === 'out-of-stock') {
      showToast({
        title: 'Sold out in this size',
        description: 'Please choose another size or join the dispatch for restock.',
        type: 'info',
      });
      return;
    }
    const max = currentVariant.quantity ?? 99;
    const safeQty = Math.min(Math.max(1, quantity), max);
    addItem(product.slug, currentVariant.sku, safeQty, undefined, max);
    showToast({
      title: 'Added to Atelier Bag',
      description: `${safeQty}× ${product.name} (size ${currentVariant.size})`,
      type: 'success',
    });
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.slug);
    const saved = !isWishlisted(product.slug);
    showToast({
      title: saved ? 'Saved to Wishlist' : 'Removed from Wishlist',
      description: product.name,
      type: saved ? 'accent' : 'info',
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
    showToast({
      title: 'Review Submitted',
      description: 'Thank you for your connoisseur feedback.',
      type: 'success',
    });
    refetchReviews();
  };

  const activeImage = product.images[selectedImageIndex] || product.images[0];
  const isWish = isWishlisted(product.slug);

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
      availability:
        currentVariant.status === 'out-of-stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
    ...(reviews && reviews.length > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1),
            reviewCount: reviews.length,
          },
          review: reviews.slice(0, 5).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.author },
            reviewRating: { '@type': 'Rating', ratingValue: r.rating },
            name: r.title,
            reviewBody: r.comment,
          })),
        }
      : {}),
  };

  return (
    <div className="bg-cream min-h-screen">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      {/* Breadcrumb Bar */}
      <div className="border-b border-stone/50 bg-paper py-3">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 flex items-center text-xs tracking-wider uppercase font-sans text-ink-muted">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <span className="mx-2 text-stone">/</span>
          {universe ? (
            <>
              <Link to={`/universes/${universe.slug}`} className="hover:text-ink transition-colors">{universe.name}</Link>
              <span className="mx-2 text-stone">/</span>
            </>
          ) : null}
          {product.garmentType ? (
            <Link to={`/clothing/${product.garmentType}`} className="text-accent hover:text-ink transition-colors font-medium capitalize">
              {product.garmentType}s
            </Link>
          ) : (
            <Link to={`/category/${product.categorySlug}`} className="text-accent hover:text-ink transition-colors font-medium capitalize">
              {product.categorySlug}
            </Link>
          )}
          <span className="mx-2 text-stone">/</span>
          <span className="text-ink truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Main PDP Container */}
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* LEFT: Multi-Image Gallery & Interactive Macro Loupe Zoom */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail Strip */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  aria-label={`View image ${idx + 1} of ${product.images.length}`}
                  aria-pressed={selectedImageIndex === idx}
                  className={`w-16 sm:w-20 aspect-[3/4] border overflow-hidden flex-shrink-0 transition-all min-h-[44px] ${
                    selectedImageIndex === idx
                      ? 'border-gold ring-2 ring-gold/30 shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.tried) {
                        target.dataset.tried = 'true';
                        if (target.src.endsWith('.jpg')) target.src = target.src.replace(/\.jpg$/, '.png');
                        else if (target.src.endsWith('.png')) target.src = target.src.replace(/\.png$/, '.jpg');
                      }
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Main Interactive Stage */}
            <div className="flex-1 relative">
              <div
                ref={imageContainerRef}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                className="relative aspect-[3/4] bg-stone/20 overflow-hidden border border-stone cursor-crosshair group shadow-md"
              >
                <img
                  src={activeImage.src}
                  alt={activeImage.alt}
                  className="w-full h-full object-cover select-none"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.tried) {
                      target.dataset.tried = 'true';
                      if (target.src.endsWith('.jpg')) target.src = target.src.replace(/\.jpg$/, '.png');
                      else if (target.src.endsWith('.png')) target.src = target.src.replace(/\.png$/, '.jpg');
                    }
                  }}
                />

                {/* Macro Loupe Lens Hover Window (Pillar 1) */}
                {isZooming && (
                  <div
                    className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
                    style={{
                      backgroundImage: `url(${activeImage.src})`,
                      backgroundPosition: `${zoomCoords.percentX}% ${zoomCoords.percentY}%`,
                      backgroundSize: '280%',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <div className="absolute top-4 left-4 bg-panel-raised/90 text-white px-3 py-1 text-xs tracking-widest uppercase font-sans backdrop-blur-md border border-stone/30">
                      3x Macro Thread Inspection
                    </div>
                  </div>
                )}

                {/* Badges on Image */}
                {product.embroidery && (
                  <div className="absolute bottom-4 left-4 bg-cream/95 text-ink backdrop-blur-md px-3 py-1.5 text-xs tracking-widest uppercase border border-stone shadow-sm">
                    {product.embroidery.techniqueLabel}
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-panel-raised/75 text-white text-xs px-2.5 py-1 tracking-widest uppercase backdrop-blur-xs">
                  Hover to Inspect Stitches
                </div>
              </div>

              {/* Embroidery Hours Pill (+ Handcrafted badge only when flagged) */}
              {product.embroidery?.artisanHours && (
                <div className="mt-4 p-3 bg-paper border border-stone flex items-center justify-between text-xs text-ink-muted">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 20l3-3m2-2l9.5-9.5a1.5 1.5 0 00-2-2L7 13l-3 3m9-9l2 2M9 7l8 8" />
                    </svg>
                    <span className="font-serif text-ink text-sm">
                      {product.embroidery.artisanHours} hours of embroidery threadwork
                    </span>
                  </div>
                  <span className={`text-xs uppercase tracking-widest font-medium ${product.handcrafted ? 'text-gold-deep' : 'text-ink'}`}>
                    {product.handcrafted ? 'Handcrafted piece' : 'Atelier finish'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Buy Box & Tailoring Specs */}
          <div ref={buyBoxRef} className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Universe tag + transliteration + Bestseller (render 09) */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 text-xs">
                  {universe && (
                    <Link
                      to={`/universes/${universe.slug}`}
                      className="inline-flex items-center gap-1.5 bg-gold-deep/10 text-gold-deep font-sans tracking-label uppercase px-2.5 py-1"
                    >
                      <span aria-hidden="true">◉</span> {universe.name}
                    </Link>
                  )}
                  {product.foreignTagline && (
                    <span className="text-ink-muted font-serif" lang="ja">
                      {product.foreignTagline}
                    </span>
                  )}
                </div>
                {product.featured && (
                  <span className="text-xs text-ink font-medium inline-flex items-center gap-1">
                    Bestseller <span aria-hidden="true" className="text-gold-deep">🔥</span>
                  </span>
                )}
              </div>

              {/* Category, Craft Region & Batch Scarcity Marker */}
              <div className="flex flex-col gap-1.5 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-sans text-xs tracking-eyebrow text-accent uppercase font-medium">
                    {formatCountryOfOrigin(product.countryOfOrigin)} // {product.garmentType ?? product.categorySlug}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-ink">
                    {displayRating ? (
                      <>
                        <span className="text-gold-deep" aria-hidden="true">
                          {'★'.repeat(Math.round(displayRating.value))}
                        </span>
                        <span className="font-medium">{displayRating.value.toFixed(1)}</span>
                        <span className="text-ink-muted text-xs">({displayRating.count} reviews)</span>
                      </>
                    ) : (
                      <span className="text-ink-muted text-xs">No reviews yet</span>
                    )}
                  </div>
                </div>

                {/* Collection + Craft provenance strip */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs uppercase font-sans tracking-widest">
                  {(product.collectionSlug || product.artStyleSlug) && (
                    <span className="inline-flex items-center gap-2 text-ink">
                      <span className="text-ink-muted font-medium">Collection</span>
                      <Link
                        to={`/collections/${product.collectionSlug || product.artStyleSlug}`}
                        className="font-medium text-ink hover:text-accent transition-colors underline decoration-stone/50 underline-offset-4"
                      >
                        {COLLECTIONS.find((s) => s.slug === (product.collectionSlug || product.artStyleSlug))?.name.replace(' Collection', '') ??
                          (product.collectionSlug || product.artStyleSlug)?.replace(/-/g, ' ')}
                      </Link>
                    </span>
                  )}
                  {(product.craftTechniques ?? []).map((t) => (
                    <Link
                      key={t}
                      to={`/atelier/${t}`}
                      className="border border-stone/70 px-2 py-0.5 hover:border-ink hover:text-accent transition-colors"
                    >
                      {t.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>

                {/* Trust row — replaces the old batch/cluster scarcity strip.
                    These are the surfaces a first-time tier-2/3 buyer checks
                    before adding to bag (docs/11-data-model §5). */}
                <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase font-sans tracking-widest text-ink-muted">
                  {product.codAvailable && (
                    <span className="text-ink font-medium">Cash on delivery</span>
                  )}
                  {product.returnWindowDays != null && product.returnWindowDays > 0 && (
                    <span>{product.returnWindowDays}-day returns</span>
                  )}
                  {product.returnWindowDays === 0 && (
                    <span>Made to order · non-returnable</span>
                  )}
                  {product.deliveryDaysMin != null && product.deliveryDaysMax != null && (
                    <span>
                      Delivers in {product.deliveryDaysMin}–{product.deliveryDaysMax} days
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className="font-serif text-4xl sm:text-5xl text-ink font-normal leading-tight tracking-tight">
                {product.name}
              </h1>
              <p className="font-serif text-lg text-ink-muted mt-2 leading-relaxed">
                {product.subtitle}
              </p>

              {/* Expression Scale & Placement Badge (Spec PDP requirement) */}
              <div className="mt-4 p-3.5 bg-paper border border-stone/70 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 bg-panel-raised text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {expScore}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs uppercase font-sans tracking-widest text-ink-muted">
                          Expression
                        </span>
                        <span className="text-xs font-serif font-semibold text-accent">
                          Level {expScore} / 5 · {expInfo?.name ?? 'Artistic'}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted leading-tight font-light mt-0.5">
                        {expInfo?.tagline ?? 'Medium compositions, illustrative designs.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsExpressionModalOpen(true)}
                    className="text-xs uppercase font-sans tracking-widest text-accent hover:underline font-semibold cursor-pointer shrink-0 ml-2"
                  >
                    Explain Scale ↗
                  </button>
                </div>

                {product.embroidery?.placement && product.embroidery.placement.length > 0 && (
                  <div className="pt-2 border-t border-stone/30 flex items-center gap-2 text-xs text-ink-muted">
                    <span className="uppercase tracking-wider font-medium text-ink/70">
                      Placement Zones:
                    </span>
                    <span className="font-serif text-ink">
                      {product.embroidery.placement.join(' • ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Price: serif + compare-at + computed %OFF (render 09) */}
              <div className="mt-5 pb-5 border-b border-stone/50">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-serif text-3xl sm:text-4xl text-ink font-bold">
                    {formatPrice(currentVariant.priceCents)}
                  </span>
                  {currentVariant.compareAtPriceCents &&
                    currentVariant.compareAtPriceCents > currentVariant.priceCents && (
                      <>
                        <span className="text-base text-ink-muted line-through">
                          {formatPrice(currentVariant.compareAtPriceCents)}
                        </span>
                        <span
                          className={`text-xs font-sans px-2 py-0.5 ${
                            'font-semibold text-success bg-success/10'
                          }`}
                        >
                          ({discountPct}% off)
                        </span>
                      </>
                    )}
                </div>

                {/* Checkout promo callout */}
                <div className="mt-3 flex items-center justify-between gap-3 border border-stone-strong bg-panel p-3 text-xs text-ink">
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true" className="text-accent">✦</span>
                      <span>
                        Get an extra 10% off with code{' '}
                        <strong className="font-mono font-semibold text-accent">HUSTLE10</strong> at checkout
                      </span>
                    </div>
                  <span className="shrink-0 bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                    Apply in bag
                  </span>
                </div>

                <p className="text-xs text-ink-muted mt-2 font-light">
                  Inclusive of all taxes. Hand-numbered certificate of authenticity included with each piece.
                </p>
                {/* EMI line (render 09) — figure computed from variant price; the
                    render's "with simpl" brand claim deferred: no EPI integration
                    exists yet, so it stays a neutral promise (logged deviation) */}
                <p className="font-serif text-xs text-ink-muted mt-1.5">
                  or {formatPrice(Math.round(currentVariant.priceCents / 6)).replace('-', '')}/month for 6 months ·
                  EMI options confirmed at checkout
                </p>
              </div>

              {/* Non-Accordion Initial Garment Specifications (Mobile-Optimized) */}
              <div className="my-5 p-4 bg-paper border border-stone/70">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {product.fabricGsm && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-muted block font-medium">Textile Spec</span>
                      <span className="text-ink font-medium">{product.fabricGsm}</span>
                    </div>
                  )}
                  {product.embroidery?.artisanHours != null && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-muted block font-medium">Embroidery Time</span>
                      <span className="text-ink font-medium">{product.embroidery.artisanHours} hours of threadwork</span>
                    </div>
                  )}
                  {product.embroidery?.techniqueLabel && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-muted block font-medium">Craft Technique</span>
                      <span className="text-ink font-medium">{product.embroidery.techniqueLabel}</span>
                    </div>
                  )}
                  {product.fit && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-ink-muted block font-medium">Fit Profile</span>
                      <span className="text-ink font-medium">{product.fit}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Variant Picker: Sizes (no colour option — one colour per piece) */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-sans tracking-widest uppercase text-ink font-medium">
                    Size: <span className="text-ink-muted font-normal">{currentVariant.size}</span>
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs uppercase tracking-widest text-accent hover:underline font-medium"
                  >
                    India & International Sizing →
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants
                    .map((v) => {
                      const isSelected = currentVariant.sku === v.sku;
                      const isOut = v.status === 'out-of-stock';
                      const sizeLabel =
                        v.size === 'S' ? '38 (S)' :
                        v.size === 'M' ? '40 (M)' :
                        v.size === 'L' ? '42 (L)' :
                        v.size === 'XL' ? '44 (XL)' : v.size;
                      return (
                        <button
                          key={v.sku}
                          onClick={() => !isOut && setSelectedVariant(v)}
                          disabled={isOut}
                          aria-label={`Size ${sizeLabel}${isOut ? ' — sold out' : ''}`}
                          aria-pressed={isSelected}
                          className={`min-w-[64px] min-h-[44px] h-11 px-3 text-xs font-sans border transition-all flex flex-col items-center justify-center ${
                            isOut
                              ? 'bg-cream text-ink-muted/50 border-stone/40 line-through cursor-not-allowed'
                              : isSelected
                                ? 'border-gold bg-gold/10 text-ink font-medium shadow-sm'
                                : 'bg-paper text-ink border-stone hover:border-ink/60'
                          }`}
                        >
                          <span>{sizeLabel}</span>
                          {isOut && <span className="text-xs no-underline">Sold out</span>}
                        </button>
                      );
                    })}
                </div>
                {/* Stock Indicator */}
                <div className="mt-2.5 flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-ink-muted text-xs">
                    {currentVariant.quantity && currentVariant.quantity <= 2
                      ? `Small batch alert: Only ${currentVariant.quantity} pieces left in atelier`
                      : 'In stock — ready for dispatch from regional workshop'}
                  </span>
                </div>
              </div>

              {/* Quantity Stepper & Add to Bag */}
              <div className="mt-8 flex gap-3">
                <div className="flex items-center border border-stone bg-paper">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-11 h-12 flex items-center justify-center text-ink hover:text-accent transition-colors"
                  >
                    –
                  </button>
                  <span className="w-10 text-center font-sans text-xs font-medium text-ink">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentVariant.quantity ?? 99, q + 1))}
                    aria-label="Increase quantity"
                    className="w-11 h-12 flex items-center justify-center text-ink hover:text-accent transition-colors"
                  >
                    +
                  </button>
                </div>

                <CtaButton className="flex-1" onClick={handleAddToCart}>
                  Add to Bag <span aria-hidden="true">→</span>
                </CtaButton>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  aria-label={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
                  aria-pressed={isWish}
                  className={`min-w-[44px] min-h-[44px] w-12 h-12 border flex items-center justify-center transition-colors ${
                    isWish
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-stone bg-paper text-ink-muted hover:text-ink hover:border-ink'
                  }`}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>

              {/* Trust row (render 09) — line-icon SVGs, no emoji */}
              <div className="mt-4 flex items-center justify-between gap-2 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0 text-gold-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7h11v10H3zM14 10h4l3 3v4h-7zM7 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm11 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Free shipping on orders above ₹500
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0 text-gold-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7H4v13h16V7zM4 7l2-3h12l2 3M9 11h6" />
                  </svg>
                  14-day home inspection
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0 text-gold-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3l8 3v6c0 4.5-3.5 7.5-8 9-4.5-1.5-8-4.5-8-9V6l8-3zm-2.5 8.5l2 2 4-4" />
                  </svg>
                  Secure payments · UPI, Cards, COD
                </span>
              </div>

              {/* India Pincode Delivery ETA & Trust Block (Task S1.9) */}
              <div className="mt-5 p-4 bg-paper border border-stone/80 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans uppercase tracking-widest text-ink font-medium">
                    Estimated Delivery & Pincode Checker
                  </span>
                  <span className="text-xs text-accent font-medium">Pan-India Express</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit PIN code (e.g. 110001, 400001)"
                    className="flex-1 bg-cream border border-stone px-3 py-2 text-xs text-ink placeholder:text-warm-gray focus:outline-accent"
                  />
                  <button
                    type="button"
                    onClick={checkPincode}
                    className="px-4 py-2 bg-panel-raised text-white hover:bg-accent text-xs uppercase tracking-wider transition-colors font-medium"
                  >
                    Check
                  </button>
                </div>
                {pincodeEta && (
                  <p className="text-xs text-ink font-medium bg-cream p-2.5 border border-stone/50">
                    ✦ {pincodeEta}
                  </p>
                )}
                <div className="pt-2 border-t border-stone/40 grid grid-cols-2 gap-2 text-xs text-ink-muted uppercase tracking-wider font-light">
                  <span>✓ Cash on Delivery (COD)</span>
                  <span>✓ UPI / NetBanking / Cards</span>
                  <span>✓ Free Express Shipping</span>
                  <span>✓ 7-Day Doorstep Exchange</span>
                </div>
              </div>

              {/* Bespoke Personalization CTA */}
              {product.customizable && (
                <div className="mt-4 p-4 bg-paper border border-stone/80 rounded-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-sans tracking-widest text-accent font-medium block">
                        ✦ Bespoke Studio Available
                      </span>
                      <p className="text-xs text-ink font-serif mt-0.5">
                        Personalize with embroidered monogram or botanical motif
                      </p>
                    </div>
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => openCustomizer(product)}
                      className="text-xs tracking-widest px-3"
                    >
                      Customize
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Pillars: Craftsmanship, Fabrics, Fit & Care */}
            <div className="mt-10 border-t border-stone/60 divide-y divide-stone/60">
              
              {/* Accordion 1: Technique & Needlework */}
              {product.embroidery && (
                <div>
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === 'technique' ? null : 'technique')}
                    aria-expanded={activeAccordion === 'technique'}
                    className="w-full py-4 min-h-[44px] flex items-center justify-between text-left text-xs uppercase tracking-widest text-ink font-medium hover:text-accent transition-colors"
                  >
                    <span>Needlecraft & Technique</span>
                    <span className="text-sm">{activeAccordion === 'technique' ? '–' : '+'}</span>
                  </button>
                  {activeAccordion === 'technique' && (
                    <div className="pb-5 text-xs text-ink-muted space-y-2.5 font-light leading-relaxed">
                      <p className="text-ink font-serif text-sm">
                        {product.embroidery.techniqueLabel}
                      </p>
                      <p>{product.embroidery.motifStory}</p>
                      <div className="pt-2 grid grid-cols-2 gap-2 text-xs text-ink">
                        <div>
                          <strong className="font-medium text-ink-muted uppercase tracking-wider block text-xs">
                            Thread Composition
                          </strong>
                          {product.embroidery.threadComposition}
                        </div>
                        <div>
                          <strong className="font-medium text-ink-muted uppercase tracking-wider block text-xs">
                            Placement Zones
                          </strong>
                          {product.embroidery.placement.join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Accordion 2: Materials & Provenance */}
              <div>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'materials' ? null : 'materials')}
                  aria-expanded={activeAccordion === 'materials'}
                  className="w-full py-4 min-h-[44px] flex items-center justify-between text-left text-xs uppercase tracking-widest text-ink font-medium hover:text-accent transition-colors"
                >
                  <span>Textile Composition & Provenance</span>
                  <span className="text-sm">{activeAccordion === 'materials' ? '–' : '+'}</span>
                </button>
                {activeAccordion === 'materials' && (
                  <div className="pb-5 text-xs text-ink-muted space-y-2 font-light leading-relaxed">
                    <p>{product.description}</p>
                    {product.material && (
                      <ul className="list-disc pl-4 space-y-1 text-ink mt-2">
                        {product.material.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 3: Fit & Measurements */}
              <div>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'fit' ? null : 'fit')}
                  aria-expanded={activeAccordion === 'fit'}
                  className="w-full py-4 min-h-[44px] flex items-center justify-between text-left text-xs uppercase tracking-widest text-ink font-medium hover:text-accent transition-colors"
                >
                  <span>Fit & Tailoring Dimensions</span>
                  <span className="text-sm">{activeAccordion === 'fit' ? '–' : '+'}</span>
                </button>
                {activeAccordion === 'fit' && (
                  <div className="pb-5 text-xs text-ink-muted space-y-3 font-light leading-relaxed">
                    {product.fitNotes && (
                      <p className="text-ink font-medium">{product.fitNotes}</p>
                    )}
                    {product.fit && !product.fitNotes && (
                      <p className="text-ink font-medium">{product.fit}</p>
                    )}
                    {(product.modelHeightCm || product.modelWornSize) && (
                      <p>
                        {product.modelHeightCm ? `Model is ${product.modelHeightCm} cm` : 'Model'}
                        {product.modelWornSize ? ` and wears size ${product.modelWornSize}.` : '.'}
                      </p>
                    )}

                    {/* Category-scoped attributes, as a marketplace-style spec table.
                        Which rows appear depends on garment type: a scarf has no
                        neck or sleeve, a trouser has rise. Sourced from
                        products.attributes validated against attribute_definitions. */}
                    {product.attributes && Object.keys(product.attributes).length > 0 && (
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-stone/40">
                        {Object.entries(product.attributes).map(([k, v]) => (
                          <div key={k} className="contents">
                            <dt className="text-ink-muted">{k.replace(/_/g, ' ')}</dt>
                            <dd className="text-ink m-0">{String(v).replace(/-/g, ' ')}</dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    {product.countryOfOrigin && (
                      <p className="pt-1 text-xs uppercase tracking-widest text-ink-muted">
                        {formatCountryOfOrigin(product.countryOfOrigin)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 4: Garment Care */}
              <div>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'care' ? null : 'care')}
                  aria-expanded={activeAccordion === 'care'}
                  className="w-full py-4 min-h-[44px] flex items-center justify-between text-left text-xs uppercase tracking-widest text-ink font-medium hover:text-accent transition-colors"
                >
                  <span>Heirloom Care & Storage</span>
                  <span className="text-sm">{activeAccordion === 'care' ? '–' : '+'}</span>
                </button>
                {activeAccordion === 'care' && (
                  <div className="pb-5 text-xs text-ink-muted space-y-1 font-light leading-relaxed">
                    {product.care?.map((c, i) => (
                      <p key={i}>✦ {c}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Accordion 5: White-Glove Delivery */}
              <div>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'delivery' ? null : 'delivery')}
                  aria-expanded={activeAccordion === 'delivery'}
                  className="w-full py-4 min-h-[44px] flex items-center justify-between text-left text-xs uppercase tracking-widest text-ink font-medium hover:text-accent transition-colors"
                >
                  <span>Atelier Dispatch & In-Home Guarantee</span>
                  <span className="text-sm">{activeAccordion === 'delivery' ? '–' : '+'}</span>
                </button>
                {activeAccordion === 'delivery' && (
                  <div className="pb-5 text-xs text-ink-muted space-y-2 font-light leading-relaxed">
                    <p>Orders ship in bespoke archival gift boxes lined with Japanese mulberry tissue and unbleached cotton dust bags.</p>
                    <p>Complimentary 14-day in-home inspection and exchange service included.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* DETAIL STRIP: captioned macro / fabric / placement / fit (render 09) */}
        <section aria-label="Product details close-up" className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { img: product.images[3], title: 'Embroidered details', detail: product.embroidery ? `Over ${product.embroidery.artisanHours ?? '—'} hours of threadwork.` : 'Finished in the atelier.', badge: product.handcrafted ? 'Handcrafted' : undefined },
            { img: product.images[2], title: 'Premium fabric', detail: product.fabricGsm ? `${product.fabricGsm} · ${product.material?.[0] ?? 'natural textile'}.` : 'Natural textile.', badge: undefined },
            { img: product.images[4] ?? product.images[1], title: 'Motif placement', detail: product.embroidery ? product.embroidery.placement.join(', ') || 'All-over artwork.' : 'Full artwork view.', badge: undefined },
            { img: product.images[5] ?? product.images[0], title: 'Scale & fit', detail: product.fit ? `${product.fit}. Comfort meets statement.` : 'Comfort meets statement.', badge: undefined },
          ].map((d, i) => (
            <figure key={i} className="bg-paper border border-stone/60 overflow-hidden">
              <div className="aspect-square overflow-hidden bg-stone/20">
                {d.img && (
                  <img src={d.img.src} alt={d.img.alt} loading="lazy" className="w-full h-full object-cover" />
                )}
              </div>
              <figcaption className="p-3">
                <p className="font-serif text-sm text-ink flex items-center gap-2 flex-wrap">
                  {d.title}
                  {d.badge && (
                    <span className="text-xs font-sans uppercase tracking-label text-gold-deep border border-gold-deep/50 rounded-full px-2 py-0.5">
                      {d.badge}
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-muted mt-0.5">{d.detail}</p>
              </figcaption>
            </figure>
          ))}
        </section>

        {/* MOTIF STORY BAND (render 09) */}
        {(motif || product.embroidery?.motifStory) && (
          <section aria-label="The story behind this motif" className="mt-14 bg-paper border border-stone/60 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-xs font-sans uppercase tracking-eyebrow text-gold-deep">
                {universe?.name ?? 'UniqueLo'} lore
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-2 tracking-tight">
                The Story Behind {motif?.name ?? product.name}
              </h2>
              <p className="text-sm text-ink-muted mt-4 font-light leading-relaxed">
                {motif?.meaning ?? product.embroidery?.motifStory}
              </p>
              {product.embroidery?.motifStory && motif?.meaning && (
                <p className="text-sm text-ink-muted mt-3 font-light leading-relaxed">
                  {product.embroidery.motifStory}
                </p>
              )}
              {universe && (
                <Link
                  to={`/universes/${universe.slug}`}
                  className="inline-flex items-center gap-2 mt-5 px-6 py-3 font-serif text-base text-ink border border-ink/30 hover:border-ink transition-colors min-h-[48px]"
                >
                  Explore {universe.name} <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
            <div className="aspect-[16/10] overflow-hidden bg-stone/20">
              {product.images[3] && (
                <img
                  src={product.images[3].src}
                  alt={product.images[3].alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </section>
        )}

        {/* COMMUNITY STRIP (render 09) */}
        <section aria-label="Worn by the community" className="mt-14">
          <h2 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">Real People. Real Fits.</h2>
          <p className="text-sm text-ink-muted mt-2 font-light">Worn across cities, campuses and conventions.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[product.images[1], product.images[4], product.images[5], product.images[0]]
              .filter(Boolean)
              .map((img, i) => (
                <div key={i} className="aspect-[3/4] overflow-hidden bg-stone/20 border border-stone/60">
                  <img src={img!.src} alt={img!.alt} loading="lazy" className="w-full h-full object-cover" />
                </div>
              ))}
          </div>
          <p className="text-xs text-ink-muted mt-3">Community fits — share yours with #UniqueLo.</p>
        </section>

        {/* CUSTOMER REVIEWS & CONNOISSEUR TESTIMONIALS */}
        <section className="mt-20 pt-16 border-t border-stone/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-stone/40">
            <div>
              <span className="text-xs font-sans tracking-eyebrow text-gold-deep uppercase font-medium">
                Worn & reviewed
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink mt-1 tracking-tight">
                Customer Reviews
              </h2>
              {displayRating && (
                <p className="text-sm text-ink-muted mt-2">
                  <span className="text-gold-deep" aria-hidden="true">
                    {'★'.repeat(Math.round(displayRating.value))}
                  </span>{' '}
                  {displayRating.value.toFixed(1)} out of 5 · Based on {displayRating.count} reviews
                </p>
              )}
            </div>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="mt-4 sm:mt-0 px-5 py-2.5 bg-transparent text-ink border border-ink/30 text-xs uppercase tracking-widest font-sans hover:border-ink transition-colors min-h-[44px]"
            >
              Write a review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(reviews || []).map((rev) => (
              <div key={rev.id} className="p-6 bg-paper border border-stone/70 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-accent text-sm">{'★'.repeat(rev.rating)}</span>
                  <span className="text-xs text-ink-muted uppercase tracking-wider">{rev.createdAt}</span>
                </div>
                <h4 className="font-serif text-base text-ink font-medium">{rev.title}</h4>
                <p className="text-xs text-ink-muted font-light mt-2 leading-relaxed">{rev.comment}</p>
                <div className="mt-4 pt-3 border-t border-stone/40 flex items-center justify-between text-xs">
                  <span className="text-ink font-medium">{rev.author}</span>
                  {rev.verified && (
                    <span className="text-accent text-xs uppercase tracking-wider">
                      Verified Collector ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DUAL DISCOVERY AXIS RECOMMENDATIONS */}
        <div className="mt-20 pt-16 border-t border-stone/60 space-y-16">
          {/* Stream 1: More from the same Universe */}
          {universe && universeProducts.length > 0 && (
            <section aria-labelledby="universe-recs-heading">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-sans tracking-eyebrow text-accent uppercase font-medium">
                    Curated Universe
                  </span>
                  <h2 id="universe-recs-heading" className="font-serif text-2xl sm:text-3xl text-ink mt-1">
                    More from {universe.name}
                  </h2>
                  <p className="text-xs text-ink-muted mt-1 font-light">
                    Heirloom pieces woven from the same lore, characters, and needlework aesthetic.
                  </p>
                </div>
                <Link
                  to={`/worlds/${universe.slug}`}
                  className="text-xs uppercase font-sans tracking-widest text-accent hover:underline font-semibold shrink-0"
                >
                  Explore All {universe.name} Pieces →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3">
                {universeProducts.map((rel) => {
                  const relVariant = getDefaultVariant(rel);
                  return (
                    <Link
                      key={rel.slug}
                      to={`/product/${rel.slug}`}
                      className="group block bg-paper border border-stone/70 p-2.5 sm:p-3 hover:border-ink/50 transition-colors"
                    >
                      <div className="aspect-[3/4] bg-stone/20 overflow-hidden relative mb-2 sm:mb-3">
                        <img
                          src={rel.images[0]?.src || '/images/placeholders/hero.jpg'}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {rel.embroidery && (
                          <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-cream/90 text-ink text-xs sm:text-xs uppercase tracking-widest px-1.5 sm:px-2 py-0.5">
                            {rel.embroidery.techniqueLabel}
                          </span>
                        )}
                        <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-paper/90 text-accent text-xs sm:text-xs uppercase tracking-widest px-1.5 sm:px-2 py-0.5 font-sans font-semibold">
                          ✦ L{getExpressionScore(rel)}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div className="min-w-0">
                          <h4 className="font-serif text-xs sm:text-sm text-ink group-hover:text-accent transition-colors line-clamp-1">
                            {rel.name}
                          </h4>
                          <span className="font-sans text-xs sm:text-xs text-ink-muted block mt-0.5 truncate">
                            {rel.garmentType ? `${rel.garmentType}s` : rel.categorySlug}
                          </span>
                        </div>
                        <span className="font-sans text-xs font-semibold text-ink shrink-0">
                          {formatPrice(relVariant.priceCents)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Stream 2: More at the same Expression Level */}
          {expressionProducts.length > 0 && (
            <section aria-labelledby="expression-recs-heading">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-sans tracking-eyebrow text-accent uppercase font-medium">
                    The Expression Spectrum
                  </span>
                  <h2 id="expression-recs-heading" className="font-serif text-2xl sm:text-3xl text-ink mt-1">
                    Pieces at Level {expScore} ({expInfo?.name})
                  </h2>
                  <p className="text-xs text-ink-muted mt-1 font-light">
                    Cross-world pieces sharing the same visual presence and needlecraft density.
                  </p>
                </div>
                <Link
                  to={`/styles/${product.expressionSlug || 'cult'}`}
                  className="text-xs uppercase font-sans tracking-widest text-accent hover:underline font-semibold shrink-0"
                >
                  Explore All {expInfo?.name || `Level ${expScore}`} Pieces →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3">
                {expressionProducts.map((rel) => {
                  const relVariant = getDefaultVariant(rel);
                  return (
                    <Link
                      key={rel.slug}
                      to={`/product/${rel.slug}`}
                      className="group block bg-paper border border-stone/70 p-2.5 sm:p-3 hover:border-ink/50 transition-colors"
                    >
                      <div className="aspect-[3/4] bg-stone/20 overflow-hidden relative mb-2 sm:mb-3">
                        <img
                          src={rel.images[0]?.src || '/images/placeholders/hero.jpg'}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {rel.embroidery && (
                          <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-cream/90 text-ink text-xs sm:text-xs uppercase tracking-widest px-1.5 sm:px-2 py-0.5">
                            {rel.embroidery.techniqueLabel}
                          </span>
                        )}
                        <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-paper/90 text-accent text-xs sm:text-xs uppercase tracking-widest px-1.5 sm:px-2 py-0.5 font-sans font-semibold">
                          ✦ L{getExpressionScore(rel)}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div className="min-w-0">
                          <h4 className="font-serif text-xs sm:text-sm text-ink group-hover:text-accent transition-colors line-clamp-1">
                            {rel.name}
                          </h4>
                          <span className="font-sans text-xs sm:text-xs text-ink-muted block mt-0.5 truncate">
                            {rel.garmentType ? `${rel.garmentType}s` : rel.categorySlug}
                          </span>
                        </div>
                        <span className="font-sans text-xs font-semibold text-ink shrink-0">
                          {formatPrice(relVariant.priceCents)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Fallback Curated Wardrobe when neither stream populated */}
          {!universeProducts.length && !expressionProducts.length && relatedProducts.length > 0 && (
            <section>
              <div className="mb-8">
                <span className="text-xs font-sans tracking-eyebrow text-accent uppercase font-medium">
                  Curated Wardrobe
                </span>
                <h2 className="font-serif text-3xl text-ink mt-1">
                  Frequently Stitched Together
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3">
                {relatedProducts.map((rel) => {
                  const relVariant = getDefaultVariant(rel);
                  return (
                    <Link
                      key={rel.slug}
                      to={`/product/${rel.slug}`}
                      className="group block bg-paper border border-stone/70 p-2.5 sm:p-3 hover:border-ink/50 transition-colors"
                    >
                      <div className="aspect-[3/4] bg-stone/20 overflow-hidden relative mb-2 sm:mb-3">
                        <img
                          src={rel.images[0]?.src || '/images/placeholders/hero.jpg'}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {rel.embroidery && (
                          <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-cream/90 text-ink text-xs sm:text-xs uppercase tracking-widest px-1.5 sm:px-2 py-0.5">
                            {rel.embroidery.techniqueLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div className="min-w-0">
                          <h4 className="font-serif text-xs sm:text-sm text-ink group-hover:text-accent transition-colors line-clamp-1">
                            {rel.name}
                          </h4>
                          <span className="font-sans text-xs sm:text-xs text-ink-muted block mt-0.5 truncate">
                            {rel.garmentType ? `${rel.garmentType}s` : rel.categorySlug}
                          </span>
                        </div>
                        <span className="font-sans text-xs font-medium text-ink shrink-0">
                          {formatPrice(relVariant.priceCents)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Sizing Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.categorySlug}
      />

      {/* Expression Guide Modal */}
      <ExpressionGuideModal
        isOpen={isExpressionModalOpen}
        onClose={() => setIsExpressionModalOpen(false)}
        currentScore={expScore}
      />

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsReviewModalOpen(false)}
            className="fixed inset-0 bg-panel-raised/70 backdrop-blur-md"
          />
          <div className="relative w-full max-w-lg bg-paper border border-stone shadow-2xl rounded-sm p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200">
            <h3 className="font-serif text-2xl text-ink">Submit Connoisseur Review</h3>
            <p className="text-xs text-ink-muted mt-1">Share your thoughts on the needlecraft and fit of {product.name}.</p>
            
            <form onSubmit={handleReviewSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink font-medium mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  placeholder="e.g. Evelyn Reed"
                  className="w-full bg-cream border border-stone px-3 py-2 text-xs text-ink focus:outline-accent"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink font-medium mb-1">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex gap-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`px-3 py-1 text-xs border ${
                        reviewRating === star ? 'bg-panel-raised text-white border-ink' : 'border-stone text-ink'
                      }`}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink font-medium mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Exquisite silk tension and heirloom structure"
                  className="w-full bg-cream border border-stone px-3 py-2 text-xs text-ink focus:outline-accent"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink font-medium mb-1">
                  Detailed Experience
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe the fabric feel, stitch relief, and how the garment wears..."
                  className="w-full bg-cream border border-stone px-3 py-2 text-xs text-ink focus:outline-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sticky Quick-Buy Bar for High-Conversion Scroll (Competitor Parity) */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-md border-t border-stone shadow-xl py-3 px-4 sm:px-8 transition-transform duration-300">
          <div className="max-w-[var(--container-max)] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={activeImage.src}
                alt={product.name}
                className="w-10 h-12 object-cover border border-stone shadow-xs"
              />
              <div className="hidden sm:block">
                <span className="font-serif text-sm text-ink block leading-tight font-medium">
                  {product.name}
                </span>
                <span className="text-xs text-ink-muted uppercase tracking-widest font-sans">
                  {currentVariant.size}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-sans text-base sm:text-lg font-medium text-ink block leading-none">
                  {formatPrice(currentVariant.priceCents)}
                </span>
                <span className="text-xs text-accent font-medium font-sans">
                  Express Dispatch Included
                </span>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                className="text-xs uppercase tracking-widest px-6 h-10 shadow-sm"
              >
                Add to Bag
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
