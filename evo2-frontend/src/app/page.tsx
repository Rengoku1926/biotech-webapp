"use client";

import { Clapperboard, Search, SearchCodeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import GeneViewer from "~/components/gene-viewer";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  type ChromosomeFromSeach,
  type GeneFromSearch,
  type GenomeAssemblyFromSearch,
  getAvailableGenomes,
  getGenomeChromosomes,
  searchGenes,
} from "~/utils/genome-api";

type Mode = "browse" | "search";

export default function HomePage() {
  const [genomes, setGenomes] = useState<GenomeAssemblyFromSearch[]>([]);
  const [selectedGenome, setSelectedGenome] = useState<string>("hg38");
  const [chromosomes, setChromosomes] = useState<ChromosomeFromSeach[]>([]);
  const [selectedChromosome, setSelectedChromosome] = useState<string>("chr1");
  const [selectedGene, setSelectedGene] = useState<GeneFromSearch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeneFromSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("search");

  useEffect(() => {
    const fetchGenomes = async () => {
      try {
        setIsLoading(true);
        const data = await getAvailableGenomes();
        if (data.genomes && data.genomes["Human"]) {
          setGenomes(data.genomes["Human"]);
        }
      } catch (err) {
        setError("Failed to load genome data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenomes();
  }, []);

  useEffect(() => {
    const fetchChromosomes = async () => {
      try {
        setIsLoading(true);
        const data = await getGenomeChromosomes(selectedGenome);
        setChromosomes(data.chromosomes);
        if (data.chromosomes.length > 0) {
          setSelectedChromosome(data.chromosomes[0]!.name);
        }
      } catch (err) {
        setError("Failed to load chromosome data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchChromosomes();
  }, [selectedGenome]);

  const performGeneSearch = async (
    query: string,
    genome: string,
    filterFn?: (gene: GeneFromSearch) => boolean,
  ) => {
    try {
      setIsLoading(true);
      const data = await searchGenes(query, genome);
      const results = filterFn ? data.results.filter(filterFn) : data.results;

      setSearchResults(results);
    } catch (err) {
      setError("Failed to search genes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedChromosome || mode !== "browse") return;
    performGeneSearch(
      selectedChromosome,
      selectedGenome,
      (gene: GeneFromSearch) => gene.chrom === selectedChromosome,
    );
  }, [selectedChromosome, selectedGenome, mode]);

  const handleGenomeChange = (value: string | null) => {
  if (!value) return; // handle null safely
  setSelectedGenome(value);
  setSearchResults([]);
  setSelectedGene(null);
};

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;

    setSearchResults([]);
    setSelectedGene(null);
    setError(null);

    if (newMode === "browse" && selectedChromosome) {
      performGeneSearch(
        selectedChromosome,
        selectedGenome,
        (gene: GeneFromSearch) => gene.chrom === selectedChromosome,
      );
    }

    setMode(newMode);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    performGeneSearch(searchQuery, selectedGenome);
  };

  const loadBRCA1Example = () => {
    setMode("search");
    setSearchQuery("BRCA1");
    performGeneSearch("BRCA1", selectedGenome);
  };

  return (
    <div className="relative min-h-screen bg-zinc-50/50">
      {/* Decorative background blur (Modern SaaS Touch) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex justify-center">
        <div className="w-[800px] h-[400px] bg-gradient-to-tr from-[#de8246]/5 to-zinc-300/20 blur-3xl rounded-full -top-32 opacity-50"></div>
      </div>

      {/* Clean, blurred header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <div className="flex items-baseline gap-1">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              EVO<span className="text-[#de8246]">2</span>
            </h1>
          </div>
          <div className="h-4 w-px bg-zinc-200"></div>
          <span className="text-sm font-medium text-zinc-500">
            Variant Analysis
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 relative z-10">
        {selectedGene ? (
          <GeneViewer
            gene={selectedGene}
            genomeId={selectedGenome}
            onClose={() => setSelectedGene(null)}
          />
        ) : (
          <div className="space-y-6">
            {/* Settings / Genome Selection Card */}
            <Card className="rounded-2xl border-zinc-200/60 bg-white/80 shadow-sm shadow-black/[0.02] backdrop-blur-xl transition-all">
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-zinc-800">
                    Genome Assembly
                  </CardTitle>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                    Human
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <Select
                  value={selectedGenome}
                  onValueChange={handleGenomeChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-zinc-200 bg-white/50 transition-colors hover:bg-zinc-50 focus:ring-2 focus:ring-[#de8246]/20">
                    <SelectValue placeholder="Select genome assembly" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-zinc-200 shadow-lg">
                    {genomes.map((genome) => (
                      <SelectItem key={genome.id} value={genome.id} className="rounded-lg cursor-pointer">
                        {genome.id} <span className="text-zinc-400">—</span> {genome.name}
                        {genome.active && <span className="ml-2 text-[10px] uppercase tracking-wider text-green-600 font-semibold">Active</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedGenome && (
                  <p className="mt-3 text-xs font-medium text-zinc-400">
                    Source:{" "}
                    {genomes.find((genome) => genome.id === selectedGenome)?.sourceName}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Main Action Card */}
            <Card className="rounded-2xl border-zinc-200/60 bg-white shadow-sm shadow-black/[0.02] transition-all hover:shadow-md hover:shadow-black/[0.04]">
              <CardContent className="p-6">
                <Tabs
                  value={mode}
                  onValueChange={(value) => switchMode(value as Mode)}
                  className="w-full"
                >
                  <TabsList className="mb-8 grid w-full max-w-xs grid-cols-2 rounded-xl bg-zinc-100/80 p-1">
                    <TabsTrigger
                      className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm"
                      value="search"
                    >
                      <SearchCodeIcon className="mr-2 h-4 w-4" />
                      Search
                    </TabsTrigger>
                    <TabsTrigger
                      className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm"
                      value="browse"
                    >
                      <Clapperboard className="mr-2 h-4 w-4" />
                      Browse
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="search" className="mt-0">
                    <div className="flex flex-col gap-4">
                      <form onSubmit={handleSearch} className="relative flex w-full items-center">
                        <Search className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                        <Input
                          type="text"
                          placeholder="Search genes by symbol or name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-12 w-full rounded-xl border-zinc-200 bg-white pl-10 pr-24 shadow-sm transition-all focus-visible:border-[#de8246]/50 focus-visible:ring-4 focus-visible:ring-[#de8246]/10 placeholder:text-zinc-400"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="absolute right-1.5 h-9 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                          disabled={isLoading || !searchQuery.trim()}
                        >
                          Search
                        </Button>
                      </form>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>Not sure what to look for?</span>
                        <button
                          type="button"
                          className="font-medium text-[#de8246] hover:text-[#de8246]/80 transition-colors"
                          onClick={loadBRCA1Example}
                        >
                          Try BRCA1 example
                        </button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="browse" className="mt-0">
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
                      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Select Chromosome
                      </div>
                      <div className="max-h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200">
                        <div className="flex flex-wrap gap-2">
                          {chromosomes.map((chrom) => (
                            <Button
                              key={chrom.name}
                              variant={selectedChromosome === chrom.name ? "default" : "outline"}
                              size="sm"
                              className={`h-8 rounded-lg transition-all ${
                                selectedChromosome === chrom.name
                                  ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm"
                                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                              }`}
                              onClick={() => setSelectedChromosome(chrom.name)}
                            >
                              {chrom.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* State Management */}
                {isLoading && (
                  <div className="mt-12 flex flex-col items-center justify-center space-y-4 py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-[#de8246]"></div>
                    <p className="text-sm font-medium text-zinc-500 animate-pulse">Fetching genome data...</p>
                  </div>
                )}

                {error && (
                  <div className="mt-8 rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                  </div>
                )}

                {/* Results Table */}
                {searchResults.length > 0 && !isLoading && (
                  <div className="mt-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-zinc-900">
                        {mode === "search" ? "Search Results" : `Chromosome ${selectedChromosome}`}
                      </h4>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                        {searchResults.length} {searchResults.length === 1 ? "gene" : "genes"} found
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-zinc-50/80 border-b border-zinc-200 hover:bg-zinc-50/80">
                            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                              Symbol
                            </TableHead>
                            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                              Name
                            </TableHead>
                            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                              Location
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchResults.map((gene, index) => (
                            <TableRow
                              key={`${gene.symbol}-${index}`}
                              className="cursor-pointer border-b border-zinc-100 transition-colors hover:bg-zinc-50/80"
                              onClick={() => setSelectedGene(gene)}
                            >
                              <TableCell className="py-3 font-semibold text-zinc-900">
                                {gene.symbol}
                              </TableCell>
                              <TableCell className="py-3 text-sm text-zinc-600">
                                {gene.name}
                              </TableCell>
                              <TableCell className="py-3 text-sm text-zinc-500">
                                <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10">
                                  {gene.chrom}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && searchResults.length === 0 && (
                  <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 mb-4">
                      <Search className="h-6 w-6 text-zinc-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900">No results found</h3>
                    <p className="mt-1 text-sm text-zinc-500 max-w-[250px]">
                      {mode === "search"
                        ? "Try adjusting your search query to find specific genes."
                        : "Select a different chromosome to view available genes."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}