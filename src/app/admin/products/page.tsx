"use client";

import React, { useState } from "react";
import { useProductStore, Product } from "@/store/productStore";
import { 
  Search, Edit, Save, X, Plus, Check, Sparkles, Trash2, 
  Tag, AlertCircle, CheckCircle2, XCircle, SlidersHorizontal, Image as ImageIcon
} from "lucide-react";

const IMAGE_PRESETS = [
  { label: "Flours Pack", url: "/pkg_flours.png" },
  { label: "Spice Powders Pack", url: "/pkg_spice_powder.png" },
  { label: "Whole Spices Pack", url: "/pkg_whole_spices.png" },
  { label: "Grains & Pulses Pack", url: "/pkg_whole_grains.png" },
  { label: "Red Chilli", url: "/prod-chilli.jpg" },
  { label: "Jeera (Cumin)", url: "/prod-jeera.jpg" },
  { label: "Tur Dal", url: "/prod-tur-dal.jpg" },
];

const BADGE_PRESETS = [
  "Bestseller",
  "Special Offer",
  "Hot Deal",
  "High Fiber",
  "Gluten Free",
  "100% Chana Dal",
  "High Curcumin",
  "Fresh Aroma",
  "Unjha Special",
  "Chef Special",
  "Unpolished",
  "2 Years Aged",
  "Easy Digest",
  "Best Value"
];

export default function AdminProductsPage() {
  const products = useProductStore((state) => state.products);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const addProduct = useProductStore((state) => state.addProduct);
  const deleteProduct = useProductStore((state) => state.deleteProduct);
  const deleteProductGroup = useProductStore((state) => state.deleteProductGroup);
  const toggleStock = useProductStore((state) => state.toggleStock);
  const clearAllProducts = useProductStore((state) => state.clearAllProducts);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editMode, setEditMode] = useState<'product' | 'variant' | 'new-product' | 'new-variant' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  
  // State for delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'variant' | 'group' | 'all'; idOrName: string; title: string } | null>(null);

  // Form State
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [weightValue, setWeightValue] = useState("");
  const [weightUom, setWeightUom] = useState("Kg");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [customFeatureInput, setCustomFeatureInput] = useState("");

  const categories = ["Flours", "Spice Powders", "Whole Spices", "Grains"];

  // Filter products by Category
  const categoryProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory || (p.category === 'Spices' && selectedCategory.includes('Spice')))
    : products;

  // Filter by Search & Stock Status
  const filteredProducts = categoryProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.badge && product.badge.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStock = stockFilter === 'all' 
      ? true 
      : stockFilter === 'in-stock' 
        ? product.inStock !== false 
        : product.inStock === false;

    return matchesSearch && matchesStock;
  });

  const handleGenerateDescription = async () => {
    if (!editForm.name) {
      alert("Please enter a product name first before generating a description.");
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const prompt = `Write a short, 2-sentence, enticing, and premium e-commerce product description for an authentic food product named "${editForm.name}". Category: "${editForm.category || selectedCategory || "Flours"}". Highlight purity, freshness, natural aroma, and health benefits. Return only the description text.`;
      
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await res.json();
      if (data.text) {
        setEditForm(prev => ({ ...prev, description: data.text.trim() }));
      } else {
        alert("Unable to generate description at this moment.");
      }
    } catch (error) {
      console.error(error);
      alert("Unable to generate description at this moment.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleEditClick = (product: Product, mode: 'product' | 'variant') => {
    setEditingProduct(product);
    setEditForm(product);
    setEditMode(mode);
    
    if ((mode === 'variant' || mode === 'product') && product.weight) {
      const match = String(product.weight).match(/^([\d.]+)\s*(.*)$/);
      if (match) {
        setWeightValue(match[1] || "");
        setWeightUom(match[2] || "Kg");
      } else {
        setWeightValue(product.weight);
        setWeightUom("Kg");
      }
    }
  };

  const handleAddFeature = () => {
    if (!customFeatureInput.trim()) return;
    const currentFeatures = editForm.features || [];
    setEditForm({
      ...editForm,
      features: [...currentFeatures, customFeatureInput.trim()]
    });
    setCustomFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    const currentFeatures = editForm.features || [];
    setEditForm({
      ...editForm,
      features: currentFeatures.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    const finalWeight = `${weightValue} ${weightUom}`.trim() || "1 Kg";

    if (editMode === 'new-product') {
      const id = (editForm.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'new-item') + '-' + finalWeight.toLowerCase().replace(/\s+/g, '');
      
      const newProd: Product = {
        id: id || Date.now().toString(),
        name: editForm.name || "New Product",
        category: editForm.category || selectedCategory || "Flours",
        price: Number(editForm.price) || 0,
        originalPrice: Number(editForm.originalPrice) || Number(editForm.price) || 0,
        image: editForm.image || "/pkg_flours.png",
        images: editForm.images || [],
        rating: editForm.rating || 5.0,
        reviews: editForm.reviews || 0,
        weight: finalWeight,
        isNew: true,
        inStock: editForm.inStock !== false,
        badge: editForm.badge || undefined,
        description: editForm.description || "",
        ingredients: editForm.ingredients || "",
        nutritionalInfo: editForm.nutritionalInfo || "",
        disclaimer: editForm.disclaimer || "Store in a cool dry place.",
        features: editForm.features || ["100% Pure", "Fresh Grinding"],
        productDetails: editForm.productDetails || ""
      };
      
      addProduct(newProd);

      // Trigger actual ERP API backend creation for Barcode generation
      const pCode = (editForm as any).productCode;
      if (pCode) {
        let catCode = "01";
        const cat = newProd.category;
        if (cat === "Spice Powders" || cat === "Spices") catCode = "02";
        else if (cat === "Whole Spices") catCode = "03";
        else if (cat === "Grains") catCode = "04";

        fetch('/api/erp/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newProd.name,
            category: catCode,
            productCode: pCode,
            price: newProd.price || 0,
            weight: newProd.weight
          })
        }).catch(err => console.error("ERP API sync failed", err));
      }

      setEditForm({});
      setEditMode(null);
      return;
    }

    if (editMode === 'new-variant' && editingProduct) {
      const id = editingProduct.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + finalWeight.toLowerCase().replace(/\s+/g, '');
      addProduct({
        ...editingProduct, // copy shared fields
        id: id || Date.now().toString(),
        price: Number(editForm.price) || 0,
        originalPrice: Number(editForm.originalPrice) || Number(editForm.price) || 0,
        weight: finalWeight,
        inStock: editForm.inStock !== false,
        image: editForm.image || editingProduct.image,
        images: editForm.images || editingProduct.images || [],
      });
      setEditingProduct(null);
      setEditForm({});
      setEditMode(null);
      return;
    }

    if (editingProduct && editForm) {
      if (editMode === 'product') {
        // Shared properties across all variants of the product group
        const sharedProperties = {
          name: editForm.name,
          category: editForm.category,
          badge: editForm.badge,
          image: editForm.image,
          images: editForm.images,
          description: editForm.description,
          ingredients: editForm.ingredients,
          nutritionalInfo: editForm.nutritionalInfo,
          disclaimer: editForm.disclaimer,
          features: editForm.features,
          productDetails: editForm.productDetails,
        };

        const relatedProducts = products.filter(p => p.name === editingProduct.name);
        relatedProducts.forEach(p => {
          updateProduct(p.id, sharedProperties);
        });
      } else if (editMode === 'variant') {
        // Update specific variant properties
        updateProduct(editingProduct.id, {
          price: Number(editForm.price),
          originalPrice: Number(editForm.originalPrice),
          weight: finalWeight,
          inStock: editForm.inStock !== false,
          image: editForm.image,
          images: editForm.images,
          badge: editForm.badge
        });
      }

      setEditingProduct(null);
      setEditForm({});
      setEditMode(null);
    }
  };

  const handleDeleteExecute = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'all') {
      clearAllProducts();
    } else if (deleteConfirm.type === 'group') {
      deleteProductGroup(deleteConfirm.idOrName);
    } else {
      deleteProduct(deleteConfirm.idOrName);
    }
    setDeleteConfirm(null);
  };

  const toggleExpand = (productName: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productName]: !prev[productName]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          {selectedCategory ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">{selectedCategory}</h2>
            </div>
          ) : (
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Product Portfolio Management</h2>
          )}
          <p className="text-gray-500 mt-1 text-sm">
            {selectedCategory 
              ? `Manage products, pricing, discounts, and inventory for ${selectedCategory}.` 
              : 'Full control over products, packaging variants, prices, discounts, and stock levels.'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {products.length > 0 && (
            <button 
              onClick={() => setDeleteConfirm({
                type: 'all',
                idOrName: 'all',
                title: 'Delete Entire Product List?'
              })}
              className="px-4 py-2.5 bg-red-50 text-red-700 font-semibold border border-red-200 rounded-lg hover:bg-red-100 transition-colors inline-flex items-center gap-1.5 text-sm"
            >
              <Trash2 className="w-4 h-4" /> Delete All Products
            </button>
          )}

          <button 
            onClick={() => {
              if (window.confirm("This will restore all default products, prices, and categories back to master demo dataset. Continue?")) {
                useProductStore.getState().resetDatabase();
                window.location.reload();
              }
            }}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2 text-sm"
          >
            Restore Master Data
          </button>
          
          <button 
            onClick={() => {
              setEditingProduct(null);
              setEditForm({ 
                category: selectedCategory || "Flours", 
                inStock: true,
                features: ["100% Pure & Natural", "Cold Ground Technology"],
                badge: "Bestseller" 
              });
              setEditMode('new-product');
              setWeightValue("1");
              setWeightUom("Kg");
            }}
            className="px-5 py-2.5 bg-[var(--color-devam-red)] text-white font-bold rounded-lg hover:bg-red-700 transition-all inline-flex items-center gap-2 text-sm shadow-md"
          >
            <Plus className="w-5 h-5" /> Add New Product
          </button>
        </div>
      </div>

      {/* Empty State Banner when 0 products */}
      {products.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-300 max-w-2xl mx-auto my-8 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-red-50 text-[var(--color-devam-red)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Product Portfolio is Empty</h3>
          <p className="text-gray-500 mb-6 text-sm max-w-md mx-auto">
            You have deleted all products. You can now build your brand new product catalog from scratch or restore the demo dataset anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setEditingProduct(null);
                setEditForm({ category: "Flours", inStock: true, features: ["100% Pure"], badge: "Bestseller" });
                setEditMode('new-product');
                setWeightValue("1");
                setWeightUom("Kg");
              }}
              className="px-6 py-3 bg-[var(--color-devam-red)] text-white font-bold rounded-lg hover:bg-red-700 transition-all inline-flex items-center gap-2 text-sm shadow-md"
            >
              <Plus className="w-5 h-5" /> Add First Product
            </button>
            <button
              onClick={() => {
                useProductStore.getState().resetDatabase();
                window.location.reload();
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Restore Master Dataset
            </button>
          </div>
        </div>
      )}

      {/* Category Overview Cards (when no category is filtered) */}
      {!selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {categories.map(category => {
            const catProds = products.filter(p => p.category === category || (p.category === 'Spices' && category.includes('Spice')));
            const totalVariants = catProds.length;
            const uniqueNames = new Set(catProds.map(p => p.name)).size;
            const outOfStockCount = catProds.filter(p => p.inStock === false).length;

            return (
              <button 
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[var(--color-devam-red)] transition-all group flex flex-col justify-between text-left relative overflow-hidden"
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="w-12 h-12 bg-red-50 text-[var(--color-devam-red)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                      <line x1="9" y1="21" x2="9" y2="9"/>
                    </svg>
                  </div>
                  {outOfStockCount > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">
                      {outOfStockCount} Out of Stock
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--color-devam-red)] transition-colors">
                    {category}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                    <span>{uniqueNames} Products</span>
                    <span>•</span>
                    <span>{totalVariants} Variants</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/80 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search product, SKU ID, or discount offer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent bg-white"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Stock Filter */}
            <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1 text-xs font-semibold">
              <button
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${stockFilter === 'all' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                All ({categoryProducts.length})
              </button>
              <button
                onClick={() => setStockFilter('in-stock')}
                className={`px-3 py-1.5 rounded-md transition-colors ${stockFilter === 'in-stock' ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                In Stock ({categoryProducts.filter(p => p.inStock !== false).length})
              </button>
              <button
                onClick={() => setStockFilter('out-of-stock')}
                className={`px-3 py-1.5 rounded-md transition-colors ${stockFilter === 'out-of-stock' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Out of Stock ({categoryProducts.filter(p => p.inStock === false).length})
              </button>
            </div>

            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-gray-500 hover:text-gray-800 underline font-medium"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">Product Name & Group</th>
                <th className="px-6 py-3.5">Weight / Variant</th>
                <th className="px-6 py-3.5">Selling Price</th>
                <th className="px-6 py-3.5">MRP / Offer</th>
                <th className="px-6 py-3.5">Stock Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-700">No matching products found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or filter options.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                Object.entries(
                  filteredProducts.reduce((groups, product) => {
                    const name = product.name;
                    if (!groups[name]) groups[name] = [];
                    groups[name].push(product);
                    return groups;
                  }, {} as Record<string, Product[]>)
                ).map(([productName, variants]) => {
                  const isExpanded = expandedProducts[productName] !== false; // default expanded
                  const sampleProd = variants[0];

                  return (
                    <React.Fragment key={productName}>
                      {/* Product Group Header Row */}
                      <tr className="bg-gray-100/60 border-t border-b border-gray-200">
                        <td colSpan={6} className="px-6 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleExpand(productName)}>
                              <div className="w-8 h-8 rounded bg-white border border-gray-200 p-1 flex items-center justify-center shrink-0">
                                <img src={sampleProd.image} alt={productName} className="w-full h-full object-contain" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900 text-sm">{productName}</span>
                                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                                    {variants.length} Variant{variants.length !== 1 ? 's' : ''}
                                  </span>
                                  {sampleProd.badge && sampleProd.badge !== "None" && sampleProd.badge.trim() !== "" && (
                                    <span className="bg-red-100 text-[var(--color-devam-red)] px-2 py-0.5 rounded-full text-[10px] font-bold">
                                      {sampleProd.badge}
                                    </span>
                                  )}
                                  <span className="text-gray-400 text-xs ml-1">({sampleProd.category})</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingProduct(sampleProd);
                                  setEditForm({
                                    category: sampleProd.category,
                                    image: sampleProd.image,
                                    badge: sampleProd.badge,
                                    price: sampleProd.price,
                                    originalPrice: sampleProd.originalPrice,
                                    inStock: true
                                  });
                                  setEditMode('new-variant');
                                  setWeightValue("");
                                  setWeightUom("Kg");
                                }}
                                className="text-green-700 hover:text-green-900 px-3 py-1 bg-white border border-green-200 hover:bg-green-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Variant
                              </button>

                              <button 
                                onClick={() => handleEditClick(sampleProd, 'product')}
                                className="text-indigo-700 hover:text-indigo-900 px-3 py-1 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold shadow-xs"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit Product Details
                              </button>

                              <button 
                                onClick={() => setDeleteConfirm({
                                  type: 'group',
                                  idOrName: productName,
                                  title: `Delete all variants of "${productName}"?`
                                })}
                                className="text-red-600 hover:text-red-800 p-1.5 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center text-xs font-bold"
                                title="Delete Entire Product Group"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Variant Rows */}
                      {isExpanded && variants.map(product => {
                        const isDiscounted = product.originalPrice > product.price;
                        const discountPct = isDiscounted 
                          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                          : 0;

                        return (
                          <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-3.5 pl-12">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white rounded border border-gray-200 p-1 overflow-hidden shrink-0 flex items-center justify-center">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-800 text-xs">SKU: {product.id}</div>
                                  <div className="text-[11px] text-gray-500 truncate max-w-xs">{product.description || 'No description'}</div>
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-6 py-3.5 font-bold text-gray-900">{product.weight}</td>
                            
                            <td className="px-6 py-3.5 font-bold text-[var(--color-devam-red)]">
                              ₹{product.price}
                            </td>

                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 line-through text-xs">₹{product.originalPrice}</span>
                                {isDiscounted && (
                                  <span className="text-[11px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                                    {discountPct}% OFF
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-3.5">
                              <button
                                onClick={() => toggleStock(product.id)}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                  product.inStock !== false 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                }`}
                              >
                                {product.inStock !== false ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" /> Out of Stock
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="px-6 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={() => handleEditClick(product, 'variant')}
                                  className="text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                                  title="Edit Price/MRP & Variant Details"
                                >
                                  <Edit className="w-4 h-4" /> Edit
                                </button>
                                <button 
                                  onClick={() => setDeleteConfirm({
                                    type: 'variant',
                                    idOrName: product.id,
                                    title: `Delete variant ${product.weight} (${product.id})?`
                                  })}
                                  className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Variant"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {(editingProduct || editMode === 'new-product') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editMode === 'product' ? 'Edit Product Master Details' 
                    : editMode === 'new-product' ? 'Add New Product' 
                    : editMode === 'new-variant' ? 'Add Packaging Variant' 
                    : 'Edit Variant Price & Stock'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editMode === 'product' ? 'Changes will apply to all variants of this product.' : 'Specify price, MRP, discount offer, and weight.'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setEditMode(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
              {/* Fields for Product Master or New Product */}
              {(editMode === 'product' || editMode === 'new-product') && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Product Name *</label>
                      <input 
                        type="text" 
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        placeholder="e.g. Sharbati Atta"
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                      <select
                        value={editForm.category || selectedCategory || "Flours"}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] bg-white"
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Badge / Tag</label>
                      <select
                        value={editForm.badge || ""}
                        onChange={(e) => setEditForm({...editForm, badge: e.target.value})}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] bg-white"
                      >
                        <option value="">None</option>
                        {BADGE_PRESETS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Option 1: Display Image */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide">
                      📸 Option 1: Display Image
                    </label>
                    <span className="text-[10px] text-gray-500 font-semibold">Seen in Product Portfolio & Shop Cards</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Primary thumbnail image used on the homepage, shop grid, and admin table.</p>
                </div>
                
                {/* Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {IMAGE_PRESETS.map(preset => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setEditForm({...editForm, image: preset.url})}
                      className={`text-xs px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-colors ${
                        editForm.image === preset.url 
                          ? 'bg-red-50 border-[var(--color-devam-red)] text-[var(--color-devam-red)] font-bold' 
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <img src={preset.url} className="w-4 h-4 object-contain" />
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Local File Upload & Custom URL Input */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="flex items-center justify-center gap-2 px-3.5 py-2 bg-gray-900 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-gray-800 transition-all shadow-xs shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload Display Image from PC
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          alert("File size is too large. Please select an image under 5MB.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setEditForm(prev => ({ ...prev, image: event.target!.result as string }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden" 
                    />
                  </label>
                  
                  <span className="text-xs text-gray-400 text-center font-medium">OR</span>

                  <input 
                    type="text" 
                    value={editForm.image || ""}
                    onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                    placeholder="Enter image URL e.g. /pkg_flours.png"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] bg-white"
                  />
                </div>

                {/* Image Preview Box */}
                {editForm.image && (
                  <div className="p-2 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-gray-50 rounded border border-gray-200 p-1 shrink-0 flex items-center justify-center">
                        <img src={editForm.image} alt="Display Preview" className="w-full h-full object-contain" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-gray-800">Display Image Set</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-sm">
                          {editForm.image.startsWith('data:') ? 'Local Computer File (Base64)' : editForm.image}
                        </div>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => setEditForm({...editForm, image: ''})}
                      className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1 bg-gray-50 border border-red-200 rounded hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Option 2: Other Images (Description Page Gallery) */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wide">
                      🖼️ Option 2: Other Images
                    </label>
                    <span className="text-[10px] text-gray-500 font-semibold">Seen in Description Page Gallery</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Additional photos shown alongside the Display Image on the product details page.</p>
                </div>

                {/* Other Image Upload & URL input */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="flex items-center justify-center gap-2 px-3.5 py-2 bg-gray-800 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-gray-700 transition-all shadow-xs shrink-0">
                    <Plus className="w-4 h-4" />
                    Upload Other Image from PC
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          alert("File size is too large. Please select an image under 5MB.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            const newImg = event.target!.result as string;
                            const existingImages = editForm.images || [];
                            setEditForm(prev => ({ ...prev, images: [...existingImages, newImg] }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* List of Other Images */}
                {(editForm.images && editForm.images.length > 0) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {editForm.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative bg-white p-1 border border-gray-200 rounded-lg flex flex-col items-center group">
                        <div className="w-full h-16 relative flex items-center justify-center overflow-hidden rounded bg-gray-50">
                          <img src={imgUrl} alt={`Other ${idx+1}`} className="w-full h-full object-contain" />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (editForm.images || []).filter((_, i) => i !== idx);
                            setEditForm({...editForm, images: updated});
                          }}
                          className="mt-1 text-[10px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-400 italic bg-white p-3 rounded-lg border border-dashed border-gray-200 text-center">
                    No additional images added yet. (Product description page will display only the Option 1 Display Image).
                  </div>
                )}
              </div>

              {/* Product Details Section (Description, Features, Ingredients) */}
              {(editMode === 'product' || editMode === 'new-product') && (
                <>

                  {/* Description & AI Generator */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-gray-700">Product Description</label>
                      <button 
                        type="button" 
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingAI}
                        className="text-xs flex items-center gap-1 text-[var(--color-devam-red)] hover:text-red-800 font-bold disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {isGeneratingAI ? "Generating AI Text..." : "Auto-Generate with AI"}
                      </button>
                    </div>
                    <textarea 
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                      placeholder="Write an enticing description highlighting quality, origin, and freshness..."
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] resize-none"
                    />
                  </div>

                  {/* Features List */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Product Feature Highlights</label>
                    <div className="flex items-center gap-2 mb-2">
                      <input 
                        type="text" 
                        value={customFeatureInput}
                        onChange={(e) => setCustomFeatureInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                        placeholder="Add feature highlight (e.g. 100% Cold Ground)"
                        className="flex-1 px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddFeature}
                        className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(editForm.features || []).map((feat, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-gray-200">
                          {feat}
                          <button type="button" onClick={() => handleRemoveFeature(idx)} className="text-gray-400 hover:text-red-600">
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ingredients & Nutritional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Ingredients</label>
                      <textarea 
                        value={editForm.ingredients || ""}
                        onChange={(e) => setEditForm({...editForm, ingredients: e.target.value})}
                        rows={2}
                        placeholder="e.g. 100% Pure MP Sharbati Wheat"
                        className="w-full px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nutritional Info</label>
                      <textarea 
                        value={editForm.nutritionalInfo || ""}
                        onChange={(e) => setEditForm({...editForm, nutritionalInfo: e.target.value})}
                        rows={2}
                        placeholder="e.g. Per 100g: Energy 364 kcal, Protein 12.5g"
                        className="w-full px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] resize-none"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {/* Packaging Variant & Price Details */}
              {(editMode === 'variant' || editMode === 'new-variant' || editMode === 'new-product') && (
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[var(--color-devam-red)]" /> Packaging Variant & Pricing
                  </h3>
                  
                  {editingProduct && editMode !== 'new-product' && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4 flex items-center gap-3">
                      <img src={editingProduct.image} className="w-10 h-10 object-contain bg-white border border-gray-200 rounded p-1" />
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{editingProduct.name}</div>
                        <div className="text-xs text-gray-500">
                          {editMode === 'new-variant' ? 'Adding New Weight Variant' : `Editing Variant: ${editingProduct.weight}`}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Weight / Quantity *</label>
                      <input 
                        type="text" 
                        value={weightValue}
                        onChange={(e) => setWeightValue(e.target.value)}
                        placeholder="e.g. 500, 1, 5"
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Unit of Measure *</label>
                      <select 
                        value={weightUom}
                        onChange={(e) => setWeightUom(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] bg-white"
                      >
                        <option value="Kg">Kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="ml">ml</option>
                        <option value="Pack">Pack</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Pricing Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Selling Price (₹) *</label>
                      <input 
                        type="number" 
                        value={editForm.price || 0}
                        onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-bold text-[var(--color-devam-red)] focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">MRP Original Price (₹) *</label>
                      <input 
                        type="number" 
                        value={editForm.originalPrice || 0}
                        onChange={(e) => setEditForm({...editForm, originalPrice: Number(e.target.value)})}
                        className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]"
                      />
                    </div>
                  </div>
                  
                  {/* Discount Preview & Stock Toggle */}
                  <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600 font-medium">Customer Discount Preview:</span>
                      {editForm.originalPrice && editForm.price && editForm.originalPrice > editForm.price ? (
                        <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded font-bold">
                          {Math.round(((editForm.originalPrice - editForm.price) / editForm.originalPrice) * 100)}% OFF
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">No discount applied</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-gray-700">Stock Availability:</label>
                      <button
                        type="button"
                        onClick={() => setEditForm({...editForm, inStock: editForm.inStock === false ? true : false})}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                          editForm.inStock !== false 
                            ? 'bg-green-600 text-white' 
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {editForm.inStock !== false ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setEditMode(null);
                }}
                className="px-5 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSave}
                className="px-6 py-2 bg-[var(--color-devam-red)] text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm shadow-md"
              >
                <Check className="w-4 h-4" /> Save Product Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{deleteConfirm.title}</h3>
            <p className="text-sm text-gray-500 mb-6">
              This action will remove the item from your live product portfolio. Customers won&apos;t be able to view or order this item.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExecute}
                className="px-5 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 text-sm shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
