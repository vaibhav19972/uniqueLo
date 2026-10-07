import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useProduct, useProducts, useReviews } from '../hooks/useCatalog';
import { useCartStore } from '../stores/cart';
import { useCustomizerStore } from '../stores/customizer';
import { useWishlistStore } from '../stores/wishlist';
import { useToastStore } from '../stores/toast';
import { formatPrice, getDefaultVariant, type ProductVariant, submitReview } from '../lib/data';
import { Button } from '../components/ui/Button';
import { SizeGuideModal } from '../components/shop/SizeGuideModal';

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
    if (pincode.length === 6) {
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
      setPincodeEta(`Serviceable: ${cityInfo} • Cash on Delivery / UPI Available`);
    } else {
      setPincodeEta('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  const currentVariant = useMemo(() => {
    if (!product) return null;
    return selectedVariant || getDefaultVariant(product);
  }, [product, selectedVariant]);

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
    addItem(product.slug, currentVariant.sku, quantity);
    showToast({
      title: 'Added to Atelier Bag',
      description: `${quantity}× ${product.name} (${currentVariant.color} / ${currentVariant.size})`,
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

  return (
    <div className="bg-cream min-h-screen">
      {/* Breadcrumb Bar */}
      <div className="border-b border-stone/50 bg-paper py-3">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 flex items-center text-xs tracking-wider uppercase font-sans text-ink-muted">
          <Link to="/" className="hover:text-ink transition-colors">Atelier</Link>
          <span className="mx-2 text-stone">/</span>
          <Link to="/shop" className="hover:text-ink transition-colors">Collections</Link>
          <span className="mx-2 text-stone">/</span>
          <span className="text-accent font-medium">{product.categorySlug}</span>
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
                  className={`w-16 sm:w-20 aspect-[3/4] border overflow-hidden flex-shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-accent ring-2 ring-accent/40 shadow-sm'
                      : 'border-stone opacity-70 hover:opacity-100'
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
                    <div className="absolute top-4 left-4 bg-ink/90 text-cream px-3 py-1 text-[10px] tracking-widest uppercase font-sans backdrop-blur-md border border-stone/30">
                      ✦ 3x Macro Thread Inspection
                    </div>
                  </div>
                )}

                {/* Badges on Image */}
                {product.embroidery && (
                  <div className="absolute bottom-4 left-4 bg-cream/95 text-ink backdrop-blur-md px-3 py-1.5 text-[11px] tracking-widest uppercase border border-stone shadow-sm">
                    {product.embroidery.techniqueLabel}
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-ink/75 text-cream text-[10px] px-2.5 py-1 tracking-widest uppercase backdrop-blur-xs">
                  Hover to Inspect Stitches
                </div>
              </div>

              {/* Artisan Hours Pill */}
              {product.embroidery?.artisanHours && (
                <div className="mt-4 p-3 bg-paper border border-stone flex items-center justify-between text-xs text-ink-muted">
                  <div className="flex items-center gap-2">
                    <span className="text-accent text-sm">✦</span>
                    <span className="font-serif text-ink text-sm">
                      {product.embroidery.artisanHours} Hours of Continuous Hand Needlework
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-ink font-medium">
                    Atelier Certified
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Buy Box & Tailoring Specs */}
          <div ref={buyBoxRef} className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Category, Craft Region & Batch Scarcity Marker */}
              <div className="flex flex-col gap-1.5 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-sans text-[11px] tracking-[0.25em] text-accent uppercase font-medium">
                    {product.craftRegion || 'Made in India'} // {product.categorySlug}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-ink">
                    <span className="text-accent">★★★★★</span>
                    <span className="font-medium">4.9</span>
                    <span className="text-ink-muted text-[11px]">({reviews?.length || 24} collector reviews)</span>
                  </div>
                </div>

                {/* Quiet Batch Scarcity Marker */}
                <div className="inline-flex items-center gap-2 text-[10px] uppercase font-sans tracking-widest text-ink-muted">
                  <span className="text-ink font-medium">
                    Edition {product.batchNumber || 12} of {product.batchTotal || 50}
                  </span>
                  <span>•</span>
                  <span>{product.craftCluster || 'Atelier Guild'}</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal leading-tight tracking-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted mt-2 font-light leading-relaxed">
                {product.subtitle}
              </p>

              {/* Price & Shipping */}
              <div className="mt-5 pb-5 border-b border-stone/50">
                <div className="flex items-baseline gap-3">
                  <span className="font-sans text-2xl sm:text-3xl font-medium text-ink">
                    {formatPrice(currentVariant.priceCents)}
                  </span>
                  <span className="text-xs text-accent font-medium tracking-wide">
                    Complimentary Express Shipping
                  </span>
                </div>
                <p className="text-[11px] text-ink-muted mt-1 font-light">
                  Inclusive of all taxes. Hand-numbered certificate of authenticity included with each piece.
                </p>
              </div>

              {/* Non-Accordion Initial Garment Specifications (Mobile-Optimized) */}
              <div className="my-5 p-4 bg-paper border border-stone/70">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-ink-muted block font-medium">Textile Spec</span>
                    <span className="text-ink font-medium">{product.fabricGsm || '280 GSM Organic Cotton'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-ink-muted block font-medium">Hand Needlework</span>
                    <span className="text-ink font-medium">{product.embroidery?.artisanHours || 14} Hours by Guild</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-ink-muted block font-medium">Craft Technique</span>
                    <span className="text-ink font-medium">{product.embroidery?.techniqueLabel || 'Regional Needlecraft'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-ink-muted block font-medium">Fit Profile</span>
                    <span className="text-ink font-medium">{product.fit || 'Atelier Relaxed Fit'}</span>
                  </div>
                </div>
              </div>

              {/* Variant Picker: Colors */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-sans tracking-widest uppercase text-ink font-medium">
                    Textile Colorway: <span className="text-ink-muted font-normal">{currentVariant.color}</span>
                  </span>
                </div>
                <div className="flex gap-3">
                  {Array.from(new Set(product.variants.map((v) => v.color))).map((color) => {
                    const variantForColor = product.variants.find((v) => v.color === color);
                    const isSelected = currentVariant.color === color;
                    return (
                      <button
                        key={color}
                        onClick={() => variantForColor && setSelectedVariant(variantForColor)}
                        className={`group relative flex items-center gap-2 p-1 border transition-all ${
                          isSelected ? 'border-ink bg-paper shadow-sm' : 'border-stone hover:border-ink/50'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-stone/50 shadow-inner"
                          style={{ backgroundColor: variantForColor?.colorHex }}
                        />
                        <span className="text-xs text-ink pr-2 font-light">{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Variant Picker: Sizes (India sizes first) */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-sans tracking-widest uppercase text-ink font-medium">
                    Size: <span className="text-ink-muted font-normal">{currentVariant.size}</span>
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[11px] uppercase tracking-widest text-accent hover:underline font-medium"
                  >
                    India & International Sizing →
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants
                    .filter((v) => v.color === currentVariant.color)
                    .map((v) => {
                      const isSelected = currentVariant.sku === v.sku;
                      const sizeLabel =
                        v.size === 'S' ? '38 (S)' :
                        v.size === 'M' ? '40 (M)' :
                        v.size === 'L' ? '42 (L)' :
                        v.size === 'XL' ? '44 (XL)' : v.size;
                      return (
                        <button
                          key={v.sku}
                          onClick={() => setSelectedVariant(v)}
                          className={`min-w-[64px] h-10 px-3 text-xs font-sans border transition-all flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-ink text-cream border-ink font-medium shadow-sm'
                              : 'bg-paper text-ink border-stone hover:border-ink/60'
                          }`}
                        >
                          <span>{sizeLabel}</span>
                        </button>
                      );
                    })}
                </div>
                {/* Stock Indicator */}
                <div className="mt-2.5 flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-ink-muted text-[11px]">
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
                    className="w-10 h-12 flex items-center justify-center text-ink hover:text-accent transition-colors"
                  >
                    –
                  </button>
                  <span className="w-10 text-center font-sans text-xs font-medium text-ink">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-12 flex items-center justify-center text-ink hover:text-accent transition-colors"
                  >
                    +
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1 text-xs tracking-widest font-medium uppercase h-12"
                  onClick={handleAddToCart}
                >
                  Add to Atelier Bag
                </Button>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  aria-label="Save to Wishlist"
                  className={`w-12 h-12 border flex items-center justify-center transition-colors ${
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

              {/* India Pincode Delivery ETA & Trust Block (Task S1.9) */}
              <div className="mt-5 p-4 bg-paper border border-stone/80 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-ink font-medium">
                    Estimated Delivery & Pincode Checker
                  </span>
                  <span className="text-[10px] text-accent font-medium">Pan-India Express</span>
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
                    className="px-4 py-2 bg-ink text-cream hover:bg-accent text-xs uppercase tracking-wider transition-colors font-medium"
                  >
                    Check
                  </button>
                </div>
                {pincodeEta && (
                  <p className="text-xs text-ink font-medium bg-cream p-2.5 border border-stone/50">
                    ✦ {pincodeEta}
                  </p>
                )}
                <div className="pt-2 border-t border-stone/40 grid grid-cols-2 gap-2 text-[10px] text-ink-muted uppercase tracking-wider font-light">
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
                      <span className="text-[10px] uppercase font-sans tracking-widest text-accent font-medium block">
                        ✦ Bespoke Studio Available
                      </span>
                      <p className="text-xs text-ink font-serif mt-0.5">
                        Personalize with hand-embroidered monogram or botanical motif
                      </p>
                    </div>
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => openCustomizer(product)}
                      className="text-[10px] tracking-widest px-3"
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
                    className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-widest text-ink font-medium hover:text-accent transition-colors"
                  >
                    <span>Artisanal Needlecraft & Technique</span>
                    <span className="text-sm">{activeAccordion === 'technique' ? '–' : '+'}</span>
                  </button>
                  {activeAccordion === 'technique' && (
                    <div className="pb-5 text-xs text-ink-muted space-y-2.5 font-light leading-relaxed">
                      <p className="text-ink font-serif text-sm">
                        {product.embroidery.techniqueLabel}
                      </p>
                      <p>{product.embroidery.motifStory}</p>
                      <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-ink">
                        <div>
                          <strong className="font-medium text-ink-muted uppercase tracking-wider block text-[9px]">
                            Thread Composition
                          </strong>
                          {product.embroidery.threadComposition}
                        </div>
                        <div>
                          <strong className="font-medium text-ink-muted uppercase tracking-wider block text-[9px]">
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
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-widest text-ink font-medium hover:text-accent transition-colors"
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
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-widest text-ink font-medium hover:text-accent transition-colors"
                >
                  <span>Fit & Tailoring Dimensions</span>
                  <span className="text-sm">{activeAccordion === 'fit' ? '–' : '+'}</span>
                </button>
                {activeAccordion === 'fit' && (
                  <div className="pb-5 text-xs text-ink-muted space-y-2 font-light leading-relaxed">
                    <p className="text-ink font-medium">{product.fit || 'Atelier tailored relaxed silhouette.'}</p>
                    <p>Designed to drape naturally over heirloom garments without restriction.</p>
                  </div>
                )}
              </div>

              {/* Accordion 4: Garment Care */}
              <div>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'care' ? null : 'care')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-widest text-ink font-medium hover:text-accent transition-colors"
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
                  className="w-full py-4 flex items-center justify-between text-left text-xs uppercase tracking-widest text-ink font-medium hover:text-accent transition-colors"
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

        {/* CUSTOMER REVIEWS & CONNOISSEUR TESTIMONIALS */}
        <section className="mt-20 pt-16 border-t border-stone/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-stone/40">
            <div>
              <span className="text-[10px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
                Client Testimonials
              </span>
              <h2 className="font-serif text-3xl text-ink mt-1">
                Connoisseur Reviews
              </h2>
            </div>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="mt-4 sm:mt-0 px-4 py-2 bg-ink text-cream text-xs uppercase tracking-widest font-sans hover:bg-accent transition-colors"
            >
              Write Atelier Review ✦
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(reviews || []).map((rev) => (
              <div key={rev.id} className="p-6 bg-paper border border-stone/70 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-accent text-sm">{'★'.repeat(rev.rating)}</span>
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider">{rev.createdAt}</span>
                </div>
                <h4 className="font-serif text-base text-ink font-medium">{rev.title}</h4>
                <p className="text-xs text-ink-muted font-light mt-2 leading-relaxed">{rev.comment}</p>
                <div className="mt-4 pt-3 border-t border-stone/40 flex items-center justify-between text-[11px]">
                  <span className="text-ink font-medium">{rev.author}</span>
                  {rev.verified && (
                    <span className="text-accent text-[10px] uppercase tracking-wider">
                      Verified Collector ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FREQUENTLY STITCHED TOGETHER / RECOMMENDATIONS */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-stone/60">
            <div className="mb-8">
              <span className="text-[10px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
                Curated Wardrobe
              </span>
              <h2 className="font-serif text-3xl text-ink mt-1">
                Frequently Stitched Together
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => {
                const relVariant = getDefaultVariant(rel);
                return (
                  <Link
                    key={rel.slug}
                    to={`/product/${rel.slug}`}
                    className="group block bg-paper border border-stone/70 p-3 hover:border-ink/50 transition-colors"
                  >
                    <div className="aspect-[3/4] bg-stone/20 overflow-hidden relative mb-3">
                      <img
                        src={rel.images[0]?.src || '/images/placeholders/hero.jpg'}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {rel.embroidery && (
                        <span className="absolute bottom-2 left-2 bg-cream/90 text-ink text-[9px] uppercase tracking-widest px-2 py-0.5">
                          {rel.embroidery.techniqueLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif text-sm text-ink group-hover:text-accent transition-colors">
                        {rel.name}
                      </h4>
                      <span className="font-sans text-xs font-medium text-ink">
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

      {/* Sizing Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.categorySlug}
      />

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[480] flex items-center justify-center p-4">
          <div
            onClick={() => setIsReviewModalOpen(false)}
            className="fixed inset-0 bg-ink/70 backdrop-blur-md"
          />
          <div className="relative w-full max-w-lg bg-paper border border-stone shadow-2xl rounded-sm p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200">
            <h3 className="font-serif text-2xl text-ink">Submit Connoisseur Review</h3>
            <p className="text-xs text-ink-muted mt-1">Share your thoughts on the needlecraft and fit of {product.name}.</p>
            
            <form onSubmit={handleReviewSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
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
                <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex gap-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`px-3 py-1 text-xs border ${
                        reviewRating === star ? 'bg-ink text-cream border-ink' : 'border-stone text-ink'
                      }`}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
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
                <label className="block text-[11px] uppercase tracking-wider text-ink font-medium mb-1">
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
                <span className="text-[10px] text-ink-muted uppercase tracking-widest font-sans">
                  Edition {product.batchNumber || 12}/{product.batchTotal || 50} • {currentVariant.color} / {currentVariant.size}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-sans text-base sm:text-lg font-medium text-ink block leading-none">
                  {formatPrice(currentVariant.priceCents)}
                </span>
                <span className="text-[10px] text-accent font-medium font-sans">
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
