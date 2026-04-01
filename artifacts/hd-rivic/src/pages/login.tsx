import { Layout } from "@/components/layout";
import { useState } from "react";
import { useLoginUser, useCreateUser } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña mínima 6 caracteres"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña mínima 6 caracteres"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginUser = useLoginUser();
  const createUser = useCreateUser();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginUser.mutate(
      { data: values },
      {
        onSuccess: (user) => {
          if (!user.approved) {
            toast({
              title: "Cuenta pendiente",
              description: "Tu cuenta debe ser aprobada por el administrador.",
              variant: "destructive"
            });
            return;
          }
          toast({ title: "Bienvenido", description: "Inicio de sesión exitoso." });
          window.location.href = "/admin";
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Credenciales incorrectas o cuenta no existe.",
          });
        }
      }
    );
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    createUser.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "Registro exitoso",
            description: "Tu cuenta ha sido creada y está pendiente de aprobación.",
          });
          registerForm.reset();
          setActiveTab("login");
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: err?.message || "Ocurrió un error al registrarse.",
          });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-serif text-2xl text-primary font-bold">Portal Administrativo</CardTitle>
            <CardDescription>Acceso exclusivo para personal de HD RIVIC</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Ingresar</TabsTrigger>
                <TabsTrigger value="register">Solicitar Acceso</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@hdrivic.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loginUser.isPending}>
                      {loginUser.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Iniciar Sesión
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo corporativo</FormLabel>
                          <FormControl>
                            <Input placeholder="ejemplo@hdrivic.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white" disabled={createUser.isPending}>
                      {createUser.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Solicitar Cuenta
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
