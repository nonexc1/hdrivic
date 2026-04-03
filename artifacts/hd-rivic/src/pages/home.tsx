import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGetFeaturedProperties } from "@workspace/api-client-react";
import { PropertyCard } from "@/components/property-card";
import { Search, Building2, Key, Calendar, Map, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CIUDADES, getDistritos } from "@/lib/peru-locations";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: featuredProperties, isLoading } = useGetFeaturedProperties();

  const [searchStatus, setSearchStatus] = useState<string>("venta");
  const [searchType, setSearchType] = useState<string>("all");
  const [searchCity, setSearchCity] = useState<string>("all");
  const [searchDistrict, setSearchDistrict] = useState<string>("all");

  const districtOptions = useMemo(() => {
    if (searchCity === "all") return [];
    return getDistritos(searchCity);
  }, [searchCity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchStatus && searchStatus !== "all") params.append("status", searchStatus);
    if (searchType && searchType !== "all") params.append("type", searchType);
    if (searchCity && searchCity !== "all") params.append("city", searchCity);
    if (searchDistrict && searchDistrict !== "all") params.append("district", searchDistrict);

    setLocation(`/propiedades?${params.toString()}`);
  };

  const setOperation = (operation: string) => {
    setSearchStatus(operation);
  };

  const services = [
    {
      title: "Compra y Venta",
      description: "Asesoramiento integral en la compra y venta de propiedades residenciales y comerciales.",
      icon: <Building2 className="w-8 h-8 text-secondary" />
    },
    {
      title: "Alquileres Premium",
      description: "Encuentra el lugar perfecto con contratos seguros y condiciones claras.",
      icon: <Key className="w-8 h-8 text-secondary" />
    },
    {
      title: "Gestión Airbnb",
      description: "Maximizamos el rendimiento de tu propiedad con gestión profesional de alquileres a corto plazo.",
      icon: <Calendar className="w-8 h-8 text-secondary" />
    },
    {
      title: "Terrenos e Inversión",
      description: "Oportunidades de inversión en terrenos con alto potencial de revalorización.",
      icon: <Map className="w-8 h-8 text-secondary" />
    }
  ];

  return (
    <Layout>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(43,127,212,0.28),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(28,58,110,0.38),_transparent_32%),linear-gradient(135deg,rgba(10,18,35,0.96),rgba(17,35,61,0.93))]" />
        <div className="absolute inset-0 bg-[url('/images/hero-1.png')] bg-cover bg-center opacity-[0.11] mix-blend-screen" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white text-xs font-semibold tracking-[0.2em] uppercase mb-6 backdrop-blur-sm border border-white/15 shadow-sm">
                HD RIVIC GLOBAL S.A.C.
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold text-white leading-tight mb-6">
                Encuentra tu hogar con estilo profesional.
              </h1>
              <p className="text-lg md:text-xl text-white/78 max-w-2xl mb-8 font-light leading-relaxed">
                Plataforma inmobiliaria moderna, clara y confiable para comprar, alquilar y descubrir proyectos en Perú.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/propiedades"><Button className="h-12 px-6 bg-secondary hover:bg-secondary/90 text-white font-bold">Ver propiedades</Button></Link>
                <Link href="/admin"><Button variant="outline" className="h-12 px-6 border-white/25 text-white hover:bg-white hover:text-primary bg-transparent">Portal admin</Button></Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="bg-white/96 rounded-2xl shadow-2xl p-5 md:p-6 border border-white/70 backdrop-blur-sm">
              <div className="flex gap-2 mb-5">
                <button type="button" onClick={() => setOperation("venta")} className={`flex-1 h-11 rounded-xl text-sm font-semibold ${searchStatus === "venta" ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}>Comprar</button>
                <button type="button" onClick={() => setOperation("alquiler")} className={`flex-1 h-11 rounded-xl text-sm font-semibold ${searchStatus === "alquiler" ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}>Alquilar</button>
                <button type="button" onClick={() => setOperation("airbnb")} className={`flex-1 h-11 rounded-xl text-sm font-semibold ${searchStatus === "airbnb" ? "bg-primary text-white" : "bg-slate-100 text-slate-700"}`}>Proyectos</button>
              </div>
              <form onSubmit={handleSearch} className="grid gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de Inmueble</label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-full border-gray-200 bg-gray-50 h-12"><SelectValue placeholder="Todos los Tipos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Tipos</SelectItem>
                      <SelectItem value="departamento">Departamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ciudad</label>
                  <Select value={searchCity} onValueChange={(value) => { setSearchCity(value); setSearchDistrict("all"); }}>
                    <SelectTrigger className="w-full border-gray-200 bg-gray-50 h-12">
                      <SelectValue placeholder="Selecciona una ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las ciudades</SelectItem>
                      {CIUDADES.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Distrito</label>
                  <Select value={searchDistrict} onValueChange={setSearchDistrict} disabled={searchCity === "all"}>
                    <SelectTrigger className="w-full border-gray-200 bg-gray-50 h-12">
                      <SelectValue placeholder={searchCity === "all" ? "Primero elige una ciudad" : "Selecciona un distrito"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los distritos</SelectItem>
                      {districtOptions.map((district) => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rango de precio</label>
                  <Select value={searchStatus} onValueChange={setSearchStatus}>
                    <SelectTrigger className="w-full border-gray-200 bg-gray-50 h-12"><SelectValue placeholder="Selecciona un rango" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venta">S/ 0 - S/ 350,000</SelectItem>
                      <SelectItem value="alquiler">S/ 350,000 - S/ 900,000</SelectItem>
                      <SelectItem value="airbnb">S/ 900,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white font-bold tracking-wide uppercase"><Search className="w-5 h-5 mr-2" />Buscar</Button>
              </form>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50"><ChevronDown className="w-8 h-8" /></div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-sm font-bold text-secondary uppercase tracking-widest mb-2">Selección Exclusiva</h2>
              <h3 className="text-3xl md:text-4xl font-sans font-bold text-primary">Propiedades Destacadas</h3>
            </div>
            <Link href="/propiedades" className="hidden md:inline-flex items-center text-primary font-medium hover:text-secondary transition-colors">
              Ver todas las propiedades
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{[1, 2, 3].map((i) => <div key={i} className="h-[400px] bg-gray-200 animate-pulse rounded-xl"></div>)}</div>
          ) : featuredProperties?.properties && featuredProperties.properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{featuredProperties.properties.slice(0, 3).map((property, index) => <PropertyCard key={property.id} property={property} index={index} />)}</div>
          ) : (
            <div className="text-center py-12 text-gray-500">No hay propiedades destacadas en este momento.</div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link href="/propiedades"><Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">Ver todas las propiedades</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-secondary uppercase tracking-widest mb-2">Nosotros</h2>
            <h3 className="text-3xl md:text-4xl font-sans font-bold text-primary mb-6">Soluciones Inmobiliarias Integrales</h3>
            <p className="text-gray-600">Ofrecemos un servicio 360° para garantizar que su experiencia inmobiliaria sea fluida, segura y rentable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="bg-gray-50 p-8 rounded-xl hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                <h4 className="text-xl font-sans font-bold text-primary mb-4">{service.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
