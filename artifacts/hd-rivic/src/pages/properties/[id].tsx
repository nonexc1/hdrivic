import { Layout } from "@/components/layout";
import { useGetProperty, useCreateLead, getGetPropertyQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { useState } from "react";
import { Loader2, MapPin, BedDouble, Bath, Square, ChevronLeft, ChevronRight, CarFront, MessageCircle, Mail, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InquiryDialog } from "@/components/inquiry-dialog";
import { NotifyMeDialog } from "@/components/notify-me-dialog";

const contactFormSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "Teléfono requerido"),
  message: z.string().min(10, "Mensaje demasiado corto"),
});

export default function PropertyDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { toast } = useToast();
  
  const { data: property, isLoading } = useGetProperty(id, { 
    query: { enabled: !!id, queryKey: getGetPropertyQueryKey(id) } 
  });
  
  const createLead = useCreateLead();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMode, setContactMode] = useState<"whatsapp" | "email" | null>(null);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "Hola, me interesa agendar una visita para esta propiedad.",
    },
  });

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const onSubmit = (values: z.infer<typeof contactFormSchema>) => {
    createLead.mutate(
      {
        data: {
          ...values,
          type: "agendar_visita",
          propertyId: id,
        }
      },
      {
        onSuccess: () => {
          toast({
            title: "Solicitud enviada",
            description: "Nos contactaremos pronto para confirmar su visita.",
          });
          form.reset();
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Hubo un problema al enviar su solicitud.",
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-secondary" />
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center pt-20">
          <h1 className="text-2xl font-bold text-primary mb-4">Propiedad no encontrada</h1>
          <Button onClick={() => window.history.back()}>Volver atrás</Button>
        </div>
      </Layout>
    );
  }

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

  const waNumber = (property.whatsappNumber ?? "51924250051").replace(/[\s+\-()]/g, "");
  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola, estoy interesado en la propiedad: ${property.title} (ID: ${id})`)}`;
  const whatsappVendidoUrl = `https://wa.me/51924250051?text=${encodeURIComponent("Hola, busco propiedades similares a las que tienen disponibles")}`;

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

  // Only show "Nuevo" / "Exclusivo" tags — never persist "Vendido" tag when status changed
  const showTag = property.tag && property.tag !== "Vendido";

  return (
    <Layout>
      <div className="bg-white pb-24 pt-24 md:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="secondary" className={`${statusColorMap[status] ?? "bg-gray-100 text-gray-700"} uppercase tracking-wider text-xs font-bold px-3 py-1`}>
                {statusLabel[status] ?? status}
              </Badge>
              {isVendido && (
                <Badge className="bg-secondary text-white border-none uppercase tracking-wider text-xs font-bold px-3 py-1">
                  Vendido
                </Badge>
              )}
              {showTag && (
                <Badge className="bg-secondary text-white border-none uppercase tracking-wider text-xs font-bold px-3 py-1">
                  {property.tag}
                </Badge>
              )}
              {isRentado && (
                <button
                  onClick={() => setNotifyOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow hover:bg-secondary/90 transition-colors uppercase tracking-wider"
                >
                  <Bell className="w-3.5 h-3.5" />
                  Notificarme cuando esté disponible
                </button>
              )}
              <span className="text-gray-500 flex items-center text-sm ml-auto">
                <MapPin className="w-4 h-4 mr-1" />
                {property.address}, {property.district}
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h1 className="text-3xl md:text-5xl font-sans font-bold text-primary leading-tight flex-1">
                {property.title}
              </h1>
              <div className="text-3xl md:text-4xl font-sans font-bold text-secondary shrink-0">
                {formatPrice(property.price, property.currency)}
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="mb-10">
            <div className="relative rounded-2xl overflow-hidden group bg-gray-100 h-[420px] md:h-[560px] w-full">
              {property.images && property.images.length > 0 ? (
                <>
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {property.images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={prevImage} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-primary hover:bg-white hover:text-secondary transition-colors shadow-lg">
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button onClick={nextImage} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-primary hover:bg-white hover:text-secondary transition-colors shadow-lg">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-medium">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No hay imágenes disponibles</div>
              )}
            </div>

            {property.images && property.images.length > 1 && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? "border-secondary scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-2xl p-6 mb-10 flex flex-wrap gap-8 items-center justify-center divide-x divide-gray-200">
                {property.bedrooms !== null && (
                  <div className="flex flex-col items-center px-4">
                    <BedDouble className="w-6 h-6 text-secondary mb-2" />
                    <span className="font-bold text-lg text-primary">{property.bedrooms}</span>
                    <span className="text-gray-500 text-xs uppercase tracking-wider">Dormitorios</span>
                  </div>
                )}
                {property.bathrooms !== null && (
                  <div className="flex flex-col items-center px-4">
                    <Bath className="w-6 h-6 text-secondary mb-2" />
                    <span className="font-bold text-lg text-primary">{property.bathrooms}</span>
                    <span className="text-gray-500 text-xs uppercase tracking-wider">Baños</span>
                  </div>
                )}
                {property.parkingSpaces !== null && (
                  <div className="flex flex-col items-center px-4">
                    <CarFront className="w-6 h-6 text-secondary mb-2" />
                    <span className="font-bold text-lg text-primary">{property.parkingSpaces}</span>
                    <span className="text-gray-500 text-xs uppercase tracking-wider">Cocheras</span>
                  </div>
                )}
                {property.area !== null && (
                  <div className="flex flex-col items-center px-4">
                    <Square className="w-6 h-6 text-secondary mb-2" />
                    <span className="font-bold text-lg text-primary">{property.area} m²</span>
                    <span className="text-gray-500 text-xs uppercase tracking-wider">Área Total</span>
                  </div>
                )}
              </div>

              <div className="prose max-w-none">
                <h3 className="text-2xl font-sans font-bold text-primary mb-4">Descripción de la Propiedad</h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="sticky top-24">
                {isRentado ? (
                  /* Rentado state: compact notice + notify button */
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                      <Bell className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-gray-700 text-lg mb-1">Propiedad alquilada</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">Esta propiedad está actualmente ocupada. Regístrate y te avisamos en cuanto esté disponible.</p>
                    </div>
                    <Button
                      className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white font-bold"
                      onClick={() => setNotifyOpen(true)}
                    >
                      <Bell className="w-5 h-5 mr-2" />
                      Notificarme cuando esté disponible
                    </Button>
                  </div>
                ) : isVendido ? (
                  /* Vendido state: show sold card */
                  <Card className="border-border shadow-xl rounded-2xl overflow-hidden">
                    <div className="bg-gray-700 p-6 text-center">
                      <h3 className="text-xl font-sans font-bold text-white mb-2">Propiedad Vendida</h3>
                      <p className="text-white/70 text-sm">Esta propiedad ya fue vendida. Contáctanos para conocer propiedades similares disponibles.</p>
                    </div>
                    <CardContent className="p-6">
                      <a href={whatsappVendidoUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold">
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Consultar propiedades similares
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                ) : (
                  /* Available: WhatsApp hero + form */
                  <div className="space-y-4">
                    {/* WhatsApp — Primary CTA */}
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="bg-[#25D366] hover:bg-[#1EBE5D] active:bg-[#128C7E] transition-colors rounded-2xl p-6 shadow-xl cursor-pointer">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white shrink-0" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.532 5.849L.057 23.886a.5.5 0 0 0 .609.61l6.098-1.595A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 0 1-5.337-1.547l-.383-.229-3.963 1.036 1.054-3.859-.249-.396A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                          </svg>
                          <div>
                            <p className="text-white font-bold text-xl leading-tight">Consultar por WhatsApp</p>
                            <p className="text-white/80 text-sm">Respuesta inmediata · Gratis</p>
                          </div>
                        </div>
                        <div className="mt-3 bg-white/20 rounded-xl py-2.5 text-center">
                          <span className="text-white font-bold text-base tracking-wide">Enviar mensaje ahora →</span>
                        </div>
                      </div>
                    </a>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">o agendar visita</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Contact form */}
                    <Card className="border-border shadow-lg rounded-2xl overflow-hidden">
                      <CardContent className="p-6">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre completo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ej. Juan Pérez" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Correo electrónico</FormLabel>
                                <FormControl>
                                  <Input placeholder="ejemplo@correo.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                  <Input placeholder="+51 999 999 999" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mensaje</FormLabel>
                                <FormControl>
                                  <Textarea className="resize-none" rows={3} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white font-bold" disabled={createLead.isPending}>
                            {createLead.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar Solicitud"}
                          </Button>
                        </form>
                      </Form>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          className="bg-[#25D366] hover:bg-[#128C7E] text-white"
                          onClick={() => { setContactMode("whatsapp"); setContactOpen(true); }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => { setContactMode("email"); setContactOpen(true); }}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Correo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      {!isUnavailable && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full"
          >
            <Button className="w-full h-14 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg rounded-xl">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Escríbeme por WhatsApp
            </Button>
          </a>
        </div>
      )}

      {isRentado && (
        <NotifyMeDialog
          open={notifyOpen}
          onOpenChange={setNotifyOpen}
          propertyId={property.id}
          propertyTitle={property.title}
        />
      )}

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
    </Layout>
  );
}
