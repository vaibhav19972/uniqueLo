import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  useProducts,
  useUniverses,
  useMotifsByUniverse,
  useCategories,
  useGarments,
  useCollections,
  catalogKeys,
} from '../hooks/useCatalog';
import { useToastStore } from '../stores/toast';
import {
  formatPrice,
  EDITS,
  EXPRESSION_LEVELS,
  GARMENTS,
  COLLECTIONS,
  type EditSlug,
  type ExpressionScore,
  type Gender,
  type EmbroideryTechnique,
} from '../lib/data';
import {
  SPEC_BOARD_SLOTS,
  cropSpecBoard,
  validateCrops,
  revokeCropPreviews,
  type CroppedSlot,
  type CropIssue,
} from '../lib/cropSpecBoard';

interface VariantForm {
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  price: number; // in normal currency, e.g. 380
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  quantity: number;
}

// Session-unique upload suffix (module scope: pure, lint-clean alternative to
// Date.now() inside the component). Filenames are already namespaced by
// product slug + slot key; storage uploads use upsert so retries overwrite.
let uploadSequence = 0;
const nextUploadSuffix = (): string => {
  uploadSequence += 1;
  return `u${uploadSequence.toString(36)}`;
};

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
  { label: 'Sakura Hoodie 1', src: '/images/products/sakura-ronin-hoodie-1.jpg' },
  { label: 'Sakura Hoodie 2', src: '/images/products/sakura-ronin-hoodie-2.jpg' },
  { label: 'Sakura Hoodie 3', src: '/images/products/sakura-ronin-hoodie-3.jpg' },
  { label: 'Sakura Hoodie 4', src: '/images/products/sakura-ronin-hoodie-4.jpg' },
  { label: 'Sakura Hoodie 5', src: '/images/products/sakura-ronin-hoodie-5.jpg' },
  { label: 'Sakura Hoodie 6', src: '/images/products/sakura-ronin-hoodie-6.jpg' },
  { label: 'Hero Placeholder', src: '/images/placeholders/hero.jpg' },
];

const AdminStudio: React.FC = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);
  const { data: existingProducts, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: dbGarments } = useGarments();
  const { data: dbCollections } = useCollections();

  const [activeTab, setActiveTab] = useState<'create' | 'catalog' | 'sql-help'>('create');

  // Available categories: dynamic from public.categories via Supabase, with robust fallback
  const availableCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    return [
      { slug: 'tops', name: 'Tops & Shirts', label: 'Tops', description: 'Heavyweight organic cotton box tees, silk-floss oxfords, and band-collar tunics.' },
      { slug: 'outerwear', name: 'Outerwear & Jackets', label: 'Outerwear', description: 'Tailored chore jackets, kimono overcoats, and embroidered denim outerwear.' },
      { slug: 'knitwear', name: 'Knitwear & Cashmere', label: 'Knitwear', description: 'Pure cashmere cardigans, merino sweaters, and chain-stitched crewnecks.' },
      { slug: 'bottoms', name: 'Bottoms & Trousers', label: 'Bottoms', description: 'Pleated wide-leg trousers, raw selvedge denim, and kantha-embroidered work pants.' },
      { slug: 'accessories', name: 'Accessories', label: 'Accessories', description: 'Embroidered silk scarves, raw canvas tote bags, and heirloom monogram badges.' },
    ];
  }, [categories]);

  // Available garments: dynamic from public.garments via Supabase, with fallback to local taxonomy
  const availableGarments = useMemo(() => {
    if (dbGarments && dbGarments.length > 0) return dbGarments;
    return GARMENTS;
  }, [dbGarments]);

  // Available collections: dynamic from public.collections via Supabase, with fallback to local taxonomy
  const availableCollections = useMemo(() => {
    if (dbCollections && dbCollections.length > 0) return dbCollections;
    return COLLECTIONS;
  }, [dbCollections]);

  // Quick Taxonomy Creation Modals
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddGarmentModal, setShowAddGarmentModal] = useState(false);
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);

  // New Category State
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // New Garment State
  const [newGarmentSlug, setNewGarmentSlug] = useState('');
  const [newGarmentName, setNewGarmentName] = useState('');
  const [newGarmentCategory, setNewGarmentCategory] = useState('tops');
  const [newGarmentDesc, setNewGarmentDesc] = useState('');

  // New Collection State
  const [newColSlug, setNewColSlug] = useState('');
  const [newColName, setNewColName] = useState('');
  const [newColTagline, setNewColTagline] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColUniverse, setNewColUniverse] = useState('');

  const [isSavingTaxonomy, setIsSavingTaxonomy] = useState(false);

  const handleSaveNewCategory = async () => {
    if (!newCatName.trim() || !newCatSlug.trim()) {
      showToast({ title: 'Validation Error', description: 'Category Name and Slug are required.', type: 'info' });
      return;
    }
    setIsSavingTaxonomy(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('categories').upsert({
          slug: newCatSlug.trim().toLowerCase(),
          name: newCatName.trim(),
          label: newCatLabel.trim() || newCatName.trim(),
          description: newCatDesc.trim() || `${newCatName.trim()} collection.`,
          order_num: availableCategories.length + 1,
        });
        if (error) throw error;
        await queryClient.invalidateQueries({ queryKey: catalogKeys.categories });
        setCategorySlug(newCatSlug.trim().toLowerCase());
        showToast({ title: 'Category Saved', description: `Category "${newCatName}" saved to public.categories!`, type: 'success' });
        setShowAddCategoryModal(false);
        setNewCatSlug('');
        setNewCatName('');
        setNewCatLabel('');
        setNewCatDesc('');
      } else {
        showToast({ title: 'Database Offline', description: 'Supabase is not configured in this environment.', type: 'info' });
      }
    } catch (err: any) {
      showToast({ title: 'Save Failed', description: err.message || 'Failed to save category to database.', type: 'info' });
    } finally {
      setIsSavingTaxonomy(false);
    }
  };

  const handleSaveNewGarment = async () => {
    if (!newGarmentName.trim() || !newGarmentSlug.trim()) {
      showToast({ title: 'Validation Error', description: 'Garment Name and Slug are required.', type: 'info' });
      return;
    }
    setIsSavingTaxonomy(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('garments').upsert({
          slug: newGarmentSlug.trim().toLowerCase(),
          name: newGarmentName.trim(),
          category_slug: newGarmentCategory,
          description: newGarmentDesc.trim() || `${newGarmentName.trim()} silhouette.`,
          order_num: availableGarments.length + 1,
        });
        if (error) throw error;
        await queryClient.invalidateQueries({ queryKey: catalogKeys.garments });
        setGarmentType(newGarmentSlug.trim().toLowerCase());
        setCategorySlug(newGarmentCategory as any);
        showToast({ title: 'Garment Saved', description: `Garment "${newGarmentName}" saved to public.garments!`, type: 'success' });
        setShowAddGarmentModal(false);
        setNewGarmentSlug('');
        setNewGarmentName('');
        setNewGarmentDesc('');
      } else {
        showToast({ title: 'Database Offline', description: 'Supabase is not configured in this environment.', type: 'info' });
      }
    } catch (err: any) {
      showToast({ title: 'Save Failed', description: err.message || 'Failed to save garment to database.', type: 'info' });
    } finally {
      setIsSavingTaxonomy(false);
    }
  };

  const handleSaveNewCollection = async () => {
    if (!newColName.trim() || !newColSlug.trim()) {
      showToast({ title: 'Validation Error', description: 'Collection Name and Slug are required.', type: 'info' });
      return;
    }
    setIsSavingTaxonomy(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('collections').upsert({
          slug: newColSlug.trim().toLowerCase(),
          name: newColName.trim(),
          tagline: newColTagline.trim() || null,
          description: newColDesc.trim() || null,
          universe_slug: newColUniverse.trim() || null,
          featured: true,
          order_num: availableCollections.length + 1,
        });
        if (error) throw error;
        await queryClient.invalidateQueries({ queryKey: catalogKeys.collections });
        setCollectionSlug(newColSlug.trim().toLowerCase());
        if (newColUniverse) {
          setUniverseSlug(newColUniverse as any);
        }
        showToast({ title: 'Collection Saved', description: `Collection "${newColName}" saved to public.collections!`, type: 'success' });
        setShowAddCollectionModal(false);
        setNewColSlug('');
        setNewColName('');
        setNewColTagline('');
        setNewColDesc('');
      } else {
        showToast({ title: 'Database Offline', description: 'Supabase is not configured in this environment.', type: 'info' });
      }
    } catch (err: any) {
      showToast({ title: 'Save Failed', description: err.message || 'Failed to save collection to database.', type: 'info' });
    } finally {
      setIsSavingTaxonomy(false);
    }
  };

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [subtitle, setSubtitle] = useState('');
  const [foreignTagline, setForeignTagline] = useState('');
  const [description, setDescription] = useState('');
  const [categorySlug, setCategorySlug] = useState<string>('tops');
  const [universeSlug, setUniverseSlug] = useState<'animeverse' | 'heroverse' | 'itihaas'>('itihaas');
  const [gender, setGender] = useState<Gender>('unisex');
  const [collectionSlug, setCollectionSlug] = useState('spring-sakura');
  const [garmentType, setGarmentType] = useState('tee');
  const [motifId, setMotifId] = useState('');
  const [tagsInput, setTagsInput] = useState('tops, embroidery, handcrafted');
  const [selectedMoods, setSelectedMoods] = useState<EditSlug[]>(['everyday', 'heritage']);
  const [selectedExpressionScore, setSelectedExpressionScore] = useState<ExpressionScore>(3);
  const [featured, setFeatured] = useState(true);
  const [customizable, setCustomizable] = useState(true);
  const [handcrafted, setHandcrafted] = useState(true);
  const [rating, setRating] = useState<number>(5.0);
  const [reviewCount, setReviewCount] = useState<number>(12);
  const [soldCount, setSoldCount] = useState<string>('50+');

  const selectedExpression =
    EXPRESSION_LEVELS.find((e) => e.score === selectedExpressionScore) || EXPRESSION_LEVELS[2];
  const selectedExpressionSlug = selectedExpression.slug;

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

  // Images — six catalog slots (sort_order 0–5; see SPEC_BOARD_SLOTS).
  // Slots 0–1 default to atelier imagery; 2–5 default to the shared placeholder
  // until dedicated crops land via single upload or All-in-One spec board.
  const [slotImages, setSlotImages] = useState<{ src: string; alt: string }[]>([
    { src: '/images/products/sakura-ronin-hoodie-1.jpg', alt: '' },
    { src: '/images/products/sakura-ronin-hoodie-2.jpg', alt: '' },
    { src: '/images/placeholders/hero.jpg', alt: '' },
    { src: '/images/placeholders/hero.jpg', alt: '' },
    { src: '/images/placeholders/hero.jpg', alt: '' },
    { src: '/images/placeholders/hero.jpg', alt: '' },
  ]);
  const [slotUploading, setSlotUploading] = useState<boolean[]>(Array(6).fill(false));

  const updateSlot = (index: number, patch: Partial<{ src: string; alt: string }>) => {
    setSlotImages((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  // All-in-One spec-board intake (single board PNG → six slot crops)
  const [boardCrops, setBoardCrops] = useState<CroppedSlot[] | null>(null);
  const [boardIssues, setBoardIssues] = useState<CropIssue[]>([]);
  const [isBoardWorking, setIsBoardWorking] = useState(false);
  const [isBoardUploading, setIsBoardUploading] = useState(false);
  const boardBlobs = useRef<(Blob | null)[]>(Array(6).fill(null));

  const clearBoard = () => {
    if (boardCrops) revokeCropPreviews(boardCrops);
    setBoardCrops(null);
    setBoardIssues([]);
    boardBlobs.current = Array(6).fill(null);
  };

  const slotAltFor = (index: number, productName: string, colorway: string) =>
    `${productName || 'New Product'} — ${colorway} — ${SPEC_BOARD_SLOTS[index].altSuffix}`;

  /** Fill empty slot alts from the slot templates (used by both Apply and Upload). */
  const fillSlotAlts = () => {
    const colorway = selectedColors[0]?.name || variants[0]?.color || 'Natural';
    setSlotImages((prev) =>
      prev.map((slot, i) => (slot.alt ? slot : { ...slot, alt: slotAltFor(i, name, colorway) }))
    );
  };

  /** Slots holding local-only sources must reach the CDN before publishing. */
  const hasUnpublishedSlots = slotImages.some(
    (s) => s.src.startsWith('blob:') || s.src.startsWith('data:')
  );

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Could not read crop data'));
      reader.readAsDataURL(blob);
    });

  // Upload directly to Supabase Storage CDN
  const uploadBlobToCdn = async (blob: Blob, fileName: string): Promise<string> => {
    if (!supabase) throw new Error('Supabase client unavailable');
    const filePath = `products/${fileName}`;
    const { error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(filePath, blob, { cacheControl: '3600', upsert: true });
    if (uploadErr) throw uploadErr;
    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const handleUploadImage = async (file: File, target: number) => {
    if (!file) return;
    const setUploadingAt = (v: boolean) =>
      setSlotUploading((prev) => prev.map((u, i) => (i === target ? v : u)));

    // Set immediate preview
    const localPreviewUrl = URL.createObjectURL(file);

    if (!isSupabaseConfigured() || !supabase) {
      updateSlot(target, { src: localPreviewUrl });
      showToast({
        title: 'Preview Loaded',
        description: 'Local preview active. Configure Supabase to upload to Cloud CDN.',
        type: 'info',
      });
      return;
    }

    setUploadingAt(true);
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanSlug = (slug || 'product').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      const fileName = `${cleanSlug}-${SPEC_BOARD_SLOTS[target].key}-${nextUploadSuffix()}.${fileExt}`;
      const publicUrl = await uploadBlobToCdn(file, fileName);
      updateSlot(target, { src: publicUrl });
      showToast({
        title: '✦ Image Uploaded to CDN',
        description: `Slot ${target + 1} URL generated and embedded into your JSON & SQL!`,
        type: 'success',
      });
    } catch (err: any) {
      console.warn('[Storage Upload Error]:', err);
      // Fallback to local preview so user still sees the picture
      updateSlot(target, { src: localPreviewUrl });
      showToast({
        title: 'Storage Bucket Notice',
        description: `Could not save to bucket "${err?.message || 'product-images'}". Check SQL tab to create bucket!`,
        type: 'info',
      });
    } finally {
      setUploadingAt(false);
    }
  };

  // All-in-One: crop a spec-board PNG into the six slot previews
  const handleBoardSelect = async (file: File) => {
    if (!file) return;
    clearBoard();
    setIsBoardWorking(true);
    try {
      const crops = await cropSpecBoard(file);
      const issues = await validateCrops(crops);
      setBoardCrops(crops);
      setBoardIssues(issues);
      boardBlobs.current = crops.map((c) => c.blob);
      showToast({
        title: issues.length === 0 ? '✦ Board cropped into 6 slots' : 'Board cropped with warnings',
        description:
          issues.length === 0
            ? 'Review the previews, then Apply to fill the six slots.'
            : `${issues.length} slot(s) need review before applying.`,
        type: issues.length === 0 ? 'success' : 'info',
      });
    } catch (err: any) {
      console.warn('[Spec Board Crop Error]:', err);
      showToast({
        title: 'Board Crop Failed',
        description: err?.message || 'Could not split the board image. Is it the 3×2 v1 template?',
        type: 'info',
      });
    } finally {
      setIsBoardWorking(false);
    }
  };

  // Fill the six slots from the current board previews. Previews are stored
  // as self-contained data URLs (never revocable blob: URLs), so a later
  // clearBoard() or a second board cannot break already-applied slots.
  const applyBoardCrops = async () => {
    if (!boardCrops) return;
    try {
      const urls = await Promise.all(boardCrops.map((crop) => blobToDataUrl(crop.blob)));
      const colorway = selectedColors[0]?.name || variants[0]?.color || 'Natural';
      setSlotImages(
        urls.map((url, i) => ({
          src: url,
          alt: slotImages[i]?.alt || slotAltFor(i, name, colorway),
        }))
      );
      showToast({
        title: 'Slots filled from board',
        description: 'Six previews applied. Use “Upload all 6 to CDN” before publishing.',
        type: 'accent',
      });
    } catch {
      showToast({
        title: 'Apply failed',
        description: 'Could not read the crop data. Try selecting the board again.',
        type: 'info',
      });
    }
  };

  // Upload all six board crops to the CDN in slot order
  const uploadBoardCrops = async () => {
    if (!boardCrops) return;
    // Direct-upload path fills alts too, so SQL/JSON never fall back to the bare name.
    fillSlotAlts();
    if (!isSupabaseConfigured() || !supabase) {
      // No backend: previews are already applied as local URLs.
      applyBoardCrops();
      return;
    }
    setIsBoardUploading(true);
    try {
      const cleanSlug = (slug || 'product').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      const stamp = nextUploadSuffix();
      for (let i = 0; i < boardCrops.length; i++) {
        const blob = boardBlobs.current[i];
        if (!blob) continue;
        try {
          const publicUrl = await uploadBlobToCdn(blob, `${cleanSlug}-${SPEC_BOARD_SLOTS[i].key}-${stamp}.jpg`);
          updateSlot(i, { src: publicUrl });
        } catch (err: any) {
          console.warn(`[Board Upload Error] slot ${i}:`, err);
          showToast({
            title: `Slot ${i + 1} upload failed`,
            description: 'Local preview kept. Check the SQL tab for bucket setup.',
            type: 'info',
          });
        }
      }
      showToast({
        title: '✦ All 6 crops uploaded',
        description: 'CDN URLs embedded into your JSON & SQL!',
        type: 'success',
      });
    } finally {
      setIsBoardUploading(false);
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
      const colorway = selectedColors[0]?.name || 'Natural';
      if (!slotImages[0]?.alt) updateSlot(0, { alt: slotAltFor(0, val, colorway) });
      if (!slotImages[3]?.alt) updateSlot(3, { alt: slotAltFor(3, val, colorway) });
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
    const editsArr = selectedMoods.map((m) => `'${m}'`).join(', ');
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
  collection_slug, garment_type, gender, motif_id, handcrafted, expression_score, expression_slug, edits,
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
  '${collectionSlug.replace(/'/g, "''")}',
  '${garmentType.replace(/'/g, "''")}',
  '${gender}',
  ${motifId ? `'${motifId.replace(/'/g, "''")}'` : 'NULL'},
  ${handcrafted},
  ${selectedExpressionScore},
  '${selectedExpressionSlug}',
  ARRAY[${editsArr}],
  ${rating},
  ${reviewCount},
  ${soldCount ? `'${soldCount.replace(/'/g, "''")}'` : 'NULL'},
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
  collection_slug = EXCLUDED.collection_slug,
  garment_type = EXCLUDED.garment_type,
  gender = EXCLUDED.gender,
  motif_id = EXCLUDED.motif_id,
  handcrafted = EXCLUDED.handcrafted,
  expression_score = EXCLUDED.expression_score,
  expression_slug = EXCLUDED.expression_slug,
  edits = EXCLUDED.edits,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  sold_count = EXCLUDED.sold_count,
  tags = EXCLUDED.tags,
  featured = EXCLUDED.featured,
  customizable = EXCLUDED.customizable;

-- 2. Insert Images (cleans previous slot allocations for this product)
DELETE FROM public.product_images WHERE product_slug = '${finalSlug}';
INSERT INTO public.product_images (product_slug, src, alt, color, sort_order) 
VALUES 
${slotImages
  .map(
    (img, i) =>
      `  ('${finalSlug}', '${img.src}', '${(img.alt || name).replace(/'/g, "''")}', '${(variants[0]?.colorHex || '#121214').replace(/'/g, "''")}', ${i})`
  )
  .join(',\n')};

-- 3. Insert or Update Variants
INSERT INTO public.variants (sku, product_slug, color, color_hex, size, price_cents, status, quantity) 
VALUES 
${variants
  .map(
    (v) =>
      `  ('${v.sku}', '${finalSlug}', '${v.color}', '${v.colorHex}', '${v.size}', ${Math.round(v.price * 100)}, '${v.status}', ${v.quantity})`
  )
  .join(',\n')}
ON CONFLICT (sku) DO UPDATE SET
  color = EXCLUDED.color,
  color_hex = EXCLUDED.color_hex,
  size = EXCLUDED.size,
  price_cents = EXCLUDED.price_cents,
  status = EXCLUDED.status,
  quantity = EXCLUDED.quantity;

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
    collectionSlug,
    garmentType,
    gender,
    motifId,
    handcrafted,
    selectedMoods,
    selectedExpressionScore,
    selectedExpressionSlug,
    rating,
    reviewCount,
    soldCount,
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
    slotImages,
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
      collectionSlug,
      garmentType,
      gender,
      motifId: motifId || undefined,
      handcrafted,
      expressionScore: selectedExpressionScore,
      expressionSlug: selectedExpressionSlug,
      edits: selectedMoods,
      rating,
      reviewCount,
      soldCount,
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
      images: slotImages.map((img) => ({
        src: img.src,
        alt: img.alt || name,
        color: variants[0]?.colorHex || '#121214',
      })),
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
    collectionSlug,
    garmentType,
    gender,
    motifId,
    handcrafted,
    selectedMoods,
    selectedExpressionScore,
    selectedExpressionSlug,
    rating,
    reviewCount,
    soldCount,
    tagsInput,
    variants,
    slotImages,
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
                <div className="border-b border-stone/30 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-accent font-semibold">Step 1</span>
                    <h2 className="font-serif text-xl text-ink mt-0.5">Core Product Identity</h2>
                  </div>
                  <span className="text-[10px] text-accent font-mono font-medium">public.products</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Product Name *
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products (name)
                      </span>
                    </div>
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
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-accent font-mono font-medium">
                          public.products (slug PK)
                        </span>
                        <button
                          type="button"
                          onClick={() => setAutoSlug(!autoSlug)}
                          className="text-[10px] text-accent hover:underline uppercase tracking-wider"
                        >
                          {autoSlug ? '🔒 Auto-Generating' : '🔓 Custom Edit'}
                        </button>
                      </div>
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
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                          Category *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAddCategoryModal(true)}
                          className="text-[10px] text-accent hover:underline font-mono"
                          title="Add a new category to public.categories"
                        >
                          + New
                        </button>
                      </div>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.categories
                      </span>
                    </div>
                    <select
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent capitalize"
                    >
                      {availableCategories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name || c.label} ({c.slug})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-ink-muted mt-1 font-light">
                      Maps to /category/{categorySlug} discovery door and database foreign key.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Universe (World) *
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.universes
                      </span>
                    </div>
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
                    <p className="text-[10px] text-ink-muted mt-1 font-light">
                      Maps to /universe/{universeSlug} portal and database foreign key.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Gender Facet *
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products (gender)
                      </span>
                    </div>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent capitalize"
                    >
                      <option value="unisex">Unisex (Both Men & Women Surfaces)</option>
                      <option value="men">Men Only</option>
                      <option value="women">Women Only</option>
                    </select>
                    <p className="text-[10px] text-ink-muted mt-1 font-light">
                      Maps to /men and /women discovery doorways. Check constraint: ('men', 'women', 'unisex').
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                          Collection (Seasonal Drop) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAddCollectionModal(true)}
                          className="text-[10px] text-accent hover:underline font-mono"
                          title="Add a new collection to public.collections"
                        >
                          + New
                        </button>
                      </div>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.collections
                      </span>
                    </div>
                    <select
                      value={collectionSlug}
                      onChange={(e) => setCollectionSlug(e.target.value)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent capitalize cursor-pointer font-medium"
                    >
                      {availableCollections.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name} ({c.slug}) {c.universeSlug ? `— ${c.universeSlug}` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-ink-muted mt-1 font-light">
                      Maps to /collections/{collectionSlug} discovery door and database foreign key.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                          Garment Silhouette (Type) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAddGarmentModal(true)}
                          className="text-[10px] text-accent hover:underline font-mono"
                          title="Add a new silhouette to public.garments"
                        >
                          + New
                        </button>
                      </div>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.garments
                      </span>
                    </div>
                    <select
                      value={garmentType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGarmentType(val);
                        const matching = availableGarments.find((g) => g.slug === val);
                        if (matching && matching.categorySlug) {
                          setCategorySlug(matching.categorySlug as any);
                        }
                      }}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent capitalize cursor-pointer font-medium"
                    >
                      {availableGarments.map((g) => (
                        <option key={g.slug} value={g.slug}>
                          {g.name} ({g.slug}) — {g.categorySlug}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-ink-muted mt-1 font-light">
                      Maps to /clothing/{garmentType} discovery door and database foreign key. Auto-syncs parent category.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Foreign Script Tagline
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products (foreign_tagline)
                      </span>
                    </div>
                    <input
                      type="text"
                      value={foreignTagline}
                      onChange={(e) => setForeignTagline(e.target.value)}
                      placeholder="e.g. वानस्पतिक रेशम or 桜 浪人"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Lore Motif (Optional)
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.motifs
                      </span>
                    </div>
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
                    <p className="text-[10px] text-ink-muted mt-1 font-light">
                      Maps to IP-cleared motif heraldry and foreign key public.motifs.id.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Editorial Subtitle
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products (subtitle)
                      </span>
                    </div>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="280 GSM heavyweight jersey with hand-hooked chain-stitch crest"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent placeholder-ink-muted/40"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Story & Atelier Description
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products (description)
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Cut from custom 280 GSM combed organic cotton jersey, finished with hand-hooked Kashmiri Aari floral needlework on the chest pocket..."
                      className="w-full bg-cream border border-stone/60 p-3 text-xs text-ink focus:outline-none focus:border-accent placeholder-ink-muted/40 leading-relaxed font-light"
                    />
                  </div>

                  {/* Edits Selector — curated collections (powers Explore-by-Edit Gateway) */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Edits — Curated Collections (Explore Gateways)
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products (edits text[])
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {EDITS.map((e) => {
                        const isSel = selectedMoods.includes(e.slug);
                        return (
                          <button
                            key={e.slug}
                            type="button"
                            onClick={() => {
                              setSelectedMoods(
                                isSel
                                  ? selectedMoods.filter((s) => s !== e.slug)
                                  : [...selectedMoods, e.slug]
                              );
                            }}
                            className={`px-3 py-1 text-xs border transition-colors cursor-pointer font-sans ${
                              isSel
                                ? 'border-accent bg-accent/15 text-accent font-semibold'
                                : 'border-stone/40 bg-cream text-ink-muted hover:border-ink-muted'
                            }`}
                          >
                            {isSel ? '✓ ' : '+ '}
                            {e.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expression Intensity Selector — 1 to 5 scale (Spec Signature Discovery Axis) */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Style & Embroidery (1–5 Discovery Axis)
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-accent font-mono font-medium">
                          public.products (expression_score, expression_slug)
                        </span>
                        <span className="text-[10px] font-sans text-accent font-semibold uppercase tracking-widest">
                          Level {selectedExpressionScore}: {selectedExpression.name}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {EXPRESSION_LEVELS.map((exp) => {
                        const isSel = selectedExpressionScore === exp.score;
                        return (
                          <button
                            key={exp.score}
                            type="button"
                            onClick={() => {
                              setSelectedExpressionScore(exp.score);
                            }}
                            aria-pressed={isSel}
                            title={exp.description}
                            className={`p-2.5 text-left border transition-all cursor-pointer font-sans ${
                              isSel
                                ? 'border-accent bg-accent/15 text-accent shadow-xs'
                                : 'border-stone/40 bg-cream text-ink-muted hover:border-ink-muted'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] uppercase tracking-widest font-bold">Level {exp.score}</span>
                              {isSel && <span className="text-xs text-accent font-bold">✓</span>}
                            </div>
                            <div className="font-serif text-sm font-semibold text-ink mt-0.5">{exp.name}</div>
                            <p className="text-[10px] text-ink-muted line-clamp-2 mt-1 leading-tight">{exp.characteristics}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Tags (Comma separated)
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products (tags text[])
                      </span>
                    </div>
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

                  {/* Social Proof & Ratings (Stored on public.products) */}
                  <div className="sm:col-span-2 pt-3 border-t border-stone/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider text-ink-muted font-medium">
                          Social Proof, Reviews & Sales Badge
                        </span>
                        <span className="text-[10px] text-accent font-serif italic">★ Public Display</span>
                      </div>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products (rating, review_count, sold_count)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-cream/40 p-3.5 border border-stone/40">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] uppercase tracking-wider text-ink font-medium">
                            Rating (1.0 – 5.0)
                          </label>
                          <span className="text-[10px] text-accent font-mono font-medium">★ {rating.toFixed(1)}</span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="5.0"
                          value={rating}
                          onChange={(e) => setRating(Math.min(5.0, Math.max(1.0, parseFloat(e.target.value) || 5.0)))}
                          className="w-full bg-paper border border-stone/60 px-3 py-1.5 text-xs text-ink font-mono font-semibold focus:outline-none focus:border-accent"
                        />
                        <p className="text-[10px] text-ink-muted mt-1">Average star rating displayed across product cards and PDP</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] uppercase tracking-wider text-ink font-medium">
                            Review Count
                          </label>
                          <span className="text-[10px] text-ink-muted font-mono">{reviewCount} reviews</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={reviewCount}
                          onChange={(e) => setReviewCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="w-full bg-paper border border-stone/60 px-3 py-1.5 text-xs text-ink font-mono font-semibold focus:outline-none focus:border-accent"
                        />
                        <p className="text-[10px] text-ink-muted mt-1">Number of customer reviews displayed beside the star score</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] uppercase tracking-wider text-ink font-medium">
                            Sold Count Badge
                          </label>
                          <span className="text-[10px] text-accent font-mono font-medium">{soldCount || 'None'}</span>
                        </div>
                        <input
                          type="text"
                          value={soldCount}
                          onChange={(e) => setSoldCount(e.target.value)}
                          placeholder="50+, 1.2K+, 400+"
                          className="w-full bg-paper border border-stone/60 px-3 py-1.5 text-xs text-ink font-mono font-semibold focus:outline-none focus:border-accent"
                        />
                        <p className="text-[10px] text-ink-muted mt-1">Marketing badge displayed on PDP (e.g. | {soldCount || '50+'} sold)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2 pt-2 border-t border-stone/20">
                    <div className="flex flex-wrap items-center gap-6">
                      <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={featured}
                          onChange={(e) => setFeatured(e.target.checked)}
                          className="w-4 h-4 accent-accent cursor-pointer"
                        />
                        <span className="font-medium">Featured (Homepage Reel)</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={customizable}
                          onChange={(e) => setCustomizable(e.target.checked)}
                          className="w-4 h-4 accent-accent cursor-pointer"
                        />
                        <span className="font-medium">Bespoke Monogram</span>
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-ink cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={handcrafted}
                          onChange={(e) => setHandcrafted(e.target.checked)}
                          className="w-4 h-4 accent-accent cursor-pointer"
                        />
                        <span className="font-medium text-accent">✦ Authentic Handcrafted</span>
                      </label>
                    </div>
                    <span className="text-[10px] text-accent font-mono font-medium">
                      public.products (featured, customizable, handcrafted)
                    </span>
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
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-accent font-mono font-medium">public.embroidery_details</span>
                    <span className="text-xs text-ink-muted font-serif italic hidden sm:inline">Indian Atelier Heritage</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Craft Technique *
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.embroidery_details.technique
                      </span>
                    </div>
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
                    <p className="text-[10px] text-ink-muted mt-1 font-light">
                      Maps to heritage needlecraft method in public.embroidery_details.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Artisan Hand Hours
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.embroidery_details.artisan_hours
                      </span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={artisanHours}
                      onChange={(e) => setArtisanHours(parseInt(e.target.value) || 0)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Technique Display Label
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.embroidery_details.technique_label
                      </span>
                    </div>
                    <input
                      type="text"
                      value={techniqueLabel}
                      onChange={(e) => setTechniqueLabel(e.target.value)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Thread Composition
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.embroidery_details.thread_composition
                      </span>
                    </div>
                    <input
                      type="text"
                      value={threadComposition}
                      onChange={(e) => setThreadComposition(e.target.value)}
                      placeholder="100% Spun Mulberry Silk Floss"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Stitch Placements (Comma separated)
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.embroidery_details.placement
                      </span>
                    </div>
                    <input
                      type="text"
                      value={placementInput}
                      onChange={(e) => setPlacementInput(e.target.value)}
                      placeholder="Chest Pocket, Back Collar Yoke"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Motif Story
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.embroidery_details.motif_story
                      </span>
                    </div>
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
                  <span className="text-[10px] text-accent font-mono font-medium">
                    public.products (batch & textile)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Quick Preset Regional Cluster
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products.craft_region
                      </span>
                    </div>
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Craft Region
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products.craft_region
                      </span>
                    </div>
                    <input
                      type="text"
                      value={craftRegion}
                      onChange={(e) => setCraftRegion(e.target.value)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Craft Cluster / Guild
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products.craft_cluster
                      </span>
                    </div>
                    <input
                      type="text"
                      value={craftCluster}
                      onChange={(e) => setCraftCluster(e.target.value)}
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Fabric Weight / GSM
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products.fabric_gsm
                      </span>
                    </div>
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                          Batch Run #
                        </label>
                        <span className="text-[10px] text-accent font-mono font-medium">
                          batch_number
                        </span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={batchNumber}
                        onChange={(e) => setBatchNumber(parseInt(e.target.value) || 1)}
                        className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                          Total In Run
                        </label>
                        <span className="text-[10px] text-accent font-mono font-medium">
                          batch_total
                        </span>
                      </div>
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Materials Composition (Comma separated)
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products (material text[])
                      </span>
                    </div>
                    <input
                      type="text"
                      value={materialsInput}
                      onChange={(e) => setMaterialsInput(e.target.value)}
                      placeholder="100% GOTS Organic Cotton, Mulberry Silk Floss"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Care Guidelines (Comma separated)
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products (care text[])
                      </span>
                    </div>
                    <input
                      type="text"
                      value={careInput}
                      onChange={(e) => setCareInput(e.target.value)}
                      placeholder="Machine wash gentle cold (30°C) inside out, Line dry in shade"
                      className="w-full bg-cream border border-stone/60 px-3.5 py-2 text-xs text-ink focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-ink-muted font-medium">
                        Garment Fit Description
                      </label>
                      <span className="text-[10px] text-accent font-mono font-medium">
                        public.products (fit)
                      </span>
                    </div>
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
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-accent font-mono font-medium">public.variants</span>
                    <span className="text-xs text-ink-muted font-mono">{variants.length} Variants</span>
                  </div>
                </div>

                {/* Generator Controls */}
                <div className="p-4 bg-cream border border-stone/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink block">
                      Quick Variant Generator
                    </span>
                    <span className="text-[10px] text-accent font-mono font-medium">
                      public.variants (sku, color, size, price_cents, status, quantity)
                    </span>
                  </div>

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
                      <span className="text-[10px] text-accent font-mono">public.variants.price_cents</span>
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
                        <th className="py-2.5 px-3">
                          <div>SKU</div>
                          <div className="text-[9px] text-accent font-mono font-normal">sku PK</div>
                        </th>
                        <th className="py-2.5 px-3">
                          <div>Color</div>
                          <div className="text-[9px] text-accent font-mono font-normal">color_hex</div>
                        </th>
                        <th className="py-2.5 px-3">
                          <div>Size</div>
                          <div className="text-[9px] text-accent font-mono font-normal">size</div>
                        </th>
                        <th className="py-2.5 px-3">
                          <div>Price</div>
                          <div className="text-[9px] text-accent font-mono font-normal">price_cents</div>
                        </th>
                        <th className="py-2.5 px-3">
                          <div>Status</div>
                          <div className="text-[9px] text-accent font-mono font-normal">public.variants.status</div>
                        </th>
                        <th className="py-2.5 px-3">
                          <div>Qty</div>
                          <div className="text-[9px] text-accent font-mono font-normal">quantity</div>
                        </th>
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
                              title="public.variants (status)"
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
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-accent font-mono font-medium">
                      public.product_images
                    </span>
                    <span className="text-[10px] text-ink-muted uppercase tracking-wider font-mono">
                      CDN Linked
                    </span>
                  </div>
                </div>

                {/* All-in-One Spec Board Intake (v1: one 3×2 board → six slots) */}
                <div className="space-y-3 p-3.5 bg-cream/60 border border-accent/40 rounded-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-ink">
                      ✦ All-in-One Spec Board → 6 Slots
                    </span>
                    {boardCrops && boardIssues.length === 0 && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded">
                        6 crops ready
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-ink-muted leading-relaxed font-light">
                    Upload one v1 board PNG (3×2 cells + numbered labels). It is split
                    into the six slots below in cell order; label strips are excluded
                    automatically. Review previews, Apply, then upload all to the CDN.
                  </p>

                  <label className={`w-full py-2.5 px-3 border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isBoardWorking
                      ? 'border-accent bg-accent/10 text-accent font-medium'
                      : 'border-accent/50 bg-paper hover:border-accent hover:bg-accent/5 text-ink'
                  }`}>
                    <span className="text-base">{isBoardWorking ? '⏳' : '🖼️'}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {isBoardWorking ? 'Splitting board...' : 'Upload Spec Board PNG'}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      disabled={isBoardWorking || isBoardUploading}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleBoardSelect(e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  {boardIssues.length > 0 && (
                    <div className="p-2.5 bg-amber-50 border border-amber-300 space-y-1">
                      {boardIssues.map((issue, i) => (
                        <p key={i} className="text-[10px] text-amber-800 font-medium">
                          Slot {issue.slotIndex >= 0 ? issue.slotIndex + 1 : '—'}: {issue.message}
                        </p>
                      ))}
                    </div>
                  )}

                  {boardCrops && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        {boardCrops.map((crop) => (
                          <div key={crop.def.index} className="aspect-[3/4] bg-stone/10 border border-stone/40 overflow-hidden relative">
                            <img
                              src={crop.previewUrl}
                              alt={`${crop.def.label} preview`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1.5 py-0.5 font-mono">
                              {crop.def.index + 1} · {crop.width}×{crop.height}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={applyBoardCrops}
                          className="flex-1 px-3 py-2 bg-paper border border-ink/30 hover:border-ink text-ink text-[11px] uppercase tracking-widest font-medium cursor-pointer transition-colors"
                        >
                          Apply previews to slots
                        </button>
                        <button
                          type="button"
                          onClick={uploadBoardCrops}
                          disabled={isBoardUploading}
                          className="flex-1 px-3 py-2 bg-accent text-cream hover:bg-accent-hover text-[11px] uppercase tracking-widest font-medium cursor-pointer transition-colors disabled:opacity-50"
                        >
                          {isBoardUploading ? 'Uploading 6...' : 'Apply + upload all 6 to CDN'}
                        </button>
                        <button
                          type="button"
                          onClick={clearBoard}
                          className="px-3 py-2 text-ink-muted hover:text-ink text-[11px] uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Six catalog image slots (sort_order 0–5) */}
                {SPEC_BOARD_SLOTS.map((def) => {
                  const img = slotImages[def.index] || { src: '', alt: '' };
                  const busy = slotUploading[def.index];
                  return (
                    <div key={def.index} className="space-y-3 p-3.5 bg-cream/60 border border-stone/40 rounded-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif font-bold text-ink">
                          {def.index + 1}. {def.label}
                        </span>
                        {img.src.startsWith('http') && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.5 rounded">
                            CDN Active
                          </span>
                        )}
                      </div>

                      <label className={`w-full py-2.5 px-3 border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        busy
                          ? 'border-accent bg-accent/10 text-accent font-medium'
                          : 'border-accent/50 bg-paper hover:border-accent hover:bg-accent/5 text-ink'
                      }`}>
                        <span className="text-base">{busy ? '⏳' : '📁'}</span>
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          {busy ? 'Uploading to Supabase CDN...' : 'Upload Image from Device'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={busy}
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleUploadImage(e.target.files[0], def.index);
                            e.target.value = '';
                          }}
                        />
                      </label>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-ink-muted mb-1 font-mono">
                          Slot {def.index + 1} URL (Embedded in JSON):
                        </label>
                        <input
                          type="text"
                          value={img.src}
                          onChange={(e) => updateSlot(def.index, { src: e.target.value })}
                          placeholder="/images/products/... or https://..."
                          className="w-full bg-paper border border-stone/60 px-2.5 py-1 text-[11px] font-mono text-ink focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-ink-muted mb-1 font-mono">
                          Slot {def.index + 1} alt text:
                        </label>
                        <input
                          type="text"
                          value={img.alt}
                          onChange={(e) => updateSlot(def.index, { alt: e.target.value })}
                          placeholder={def.altSuffix}
                          className="w-full bg-paper border border-stone/60 px-2.5 py-1 text-[11px] text-ink focus:outline-none focus:border-accent"
                        />
                      </div>

                      {/* Preset quick picker (slot 1 only) */}
                      {def.index === 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          <span className="text-[9px] text-ink-muted uppercase self-center mr-1">Presets:</span>
                          {PRESET_IMAGES.slice(0, 3).map((p, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => updateSlot(0, { src: p.src })}
                              className="text-[9px] px-1.5 py-0.5 bg-paper border border-stone/40 hover:border-accent text-ink-muted"
                            >
                              {p.label.split(' ')[0]} {i + 1}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="aspect-[3/4] max-w-[180px] mx-auto bg-stone/10 border border-stone/40 overflow-hidden relative shadow-inner">
                        <img
                          src={img.src}
                          alt={`${def.label} preview`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholders/hero.jpg';
                          }}
                        />
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] px-1.5 py-0.5 uppercase tracking-wider">
                          Slot {def.index + 1} (3:4)
                        </span>
                      </div>
                    </div>
                  );
                })}
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
                {hasUnpublishedSlots && (
                  <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1.5 font-medium">
                    Some slots still hold local previews — upload all images to
                    the CDN before copying SQL/JSON, or the snippets will embed
                    unusable local URLs.
                  </p>
                )}
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
                      <th className="py-3 px-3">
                        <div>Product</div>
                        <span className="text-[9px] text-accent font-mono font-normal">public.products</span>
                      </th>
                      <th className="py-3 px-3">
                        <div>Category</div>
                        <span className="text-[9px] text-accent font-mono font-normal">public.categories</span>
                      </th>
                      <th className="py-3 px-3">
                        <div>Garment</div>
                        <span className="text-[9px] text-accent font-mono font-normal">public.garments</span>
                      </th>
                      <th className="py-3 px-3">
                        <div>Collection</div>
                        <span className="text-[9px] text-accent font-mono font-normal">public.collections</span>
                      </th>
                      <th className="py-3 px-3">
                        <div>Expression</div>
                        <span className="text-[9px] text-accent font-mono font-normal">expression_score</span>
                      </th>
                      <th className="py-3 px-3">
                        <div>Technique</div>
                        <span className="text-[9px] text-accent font-mono font-normal">public.embroidery_details</span>
                      </th>
                      <th className="py-3 px-3">
                        <div>Price</div>
                        <span className="text-[9px] text-accent font-mono font-normal">price_cents</span>
                      </th>
                      <th className="py-3 px-3">
                        <div>Variants</div>
                        <span className="text-[9px] text-accent font-mono font-normal">public.variants</span>
                      </th>
                      <th className="py-3 px-3">
                        <div>Batch</div>
                        <span className="text-[9px] text-accent font-mono font-normal">batch_number</span>
                      </th>
                      <th className="py-3 px-3">
                        <div>Rating & Reviews</div>
                        <span className="text-[9px] text-accent font-mono font-normal">rating, review_count</span>
                      </th>
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
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-paper border border-stone/40 text-[10px] uppercase font-mono tracking-wider font-semibold text-ink whitespace-nowrap">
                            {product.garmentType || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-paper border border-stone/40 text-[10px] uppercase font-mono tracking-wider font-medium text-ink whitespace-nowrap">
                            {product.collectionSlug || product.artStyleSlug || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-paper border border-stone/40 text-[10px] uppercase tracking-wider text-accent font-medium whitespace-nowrap">
                            ✦ L{product.expressionScore ?? 3} · {(product.expressionSlug || 'cult').replace(/-/g, ' ')}
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
                        <td className="py-3 px-3 text-[11px] font-mono text-ink whitespace-nowrap">
                          ★ {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
                          <span className="text-ink-muted ml-1">({product.reviewCount ?? 0})</span>
                          {product.soldCount && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-accent/10 text-accent text-[9px] border border-accent/30 font-medium">
                              {product.soldCount}
                            </span>
                          )}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-sans tracking-[0.2em] text-accent font-semibold uppercase">
                  Production Database Schema & Incremental Migration Hub
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-semibold rounded">
                  ✦ Production Protected (Zero Wipes)
                </span>
              </div>
              <h2 className="font-serif text-2xl text-ink mt-1">
                Additive Migration & Master Taxonomy Manager
              </h2>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed max-w-3xl">
                The UniqueLo production database is live. Never execute <code className="bg-stone/20 px-1 py-0.5 font-mono text-ink">DROP TABLE</code> in production as this erases customer orders, inventory stock, and atelier reviews. All schema evolution is <strong>additive and non-destructive</strong> using <code className="bg-stone/20 px-1 py-0.5 font-mono text-ink">ON CONFLICT DO UPDATE</code>.
              </p>
            </div>

            {/* Step 1: Add New Taxonomy Row (Interactive Snippets) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-widest text-accent font-semibold">Workflow 1</span>
                  <h3 className="font-serif text-base text-ink font-semibold">Add New Master Taxonomy (Categories, Silhouettes, Capsules)</h3>
                  <p className="text-[11px] text-ink-muted">
                    Idempotent upsert queries that add new taxonomies or update existing descriptions without foreign key constraint violations.
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Add Category */}
                <div className="p-4 bg-cream border border-stone/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-ink">1. Add New Category</span>
                    <span className="text-[10px] text-accent font-mono font-medium">public.categories</span>
                  </div>
                  <pre className="bg-ink text-cream p-3 text-[10px] font-mono overflow-x-auto rounded leading-relaxed max-h-36">
{`INSERT INTO public.categories (slug, name, label, description, image, order_num)
VALUES (
  'kimonos', 'Kimonos & Haori', 'Kimonos',
  'Structured artisanal haori jackets and silk kimono overcoats.',
  '/images/categories/outerwear.jpg', 6
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, label = EXCLUDED.label,
  description = EXCLUDED.description, order_num = EXCLUDED.order_num;`}
                  </pre>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `INSERT INTO public.categories (slug, name, label, description, image, order_num)
VALUES (
  'kimonos', 'Kimonos & Haori', 'Kimonos',
  'Structured artisanal haori jackets and silk kimono overcoats.',
  '/images/categories/outerwear.jpg', 6
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, label = EXCLUDED.label,
  description = EXCLUDED.description, order_num = EXCLUDED.order_num;`,
                        'Add Category SQL'
                      )
                    }
                    className="w-full py-1.5 bg-paper border border-stone/60 hover:bg-stone/10 text-[10px] uppercase font-semibold text-ink cursor-pointer"
                  >
                    📋 Copy Add Category SQL
                  </button>
                </div>

                {/* 2. Add Garment Silhouette */}
                <div className="p-4 bg-cream border border-stone/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-ink">2. Add Garment Silhouette</span>
                    <span className="text-[10px] text-accent font-mono font-medium">public.garments</span>
                  </div>
                  <pre className="bg-ink text-cream p-3 text-[10px] font-mono overflow-x-auto rounded leading-relaxed max-h-36">
{`INSERT INTO public.garments (slug, name, category_slug, description, order_num)
VALUES (
  'haori', 'Haori Jackets', 'outerwear',
  'Traditional wide-sleeve kimono jackets carrying bold back-panel needlework.', 10
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  description = EXCLUDED.description, order_num = EXCLUDED.order_num;`}
                  </pre>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `INSERT INTO public.garments (slug, name, category_slug, description, order_num)
VALUES (
  'haori', 'Haori Jackets', 'outerwear',
  'Traditional wide-sleeve kimono jackets carrying bold back-panel needlework.', 10
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, category_slug = EXCLUDED.category_slug,
  description = EXCLUDED.description, order_num = EXCLUDED.order_num;`,
                        'Add Garment Silhouette SQL'
                      )
                    }
                    className="w-full py-1.5 bg-paper border border-stone/60 hover:bg-stone/10 text-[10px] uppercase font-semibold text-ink cursor-pointer"
                  >
                    📋 Copy Add Garment SQL
                  </button>
                </div>

                {/* 3. Add Collection */}
                <div className="p-4 bg-cream border border-stone/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-ink">3. Add Seasonal Drop</span>
                    <span className="text-[10px] text-accent font-mono font-medium">public.collections</span>
                  </div>
                  <pre className="bg-ink text-cream p-3 text-[10px] font-mono overflow-x-auto rounded leading-relaxed max-h-36">
{`INSERT INTO public.collections (slug, name, tagline, description, universe_slug, featured, order_num)
VALUES (
  'samurai-twilight', 'Samurai Twilight Collection',
  'Indigo shadows, katana arcs, and silver bullion embroidery.',
  'Night-toned apparel inspired by classic ronin epics.',
  'animeverse', true, 4
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, tagline = EXCLUDED.tagline,
  universe_slug = EXCLUDED.universe_slug, featured = EXCLUDED.featured;`}
                  </pre>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `INSERT INTO public.collections (slug, name, tagline, description, universe_slug, featured, order_num)
VALUES (
  'samurai-twilight', 'Samurai Twilight Collection',
  'Indigo shadows, katana arcs, and silver bullion embroidery.',
  'Night-toned apparel inspired by classic ronin epics.',
  'animeverse', true, 4
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, tagline = EXCLUDED.tagline,
  universe_slug = EXCLUDED.universe_slug, featured = EXCLUDED.featured;`,
                        'Add Collection SQL'
                      )
                    }
                    className="w-full py-1.5 bg-paper border border-stone/60 hover:bg-stone/10 text-[10px] uppercase font-semibold text-ink cursor-pointer"
                  >
                    📋 Copy Add Collection SQL
                  </button>
                </div>

                {/* 4. Add Motif */}
                <div className="p-4 bg-cream border border-stone/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-ink">4. Add Lore Motif</span>
                    <span className="text-[10px] text-accent font-mono font-medium">public.motifs</span>
                  </div>
                  <pre className="bg-ink text-cream p-3 text-[10px] font-mono overflow-x-auto rounded leading-relaxed max-h-36">
{`INSERT INTO public.motifs (id, universe_slug, name, meaning, symbol_notes, ip_cleared)
VALUES (
  'katana-arc', 'animeverse', 'Katana Arc Blade',
  'The disciplined curve of the lone swordsman weapon.',
  'Geometric blade curvature with subtle cherry blossom drifting.', true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, meaning = EXCLUDED.meaning, symbol_notes = EXCLUDED.symbol_notes;`}
                  </pre>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `INSERT INTO public.motifs (id, universe_slug, name, meaning, symbol_notes, ip_cleared)
VALUES (
  'katana-arc', 'animeverse', 'Katana Arc Blade',
  'The disciplined curve of the lone swordsman weapon.',
  'Geometric blade curvature with subtle cherry blossom drifting.', true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, meaning = EXCLUDED.meaning, symbol_notes = EXCLUDED.symbol_notes;`,
                        'Add Motif SQL'
                      )
                    }
                    className="w-full py-1.5 bg-paper border border-stone/60 hover:bg-stone/10 text-[10px] uppercase font-semibold text-ink cursor-pointer"
                  >
                    📋 Copy Add Motif SQL
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Database Health Diagnostics */}
            <div className="space-y-3 pt-4 border-t border-stone/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-widest text-accent font-semibold">Workflow 2</span>
                  <h3 className="font-serif text-base text-ink font-semibold">Database Integrity & Row Count Diagnostics</h3>
                  <p className="text-[11px] text-ink-muted">
                    Run these queries in Supabase SQL editor to inspect row counts across all 9 catalog tables and verify zero orphan records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `-- 1. Check Row Counts across all catalog tables
SELECT 'universes' as table_name, count(*) as count FROM public.universes
UNION ALL
SELECT 'motifs', count(*) FROM public.motifs
UNION ALL
SELECT 'categories', count(*) FROM public.categories
UNION ALL
SELECT 'garments', count(*) FROM public.garments
UNION ALL
SELECT 'collections', count(*) FROM public.collections
UNION ALL
SELECT 'products', count(*) FROM public.products
UNION ALL
SELECT 'variants', count(*) FROM public.variants
UNION ALL
SELECT 'product_images', count(*) FROM public.product_images
UNION ALL
SELECT 'embroidery_details', count(*) FROM public.embroidery_details;

-- 2. Verify Relational Integrity (Must return 0 orphan rows)
SELECT p.slug, p.name 
FROM public.products p
LEFT JOIN public.categories c ON p.category_slug = c.slug
WHERE p.category_slug IS NOT NULL AND c.slug IS NULL;

-- 3. Verify Row Level Security (RLS) is active
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`,
                      'Health Diagnostic SQL Queries'
                    )
                  }
                  className="px-3.5 py-1.5 bg-accent text-cream hover:bg-accent-hover text-[11px] uppercase tracking-wider font-semibold cursor-pointer shrink-0"
                >
                  📋 Copy Health Check Queries
                </button>
              </div>

              <pre className="bg-ink text-cream p-4 text-[11px] font-mono overflow-x-auto rounded border border-stone/30 leading-relaxed max-h-48">
{`-- Row Counts:
SELECT 'universes' as tbl, count(*) FROM public.universes UNION ALL
SELECT 'motifs', count(*) FROM public.motifs UNION ALL
SELECT 'categories', count(*) FROM public.categories UNION ALL
SELECT 'garments', count(*) FROM public.garments UNION ALL
SELECT 'collections', count(*) FROM public.collections UNION ALL
SELECT 'products', count(*) FROM public.products UNION ALL
SELECT 'variants', count(*) FROM public.variants;

-- Check Orphan Products (Must return 0 rows):
SELECT p.slug, p.name FROM public.products p
LEFT JOIN public.categories c ON p.category_slug = c.slug
WHERE p.category_slug IS NOT NULL AND c.slug IS NULL;`}
              </pre>
            </div>

            {/* Step 3: Complete Schema Migration Documentation */}
            <div className="space-y-3 pt-4 border-t border-stone/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-widest text-accent font-semibold">Documentation</span>
                  <h3 className="font-serif text-base text-ink font-semibold">Official Database Migration Guide</h3>
                  <p className="text-[11px] text-ink-muted">
                    Full architectural manual on adding columns, creating new tables, zero-downtime migrations, and RLS security policies.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-cream border border-stone/40 text-xs text-ink space-y-2">
                <span className="font-semibold block">✦ Synchronized in Repository:</span>
                <p className="text-ink-muted leading-relaxed">
                  Refer to <code className="bg-stone/20 px-1.5 py-0.5 font-mono text-[11px]">docs/DATABASE_MIGRATION_GUIDE.md</code> for the complete step-by-step operating runbook, 4-level topological foreign key dependency graphs, and TypeScript synchronization checklists.
                </p>
                <div className="pt-2 flex items-center gap-4 text-[11px] font-mono text-ink-muted">
                  <span>File: docs/DATABASE_MIGRATION_GUIDE.md (19 KB)</span>
                  <span>DDL Blueprint: backend/schema.sql</span>
                  <span>Baseline Seed: backend/production-seed.sql</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 1: Add New Category */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-paper border border-stone/60 max-w-lg w-full p-6 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between border-b border-stone/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] uppercase font-sans tracking-widest text-accent font-semibold">New Entry</span>
                  <h3 className="font-serif text-lg text-ink font-semibold">Add New Category</h3>
                </div>
                <span className="text-[10px] text-accent font-mono font-medium">public.categories</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewCatName(val);
                      if (!newCatSlug || newCatSlug === newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
                        setNewCatSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                      if (!newCatLabel) {
                        setNewCatLabel(val);
                      }
                    }}
                    placeholder="e.g. Kimonos & Robes"
                    className="w-full bg-cream border border-stone/60 px-3 py-2 text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium mb-1">
                      Slug (Primary Key) *
                    </label>
                    <input
                      type="text"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                      placeholder="e.g. kimonos"
                      className="w-full bg-cream border border-stone/60 px-3 py-2 font-mono text-ink focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium mb-1">
                      Short Label
                    </label>
                    <input
                      type="text"
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      placeholder="e.g. Kimonos"
                      className="w-full bg-cream border border-stone/60 px-3 py-2 text-ink focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="e.g. Artisanal silk kimono overcoats and haori jackets."
                    className="w-full bg-cream border border-stone/60 px-3 py-2 text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="p-3 bg-cream border border-stone/40 text-[11px] text-ink-muted space-y-1">
                  <span className="font-semibold text-ink block">✦ Target Database Table:</span>
                  <p>
                    Inserts into <code className="font-mono text-accent">public.categories</code> via authenticated client. Immediately available in Admin Studio and navigation doors without wiping or rebuilding the database.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone/30">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `INSERT INTO public.categories (slug, name, label, description, order_num)
VALUES ('${newCatSlug || 'category-slug'}', '${newCatName || 'Category Name'}', '${newCatLabel || newCatName || 'Category'}', '${newCatDesc || 'Description'}', ${availableCategories.length + 1})
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, label = EXCLUDED.label, description = EXCLUDED.description;`,
                      'Idempotent Category SQL'
                    )
                  }
                  className="text-[11px] text-ink-muted hover:text-ink font-mono underline"
                >
                  📋 Copy SQL
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    className="px-3.5 py-1.5 border border-stone/50 hover:bg-stone/10 text-[11px] uppercase tracking-wider font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewCategory}
                    disabled={isSavingTaxonomy}
                    className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-cream text-[11px] uppercase tracking-wider font-semibold disabled:opacity-50"
                  >
                    {isSavingTaxonomy ? 'Saving...' : 'Save to public.categories'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Add New Garment Silhouette */}
        {showAddGarmentModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-paper border border-stone/60 max-w-lg w-full p-6 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between border-b border-stone/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] uppercase font-sans tracking-widest text-accent font-semibold">New Entry</span>
                  <h3 className="font-serif text-lg text-ink font-semibold">Add Garment Silhouette</h3>
                </div>
                <span className="text-[10px] text-accent font-mono font-medium">public.garments</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium mb-1">
                    Silhouette Name *
                  </label>
                  <input
                    type="text"
                    value={newGarmentName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewGarmentName(val);
                      if (!newGarmentSlug || newGarmentSlug === newGarmentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
                        setNewGarmentSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="e.g. Haori Jackets"
                    className="w-full bg-cream border border-stone/60 px-3 py-2 text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium mb-1">
                      Slug (Primary Key) *
                    </label>
                    <input
                      type="text"
                      value={newGarmentSlug}
                      onChange={(e) => setNewGarmentSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                      placeholder="e.g. haori"
                      className="w-full bg-cream border border-stone/60 px-3 py-2 font-mono text-ink focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium">
                        Category *
                      </label>
                      <span className="text-[9px] text-accent font-mono">FK public.categories</span>
                    </div>
                    <select
                      value={newGarmentCategory}
                      onChange={(e) => setNewGarmentCategory(e.target.value)}
                      className="w-full bg-cream border border-stone/60 px-3 py-2 text-ink focus:outline-none focus:border-accent capitalize"
                    >
                      {availableCategories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name || c.label} ({c.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newGarmentDesc}
                    onChange={(e) => setNewGarmentDesc(e.target.value)}
                    placeholder="e.g. Traditional wide-sleeve kimono jackets carrying bold back-panel needlework."
                    className="w-full bg-cream border border-stone/60 px-3 py-2 text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="p-3 bg-cream border border-stone/40 text-[11px] text-ink-muted space-y-1">
                  <span className="font-semibold text-ink block">✦ Target Database Table:</span>
                  <p>
                    Inserts into <code className="font-mono text-accent">public.garments</code> with foreign key link to <code className="font-mono text-accent">category_slug = '{newGarmentCategory}'</code>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone/30">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `INSERT INTO public.garments (slug, name, category_slug, description, order_num)
VALUES ('${newGarmentSlug || 'garment-slug'}', '${newGarmentName || 'Garment Name'}', '${newGarmentCategory}', '${newGarmentDesc || 'Description'}', ${availableGarments.length + 1})
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category_slug = EXCLUDED.category_slug, description = EXCLUDED.description;`,
                      'Idempotent Garment SQL'
                    )
                  }
                  className="text-[11px] text-ink-muted hover:text-ink font-mono underline"
                >
                  📋 Copy SQL
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddGarmentModal(false)}
                    className="px-3.5 py-1.5 border border-stone/50 hover:bg-stone/10 text-[11px] uppercase tracking-wider font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewGarment}
                    disabled={isSavingTaxonomy}
                    className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-cream text-[11px] uppercase tracking-wider font-semibold disabled:opacity-50"
                  >
                    {isSavingTaxonomy ? 'Saving...' : 'Save to public.garments'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Add New Collection */}
        {showAddCollectionModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-paper border border-stone/60 max-w-lg w-full p-6 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between border-b border-stone/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] uppercase font-sans tracking-widest text-accent font-semibold">New Entry</span>
                  <h3 className="font-serif text-lg text-ink font-semibold">Add Collection / Drop</h3>
                </div>
                <span className="text-[10px] text-accent font-mono font-medium">public.collections</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium mb-1">
                    Collection Title *
                  </label>
                  <input
                    type="text"
                    value={newColName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewColName(val);
                      if (!newColSlug || newColSlug === newColName.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
                        setNewColSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="e.g. Samurai Twilight Collection"
                    className="w-full bg-cream border border-stone/60 px-3 py-2 text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium mb-1">
                      Slug (Primary Key) *
                    </label>
                    <input
                      type="text"
                      value={newColSlug}
                      onChange={(e) => setNewColSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                      placeholder="e.g. samurai-twilight"
                      className="w-full bg-cream border border-stone/60 px-3 py-2 font-mono text-ink focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium">
                        Universe
                      </label>
                      <span className="text-[9px] text-accent font-mono">FK public.universes</span>
                    </div>
                    <select
                      value={newColUniverse}
                      onChange={(e) => setNewColUniverse(e.target.value)}
                      className="w-full bg-cream border border-stone/60 px-3 py-2 text-ink focus:outline-none focus:border-accent capitalize"
                    >
                      <option value="">None (Universe-Neutral)</option>
                      {(universes ?? []).map((u) => (
                        <option key={u.slug} value={u.slug}>
                          {u.name} ({u.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={newColTagline}
                    onChange={(e) => setNewColTagline(e.target.value)}
                    placeholder="e.g. Indigo shadows, katana arcs, and silver bullion embroidery."
                    className="w-full bg-cream border border-stone/60 px-3 py-2 text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-ink-muted uppercase tracking-wider text-[11px] font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newColDesc}
                    onChange={(e) => setNewColDesc(e.target.value)}
                    placeholder="e.g. Night-toned apparel inspired by classic ronin epics with dense silver bullion threadwork."
                    className="w-full bg-cream border border-stone/60 px-3 py-2 text-ink focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="p-3 bg-cream border border-stone/40 text-[11px] text-ink-muted space-y-1">
                  <span className="font-semibold text-ink block">✦ Target Database Table:</span>
                  <p>
                    Inserts into <code className="font-mono text-accent">public.collections</code> with optional foreign key to <code className="font-mono text-accent">universe_slug</code>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone/30">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `INSERT INTO public.collections (slug, name, tagline, description, universe_slug, featured, order_num)
VALUES ('${newColSlug || 'col-slug'}', '${newColName || 'Collection Name'}', ${newColTagline ? `'${newColTagline}'` : 'NULL'}, ${newColDesc ? `'${newColDesc}'` : 'NULL'}, ${newColUniverse ? `'${newColUniverse}'` : 'NULL'}, true, ${availableCollections.length + 1})
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, tagline = EXCLUDED.tagline, description = EXCLUDED.description, universe_slug = EXCLUDED.universe_slug;`,
                      'Idempotent Collection SQL'
                    )
                  }
                  className="text-[11px] text-ink-muted hover:text-ink font-mono underline"
                >
                  📋 Copy SQL
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCollectionModal(false)}
                    className="px-3.5 py-1.5 border border-stone/50 hover:bg-stone/10 text-[11px] uppercase tracking-wider font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewCollection}
                    disabled={isSavingTaxonomy}
                    className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-cream text-[11px] uppercase tracking-wider font-semibold disabled:opacity-50"
                  >
                    {isSavingTaxonomy ? 'Saving...' : 'Save to public.collections'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminAuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email.trim() || !password) return;
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      setSession(data.session);
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setSession(null);
    }
  };

  if (!isSupabaseConfigured() || !supabase) {
    // Local / offline fallback
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-ink p-4">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg text-ink-muted">Verifying Atelier Security Credentials…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-paper border border-stone/50 p-8 sm:p-10 shadow-sm text-ink">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent font-medium block">
              UniqueLo Atelier Studio
            </span>
            <h1 className="font-serif text-3xl font-normal text-ink mt-2">Staff Portal</h1>
            <p className="text-xs text-ink-muted mt-2 font-sans leading-relaxed">
              Authenticate with your verified Supabase admin credentials to unlock catalog publishing and CDN media uploads.
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-mono">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1.5">
                Staff Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@uniquelo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream border border-stone/60 text-xs text-ink font-mono focus:outline-none focus:border-ink"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream border border-stone/60 text-xs text-ink font-mono focus:outline-none focus:border-ink"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-ink text-cream hover:bg-ink-light text-xs font-mono uppercase tracking-widest transition-colors disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Verifying Credentials…' : 'Enter Atelier Studio →'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone/30 text-center">
            <Link
              to="/"
              className="text-[11px] font-mono text-ink-muted hover:text-ink transition-colors uppercase tracking-wider"
            >
              ← Return to Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Authenticated Staff Top Bar */}
      <div className="bg-ink text-cream px-4 sm:px-6 py-2 text-[11px] font-mono flex items-center justify-between border-b border-stone/30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Atelier Session: <strong className="text-white font-medium">{session.user.email}</strong></span>
          <span className="text-stone-400 text-[10px] hidden sm:inline">• Authenticated Admin Active</span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-stone-300 hover:text-white underline underline-offset-2 transition-colors uppercase tracking-wider text-[10px]"
        >
          Sign Out ↗
        </button>
      </div>
      {children}
    </div>
  );
};

export const Admin: React.FC = () => {
  return (
    <AdminAuthGate>
      <AdminStudio />
    </AdminAuthGate>
  );
};
