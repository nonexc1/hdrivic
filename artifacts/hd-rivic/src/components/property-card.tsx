import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, BedDouble, Bath, Square, Home, Building2, Trees, Store, ImageOff, MessageCircle, Mail, Bell } from "lucide-react";
import { Property } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { InquiryDialog } from "@/components/inquiry-dialog";
import { NotifyMeDialog } from "@/components/notify-me-dialog";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-2 ${className}`}>
        <ImageOff className="w-10 h-10 opacity-40" />
        <span className="text-xs text-gray-400">Imagen no disponible</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
};

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMode, setContactMode] = useState<"whatsapp" | "email" | null>(null);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const status = property.status as string;
  const isUnavailable = status === "vendido" || status === "rentado";
  const isRentado = status === "rentado";
  const isVendido = status === "vendido";

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency === 'PEN' ? 'PEN' : 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const whatsappUrl = useMemo(() => {
    const num = (property.whatsappNumber ?? "51924250021").replace(/[\s+\-()]/g, "");
    const message = encodeURIComponent(`Hola, estoy interesado en la propiedad: ${property.title} (ID: ${property.id})`);
    return `https://wa.me/${num}?text=${message}`;
  }, [property.id, property.title, property.whatsappNumber]);

  const openContact = (mode: "whatsapp" | "email") => {
    setContactMode(mode);
    setContactOpen(true);
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'casa': return <Home className="w-4 h-4" />;
      case 'departamento': return <Building2 className="w-4 h-4" />;
      case 'terreno': return <Trees className="w-4 h-4" />;
      case 'comercial': return <Store className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  const statusColorMap: Record<string, string> = {
    venta: "bg-blue-100 text-blue-800 border-blue-200",
    alquiler: "bg-green-100 text-green-800 border-green-200",
    airbnb: "bg-rose-100 text-rose-800 border-rose-200",
    vendido: "bg-gray-200 text-gray-700 border-gray-300",
    rentado: "bg-gray-200 text-gray-700 border-gray-300",
  };

  const statusLabel: Record<string, string> = {
    venta: "En venta",
    alquiler: "En alquiler",
    airbnb: "Airbnb",
    vendido: "No disponible",
    rentado: "Alquilado",
  };

  // Only show tag for Nuevo/Exclusivo — never show "Vendido" tag when status changed back
  const showTag = property.tag && property.tag !== "Vendido";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <Link href={`/propiedades/${property.id}`} className="block h-full group">
        <Card className="h-full overflow-hidden hover-elevate transition-all duration-300 border-border bg-white rounded-xl">
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            {property.images && property.images.length > 0 ? (
              <>
                <ImageWithFallback
                  src={property.images[0]}
                  alt={property.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 ${property.images.length > 1 ? 'group-hover:opacity-0' : ''}`}
                />
                {property.images.length > 1 && (
                  <ImageWithFallback
                    src={property.images[1]}
                    alt={`${property.title} alternate`}
                    className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-105"
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Building2 className="w-12 h-12 opacity-20" />
              </div>
            )}

            {/* Status + special badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge variant="secondary" className={`${statusColorMap[status] ?? "bg-gray-100 text-gray-700"} uppercase tracking-wider text-[10px] font-bold px-2 py-1 shadow-sm`}>
                {statusLabel[status] ?? status}
              </Badge>
              {isVendido && (
                <Badge className="bg-secondary text-white border-none uppercase tracking-wider text-[10px] font-bold px-2 py-1 shadow-sm">
                  Vendido
                </Badge>
              )}
              {showTag && (
                <Badge className="bg-secondary text-white border-none uppercase tracking-wider text-[10px] font-bold px-2 py-1 shadow-sm">
                  {property.tag}
                </Badge>
              )}
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-4 right-4">
              <div className="bg-primary/90 backdrop-blur-md text-white px-4 py-2 rounded shadow-lg font-sans font-bold text-lg">
                {formatPrice(property.price, property.currency)}
              </div>
            </div>
          </div>

          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-gray-500 text-xs uppercase tracking-wide">
                <MapPin className="w-3 h-3 mr-1" />
                {property.district}
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <div className="p-1.5 rounded-full bg-gray-50 text-gray-600">
                    {getPropertyTypeIcon(property.type)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="capitalize">{property.type}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <h3 className="font-sans text-xl font-bold text-primary mb-2 line-clamp-1 group-hover:text-secondary transition-colors">
              {property.title}
            </h3>

            <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
              {property.description}
            </p>

            {/* Amenities */}
            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
              {property.bedrooms !== null && property.bedrooms !== undefined && (
                <div className="flex items-center justify-center gap-1.5 text-gray-600 text-sm">
                  <BedDouble className="w-4 h-4 text-secondary" />
                  <span className="font-medium">{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms !== null && property.bathrooms !== undefined && (
                <div className="flex items-center justify-center gap-1.5 text-gray-600 text-sm">
                  <Bath className="w-4 h-4 text-secondary" />
                  <span className="font-medium">{property.bathrooms}</span>
                </div>
              )}
              {property.area !== null && property.area !== undefined && (
                <div className="flex items-center justify-center gap-1.5 text-gray-600 text-sm">
                  <Square className="w-4 h-4 text-secondary" />
                  <span className="font-medium">{property.area} m²</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {isRentado ? (
              <div className="mt-4">
                <Button
                  type="button"
                  size="sm"
                  className="w-full bg-secondary hover:bg-secondary/90 text-white"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setNotifyOpen(true); }}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notificarme cuando esté disponible
                </Button>
              </div>
            ) : !isUnavailable ? (
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openContact("whatsapp"); }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openContact("email"); }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Correo
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </Link>

      {!isUnavailable && (
        <InquiryDialog
          open={contactOpen}
          onOpenChange={setContactOpen}
          title={contactMode === "whatsapp" ? "Contactar por WhatsApp" : "Agendar visita"}
          description={contactMode === "whatsapp" ? "Completa tus datos y abriremos WhatsApp con tu mensaje listo." : "Déjanos tus datos y un asesor se contactará contigo a la brevedad."}
          submitLabel={contactMode === "whatsapp" ? "Abrir WhatsApp" : "Enviar Solicitud"}
          defaultMessage={`Hola, estoy interesado en la propiedad: ${property.title} (ID: ${property.id})`}
          onSubmit={() => {
            if (contactMode === "whatsapp") window.open(whatsappUrl, "_blank", "noopener,noreferrer");
            setContactOpen(false);
          }}
        />
      )}

      {isRentado && (
        <NotifyMeDialog
          open={notifyOpen}
          onOpenChange={setNotifyOpen}
          propertyId={property.id}
          propertyTitle={property.title}
        />
      )}
    </motion.div>
  );
}
