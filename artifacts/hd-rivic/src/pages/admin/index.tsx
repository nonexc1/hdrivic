import { Layout } from "@/components/layout";
import { useGetCurrentUser, useGetPropertyStats, useListProperties, useListLeads, useListUsers, useApproveUser, useCreateProperty, useUpdateProperty, useDeleteProperty, getGetPropertyStatsQueryKey, getListPropertiesQueryKey, getListLeadsQueryKey, getListUsersQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Loader2, LayoutDashboard, Building2, Users, MessageSquare, Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const propertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().min(1),
  currency: z.enum(["USD", "PEN"]),
  status: z.enum(["venta", "alquiler", "airbnb", "vendido"]),
  type: z.enum(["casa", "departamento", "terreno", "comercial"]),
  district: z.string().min(2),
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

export default function Admin() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useGetCurrentUser();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || !user.approved || (user.role !== "admin" && user.role !== "owner")) {
        setLocation("/login");
      }
    }
  }, [user, isUserLoading, setLocation]);

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
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4 hidden sm:block" /> Dashboard</TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2"><Building2 className="w-4 h-4 hidden sm:block" /> Propiedades</TabsTrigger>
              <TabsTrigger value="leads" className="flex items-center gap-2"><MessageSquare className="w-4 h-4 hidden sm:block" /> Leads</TabsTrigger>
              {user.role === "owner" && (
                <TabsTrigger value="users" className="flex items-center gap-2"><Users className="w-4 h-4 hidden sm:block" /> Usuarios</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>

            <TabsContent value="properties">
              <PropertiesTab />
            </TabsContent>

            <TabsContent value="leads">
              <LeadsTab />
            </TabsContent>

            {user.role === "owner" && (
              <TabsContent value="users">
                <UsersTab />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

function DashboardTab() {
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

function PropertiesTab() {
  const { data: propertiesData, isLoading } = useListProperties();
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestión de Propiedades</CardTitle>
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
              <TableHead>Distrito</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propertiesData?.properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">#{property.id}</TableCell>
                <TableCell>{property.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase text-[10px]">{property.status}</Badge>
                </TableCell>
                <TableCell>{property.currency} {property.price.toLocaleString()}</TableCell>
                <TableCell>{property.district}</TableCell>
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
      district: "",
      address: "",
      whatsappNumber: "+51 999 999 999",
      featured: false,
      images: "",
    }
  });

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

              <FormField control={form.control} name="district" render={({ field }) => (
                <FormItem>
                  <FormLabel>Distrito</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
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
                  <FormLabel>Imágenes (URLs separadas por coma)</FormLabel>
                  <FormControl><Textarea {...field} rows={2} placeholder="https://i.ibb.co/foto1.jpg, https://i.ibb.co/foto2.jpg" /></FormControl>
                  <p className="text-xs text-amber-600 mt-1">
                    Usa servicios que permitan enlace directo: <strong>ImgBB</strong> (imgbb.com), <strong>PostImages</strong> (postimages.org) o <strong>Cloudinary</strong>. Imgur y Google Drive <strong>no funcionan</strong>.
                  </p>
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

function LeadsTab() {
  const { data: leadsData, isLoading } = useListLeads();

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads y Contactos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Propiedad ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leadsData?.leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{new Date(lead.createdAt).toLocaleDateString('es-PE')}</TableCell>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>
                  <div className="text-sm">{lead.email}</div>
                  <div className="text-sm text-gray-500">{lead.phone}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase text-[10px]">{lead.type.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell>{lead.propertyId ? `#${lead.propertyId}` : '-'}</TableCell>
              </TableRow>
            ))}
            {leadsData?.leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">No hay leads registrados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function UsersTab() {
  const { data: usersData, isLoading } = useListUsers();
  const approveUser = useApproveUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const handleApprove = (id: number) => {
    approveUser.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Éxito", description: "Usuario aprobado." });
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "No se pudo aprobar." })
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios (Solo Owner)</CardTitle>
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
                  <Badge variant="secondary" className="uppercase text-[10px]">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  {user.approved ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">Aprobado</Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-500 border-orange-200">Pendiente</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!user.approved && user.role !== "owner" && (
                    <Button size="sm" onClick={() => handleApprove(user.id)} disabled={approveUser.isPending}>
                      Aprobar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
