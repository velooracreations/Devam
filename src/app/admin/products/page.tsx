"use client";

import React, { useState } from "react";
import { useProductStore, Product } from "@/store/productStore";
import { Search, Edit, Save, X, Plus, Check, Sparkles } from "lucide-react";

export default function AdminProductsPage() {
  const products = useProductStore((state) => state.products);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const addProduct = useProductStore((state) => state.addProduct);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editMode, setEditMode] = useState<'product' | 'variant' | 'new-product' | 'new-variant' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  
  // State for the edit modal
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [weightValue, setWeightValue] = useState("");
  const [weightUom, setWeightUom] = useState("Kg");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const categories = ["Flours", "Spice Powders", "Whole Spices", "Grains"];

  // Only filter if a category is selected
  const categoryProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory || (p.category === 'Spices' && selectedCategory.includes('Spice')))
    : [];

  const filteredProducts = categoryProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateDescription = async () => {
    if (!editForm.name) {
      alert("Please enter a product name first before generating a description.");
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const prompt = `Write a short, 2-sentence, enticing, and premium e-commerce product description for a food product named "${editForm.name}". It is in the "${editForm.category}" category. Emphasize quality and freshness. Do not include any intro text like "Here is the description:", just return the actual description text.`;
      
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!res.ok) throw new Error("Failed to generate");
      
      const data = await res.json();
      if (data.text) {
        setEditForm({ ...editForm, description: data.text.trim() });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to the AI service.");
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

  const handleSave = () => {
    const finalWeight = `${weightValue} ${weightUom}`.trim() || "1 Kg";

    if (editMode === 'new-product') {
      const id = editForm.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + finalWeight.toLowerCase().replace(/\s+/g, '');
      
      const newProd = {
        id: id || Date.now().toString(),
        name: editForm.name || "New Product",
        category: editForm.category || selectedCategory || "Flours",
        price: editForm.price || 0,
        originalPrice: editForm.originalPrice || 0,
        image: editForm.image || "/pkg_flours.png",
        rating: 5.0,
        reviews: 0,
        weight: finalWeight,
        isNew: true,
        description: editForm.description,
        ingredients: editForm.ingredients,
        productDetails: editForm.productDetails
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
        ...editingProduct, // copy shared fields (name, category, description, image, etc.)
        id: id || Date.now().toString(),
        price: editForm.price || 0,
        originalPrice: editForm.originalPrice || 0,
        weight: finalWeight,
        image: editForm.image || editingProduct.image,
      });
      setEditingProduct(null);
      setEditForm({});
      setEditMode(null);
      return;
    }

    if (editingProduct && editForm) {
      if (editMode === 'product') {
        // Properties that should be identical across all variants of the same product
        const sharedProperties = {
          name: editForm.name,
          category: editForm.category,
          description: editForm.description,
          ingredients: editForm.ingredients,
          productDetails: editForm.productDetails,
        };

        // Find all variants that belong to the same original product
        const relatedProducts = products.filter(p => p.name === editingProduct.name);

        // Sync changes
        relatedProducts.forEach(p => {
          updateProduct(p.id, sharedProperties);
        });
      } else if (editMode === 'variant') {
        // Update only the specific variant properties (price, weight)
        updateProduct(editingProduct.id, {
          price: editForm.price,
          originalPrice: editForm.originalPrice,
          weight: finalWeight,
        });
      }

      setEditingProduct(null);
      setEditForm({});
      setEditMode(null);
    }
  };

  const toggleExpand = (productName: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productName]: !prev[productName]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
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
              <h2 className="text-2xl font-bold !font-sans tracking-tight text-gray-900">{selectedCategory}</h2>
            </div>
          ) : (
            <h2 className="text-2xl font-bold !font-sans tracking-tight text-gray-900">Product Categories</h2>
          )}
          <p className="text-gray-500 mt-1">
            {selectedCategory ? `Manage your inventory for ${selectedCategory}.` : 'Select a category to view and manage products.'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => {
              if (window.confirm("This will reset all products and categories back to the default demo data (including new descriptions). Are you sure?")) {
                useProductStore.getState().resetDatabase();
                window.location.reload();
              }
            }}
            className="px-4 py-2.5 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors inline-flex items-center text-sm"
          >
            Reset Demo Data
          </button>
          {selectedCategory && (
            <button 
              onClick={() => {
                setEditingProduct(null);
                setEditForm({ category: selectedCategory });
                setEditMode('new-product');
                setWeightValue("");
                setWeightUom("Kg");
              }}
              className="px-6 py-2.5 bg-[var(--color-devam-red)] text-white font-bold rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2 text-sm"
            >
              <Plus className="w-5 h-5" /> Add New Product
            </button>
          )}
        </div>
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => {
            const count = products.filter(p => p.category === category || (p.category === 'Spices' && category.includes('Spice'))).length;
            return (
              <button 
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[var(--color-devam-red)] transition-all group flex flex-col items-center justify-center gap-4 text-center"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-red-50 transition-colors">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-[var(--color-devam-red)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold !font-sans tracking-tight text-gray-900">{category}</h3>
                  <p className="text-sm text-gray-500 mt-1">{count} Products</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder={`Search in ${selectedCategory}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Weight</th>
                <th className="px-6 py-4">Current Price</th>
                <th className="px-6 py-4">MRP (Original)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No products found in this category.
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
                  const isExpanded = expandedProducts[productName] || false;
                  return (
                  <React.Fragment key={productName}>
                    <tr 
                      className="bg-gray-100/50 hover:bg-gray-200 transition-colors"
                    >
                      <td colSpan={5} className="px-6 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleExpand(productName)}>
                            <span className="font-bold text-gray-800 text-sm">{productName}</span>
                            <span className="bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              {variants.length} Variant{variants.length !== 1 ? 's' : ''}
                            </span>
                            <div className="text-gray-400">
                              {isExpanded ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProduct(variants[0]);
                                setEditForm({});
                                setEditMode('new-variant');
                                setWeightValue("");
                                setWeightUom("Kg");
                              }}
                              className="text-green-600 hover:text-green-900 px-3 py-1 bg-white border border-gray-200 hover:border-green-200 hover:bg-green-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                            >
                              <Plus className="w-3 h-3" /> Add Packaging
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(variants[0], 'product');
                              }}
                              className="text-indigo-600 hover:text-indigo-900 px-3 py-1 bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                            >
                              <Edit className="w-3 h-3" /> Edit Details
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && variants.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors animate-in fade-in duration-200">
                        <td className="px-6 py-4 pl-12">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                              <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                            </div>
                            <span className="font-medium text-gray-600 text-xs">SKU: {product.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-bold">{product.weight}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--color-devam-red)]">₹{product.price}</span>
                            {product.originalPrice > product.price && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 line-through">₹{product.originalPrice}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleEditClick(product, 'variant')}
                            className="text-gray-500 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium mr-2"
                          >
                            <Edit className="w-4 h-4" /> Edit Packaging
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Edit Modal */}
      {(editingProduct || editMode === 'new-product') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                {editMode === 'product' ? 'Edit Common Details' 
                  : editMode === 'new-product' ? 'Add New Product' 
                  : editMode === 'new-variant' ? 'Add Packaging Variant' 
                  : 'Edit Packaging Variant'}
              </h2>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setEditMode(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {(editMode === 'product' || editMode === 'new-product') && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                      <input 
                        type="text" 
                        value={editForm.name || ""}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                      <select
                        value={editForm.category || ""}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent bg-white"
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Item Code (3-digit)</label>
                      <input 
                        type="text" 
                        maxLength={3}
                        placeholder="e.g. 011"
                        value={(editForm as any).productCode || ""}
                        onChange={(e) => setEditForm({...editForm, productCode: e.target.value.replace(/\D/g, '')})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-bold text-gray-700">Product Description</label>
                      <button 
                        type="button" 
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingAI}
                        className="text-xs flex items-center gap-1 text-[var(--color-devam-red)] hover:text-red-800 font-bold disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3" />
                        {isGeneratingAI ? "Generating..." : "Auto-generate with AI"}
                      </button>
                    </div>
                    <textarea 
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                      placeholder="Enter a brief description for this product..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Ingredients</label>
                    <textarea 
                      value={editForm.ingredients || ""}
                      onChange={(e) => setEditForm({...editForm, ingredients: e.target.value})}
                      rows={2}
                      placeholder="e.g. 100% Whole Wheat (Sharbati Variant)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Extended Product Details</label>
                    <textarea 
                      value={editForm.productDetails || ""}
                      onChange={(e) => setEditForm({...editForm, productDetails: e.target.value})}
                      rows={3}
                      placeholder="Additional details about sourcing, processing, or usage..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent resize-none"
                    />
                  </div>
                </>
              )}
              
              {(editMode === 'variant' || editMode === 'new-variant' || editMode === 'new-product') && (
                <>
                  {editingProduct && editMode !== 'new-product' && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6 flex items-center gap-4">
                      <img src={editingProduct.image} className="w-12 h-12 object-contain bg-white border border-gray-200 rounded" />
                      <div>
                        <div className="font-bold text-gray-900">{editingProduct.name}</div>
                        <div className="text-xs text-gray-500">
                          {editMode === 'new-variant' ? 'Adding New Packaging Variant' : 'Editing Packaging Variant'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Weight / Size</label>
                      <input 
                        type="text" 
                        value={weightValue}
                        onChange={(e) => setWeightValue(e.target.value)}
                        placeholder="e.g. 500, 1, 5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Unit of Measure</label>
                      <select 
                        value={weightUom}
                        onChange={(e) => setWeightUom(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent bg-white"
                      >
                        <option value="Kg">Kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="ml">ml</option>
                        <option value="Pieces">Pieces</option>
                        <option value="Pack">Pack</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Current Selling Price (₹)</label>
                      <input 
                        type="number" 
                        value={editForm.price || 0}
                        onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent font-bold text-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">MRP Original Price (₹)</label>
                      <input 
                        type="number" 
                        value={editForm.originalPrice || 0}
                        onChange={(e) => setEditForm({...editForm, originalPrice: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent text-gray-500"
                      />
                    </div>
                  </div>
                  
                  {editForm.originalPrice && editForm.price && editForm.originalPrice > editForm.price && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-green-800 font-medium">Customer sees:</span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold text-sm">
                        {Math.round(((editForm.originalPrice - editForm.price) / editForm.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Footer Action */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setEditMode(null);
                }}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 bg-[var(--color-devam-red)] text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <Check className="w-5 h-5" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
