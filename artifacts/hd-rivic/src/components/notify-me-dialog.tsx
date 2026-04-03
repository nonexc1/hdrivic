import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell } from "lucide-react";

interface NotifyMeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: number;
  propertyTitle: string;
}

export function NotifyMeDialog({ open, onOpenChange, propertyId, propertyTitle }: NotifyMeDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({ variant: "destructive", title: "Correo inválido", description: "Ingresa un correo electrónico válido." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Error");
      toast({
        title: "¡Listo!",
        description: "Te notificaremos por correo cuando esta propiedad esté disponible.",
      });
      setEmail("");
      onOpenChange(false);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo registrar tu correo. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-sans font-bold text-primary flex items-center gap-2">
            <Bell className="w-5 h-5 text-secondary" />
            Notificarme cuando esté disponible
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Te enviaremos un correo automático cuando <strong>{propertyTitle}</strong> vuelva a estar disponible para alquiler o venta.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="notify-email">Tu correo electrónico</Label>
            <Input
              id="notify-email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-secondary hover:bg-secondary/90 text-white font-bold"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
            {loading ? "Registrando..." : "Notificarme"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
