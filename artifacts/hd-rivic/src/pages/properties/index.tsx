import { Layout } from "@/components/layout";
import { PropertyCard } from "@/components/property-card";
import { useListProperties, useListDistricts } from "@workspace/api-client-react";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CIUDADES, getDistritos } from "@/lib/peru-locations";

export default function Properties() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  // Filter states
  const [status, setStatus] = useState<string>(searchParams.get("status") || "all");
  const [type, setType] = useState<string>(searchParams.get("type") || "all");
  const [city, setCity] = useState<string>(searchParams.get("city") || "all");
  const [district, setDistrict] = useState<string>(searchParams.get("district") || "all");
  const [minPrice, setMinPrice] = useState<string>(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("maxPrice") || "");

  const { data: districtsData } = useListDistricts();
  const districtOptions = useMemo(() => {
    if (city === "all") return districtsData?.districts ?? [];
    return getDistritos(city);
  }, [city, districtsData]);
  
  // Construct query params safely
  const queryParams: any = {};
  if (status && status !== "all") queryParams.status = status;
  if (type && type !== "all") queryParams.type = type;
  if (city && city !== "all") queryParams.city = city;
  if (district && district !== "all") queryParams.district = district;
  if (minPrice) queryParams.minPrice = Number(minPrice);
  if (maxPrice) queryParams.maxPrice = Number(maxPrice);

  const { data: propertiesData, isLoading } = useListProperties(queryParams);

  const clearFilters = () => {
    setStatus("all");
    setType("all");
    setCity("all");
    setDistrict("all");
    setMinPrice("");
    setMaxPrice("");
    window.history.pushState({}, '', '/propiedades');
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Operación</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas las operaciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las operaciones</SelectItem>
            <SelectItem value="venta">En Venta</SelectItem>
            <SelectItem value="alquiler">En Alquiler</SelectItem>
            <SelectItem value="airbnb">Airbnb</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Inmueble</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="departamento">Departamento</SelectItem>
            <SelectItem value="casa">Casa</SelectItem>
            <SelectItem value="terreno">Terreno</SelectItem>
            <SelectItem value="comercial">Comercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Ciudad</label>
        <Select value={city} onValueChange={(value) => { setCity(value); setDistrict("all"); }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas las ciudades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ciudades</SelectItem>
            {CIUDADES.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Distrito</label>
        <Select value={district} onValueChange={setDistrict} disabled={city === "all"}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={city === "all" ? "Primero elige una ciudad" : "Todos los distritos"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los distritos</SelectItem>
            {districtOptions.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Rango de Precio</label>
        <div className="flex items-center space-x-2">
          <Input 
            type="number" 
            placeholder="Min" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-gray-500">-</span>
          <Input 
            type="number" 
            placeholder="Max" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Limpiar Filtros
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="bg-primary pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-sans font-bold text-white mb-4">Catálogo de Propiedades</h1>
          <p className="text-gray-300">Encuentra la propiedad ideal que se ajuste a tus necesidades y estilo de vida.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="sticky top-32 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-sans font-bold text-primary mb-6 flex items-center">
                <SlidersHorizontal className="w-5 h-5 mr-2 text-secondary" />
                Filtros
              </h2>
              <FilterContent />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters Header */}
            <div className="flex justify-between items-center mb-6 md:hidden">
              <span className="text-gray-600 font-medium">
                {propertiesData?.total || 0} resultados
              </span>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="font-sans">Filtros de Búsqueda</SheetTitle>
                  </SheetHeader>
                  <FilterContent />
                </SheetContent>
              </Sheet>
            </div>

            <div className="hidden md:block mb-6 text-gray-600 font-medium">
              Mostrando {propertiesData?.total || 0} resultados
            </div>

            {/* Properties Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" />
              </div>
            ) : propertiesData?.properties?.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">No se encontraron propiedades</h3>
                <p className="text-gray-500 mb-6">Intenta ajustar los filtros de búsqueda.</p>
                <Button onClick={clearFilters} variant="outline">
                  Limpiar todos los filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertiesData?.properties?.map((property, index) => (
                  <PropertyCard key={property.id} property={property} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
