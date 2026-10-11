import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useProducts, useUniverses, useMotifsByUniverse } from '../hooks/useCatalog';
import { useToastStore } from '../stores/toast';
import {
  formatPrice,
  VIBES,
  MOODS,
  type Vibe,
  type MoodSlug,
  type Gender,
  type EmbroideryTechnique,
} from '../lib/data';
import { NotFound } from './NotFound';

interface VariantForm {
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  price: number; // in normal currency, e.g. 380
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  quantity: number;
}

const TECHNIQUE_OPTIONS: { value: EmbroideryTechnique; label: string; defaultStory: string }[] = [
  {
    value: 'botanical-chain',
    label: 'Kashmiri Hand-Hooked Aari Chain Stitch',
    defaultStory: 'Intricate chain-stitch loops hand-worked using an awl needle (Aari), depicting traditional foliage and flora.',
  },
  {
    value: 'hand-zardozi',
    label: 'Authentic Hand Zardozi Wirework',
    defaultStory: 'Coiled bullion metallic wires and French spring spirals hand-anchored stitch-by-stitch onto heavyweight textile.',
  },
  {
    value: 'metallic-zari',
    label: 'Metallic Zari Thread Inlay & Tilla',
    defaultStory: 'Continuous metallic silver-gilt cords couched with pure silk core thread along architectural lines.',
  },
  {
    value: 'crewel-needlework',
    label: 'Jacobean Raised Crewel Needlework',
    defaultStory: 'Textured Appleton wool needlecraft producing dimensional botanical moss, stem, and blossom reliefs.',
  },
  {
    value: 'kantha-quilt',
    label: 'Traditional Kantha Running Stitch Quilt',
    defaultStory: 'Rhythmic parallel running stitches binding organic cotton textiles with centuries-old Bengali needlecraft.',
  },
  {
    value: 'french-knot',
    label: 'Hand-Wound French Knot Needlecraft',
    defaultStory: 'Micro-sculpted tactile spiral knots delivering an organic pebble-grain dimension that catches natural light.',
  },
  {
    value: 'satin-stitch',
    label: 'Fine Shaded Silk Satin Stitch',
    defaultStory: 'High-density silk floss laid flush to create unbroken color gradients and lustrous featherweight petals.',
  },
  {
    value: 'monogram-bespoke',
    label: 'Bespoke Atelier Monogram & Crest',
    defaultStory: 'Precision hand-guided satin stitches tailored to unique patron initials with archival Gutterman thread.',
  },
];

const PRESET_COLORS = [
  { name: 'Obsidian Noir', hex: '#121214' },
  { name: 'Natural Ecru', hex: '#f4efe6' },
  { name: 'Indigo Wash', hex: '#1d2a44' },
  { name: 'Oatmeal Beige', hex: '#d9d2c5' },
  { name: 'Muted Terracotta', hex: '#c06b52' },
  { name: 'Charcoal Heather', hex: '#2c2c2e' },
  { name: 'Paper White', hex: '#ffffff' },
  { name: 'Forest Olive', hex: '#2d382e' },
];

const PRESET_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const PRESET_REGIONS = [
  { region: 'Srinagar, Jammu & Kashmir', cluster: 'Valley Aari Needlecraft Guild' },
  { region: 'Lucknow, Uttar Pradesh', cluster: 'Chikankari & Silk Chain Guild' },
  { region: 'Jaipur, Rajasthan', cluster: 'Pink City Zardozi Bullion Guild' },
  { region: 'Bolpur & Murshidabad, West Bengal', cluster: 'Shantiniketan Kantha Collective' },
  { region: 'Shimla, Himachal Pradesh', cluster: 'Himalayan Hand-Knit Cluster' },
  { region: 'Ahmedabad, Gujarat', cluster: 'Sabarmati Heavy Duck Canvas Guild' },
];

const PRESET_IMAGES = [
  { label: 'Botanical Jacket 1', src: '/images/products/botanical-silk-jacket-1.png' },
  { label: 'Botanical Jacket 2', src: '/images/products/botanical-silk-jacket-2.png' },
  { label: 'Celestial Coat 1', src: '/images/products/celestial-zardozi-coat-1.png' },
  { label: 'Celestial Coat 2', src: '/images/products/celestial-zardozi-coat-2.png' },
  { label: 'Crewel Cardigan 1', src: '/images/products/crewel-cashmere-cardigan-1.png' },
  { label: 'Crewel Cardigan 2', src: '/images/products/crewel-cashmere-cardigan-2.png' },
  { label: 'Silk Scarf 1', src: '/images/products/embroidered-silk-scarf-1.png' },
];

const AdminStudio: React.FC = () => {

  const showToast = useToastStore((s) => s.showToast);
  const { data: existingProducts, isLoading } = useProducts();

  const [activeTab, setActiveTab] = useState<'create' | 'catalog' | 'sql-help'>('create');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [subtitle, setSubtitle] = useState('');
  const [foreignTagline, setForeignTagline] = useState('');
  const [description, setDescription] = useState('');
  const [categorySlug, setCategorySlug] = useState<'outerwear' | 'knitwear' | 'tops' | 'bottoms' | 'accessories'>('tops');
  const [universeSlug, setUniverseSlug] = useState<'animeverse' | 'heroverse' | 'itihaas'>('itihaas');
  const [gender, setGender] = useState<Gender>('unisex');
  const [garmentType, setGarmentType] = useState('tops');
  const [motifId, setMotifId] = useState('');
  const [tagsInput, setTagsInput] = useState('tops, embroidery, handcrafted');
  const [selectedVibes, setSelectedVibes] = useState<Vibe[]>(['aesthetic', 'clean']);
  const [selectedMoods, setSelectedMoods] = useState<MoodSlug[]>(['everyday', 'heritage']);
  const [featured, setFeatured] = useState(true);
  const [customizable, setCustomizable] = useState(true);
  const [handcrafted, setHandcrafted] = useState(true);

  const { data: universes } = useUniverses();
  const { data: motifs } = useMotifsByUniverse(universeSlug);

  // Craft & Provenance
  const [technique, setTechnique] = useState<EmbroideryTechnique>('botanical-chain');
  const [techniqueLabel, setTechniqueLabel] = useState(TECHNIQUE_OPTIONS[0].label);
  const [artisanHours, setArtisanHours] = useState(12);
  const [placementInput, setPlacementInput] = useState('Chest Pocket, Back Collar Yoke');
  const [threadComposition, setThreadComposition] = useState('100% Spun Mulberry Silk Floss');
  const [motifStory, setMotifStory] = useState(TECHNIQUE_OPTIONS[0].defaultStory);

  // Production Metrics
  const [craftRegion, setCraftRegion] = useState('Srinagar, Jammu & Kashmir');
  const [craftCluster, setCraftCluster] = useState('Valley Aari Needlecraft Guild');
  const [fabricGsm, setFabricGsm] = useState('280 GSM Ringspun Combed Cotton');
  const [batchNumber, setBatchNumber] = useState(1);
  const [batchTotal, setBatchTotal] = useState(50);
  const [materialsInput, setMaterialsInput] = useState('100% GOTS Organic Cotton, Mulberry Silk Floss');
  const [careInput, setCareInput] = useState('Machine wash gentle cold (30°C) inside out, Line dry in shade');
  const [fit, setFit] = useState('Boxy atelier drop-shoulder fit, true to size');

  // Images
  const [image1Src, setImage1Src] = useState('/images/products/botanical-silk-jacket-1.png');
  const [image1Alt, setImage1Alt] = useState('');
  const [image2Src, setImage2Src] = useState('/images/products/botanical-silk-jacket-2.png');
  const [image2Alt, setImage2Alt] = useState('');
  const [isUploading1, setIsUploading1] = useState(false);
  const [isUploading2, setIsUploading2] = useState(false);

  // Upload directly to Supabase Storage CDN
  const handleUploadImage = async (file: File, target: 1 | 2) => {
    if (!file) return;
    const setUploading = target === 1 ? setIsUploading1 : setIsUploading2;
    const setSrc = target === 1 ? setImage1Src : setImage2Src;

    // Set immediate preview
    const localPreviewUrl = URL.createObjectURL(file);

    if (!isSupabaseConfigured() || !supabase) {
      setSrc(localPreviewUrl);
      showToast({
        title: 'Preview Loaded',
        description: 'Local preview active. Configure Supabase to upload to Cloud CDN.',
        type: 'info',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanSlug = (slug || 'product').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      const fileName = `${cleanSlug}-${target}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setSrc(publicUrlData.publicUrl);
      showToast({
        title: '✦ Image Uploaded to CDN',
        description: 'Public URL generated and embedded into your JSON & SQL!',
        type: 'success',
      });
    } catch (err: any) {
      console.warn('[Storage Upload Error]:', err);
      // Fallback to local preview so user still sees the picture
      setSrc(localPreviewUrl);
      showToast({
        title: 'Storage Bucket Notice',
        description: `Could not save to bucket "${err?.message || 'product-images'}". Check SQL tab to create bucket!`,
        type: 'info',
      });
    } finally {
      setUploading(false);
    }
  };

  // Variants Generator State
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Obsidian Noir', hex: '#121214' },
    { name: 'Natural Ecru', hex: '#f4efe6' },
  ]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L']);
  const [defaultPrice, setDefaultPrice] = useState<number>(28220);
  const [variants, setVariants] = useState<VariantForm[]>([
    {
      sku: 'top-obs-s',
      color: 'Obsidian Noir',
      colorHex: '#121214',
      size: 'S',
      price: 28220,
      status: 'in-stock',
      quantity: 10,
    },
    {
      sku: 'top-obs-m',
      color: 'Obsidian Noir',
      colorHex: '#121214',
      size: 'M',
      price: 28220,
      status: 'in-stock',
      quantity: 10,
    },
    {
      sku: 'top-obs-l',
      color: 'Obsidian Noir',
      colorHex: '#121214',
      size: 'L',
      price: 28220,
      status: 'low-stock',
      quantity: 2,
    },
    {
      sku: 'top-ecr-m',
      color: 'Natural Ecru',
      colorHex: '#f4efe6',
      size: 'M',
      price: 28220,
      status: 'in-stock',
      quantity: 8,
    },
  ]);

  // Handle Name Change with Auto-Slug
  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generated);
      if (!image1Alt) setImage1Alt(`${val} — front view`);
      if (!image2Alt) setImage2Alt(`${val} — macro stitch relief`);
    }
  };

  // Handle Technique Change
  const handleTechniqueChange = (t: EmbroideryTechnique) => {
    setTechnique(t);
    const found = TECHNIQUE_OPTIONS.find((item) => item.value === t);
    if (found) {
      setTechniqueLabel(found.label);
      setMotifStory(found.defaultStory);
    }
  };

  // Generate Matrix
  const handleGenerateMatrix = () => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      showToast({ title: 'Select Options', description: 'Choose at least 1 color and 1 size to generate variants.', type: 'info' });
      return;
    }
    const cleanPrefix = (slug || 'prod')
      .split('-')
      .map((part) => part[0])
      .join('')
      .slice(0, 4);

    const generated: VariantForm[] = [];
    selectedColors.forEach((col) => {
      const colShort = col.name.slice(0, 3).toLowerCase();
      selectedSizes.forEach((sz) => {
        generated.push({
          sku: `${cleanPrefix}-${colShort}-${sz.toLowerCase()}`,
          color: col.name,
          colorHex: col.hex,
          size: sz,
          price: defaultPrice,
          status: 'in-stock',
          quantity: 10,
        });
      });
    });
    setVariants(generated);
    showToast({ title: 'Variants Generated', description: `Created ${generated.length} variant SKUs.`, type: 'accent' });
  };

  // Build SQL Statement String
  const generatedSQL = useMemo(() => {
    const finalSlug = slug || 'new-product-slug';
    const tagsArr = tagsInput.split(',').map((t) => `'${t.trim()}'`).filter(Boolean).join(', ');
    const vibesArr = selectedVibes.map((v) => `'${v}'`).join(', ');
    const moodsArr = selectedMoods.map((m) => `'${m}'`).join(', ');
    const matArr = materialsInput.split(',').map((t) => `'${t.trim()}'`).filter(Boolean).join(', ');
    const careArr = careInput.split(',').map((t) => `'${t.trim()}'`).filter(Boolean).join(', ');
    const placeArr = placementInput.split(',').map((t) => `'${t.trim()}'`).filter(Boolean).join(', ');

    return `-- ====================================================================
-- UniqueLo SQL: Add "${name || 'New Product'}"
-- Current Schema: Fully synchronized with Universe, Gender & Craft Taxonomy
-- ====================================================================

-- 1. Insert Base Product
INSERT INTO public.products (
  slug, name, subtitle, foreign_tagline, description, category_slug, universe_slug,
  garment_type, gender, motif_id, is_mock, handcrafted, vibes, moods,
  rating, review_count, sold_count, tags, featured, customizable,
  material, care, fit, batch_number, batch_total, craft_region, craft_cluster, fabric_gsm
) VALUES (
  '${finalSlug}',
  '${name.replace(/'/g, "''")}',
  '${subtitle.replace(/'/g, "''")}',
  ${foreignTagline ? `'${foreignTagline.replace(/'/g, "''")}'` : 'NULL'},
  '${description.replace(/'/g, "''")}',
  '${categorySlug}',
  '${universeSlug}',
  '${garmentType.replace(/'/g, "''")}',
  '${gender}',
  ${motifId ? `'${motifId.replace(/'/g, "''")}'` : 'NULL'},
  false,
  ${handcrafted},
  ARRAY[${vibesArr}],
  ARRAY[${moodsArr}],
  5.0,
  12,
  '50+',
  ARRAY[${tagsArr}],
  ${featured},
  ${customizable},
  ARRAY[${matArr}],
  ARRAY[${careArr}],
  '${fit.replace(/'/g, "''")}',
  ${batchNumber},
  ${batchTotal},
  '${craftRegion.replace(/'/g, "''")}',
  '${craftCluster.replace(/'/g, "''")}',
  '${fabricGsm.replace(/'/g, "''")}'
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  foreign_tagline = EXCLUDED.foreign_tagline,
  description = EXCLUDED.description,
  category_slug = EXCLUDED.category_slug,
  universe_slug = EXCLUDED.universe_slug,
  garment_type = EXCLUDED.garment_type,
  gender = EXCLUDED.gender,
  motif_id = EXCLUDED.motif_id,
  handcrafted = EXCLUDED.handcrafted,
  vibes = EXCLUDED.vibes,
  moods = EXCLUDED.moods,
  featured = EXCLUDED.featured;

-- 2. Insert Images
INSERT INTO public.product_images (product_slug, src, alt, color, sort_order) 
VALUES 
  ('${finalSlug}', '${image1Src}', '${(image1Alt || name).replace(/'/g, "''")}', '${(variants[0]?.colorHex || '#121214').replace(/'/g, "''")}', 0),
  ('${finalSlug}', '${image2Src}', '${(image2Alt || name).replace(/'/g, "''")}', '${(variants[0]?.colorHex || '#121214').replace(/'/g, "''")}', 1);

-- 3. Insert Variants
INSERT INTO public.variants (sku, product_slug, color, color_hex, size, price_cents, status, quantity) 
VALUES 
${variants
  .map(
    (v) =>
      `  ('${v.sku}', '${finalSlug}', '${v.color}', '${v.colorHex}', '${v.size}', ${Math.round(v.price * 100)}, '${v.status}', ${v.quantity})`
  )
  .join(',\n')}
ON CONFLICT (sku) DO NOTHING;

-- 4. Insert Craft & Embroidery Provenance
INSERT INTO public.embroidery_details (
  product_slug, technique, technique_label, artisan_hours, 
  placement, thread_composition, motif_story
) VALUES (
  '${finalSlug}',
  '${technique}',
  '${techniqueLabel.replace(/'/g, "''")}',
  ${artisanHours},
  ARRAY[${placeArr}],
  '${threadComposition.replace(/'/g, "''")}',
  '${motifStory.replace(/'/g, "''")}'
) ON CONFLICT (product_slug) DO UPDATE SET
  technique = EXCLUDED.technique,
  technique_label = EXCLUDED.technique_label,
  artisan_hours = EXCLUDED.artisan_hours;
`;
  }, [
    slug,
    name,
    subtitle,
    foreignTagline,
    description,
    categorySlug,
    universeSlug,
    garmentType,
    gender,
    motifId,
    handcrafted,
    selectedVibes,
    selectedMoods,
    tagsInput,
    featured,
    customizable,
    materialsInput,
    careInput,
    fit,
    batchNumber,
    batchTotal,
    craftRegion,
    craftCluster,
    fabricGsm,
    image1Src,
    image1Alt,
    image2Src,
    image2Alt,
    variants,
    technique,
    techniqueLabel,
    artisanHours,
    placementInput,
    threadComposition,
    motifStory,
  ]);

  // Build JSON Object String
  const generatedJSON = useMemo(() => {
    const finalSlug = slug || 'new-product-slug';
    const obj = {
      slug: finalSlug,
      name,
      subtitle,
      foreignTagline: foreignTagline || undefined,
      description,
      categorySlug,
      universeSlug,
      garmentType,
      gender,
      motifId: motifId || undefined,
      isMock: false,
      handcrafted,
      vibes: selectedVibes,
      moods: selectedMoods,
      rating: 5.0,
      reviewCount: 12,
      soldCount: '50+',
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      variants: variants.map((v) => ({
        sku: v.sku,
        color: v.color,
        colorHex: v.colorHex,
        size: v.size,
        priceCents: Math.round(v.price * 100),
        status: v.status,
        quantity: v.quantity,
      })),
      images: [
        { src: image1Src, alt: image1Alt || name, color: variants[0]?.colorHex || '#121214' },
        { src: image2Src, alt: image2Alt || name, color: variants[0]?.colorHex || '#121214' },
      ],
      featured,
      customizable,
      material: materialsInput.split(',').map((t) => t.trim()).filter(Boolean),
      care: careInput.split(',').map((t) => t.trim()).filter(Boolean),
      fit,
      batchNumber,
      batchTotal,
      craftRegion,
      craftCluster,
      fabricGsm,
      embroidery: {
        technique,
        techniqueLabel,
        artisanHours,
        placement: placementInput.split(',').map((t) => t.trim()).filter(Boolean),
        threadComposition,
        motifStory,
      },
    };
    return JSON.stringify(obj, null, 2);
  }, [
    slug,
    name,
    subtitle,
    foreignTagline,
    description,
    categorySlug,
    universeSlug,
    garmentType,
    gender,
    motifId,
    handcrafted,
    selectedVibes,
    selectedMoods,
    tagsInput,
    variants,
    image1Src,
    image1Alt,
    image2Src,
    image2Alt,
    featured,
    customizable,
    materialsInput,
    careInput,
    fit,
    batchNumber,
    batchTotal,
    craftRegion,
    craftCluster,
    fabricGsm,
    technique,
    techniqueLabel,
    artisanHours,
    placementInput,
    threadComposition,
    motifStory,
  ]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast({ title: 'Copied to Clipboard', description: `${label} copied successfully.`, type: 'accent' });
  };

  return (
    <div className="w-full bg-cream min-h-screen text-ink pb-24">
      {/* Studio Header */}
      <section className="bg-paper border-b border-stone/50 pt-10 pb-8">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
                <Link to="/" className="hover:underline">Home</Link>
                <span>/</span>
                <span className="text-ink">Atelier Studio</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-ink mt-2 tracking-tight">
                Product Catalog Studio
              </h1>
              <p className="text-xs text-ink-muted mt-1 font-light max-w-xl">
                Create handcrafted editions, configure multi-size variants, preview embroidery relief imagery, and publish directly to Supabase.
              </p>
            </div>

            {/* Connection Badge */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-cream border border-stone/60 text-xs font-sans flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-medium text-[11px] uppercase tracking-wider">
                  {isSupabaseConfigured() ? 'Supabase Connected' : 'Local Fallback Mode'}
                </span>
              </div>
              <Link
                to="/shop"
                className="px-4 py-1.5 bg-ink text-cream hover:bg-ink-muted text-xs font-sans uppercase tracking-widest transition-colors"
              >
                View Shop →
              </Link>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-6 mt-8 border-b border-stone/30">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`pb-3 text-xs uppercase tracking-widest font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'create'
                  ? 'border-accent text-accent font-semibold'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              ✦ 1. Product Studio Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`pb-3 text-xs uppercase tracking-widest font-medium transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'border-accent text-accent font-semibold'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <span>Catalog Overview</span>
              <span className="px-1.5 py-0.2 bg-stone/20 text-[10px] font-mono">
                {existingProducts?.length ?? 0}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sql-help')}
              className={`pb-3 text-xs uppercase tracking-widest font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === 'sql-help'
                  ? 'border-accent text-accent font-semibold'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              Database Permissions & SQL
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 mt-8">
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Interactive Form */}
            <div className="lg:col-span-8 space-y-8">
              {/* Card 1: Core Identification */}
              <div className="bg-paper p-6 sm:p-8 border border-stone/60 shadow-sm space-y-6">
                <div className="border-b border-stone/30 pb-3">
                  <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-accent font-semibold">Step 1</span>
                  <h2 className="font-serif text-xl text-ink mt-0.5">Core Product Identity</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Royal Aari Organic Cotton Tee"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-accent transition-colors font-medium placeholder-ink-muted/40"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        URL Slug *
                      </label>
                      <button
                        type="button"
                        onClick={() => setAutoSlug(!autoSlug)}
                        className="text-[10px] text-accent hover:underline uppercase tracking-wider"
                      >
                        {autoSlug ? '🔒 Auto-Generating' : '🔓 Custom Edit'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={slug}
                      readOnly={autoSlug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="royal-aari-organic-tee"
                      className={`w-full border px-3.5 py-2 text-xs font-mono transition-colors ${
                        autoSlug ? 'bg-stone/10 border-stone/40 text-ink-muted' : 'bg-cream border-stone/60 text-ink focus:border-accent'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Category *
                    </label>
                    <select
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value as any)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent capitalize"
                    >
                      <option value="tops">Tops & Shirts</option>
                      <option value="outerwear">Outerwear & Jackets</option>
                      <option value="knitwear">Knitwear & Cashmere</option>
                      <option value="bottoms">Bottoms & Trousers</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Universe (World) *
                    </label>
                    <select
                      value={universeSlug}
                      onChange={(e) => setUniverseSlug(e.target.value as any)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent capitalize font-medium"
                    >
                      {(universes ?? [
                        { slug: 'itihaas', name: 'Itihaas' },
                        { slug: 'animeverse', name: 'Animeverse' },
                        { slug: 'heroverse', name: 'Heroverse' },
                      ]).map((u) => (
                        <option key={u.slug} value={u.slug}>
                          {u.name} ({u.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Gender Facet *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent capitalize"
                    >
                      <option value="unisex">Unisex (Both Men & Women Surfaces)</option>
                      <option value="men">Men Only</option>
                      <option value="women">Women Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Garment Type *
                    </label>
                    <input
                      type="text"
                      value={garmentType}
                      onChange={(e) => setGarmentType(e.target.value.toLowerCase())}
                      placeholder="e.g. tee, hoodie, jacket, cardigan, trousers, tote"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent lowercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Foreign Script Tagline
                    </label>
                    <input
                      type="text"
                      value={foreignTagline}
                      onChange={(e) => setForeignTagline(e.target.value)}
                      placeholder="e.g. वानस्पतिक रेशम or 桜 浪人"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Lore Motif (Optional)
                    </label>
                    <select
                      value={motifId}
                      onChange={(e) => setMotifId(e.target.value)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="">None / Standalone</option>
                      {(motifs ?? []).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Editorial Subtitle
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="280 GSM heavyweight jersey with hand-hooked chain-stitch crest"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent placeholder-ink-muted/40"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Story & Atelier Description
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Cut from custom 280 GSM combed organic cotton jersey, finished with hand-hooked Kashmiri Aari floral needlework on the chest pocket..."
                      className="w-full bg-cream border border-stone/60 p-3 text-xs text-ink focus:outline-none focus:border-accent placeholder-ink-muted/40 leading-relaxed font-light"
                    />
                  </div>

                  {/* Style Vibes Selector */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-2 font-medium">
                      Style Vibes (Powers Explore-by-Style Gateway)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {VIBES.map((v) => {
                        const isSel = selectedVibes.includes(v.slug);
                        return (
                          <button
                            key={v.slug}
                            type="button"
                            onClick={() => {
                              setSelectedVibes(
                                isSel
                                  ? selectedVibes.filter((s) => s !== v.slug)
                                  : [...selectedVibes, v.slug]
                              );
                            }}
                            className={`px-3 py-1 text-xs border transition-colors cursor-pointer capitalize font-sans ${
                              isSel
                                ? 'border-accent bg-accent/15 text-accent font-semibold'
                                : 'border-stone/40 bg-cream text-ink-muted hover:border-ink-muted'
                            }`}
                          >
                            {isSel ? '✓ ' : '+ '}
                            {v.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Intent Moods Selector */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-2 font-medium">
                      Intent Moods (Powers Explore-by-Mood Gateway)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MOODS.map((m) => {
                        const isSel = selectedMoods.includes(m.slug);
                        return (
                          <button
                            key={m.slug}
                            type="button"
                            onClick={() => {
                              setSelectedMoods(
                                isSel
                                  ? selectedMoods.filter((s) => s !== m.slug)
                                  : [...selectedMoods, m.slug]
                              );
                            }}
                            className={`px-3 py-1 text-xs border transition-colors cursor-pointer capitalize font-sans ${
                              isSel
                                ? 'border-accent bg-accent/15 text-accent font-semibold'
                                : 'border-stone/40 bg-cream text-ink-muted hover:border-ink-muted'
                            }`}
                          >
                            {isSel ? '✓ ' : '+ '}
                            {m.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="tee, aari, tops, organic, heavyweight"
                      className="w-full bg-cream border border-stone/60 px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tagsInput.split(',').map((t, idx) => {
                        const clean = t.trim();
                        if (!clean) return null;
                        return (
                          <span key={idx} className="px-2 py-0.5 bg-stone/20 text-[10px] text-ink-muted uppercase tracking-wider">
                            #{clean}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 sm:col-span-2 pt-2 border-t border-stone/20">
                    <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="w-4 h-4 accent-accent cursor-pointer"
                      />
                      <span className="font-medium">Featured Product (Highlight on Homepage Reel)</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={customizable}
                        onChange={(e) => setCustomizable(e.target.checked)}
                        className="w-4 h-4 accent-accent cursor-pointer"
                      />
                      <span className="font-medium">Enable Bespoke Monogram Customizer</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={handcrafted}
                        onChange={(e) => setHandcrafted(e.target.checked)}
                        className="w-4 h-4 accent-accent cursor-pointer"
                      />
                      <span className="font-medium text-accent">✦ Authentic Handcrafted Piece (Enables Luxury Tag)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 2: Craft & Embroidery Provenance */}
              <div className="bg-paper p-6 sm:p-8 border border-stone/60 shadow-sm space-y-6">
                <div className="border-b border-stone/30 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-accent font-semibold">Step 2</span>
                    <h2 className="font-serif text-xl text-ink mt-0.5">Embroidery & Craft Provenance</h2>
                  </div>
                  <span className="text-xs text-ink-muted font-serif italic">Indian Atelier Heritage</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Craft Technique *
                    </label>
                    <select
                      value={technique}
                      onChange={(e) => handleTechniqueChange(e.target.value as any)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent capitalize"
                    >
                      {TECHNIQUE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} ({opt.value})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Artisan Hand Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={artisanHours}
                      onChange={(e) => setArtisanHours(parseInt(e.target.value) || 0)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Technique Display Label
                    </label>
                    <input
                      type="text"
                      value={techniqueLabel}
                      onChange={(e) => setTechniqueLabel(e.target.value)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Thread Composition
                    </label>
                    <input
                      type="text"
                      value={threadComposition}
                      onChange={(e) => setThreadComposition(e.target.value)}
                      placeholder="100% Spun Mulberry Silk Floss"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Stitch Placements (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={placementInput}
                      onChange={(e) => setPlacementInput(e.target.value)}
                      placeholder="Chest Pocket, Back Collar Yoke"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Motif Story
                    </label>
                    <textarea
                      rows={2}
                      value={motifStory}
                      onChange={(e) => setMotifStory(e.target.value)}
                      className="w-full bg-cream border border-stone/60 p-3 text-xs text-ink focus:outline-none focus:border-accent leading-relaxed font-light"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Fabric & Production Batch */}
              <div className="bg-paper p-6 sm:p-8 border border-stone/60 shadow-sm space-y-6">
                <div className="border-b border-stone/30 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-accent font-semibold">Step 3</span>
                    <h2 className="font-serif text-xl text-ink mt-0.5">Textile & Workshop Batch</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Quick Preset Regional Cluster
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_REGIONS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCraftRegion(preset.region);
                            setCraftCluster(preset.cluster);
                          }}
                          className={`px-2.5 py-1 text-[11px] border text-left cursor-pointer transition-colors ${
                            craftRegion === preset.region
                              ? 'border-accent bg-accent/10 text-accent font-medium'
                              : 'border-stone/40 bg-cream text-ink-muted hover:border-ink-muted'
                          }`}
                        >
                          {preset.region.split(',')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Craft Region
                    </label>
                    <input
                      type="text"
                      value={craftRegion}
                      onChange={(e) => setCraftRegion(e.target.value)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Craft Cluster / Guild
                    </label>
                    <input
                      type="text"
                      value={craftCluster}
                      onChange={(e) => setCraftCluster(e.target.value)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Fabric Weight / GSM
                    </label>
                    <input
                      type="text"
                      value={fabricGsm}
                      onChange={(e) => setFabricGsm(e.target.value)}
                      placeholder="280 GSM Ringspun Combed Cotton"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                        Batch Run #
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={batchNumber}
                        onChange={(e) => setBatchNumber(parseInt(e.target.value) || 1)}
                        className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                        Total In Run
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={batchTotal}
                        onChange={(e) => setBatchTotal(parseInt(e.target.value) || 50)}
                        className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Materials Composition (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={materialsInput}
                      onChange={(e) => setMaterialsInput(e.target.value)}
                      placeholder="100% GOTS Organic Cotton, Mulberry Silk Floss"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Care Guidelines (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={careInput}
                      onChange={(e) => setCareInput(e.target.value)}
                      placeholder="Machine wash gentle cold (30°C) inside out, Line dry in shade"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                      Garment Fit Description
                    </label>
                    <input
                      type="text"
                      value={fit}
                      onChange={(e) => setFit(e.target.value)}
                      placeholder="Boxy atelier drop-shoulder fit, true to size"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Variant Matrix Generator */}
              <div className="bg-paper p-6 sm:p-8 border border-stone/60 shadow-sm space-y-6">
                <div className="border-b border-stone/30 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-accent font-semibold">Step 4</span>
                    <h2 className="font-serif text-xl text-ink mt-0.5">Variant Matrix & Pricing</h2>
                  </div>
                  <span className="text-xs text-ink-muted font-mono">{variants.length} Variants</span>
                </div>

                {/* Generator Controls */}
                <div className="p-4 bg-cream border border-stone/40 space-y-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink block">
                    Quick Variant Generator
                  </span>

                  <div>
                    <label className="block text-[11px] text-ink-muted uppercase tracking-wider mb-2">
                      Choose Colors
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((col, idx) => {
                        const isSel = selectedColors.some((c) => c.hex === col.hex);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (isSel) {
                                setSelectedColors(selectedColors.filter((c) => c.hex !== col.hex));
                              } else {
                                setSelectedColors([...selectedColors, col]);
                              }
                            }}
                            className={`flex items-center gap-2 px-2.5 py-1 text-xs border transition-colors cursor-pointer ${
                              isSel ? 'border-accent bg-paper font-medium text-ink' : 'border-stone/40 text-ink-muted bg-paper/50'
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: col.hex }} />
                            <span>{col.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-ink-muted uppercase tracking-wider mb-2">
                      Choose Sizes
                    </label>
                    <div className="flex gap-2">
                      {PRESET_SIZES.map((sz) => {
                        const isSel = selectedSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              if (isSel) {
                                setSelectedSizes(selectedSizes.filter((s) => s !== sz));
                              } else {
                                setSelectedSizes([...selectedSizes, sz]);
                              }
                            }}
                            className={`w-9 h-9 text-xs font-mono font-medium border flex items-center justify-center cursor-pointer transition-colors ${
                              isSel ? 'border-accent bg-accent text-cream' : 'border-stone/40 bg-paper text-ink-muted'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-ink-muted uppercase tracking-wider font-medium">Default Price (₹):</label>
                      <input
                        type="number"
                        value={defaultPrice}
                        onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
                        className="w-24 bg-paper border border-stone/60 px-2 py-1 text-xs font-mono font-bold text-ink"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateMatrix}
                      className="px-4 py-1.5 bg-accent text-cream hover:bg-accent-hover text-xs uppercase tracking-widest font-medium cursor-pointer transition-colors"
                    >
                      ✦ Re-Generate Variants
                    </button>
                  </div>
                </div>

                {/* Variants Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-cream border-y border-stone/30 text-[10px] uppercase tracking-widest text-ink-muted font-medium">
                      <tr>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Color</th>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone/20">
                      {variants.map((v, idx) => (
                        <tr key={idx} className="hover:bg-cream/50 transition-colors">
                          <td className="py-2 px-3 font-mono text-[11px] font-medium text-ink">
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => {
                                const copy = [...variants];
                                copy[idx].sku = e.target.value;
                                setVariants(copy);
                              }}
                              className="bg-transparent border-b border-dashed border-stone/50 w-24 focus:outline-none focus:border-accent"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: v.colorHex }} />
                              <span>{v.color}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold">{v.size}</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1 font-mono">
                              <span>₹</span>
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) => {
                                  const copy = [...variants];
                                  copy[idx].price = parseFloat(e.target.value) || 0;
                                  setVariants(copy);
                                }}
                                className="w-16 bg-transparent border-b border-dashed border-stone/50 focus:outline-none focus:border-accent font-bold"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={v.status}
                              onChange={(e) => {
                                const copy = [...variants];
                                copy[idx].status = e.target.value as any;
                                setVariants(copy);
                              }}
                              className="bg-transparent border border-stone/40 px-1.5 py-0.5 text-[11px]"
                            >
                              <option value="in-stock">In Stock</option>
                              <option value="low-stock">Low Stock</option>
                              <option value="out-of-stock">Out of Stock</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={v.quantity}
                              onChange={(e) => {
                                const copy = [...variants];
                                copy[idx].quantity = parseInt(e.target.value) || 0;
                                setVariants(copy);
                              }}
                              className="w-12 bg-transparent border-b border-dashed border-stone/50 text-center font-mono"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                              className="text-stone hover:text-red-600 transition-colors cursor-pointer text-sm"
                              title="Delete variant"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Image Previews & Action Deck */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              {/* Image Configuration & Previews */}
              <div className="bg-paper p-6 border border-stone/60 shadow-sm space-y-6">
                <div className="border-b border-stone/30 pb-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-accent font-semibold">Visuals</span>
                    <h3 className="font-serif text-lg text-ink">Product Imagery & Upload</h3>
                  </div>
                  <span className="text-[10px] text-ink-muted uppercase tracking-wider font-mono">
                    CDN Linked
                  </span>
                </div>

                {/* Image 1: Main Silhouette */}
                <div className="space-y-3 p-3.5 bg-cream/60 border border-stone/40 rounded-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-ink">
                      1. Main Silhouette Image (3:4)
                    </span>
                    {image1Src.startsWith('http') && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded">
                        CDN Active
                      </span>
                    )}
                  </div>

                  {/* Prominent Upload Button */}
                  <label className={`w-full py-2.5 px-3 border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isUploading1
                      ? 'border-accent bg-accent/10 text-accent font-medium'
                      : 'border-accent/50 bg-paper hover:border-accent hover:bg-accent/5 text-ink'
                  }`}>
                    <span className="text-base">{isUploading1 ? '⏳' : '📁'}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {isUploading1 ? 'Uploading to Supabase CDN...' : 'Upload Image from Device'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading1}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUploadImage(e.target.files[0], 1);
                      }}
                    />
                  </label>

                  {/* URL Display (embedded directly into JSON & SQL) */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-ink-muted mb-1 font-mono">
                      Image 1 URL (Embedded in JSON):
                    </label>
                    <input
                      type="text"
                      value={image1Src}
                      onChange={(e) => setImage1Src(e.target.value)}
                      placeholder="/images/products/... or https://..."
                      className="w-full bg-paper border border-stone/60 px-2.5 py-1 text-[11px] font-mono text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Preset quick picker */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[9px] text-ink-muted uppercase self-center mr-1">Presets:</span>
                    {PRESET_IMAGES.slice(0, 3).map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImage1Src(p.src)}
                        className="text-[9px] px-1.5 py-0.5 bg-paper border border-stone/40 hover:border-accent text-ink-muted"
                      >
                        {p.label.split(' ')[0]} {i + 1}
                      </button>
                    ))}
                  </div>

                  {/* Live Thumbnail Preview */}
                  <div className="aspect-[3/4] max-w-[180px] mx-auto bg-stone/10 border border-stone/40 overflow-hidden relative shadow-inner">
                    <img
                      src={image1Src}
                      alt="Front Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholders/hero.jpg';
                      }}
                    />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1.5 py-0.5 uppercase tracking-wider">
                      Silhouette (3:4)
                    </span>
                  </div>
                </div>

                {/* Image 2: Macro Loupe Detail */}
                <div className="space-y-3 p-3.5 bg-cream/60 border border-stone/40 rounded-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-ink">
                      2. Macro Stitch Relief (PDP Loupe)
                    </span>
                    {image2Src.startsWith('http') && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded">
                        CDN Active
                      </span>
                    )}
                  </div>

                  {/* Prominent Upload Button */}
                  <label className={`w-full py-2.5 px-3 border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isUploading2
                      ? 'border-accent bg-accent/10 text-accent font-medium'
                      : 'border-accent/50 bg-paper hover:border-accent hover:bg-accent/5 text-ink'
                  }`}>
                    <span className="text-base">{isUploading2 ? '⏳' : '🔍'}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {isUploading2 ? 'Uploading to Supabase CDN...' : 'Upload Macro Photo from Device'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading2}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUploadImage(e.target.files[0], 2);
                      }}
                    />
                  </label>

                  {/* URL Display (embedded directly into JSON & SQL) */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-ink-muted mb-1 font-mono">
                      Image 2 URL (Embedded in JSON):
                    </label>
                    <input
                      type="text"
                      value={image2Src}
                      onChange={(e) => setImage2Src(e.target.value)}
                      placeholder="/images/products/... or https://..."
                      className="w-full bg-paper border border-stone/60 px-2.5 py-1 text-[11px] font-mono text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Live Thumbnail Preview */}
                  <div className="aspect-[3/4] max-w-[180px] mx-auto bg-stone/10 border border-stone/40 overflow-hidden relative shadow-inner">
                    <img
                      src={image2Src}
                      alt="Macro Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholders/hero.jpg';
                      }}
                    />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1.5 py-0.5 uppercase tracking-wider">
                      Macro Relief
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Deck (Option 2: Air-Gapped Secure Workflow) */}
              <div className="bg-paper p-6 border border-stone/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone/30 pb-2">
                  <h3 className="font-serif text-lg text-ink">Publishing Deck</h3>
                  <span className="text-[10px] uppercase font-sans tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-medium">
                    🛡️ Air-Gapped Secure
                  </span>
                </div>

                <p className="text-[11px] text-ink-muted leading-relaxed font-light">
                  Public database write access is strictly locked down. All catalog updates run through your authenticated Supabase Console.
                </p>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedSQL, 'Ready-to-run multi-table SQL query')}
                  className="w-full py-3 bg-accent text-cream hover:bg-accent-hover transition-colors text-xs uppercase tracking-widest font-semibold cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>📋</span>
                  <span>Copy SQL Query (Ready to Run)</span>
                </button>

                {/* Direct Link to Supabase SQL Editor */}
                <a
                  href={`https://supabase.com/dashboard/project/${(import.meta.env.VITE_SUPABASE_URL || '').replace(/^https?:\/\//, '').split('.')[0] || 'heimnfjuwmmmejqcjbbd'}/sql/new`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-ink text-cream hover:bg-ink-muted transition-colors text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-2 text-center"
                >
                  <span>Open Supabase SQL Editor ↗</span>
                </a>

                {/* Copy JSON snippet */}
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedJSON, 'products.json snippet')}
                  className="w-full py-2 bg-cream border border-stone/60 hover:bg-stone/10 transition-colors text-xs uppercase tracking-widest font-medium text-ink cursor-pointer"
                >
                  Copy products.json Code (With Image URLs)
                </button>

                {/* JSON Preview Collapsible */}
                <details className="pt-1 text-xs text-ink-muted">
                  <summary className="cursor-pointer uppercase tracking-wider text-[10px] font-semibold text-accent hover:underline select-none">
                    Preview Generated JSON Object
                  </summary>
                  <pre className="mt-2 p-3 bg-ink text-cream font-mono text-[10px] rounded max-h-60 overflow-y-auto leading-relaxed border border-stone/40">
                    {generatedJSON}
                  </pre>
                </details>

                {/* SQL Code Preview Collapsible */}
                <details className="pt-2 border-t border-stone/20 text-xs text-ink-muted">
                  <summary className="cursor-pointer uppercase tracking-wider text-[10px] font-semibold text-accent hover:underline select-none">
                    View Generated SQL Statement
                  </summary>
                  <pre className="mt-2 p-3 bg-ink text-cream font-mono text-[10px] rounded max-h-60 overflow-y-auto leading-relaxed border border-stone/40">
                    {generatedSQL}
                  </pre>
                </details>

                {slug && (
                  <Link
                    to={`/product/${slug}`}
                    target="_blank"
                    className="block text-center text-xs text-accent hover:underline uppercase tracking-wider font-medium pt-2 border-t border-stone/20"
                  >
                    Preview Product Page (`/product/{slug}`) ↗
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Existing Catalog Overview */}
        {activeTab === 'catalog' && (
          <div className="bg-paper p-6 sm:p-8 border border-stone/60 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone/30 pb-4">
              <div>
                <h2 className="font-serif text-2xl text-ink">Active Atelier Catalog</h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  Showing all products queried live from database / seed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 bg-accent text-cream hover:bg-accent-hover text-xs uppercase tracking-widest font-medium cursor-pointer transition-colors"
              >
                + Add Another Product
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-ink-muted">Loading catalog...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-cream border-y border-stone/30 text-[10px] uppercase tracking-widest text-ink-muted font-medium">
                    <tr>
                      <th className="py-3 px-3">Product</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Technique</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Variants</th>
                      <th className="py-3 px-3">Batch</th>
                      <th className="py-3 px-3 text-right">View Live</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone/20">
                    {existingProducts?.map((product) => (
                      <tr key={product.slug} className="hover:bg-cream/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]?.src || '/images/placeholders/hero.jpg'}
                              alt={product.name}
                              className="w-10 h-12 object-cover border border-stone/40 bg-stone/10"
                            />
                            <div>
                              <span className="font-serif font-bold text-ink block">{product.name}</span>
                              <span className="font-mono text-[10px] text-ink-muted">{product.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-cream border border-stone/40 text-[10px] uppercase tracking-wider">
                            {product.categorySlug}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-ink-muted">
                          {product.embroidery?.techniqueLabel || '—'}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-ink">
                          {formatPrice(product.variants[0]?.priceCents ?? 0)}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {product.variants.length} SKUs
                        </td>
                        <td className="py-3 px-3 text-[11px] text-ink-muted">
                          Run {product.batchNumber ?? 1} / {product.batchTotal ?? 50}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/product/${product.slug}`}
                            className="text-accent hover:underline font-medium uppercase text-[11px] tracking-wider"
                          >
                            View PDP ↗
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: SQL Permissions & Helper */}
        {activeTab === 'sql-help' && (
          <div className="bg-paper p-6 sm:p-8 border border-stone/60 shadow-sm space-y-8">
            {/* Header */}
            <div className="border-b border-stone/30 pb-4">
              <div className="flex items-center gap-2 text-[10px] font-sans tracking-[0.2em] text-accent font-semibold uppercase">
                Database Redeployment & Schema Sync
              </div>
              <h2 className="font-serif text-2xl text-ink mt-1">
                Supabase Full Database Initialization & Seeding Guide
              </h2>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed max-w-3xl">
                Use the queries below to cleanly erase the previous database schema, create the updated relational architecture (including Universes, Motifs, Gender, and Craft taxonomies), and seed the 13 authentic atelier products with zero mock data.
              </p>
            </div>

            {/* Step 1: Wipe & Schema Creation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-widest text-accent font-semibold">Step 1</span>
                  <h3 className="font-serif text-base text-ink font-semibold">1. Complete Schema Wipe & Re-initialization (`supabase/schema.sql`)</h3>
                  <p className="text-[11px] text-ink-muted">
                    Drops previous deprecated tables and recreates the unified schema with all current columns, indexes, and RLS policies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `-- 1. Wipe Previous Tables\nDROP TABLE IF EXISTS public.order_items CASCADE;\nDROP TABLE IF EXISTS public.orders CASCADE;\nDROP TABLE IF EXISTS public.reviews CASCADE;\nDROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;\nDROP TABLE IF EXISTS public.embroidery_details CASCADE;\nDROP TABLE IF EXISTS public.product_images CASCADE;\nDROP TABLE IF EXISTS public.variants CASCADE;\nDROP TABLE IF EXISTS public.products CASCADE;\nDROP TABLE IF EXISTS public.motifs CASCADE;\nDROP TABLE IF EXISTS public.universes CASCADE;\nDROP TABLE IF EXISTS public.categories CASCADE;\n\n-- 2. Enable UUID Extension\nCREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n-- 3. Universes Table\nCREATE TABLE public.universes (\n  slug text PRIMARY KEY,\n  name text NOT NULL,\n  tagline text NOT NULL,\n  lore text NOT NULL,\n  emblem_src text,\n  hero_image text,\n  drop_cadence text,\n  is_active boolean DEFAULT true,\n  order_num integer DEFAULT 0,\n  theme_tokens jsonb DEFAULT '{}'::jsonb,\n  portal_title_color text,\n  lore_heading text,\n  hero_headline text,\n  hero_headline_accent text,\n  hero_lead_color text,\n  hero_accent_color text,\n  hero_headline_case text,\n  hero_kicker text,\n  hero_ornament text,\n  hero_note text,\n  hero_vertical_text text,\n  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\n-- 4. Motifs Table\nCREATE TABLE public.motifs (\n  id text PRIMARY KEY,\n  universe_slug text REFERENCES public.universes(slug) ON DELETE CASCADE NOT NULL,\n  name text NOT NULL,\n  meaning text NOT NULL,\n  symbol_notes text,\n  ip_cleared boolean DEFAULT true,\n  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\n-- 5. Categories Table\nCREATE TABLE public.categories (\n  slug text PRIMARY KEY,\n  name text NOT NULL,\n  label text NOT NULL,\n  description text NOT NULL,\n  image text,\n  order_num integer DEFAULT 0,\n  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\n-- 6. Products Table\nCREATE TABLE public.products (\n  slug text PRIMARY KEY,\n  name text NOT NULL,\n  subtitle text NOT NULL,\n  foreign_tagline text,\n  description text NOT NULL,\n  category_slug text REFERENCES public.categories(slug) ON DELETE SET NULL,\n  universe_slug text REFERENCES public.universes(slug) ON DELETE SET NULL,\n  garment_type text,\n  gender text DEFAULT 'unisex' CHECK (gender in ('men', 'women', 'unisex')),\n  motif_id text REFERENCES public.motifs(id) ON DELETE SET NULL,\n  is_mock boolean DEFAULT false,\n  handcrafted boolean DEFAULT false,\n  vibes text[] DEFAULT '{}',\n  moods text[] DEFAULT '{}',\n  rating numeric(3,1),\n  review_count integer DEFAULT 0,\n  sold_count text,\n  tags text[] DEFAULT '{}',\n  featured boolean DEFAULT false,\n  customizable boolean DEFAULT false,\n  material text[] DEFAULT '{}',\n  care text[] DEFAULT '{}',\n  fit text,\n  batch_number integer DEFAULT 1,\n  batch_total integer DEFAULT 50,\n  craft_region text,\n  craft_cluster text,\n  fabric_gsm text,\n  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\n-- 7. Variants Table\nCREATE TABLE public.variants (\n  sku text PRIMARY KEY,\n  product_slug text REFERENCES public.products(slug) ON DELETE CASCADE NOT NULL,\n  color text NOT NULL,\n  color_hex text NOT NULL,\n  size text NOT NULL,\n  price_cents integer NOT NULL,\n  compare_at_price_cents integer,\n  status text DEFAULT 'in-stock' CHECK (status in ('in-stock', 'low-stock', 'out-of-stock')),\n  quantity integer DEFAULT 10,\n  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\n-- 8. Product Images Table\nCREATE TABLE public.product_images (\n  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),\n  product_slug text REFERENCES public.products(slug) ON DELETE CASCADE NOT NULL,\n  src text NOT NULL,\n  alt text NOT NULL,\n  color text,\n  sort_order integer DEFAULT 0\n);\n\n-- 9. Embroidery Details Table\nCREATE TABLE public.embroidery_details (\n  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),\n  product_slug text REFERENCES public.products(slug) ON DELETE CASCADE NOT NULL UNIQUE,\n  technique text NOT NULL,\n  technique_label text NOT NULL,\n  artisan_hours integer DEFAULT 0,\n  placement text[] DEFAULT '{}',\n  thread_composition text NOT NULL,\n  motif_story text NOT NULL,\n  macro_image_src text,\n  macro_image_alt text\n);\n\n-- 10. Reviews Table\nCREATE TABLE public.reviews (\n  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),\n  product_slug text REFERENCES public.products(slug) ON DELETE CASCADE NOT NULL,\n  author text NOT NULL,\n  rating integer CHECK (rating >= 1 and rating <= 5) NOT NULL,\n  title text NOT NULL,\n  comment text NOT NULL,\n  verified boolean DEFAULT true,\n  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\n-- 11. Newsletter Subscribers Table\nCREATE TABLE public.newsletter_subscribers (\n  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),\n  email text UNIQUE NOT NULL,\n  subscribed_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\n-- 12. Orders & Order Items Table\nCREATE TABLE public.orders (\n  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),\n  customer_name text NOT NULL,\n  customer_email text NOT NULL,\n  status text DEFAULT 'confirmed',\n  subtotal_cents integer NOT NULL,\n  discount_cents integer DEFAULT 0,\n  shipping_cents integer DEFAULT 0,\n  total_cents integer NOT NULL,\n  coupon_code text,\n  gift_note text,\n  shipping_address jsonb,\n  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL\n);\n\nCREATE TABLE public.order_items (\n  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),\n  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,\n  product_slug text NOT NULL,\n  variant_sku text NOT NULL,\n  product_name text NOT NULL,\n  color text NOT NULL,\n  size text NOT NULL,\n  quantity integer NOT NULL,\n  price_cents integer NOT NULL,\n  customization jsonb\n);\n\n-- 13. Enable Row Level Security (RLS)\nALTER TABLE public.universes ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.motifs ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.products ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.embroidery_details ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;\n\n-- Public READ Policies\nCREATE POLICY "Allow public read universes" ON public.universes FOR SELECT USING (true);\nCREATE POLICY "Allow public read motifs" ON public.motifs FOR SELECT USING (true);\nCREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);\nCREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);\nCREATE POLICY "Allow public read variants" ON public.variants FOR SELECT USING (true);\nCREATE POLICY "Allow public read product images" ON public.product_images FOR SELECT USING (true);\nCREATE POLICY "Allow public read embroidery details" ON public.embroidery_details FOR SELECT USING (true);\nCREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (true);\n\n-- Public WRITE Policies\nCREATE POLICY "Allow public newsletter subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);\nCREATE POLICY "Allow public submit review" ON public.reviews FOR INSERT WITH CHECK (true);\nCREATE POLICY "Allow public create orders" ON public.orders FOR INSERT WITH CHECK (true);\nCREATE POLICY "Allow public create order items" ON public.order_items FOR INSERT WITH CHECK (true);\n\n-- Admin Studio Policies\nCREATE POLICY "Allow admin insert products" ON public.products FOR INSERT WITH CHECK (true);\nCREATE POLICY "Allow admin update products" ON public.products FOR UPDATE USING (true);\nCREATE POLICY "Allow admin insert variants" ON public.variants FOR INSERT WITH CHECK (true);\nCREATE POLICY "Allow admin update variants" ON public.variants FOR UPDATE USING (true);\nCREATE POLICY "Allow admin insert product images" ON public.product_images FOR INSERT WITH CHECK (true);\nCREATE POLICY "Allow admin delete product images" ON public.product_images FOR DELETE USING (true);\nCREATE POLICY "Allow admin insert embroidery details" ON public.embroidery_details FOR INSERT WITH CHECK (true);\nCREATE POLICY "Allow admin update embroidery details" ON public.embroidery_details FOR UPDATE USING (true);\n\n-- Storage Setup\nINSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;\nCREATE POLICY "Public Read Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');\nCREATE POLICY "Public Upload Product Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');`,
                      'Full Schema Wipe & Re-initialization SQL'
                    )
                  }
                  className="px-3.5 py-1.5 bg-accent text-cream hover:bg-accent-hover text-[11px] uppercase tracking-wider font-semibold cursor-pointer shrink-0"
                >
                  📋 Copy Full Schema SQL
                </button>
              </div>

              <div className="relative">
                <pre className="bg-ink text-cream p-4 text-[11px] font-mono overflow-x-auto rounded border border-stone/30 leading-relaxed max-h-64">
{`-- Wipe Previous Tables & Re-initialize:
DROP TABLE IF EXISTS public.order_items, public.orders, public.reviews, public.newsletter_subscribers,
  public.embroidery_details, public.product_images, public.variants, public.products,
  public.motifs, public.universes, public.categories CASCADE;

-- Enables UUID & Re-creates 12 relational tables with full universe & craft attributes.
-- Click 'Copy Full Schema SQL' above to copy the ready-to-run DDL.`}
                </pre>
              </div>
            </div>

            {/* Step 2: Seed Original Products */}
            <div className="space-y-3 pt-4 border-t border-stone/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-widest text-accent font-semibold">Step 2</span>
                  <h3 className="font-serif text-base text-ink font-semibold">2. Seed Original Products (`supabase/seed.sql`)</h3>
                  <p className="text-[11px] text-ink-muted">
                    Seeds Universes (Animeverse, Heroverse, Itihaas), Motifs, Categories, and the 13 authentic handcrafted atelier products (`is_mock = false`, `handcrafted = true`).
                  </p>
                </div>
                <a
                  href={`https://supabase.com/dashboard/project/${(import.meta.env.VITE_SUPABASE_URL || '').replace(/^https?:\/\//, '').split('.')[0] || 'heimnfjuwmmmejqcjbbd'}/sql/new`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-ink text-cream hover:bg-ink-muted text-[11px] uppercase tracking-wider font-semibold cursor-pointer shrink-0"
                >
                  Open Supabase SQL Editor ↗
                </a>
              </div>

              <div className="p-4 bg-cream border border-stone/40 text-xs text-ink space-y-2">
                <span className="font-semibold block">✦ Ready on Disk:</span>
                <p className="text-ink-muted">
                  The complete seed statement is synchronized in your repository at <code className="bg-stone/20 px-1.5 py-0.5 font-mono text-[11px]">supabase/seed.sql</code>. It contains all 13 authentic products with multi-size variants, dual imagery, embroidery stories, and universe/gender routing.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-[11px] font-mono text-ink-muted">File: supabase/seed.sql (48 KB)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Admin: React.FC = () => {
  // Security Guard: Restrict access strictly to local environment
  const isLocalEnvironment =
    import.meta.env.DEV ||
    (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '0.0.0.0'));

  if (!isLocalEnvironment) {
    return <NotFound />;
  }

  return <AdminStudio />;
};
