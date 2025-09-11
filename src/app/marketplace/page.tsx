'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, List, Map, Briefcase, ShoppingCart, PlusCircle } from 'lucide-react';
import MaterialCard from '@/components/material-card';
import TradeLeadCard from '@/components/trade-lead-card';
import { materials as allMaterials, tradeLeads as allLeads, users } from '@/lib/mock-data';
import AiSuggestions from '@/components/ai-suggestions';
import type { Material, TradeLead } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MapView from '@/components/map-view';
import React from 'react';
import VolumeContractCard from '@/components/volume-contract-card';

function MarketplacePageContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');
  const defaultTab = searchParams.get('tab') || 'listings';

  // State for Listings
  const [searchTerm, setSearchTerm] = useState('');
  const [condition, setCondition] = useState('all');
  const [category, setCategory] = useState(urlCategory || 'all');
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>(allMaterials);
  const [submittedSearch, setSubmittedSearch] = useState('');
  
  // State for Trade Leads
  const buyLeads = allLeads.filter(lead => lead.type === 'buy');
  const sellLeads = allLeads.filter(lead => lead.type === 'sell');

  useEffect(() => {
    setCategory(urlCategory || 'all');
  }, [urlCategory]);

  useEffect(() => {
    let materials = allMaterials;

    if (condition !== 'all') {
      materials = materials.filter(
        (m) => m.condition.toLowerCase() === condition
      );
    }
    if (category !== 'all') {
      materials = materials.filter(
        (m) => m.category.toLowerCase() === category
      );
    }

    if (submittedSearch) {
      materials = materials.filter((m) =>
        m.name.toLowerCase().includes(submittedSearch.toLowerCase())
      );
    }

    setFilteredMaterials(materials);
  }, [condition, category, submittedSearch]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(searchTerm);
  };

  const categories = [
    ...new Set(allMaterials.map((material) => material.category)),
  ];

  const renderLead = (lead: TradeLead) => {
    const user = users.find(u => u.id === lead.userId)
    if (lead.contractType === 'volume') {
      return <VolumeContractCard key={lead.id} lead={lead} user={user} />
    }
    return <TradeLeadCard key={lead.id} lead={lead} user={user} />
  }

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <section className="text-center bg-card p-8 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">
            Build Sustainably. Build Smart.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Your one-stop marketplace for new and reclaimed building materials.
            Reduce waste, save money, and contribute to a greener future.
            </p>
        </section>

        <Tabs defaultValue={defaultTab} className="w-full">
            <div className="border-b">
                <TabsList className="grid w-full grid-cols-2 h-12">
                    <TabsTrigger value="listings" className="text-lg">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Live Marketplace
                    </TabsTrigger>
                    <TabsTrigger value="contracts" className="text-lg">
                        <Briefcase className="mr-2 h-5 w-5" />
                        Futures & Contracts
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="listings" className="mt-8 space-y-8">
                 <section className="bg-card p-6 rounded-lg shadow-sm">
                    <form onSubmit={handleSearch} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">What are you looking for?</label>
                        <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            id="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="e.g., 'Reclaimed Oak Beams', 'Low-E Windows'..."
                            className="pl-10"
                        />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="condition" className="block text-sm font-medium text-foreground mb-1">Condition</label>
                        <Select value={condition} onValueChange={setCondition}>
                        <SelectTrigger id="condition">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Conditions</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="reclaimed">Reclaimed</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Category</label>
                        <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                            <SelectItem key={cat} value={cat.toLowerCase()}>
                                {cat}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4">
                        <Button type="submit" className="w-full" size="lg">
                        Search Materials
                        </Button>
                    </div>
                    </form>
                </section>

                {submittedSearch && <AiSuggestions query={submittedSearch} />}

                <section>
                    <Tabs defaultValue="list" className="w-full">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                        <h2 className="text-2xl font-bold font-headline">
                        {submittedSearch || urlCategory ? 'Search Results' : 'Featured Listings'}
                        </h2>
                        <TabsList>
                        <TabsTrigger value="list">
                            <List className="mr-2 h-4 w-4" />
                            List
                        </TabsTrigger>
                        <TabsTrigger value="map" disabled={filteredMaterials.length === 0}>
                            <Map className="mr-2 h-4 w-4" />
                            Map
                        </TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="list">
                        {filteredMaterials.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMaterials.map((material) => (
                            <MaterialCard key={material.id} material={material} />
                            ))}
                        </div>
                        ) : (
                        <div className="text-center py-16 bg-card rounded-lg">
                            <p className="text-muted-foreground">No materials found. Try adjusting your search.</p>
                        </div>
                        )}
                    </TabsContent>
                    <TabsContent value="map">
                        <MapView materials={filteredMaterials} />
                    </TabsContent>
                    </Tabs>
                </section>
            </TabsContent>
            
            <TabsContent value="contracts" className="mt-8 space-y-8">
                 <section className="text-center bg-card p-8 rounded-lg shadow-sm">
                    <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">
                        Futures & Contracts Hub
                    </h2>
                    <p className="mt-2 text-muted-foreground max-w-3xl mx-auto">
                        A marketplace for future supply and demand contracts. Post your needs or future inventory and let our AI match you with the right partners.
                    </p>
                    <Button asChild size="lg" className="mt-6">
                        <Link href="/trade-hub/post">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Post a New Contract
                        </Link>
                    </Button>
                </section>

                <Tabs defaultValue="buy" className="w-full">
                    <div className="flex justify-center border-b">
                        <TabsList className="mb-[-1px] bg-transparent p-0">
                            <TabsTrigger value="buy" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">
                                Demand (Buyers)
                            </TabsTrigger>
                            <TabsTrigger value="sell" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">
                                Supply (Sellers)
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="buy" className="mt-8">
                        {buyLeads.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {buyLeads.map(renderLead)}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-card rounded-lg">
                                <p className="text-muted-foreground">No active demand leads.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="sell" className="mt-8">
                        {sellLeads.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sellLeads.map(renderLead)}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-card rounded-lg">
                                <p className="text-muted-foreground">No active supply leads.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MarketplacePageContent />
        </Suspense>
    )
}
