import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useGetFeaturedProperties } from "@workspace/api-client-react";
import { PropertyCard } from "@/components/property-card";
import { Search, Building2, Key, Calendar, Map, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: featuredProperties, isLoading } = useGetFeaturedProperties();

  // Search State
  const [searchStatus, setSearchStatus] = useState<string>("venta");
  const [searchType, setSearchType] = useState<string>("all");
  const [searchDistrict, setSearchDistrict] = useState<string>("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchStatus && searchStatus !== "all") params.append("status", searchStatus);
    if (searchType && searchType !== "all") params.append("type", searchType);
    if (searchDistrict) params.append("district", searchDistrict);
    
    setLocation(`/propiedades?${params.toString()}`);
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
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Slider */}
        <div className="absolute inset-0 z-0 bg-primary">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero-1.png')" }}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary/90" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center max-w-4xl mx-auto mb-12"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Construyendo tu Futuro, <br/>
              <span className="text-secondary italic">Encontrando tu Lugar.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto font-light">
              Exclusividad, confianza y rentabilidad. HD RIVIC GLOBAL S.A.C. te acompaña en la decisión más importante de tu vida.
            </p>
          </motion.div>

          {/* Search Bar Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-4 md:p-6"
          >
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Operación</label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="w-full border-gray-200 bg-gray-50 h-12">
                    <SelectValue placeholder="Tipo de Operación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venta">Comprar</SelectItem>
                    <SelectItem value="alquiler">Alquilar</SelectItem>
                    <SelectItem value="airbnb">Airbnb</SelectItem>
                    <SelectItem value="all">Todas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de Inmueble</label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-full border-gray-200 bg-gray-50 h-12">
                    <SelectValue placeholder="Todos los Tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Tipos</SelectItem>
                    <SelectItem value="departamento">Departamento</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="terreno">Terreno</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Distrito</label>
                <Input 
                  placeholder="Ej. Miraflores, San Isidro..." 
                  className="w-full border-gray-200 bg-gray-50 h-12"
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                />
              </div>

              <div className="flex items-end md:w-auto w-full mt-4 md:mt-0">
                <Button type="submit" className="w-full md:w-auto h-12 px-8 bg-secondary hover:bg-secondary/90 text-white font-bold tracking-wide uppercase">
                  <Search className="w-5 h-5 mr-2" />
                  Buscar
                </Button>
              </div>
            </form>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
          <ChevronDown className="w-8 h-8" />
        </div>
      </section>

      {/* Featured Properties */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] bg-gray-200 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : featuredProperties?.properties && featuredProperties.properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.properties.slice(0, 3).map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No hay propiedades destacadas en este momento.
            </div>
          )}
          
          <div className="mt-12 text-center md:hidden">
            <Link href="/propiedades">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                Ver todas las propiedades
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-secondary uppercase tracking-widest mb-2">Nuestros Servicios</h2>
            <h3 className="text-3xl md:text-4xl font-sans font-bold text-primary mb-6">Soluciones Inmobiliarias Integrales</h3>
            <p className="text-gray-600">
              Ofrecemos un servicio 360° para garantizar que su experiencia inmobiliaria sea fluida, segura y rentable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-xl transition-shadow duration-300 border border-gray-100 group"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h4 className="text-xl font-sans font-bold text-primary mb-4">{service.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Preview */}
      <section className="py-24 bg-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img src="/images/hero-2.png" alt="HD RIVIC Office" className="rounded-xl shadow-2xl object-cover aspect-[4/5] w-full" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-bold text-secondary uppercase tracking-widest mb-2">Sobre Nosotros</h2>
              <h3 className="text-3xl md:text-5xl font-sans font-bold mb-6 leading-tight">Excelencia en Cada Transacción</h3>
              
              <p className="text-gray-300 mb-6 text-lg font-light leading-relaxed">
                En HD RIVIC GLOBAL S.A.C., no solo vendemos propiedades; construimos relaciones basadas en la confianza, la transparencia y los resultados.
              </p>
              
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                Con años de experiencia en el mercado inmobiliario peruano, entendemos que cada cliente tiene necesidades únicas. Ya sea que busque su hogar ideal en Miraflores, desee vender una propiedad comercial, o quiera maximizar su ROI a través de Airbnb, nuestro equipo de expertos lo guiará paso a paso.
              </p>

              <ul className="space-y-4 mb-10">
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary mr-3" />
                  <span className="font-medium text-gray-200">Asesoría Legal Segura y Transparente</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary mr-3" />
                  <span className="font-medium text-gray-200">Enfoque en Rentabilidad (ROI)</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-secondary mr-3" />
                  <span className="font-medium text-gray-200">Cartera Exclusiva de Propiedades</span>
                </li>
              </ul>

              <Link href="/contacto">
                <Button className="bg-secondary hover:bg-secondary/90 text-white px-8 h-12 text-base font-bold uppercase tracking-wide">
                  Conoce Más
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-sans font-bold text-primary mb-6">¿Listo para el Siguiente Paso?</h2>
          <p className="text-xl text-gray-600 mb-10 font-light">
            Un asesor especializado de HD RIVIC está listo para escuchar sus necesidades y presentarle las mejores opciones del mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/propiedades">
              <Button className="w-full sm:w-auto h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold text-lg">
                Explorar Propiedades
              </Button>
            </Link>
            <a href="https://wa.me/51999999999" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full sm:w-auto h-14 px-8 border-primary text-primary hover:bg-primary hover:text-white font-bold text-lg">
                Contactar por WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
