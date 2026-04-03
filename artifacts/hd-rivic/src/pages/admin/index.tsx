import { Layout } from "@/components/layout";
import { useGetCurrentUser, useGetPropertyStats, useListProperties, useListLeads, useListUsers, useApproveUser, useCreateProperty, useUpdateProperty, useDeleteProperty, getGetPropertyStatsQueryKey, getListPropertiesQueryKey, getGetPropertyQueryKey, getListLeadsQueryKey, getListUsersQueryKey } from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { useLocation, Link } from "wouter";
import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient as useQC } from "@tanstack/react-query";
import { Loader2, LayoutDashboard, Building2, Users, MessageSquare, Plus, Edit, Trash2, CheckCircle, XCircle, Upload, X, ImageIcon, ShieldCheck, Key, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CIUDADES, getDistritos } from "@/lib/peru-locations";

const propertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().min(1),
  currency: z.enum(["USD", "PEN"]),
  status: z.enum(["venta", "alquiler", "airbnb", "vendido", "rentado"]),
  type: z.enum(["casa", "departamento", "terreno", "comercial"]),
  ciudad: z.string().min(1, "Selecciona una ciudad"),
  district: z.string().min(1, "Selecciona un distrito"),
  address: z.string().min(5),
  area: z.coerce.number().optional().nullable(),
  bedrooms: z.coerce.number().optional().nullable(),
  bathrooms: z.coerce.number().optional().nullable(),
  parkingSpaces: z.coerce.number().optional().nullable(),
  featured: z.boolean().default(false),
  whatsappNumber: z.string().min(6),
  tag: z.enum(["Nuevo", "Exclusivo", "Vendido"]).optional().nullable(),
  images: z.string().transform(str => str.split(',').map(s => s.trim()).filter(Boolean))
});

function ImageUploadField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const urls = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      const serveUrl = `/api/storage${response.objectPath}`;
      const existing = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
      onChange([...existing, serveUrl].join(', '));
      toast({ title: "Imagen subida correctamente" });
    },
    onError: () => {
      toast({ title: "Error al subir imagen", variant: "destructive" });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const file of files) {
      await uploadFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeUrl = (idx: number) => {
    const next = urls.filter((_, i) => i !== idx);
    onChange(next.join(', '));
  };

  return (
    <div className="space-y-3">
      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((url, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-50">
              <img src={url} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button type="button" onClick={() => removeUrl(idx)} className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
              {idx === 0 && <span className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Principal</span>}
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 items-start">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isUploading ? "Subiendo..." : "Subir fotos desde tu computadora"}
        </Button>
        {urls.length === 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Ninguna imagen añadida</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">La primera imagen será la principal. Puedes subir varias fotos.</p>
    </div>
  );
}

export default function Admin() {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading, error: userError } = useGetCurrentUser();
  const { toast } = useToast();

  const initialTab = (() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    return params.get("tab") ?? "dashboard";
  })();

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [location]);

  const { data: unreadData, refetch: refetchUnread } = useQuery({
    queryKey: ["leads-unread"],
    queryFn: async () => {
      const res = await fetch("/api/leads/unread", { credentials: "include" });
      if (res.status === 401) throw Object.assign(new Error("Unauthorized"), { status: 401 });
      if (!res.ok) return { leads: [] };
      return res.json() as Promise<{ leads: unknown[] }>;
    },
    refetchInterval: 30000,
    enabled: !!user,
    retry: false,
  });

  const unreadCount = (unreadData?.leads ?? []).length;

  useEffect(() => {
    if (!isUserLoading) {
      const is401 = (userError as any)?.status === 401;
      if (is401) {
        toast({ title: "Sesión expirada", description: "Por favor inicia sesión nuevamente.", variant: "destructive" });
        setLocation("/login");
        return;
      }
      if (!user || !user.approved || (user.role !== "admin" && user.role !== "owner")) {
        setLocation("/login");
      }
    }
  }, [user, isUserLoading, userError, setLocation, toast]);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-[calc(100vh-80px)] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary">Panel Administrativo</h1>
              <p className="text-gray-500">Bienvenido, {user.name} ({user.role})</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full mb-8 ${user.role === "owner" ? "grid-cols-5 max-w-3xl" : "grid-cols-4 max-w-2xl"}`}>
              <TabsTrigger value="dashboard" className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4 hidden sm:block" /> Dashboard</TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2"><Building2 className="w-4 h-4 hidden sm:block" /> Propiedades</TabsTrigger>
              <TabsTrigger value="leads" className="flex items-center gap-2 relative">
                <MessageSquare className="w-4 h-4 hidden sm:block" /> Leads
                {unreadCount > 0 && (
                  <span className="ml-1 min-w-[18px] h-[18px] rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              {user.role === "owner" && (
                <TabsTrigger value="users" className="flex items-center gap-2"><Users className="w-4 h-4 hidden sm:block" /> Usuarios</TabsTrigger>
              )}
              <TabsTrigger value="account" className="flex items-center gap-2"><Key className="w-4 h-4 hidden sm:block" /> Mi cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardTab currentUser={user} />
            </TabsContent>

            <TabsContent value="properties">
              <PropertiesTab currentUser={user} />
            </TabsContent>

            <TabsContent value="leads">
              <LeadsTab onLeadRead={refetchUnread} />
            </TabsContent>

            {user.role === "owner" && (
              <TabsContent value="users">
                <UsersTab currentUser={user} />
              </TabsContent>
            )}

            <TabsContent value="account">
              <AccountTab currentUser={user} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

function DashboardTab({ currentUser }: { currentUser: any }) {
  const { data: stats, isLoading } = useGetPropertyStats();

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Propiedades</CardTitle>
          <Building2 className="w-4 h-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{stats.totalProperties}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">En Venta</CardTitle>
          <Building2 className="w-4 h-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{stats.forSale}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">En Alquiler</CardTitle>
          <Building2 className="w-4 h-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{stats.forRent}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Vendidos</CardTitle>
          <CheckCircle className="w-4 h-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{stats.sold}</div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.byType.map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="capitalize">{item.label}</span>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Por Distrito</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.byDistrict.map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span>{item.label}</span>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const PROPERTY_STATUS_OPTIONS = [
  { value: "venta",    label: "En venta",    color: "text-green-700 bg-green-50 border-green-200" },
  { value: "alquiler", label: "En alquiler", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { value: "airbnb",   label: "Airbnb",      color: "text-rose-700 bg-rose-50 border-rose-200" },
  { value: "rentado",  label: "Alquilado",   color: "text-gray-700 bg-gray-100 border-gray-300" },
  { value: "vendido",  label: "Vendido",     color: "text-gray-700 bg-gray-100 border-gray-300" },
] as const;

function PropertyStatusSelect({ propertyId, currentStatus }: { propertyId: number; currentStatus: string }) {
  const queryClient = useQC();
  const { toast } = useToast();

  const tagForStatus = (s: string): string | null => {
    if (s === "vendido") return "Vendido";
    return null;
  };

  const { mutate, isPending } = useUpdateProperty({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPropertyStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPropertyQueryKey(propertyId) });
        toast({ title: "Estado actualizado correctamente" });
      },
      onError: (err: any) => {
        if (err?.status === 401) return;
        toast({ title: "Error al actualizar el estado", variant: "destructive" });
      },
    },
  });

  const mutation = { mutate: (newStatus: string) => mutate({ id: propertyId, data: { status: newStatus as any, tag: tagForStatus(newStatus) as any } }), isPending };

  const opt = PROPERTY_STATUS_OPTIONS.find((o) => o.value === currentStatus);

  return (
    <Select
      value={currentStatus}
      onValueChange={(val) => mutation.mutate(val)}
      disabled={mutation.isPending}
    >
      <SelectTrigger className={`h-7 text-xs font-semibold border px-2 py-0 w-36 ${opt?.color ?? "bg-gray-50 text-gray-700"}`}>
        {mutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <SelectValue />}
      </SelectTrigger>
      <SelectContent>
        {PROPERTY_STATUS_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PropertiesTab({ currentUser }: { currentUser: any }) {
  const isAdmin = currentUser?.role === "admin";
  const { data: propertiesData, isLoading } = useListProperties(
    isAdmin ? { createdBy: currentUser.id } as any : undefined
  );
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Gestión de Propiedades
          {isAdmin && <span className="ml-2 text-sm font-normal text-gray-400">(solo tus propiedades)</span>}
        </CardTitle>
        <PropertyFormDialog open={isAddOpen} onOpenChange={setIsAddOpen} mode="create" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Ciudad / Distrito</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propertiesData?.properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">#{property.id}</TableCell>
                <TableCell className="max-w-[180px] truncate">
                  <Link href={`/propiedades/${property.id}`} className="text-secondary hover:underline font-medium">
                    {property.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <PropertyStatusSelect propertyId={property.id} currentStatus={property.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">{property.currency} {property.price.toLocaleString()}</TableCell>
                <TableCell>
                  {property.ciudad ? <span className="text-xs text-muted-foreground">{property.ciudad} · </span> : null}
                  {property.district}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <PropertyFormDialog mode="edit" property={property} />
                    <DeletePropertyDialog propertyId={property.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {propertiesData?.properties.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">No hay propiedades registradas</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PropertyFormDialog({ open, onOpenChange, mode, property }: { open?: boolean, onOpenChange?: (open: boolean) => void, mode: "create" | "edit", property?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : isOpen;
  const setDialogOpen = isControlled ? onOpenChange : setIsOpen;

  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: property ? {
      ...property,
      ciudad: property.ciudad || "",
      images: property.images.join(', '),
      area: property.area || null,
      bedrooms: property.bedrooms || null,
      bathrooms: property.bathrooms || null,
      parkingSpaces: property.parkingSpaces || null,
      tag: property.tag || null,
    } : {
      title: "",
      description: "",
      price: 0,
      currency: "USD",
      status: "venta",
      type: "departamento",
      ciudad: "",
      district: "",
      address: "",
      whatsappNumber: "+51924250021",
      featured: false,
      images: "",
    }
  });

  const selectedCiudad = useWatch({ control: form.control, name: "ciudad" });
  const distritos = getDistritos(selectedCiudad);

  const onSubmit = (values: any) => {
    if (mode === "create") {
      createProperty.mutate({ data: values }, {
        onSuccess: () => {
          toast({ title: "Éxito", description: "Propiedad creada." });
          queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPropertyStatsQueryKey() });
          setDialogOpen(false);
          form.reset();
        },
        onError: () => toast({ variant: "destructive", title: "Error", description: "No se pudo crear la propiedad." })
      });
    } else {
      updateProperty.mutate({ id: property.id, data: values }, {
        onSuccess: () => {
          toast({ title: "Éxito", description: "Propiedad actualizada." });
          queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPropertyStatsQueryKey() });
          setDialogOpen(false);
        },
        onError: () => toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la propiedad." })
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white"><Plus className="w-4 h-4 mr-2" /> Agregar</Button>
        ) : (
          <Button size="sm" variant="outline"><Edit className="w-4 h-4" /></Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nueva Propiedad" : "Editar Propiedad"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Título</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Descripción</FormLabel>
                  <FormControl><Textarea {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="PEN">PEN</SelectItem></SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="venta">Venta</SelectItem>
                      <SelectItem value="alquiler">Alquiler</SelectItem>
                      <SelectItem value="airbnb">Airbnb</SelectItem>
                      <SelectItem value="vendido">Vendido</SelectItem>
                      <SelectItem value="rentado">Alquilado (Rentado)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="departamento">Departamento</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="ciudad" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue("district", "");
                    }}
                    value={field.value}
                  >
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona ciudad" /></SelectTrigger></FormControl>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {CIUDADES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="district" render={({ field }) => (
                <FormItem>
                  <FormLabel>Distrito</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedCiudad}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedCiudad ? "Selecciona distrito" : "Primero elige una ciudad"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {distritos.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem>
                  <FormLabel>Área (m²)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="bedrooms" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dormitorios</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="images" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Imágenes</FormLabel>
                  <ImageUploadField value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )} />

            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createProperty.isPending || updateProperty.isPending}>
                {createProperty.isPending || updateProperty.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeletePropertyDialog({ propertyId }: { propertyId: number }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteProperty = useDeleteProperty();

  const onDelete = () => {
    deleteProperty.mutate({ id: propertyId }, {
      onSuccess: () => {
        toast({ title: "Éxito", description: "Propiedad eliminada." });
        queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPropertyStatsQueryKey() });
        setOpen(false);
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar." })
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive"><Trash2 className="w-4 h-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar propiedad?</DialogTitle>
        </DialogHeader>
        <p className="text-gray-500">Esta acción no se puede deshacer.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={onDelete} disabled={deleteProperty.isPending}>
            {deleteProperty.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const LEAD_STATUS_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  atendido: "bg-blue-100 text-blue-800",
  vendido: "bg-green-100 text-green-800",
  rentado: "bg-purple-100 text-purple-800",
  comprado: "bg-emerald-100 text-emerald-800",
};

const LEAD_STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "atendido", label: "Atendido" },
  { value: "vendido", label: "Vendido" },
  { value: "rentado", label: "Rentado" },
  { value: "comprado", label: "Comprado" },
];

function LeadsTab({ onLeadRead }: { onLeadRead?: () => void }) {
  const { data: leadsData, isLoading } = useListLeads();
  const qc = useQC();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/leads/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListLeadsQueryKey() });
      qc.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/leads/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getListLeadsQueryKey() });
      onLeadRead?.();
    },
  });

  const handleExport = () => {
    if (!leadsData?.leads) return;
    const rows = leadsData.leads.map((lead) => ({
      ID: lead.id,
      Fecha: new Date(lead.createdAt).toLocaleDateString("es-PE"),
      Nombre: lead.name,
      Email: lead.email,
      Teléfono: lead.phone,
      Tipo: lead.type.replace("_", " "),
      "Propiedad ID": lead.propertyId ?? "",
      Estado: lead.status,
      Mensaje: lead.message,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `leads_hdrivic_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle>Leads y Contactos ({leadsData?.total ?? 0})</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2 self-start sm:self-auto">
            <Download className="w-4 h-4" />
            Exportar Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Propiedad</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leadsData?.leads.map((lead) => (
              <TableRow
                key={lead.id}
                className={!lead.isRead ? "bg-blue-50/60 font-medium" : ""}
                onClick={() => { if (!lead.isRead) markRead.mutate(lead.id); }}
              >
                <TableCell className="whitespace-nowrap text-xs text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString("es-PE")}
                  {!lead.isRead && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-secondary" />}
                </TableCell>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>
                  <div className="text-sm">{lead.email}</div>
                  <div className="text-sm text-gray-500">{lead.phone}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase text-[10px]">{lead.type.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>
                  {lead.propertyId ? (
                    <Link href={`/propiedades/${lead.propertyId}`} className="text-primary hover:underline font-medium">
                      #{lead.propertyId}
                    </Link>
                  ) : "-"}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={lead.status ?? "pendiente"}
                    onValueChange={(val) => updateStatus.mutate({ id: lead.id, status: val })}
                  >
                    <SelectTrigger className="h-7 text-xs w-32 border-0 shadow-none p-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${LEAD_STATUS_COLORS[lead.status ?? "pendiente"]}`}>
                        {LEAD_STATUS_OPTIONS.find(o => o.value === (lead.status ?? "pendiente"))?.label}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${LEAD_STATUS_COLORS[opt.value]}`}>
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {leadsData?.leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">No hay leads registrados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AccountTab({ currentUser }: { currentUser: any }) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/users/me/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Contraseña actualizada correctamente" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const canSubmit =
    currentPassword.length >= 1 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword &&
    !changePassword.isPending;

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Mi cuenta</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">{currentUser?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Nombre</p>
              <p className="font-medium text-gray-800">{currentUser?.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Rol</p>
              <Badge variant="secondary" className="uppercase text-[10px]">{currentUser?.role}</Badge>
            </div>
          </div>

          <div className="border-t pt-5 space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" /> Cambiar contraseña
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Contraseña actual</label>
                <Input
                  type="password"
                  placeholder="Tu contraseña actual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nueva contraseña</label>
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                <Input
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
                )}
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => changePassword.mutate()}
                disabled={!canSubmit}
              >
                {changePassword.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
                Actualizar contraseña
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab({ currentUser }: { currentUser: any }) {
  const { data: usersData, isLoading } = useListUsers();
  const approveUser = useApproveUser();
  const queryClient = useQC();
  const { toast } = useToast();
  const [resetDialog, setResetDialog] = useState<{ open: boolean; userId: number; userName: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const changeRole = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await fetch(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Rol actualizado correctamente" });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  const resetPassword = useMutation({
    mutationFn: async ({ id, newPassword }: { id: number; newPassword: string }) => {
      const res = await fetch(`/api/users/${id}/reset-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Contraseña restablecida correctamente" });
      setResetDialog(null);
      setNewPassword("");
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Error", description: e.message }),
  });

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData?.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(role) => changeRole.mutate({ id: user.id, role })}
                      disabled={user.id === currentUser?.id}
                    >
                      <SelectTrigger className="w-28 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.approved ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">Aprobado</Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-500 border-orange-200">Pendiente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!user.approved && (
                        <Button size="sm" variant="outline" onClick={() => approveUser.mutate({ id: user.id }, {
                          onSuccess: () => { toast({ title: "Usuario aprobado" }); queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }); }
                        })} disabled={approveUser.isPending}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Aprobar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-500"
                        onClick={() => { setResetDialog({ open: true, userId: user.id, userName: user.name }); setNewPassword(""); }}
                      >
                        <Key className="w-3.5 h-3.5 mr-1" /> Contraseña
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!resetDialog?.open} onOpenChange={(o) => { if (!o) setResetDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restablecer contraseña — {resetDialog?.userName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-500">Escribe la nueva contraseña para este usuario.</p>
            <Input
              type="password"
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialog(null)}>Cancelar</Button>
            <Button
              onClick={() => resetPassword.mutate({ id: resetDialog!.userId, newPassword })}
              disabled={resetPassword.isPending || newPassword.length < 6}
            >
              {resetPassword.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Restablecer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
