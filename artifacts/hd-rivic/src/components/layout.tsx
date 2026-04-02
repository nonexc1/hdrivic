import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCurrentUser, useLogoutUser } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const { data: user } = useGetCurrentUser();
  const logout = useLogoutUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      }
    });
  };

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/propiedades", label: "Propiedades" },
  ];

  if (user?.approved && (user.role === "admin" || user.role === "owner")) {
    navLinks.push({ href: "/admin", label: "Panel Admin" });
  }

  const isHome = location === "/";
  const isTransparent = !isScrolled && isHome;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-primary text-white text-xs py-2 px-4 md:px-8 hidden md:flex justify-between items-center z-50 relative">
        <div className="flex space-x-6 font-medium tracking-wide">
          <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-secondary" /> +51 999 999 999</span>
          <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-secondary" /> contacto@hdrivic.com</span>
        </div>
        <div className="flex space-x-4">
          <Facebook className="w-4 h-4 hover:text-secondary cursor-pointer transition-colors" />
          <Instagram className="w-4 h-4 hover:text-secondary cursor-pointer transition-colors" />
          <Linkedin className="w-4 h-4 hover:text-secondary cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Navbar */}
      <nav className={`fixed w-full z-40 transition-all duration-300 ${isScrolled ? "top-0" : "top-0 md:top-8"} ${isTransparent ? "bg-transparent" : "bg-white shadow-md border-b border-border"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 select-none">
              <div className={`flex items-center font-sans font-black text-xl tracking-widest uppercase ${isTransparent ? "text-white" : "text-primary"}`}>
                <span className={`${isTransparent ? "text-secondary" : "text-secondary"} mr-1`}>HD</span>
                <span>RIVIC</span>
                <span className={`ml-2 text-[10px] font-semibold tracking-wider ${isTransparent ? "text-white/60" : "text-muted-foreground"} self-end mb-0.5 hidden sm:block`}>GLOBAL S.A.C.</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors font-semibold text-xs tracking-widest uppercase ${isTransparent ? "text-white/90 hover:text-white" : "text-primary hover:text-secondary"}`}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <div className="flex items-center gap-4 ml-4">
                  <span className={`text-sm font-medium ${isTransparent ? "text-white/80" : "text-muted-foreground"}`}>
                    {user.name}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className={`text-xs font-semibold tracking-wider uppercase ${isTransparent ? "border-white/50 text-white hover:bg-white hover:text-primary bg-transparent" : "border-secondary text-secondary hover:bg-secondary hover:text-white"}`}
                  >
                    Salir
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs font-semibold tracking-wider uppercase ${isTransparent ? "border-white/50 text-white hover:bg-white hover:text-primary bg-transparent" : "border-primary text-primary hover:bg-primary hover:text-white"}`}
                  >
                    Acceso
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`${isTransparent ? "text-white" : "text-primary"} hover:text-secondary focus:outline-none`}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-xl border-t border-border absolute w-full">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-3 rounded-md text-sm font-semibold tracking-widest uppercase text-primary hover:text-secondary hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full text-left block px-3 py-3 rounded-md text-sm font-semibold tracking-widest uppercase text-primary hover:text-secondary hover:bg-muted transition-colors"
                >
                  Salir
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block px-3 py-3 rounded-md text-sm font-semibold tracking-widest uppercase text-primary hover:text-secondary hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Acceso
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center font-sans font-black text-xl tracking-widest uppercase text-white mb-6">
                <span className="text-secondary mr-1">HD</span>RIVIC
                <span className="ml-2 text-[10px] font-semibold tracking-wider text-white/50 self-end mb-0.5">GLOBAL S.A.C.</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6 font-light">
                Firma inmobiliaria peruana de prestigio, especializada en la compra, venta, alquiler y gestión Airbnb de propiedades exclusivas.
              </p>
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
                  <Facebook className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
                  <Linkedin className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold mb-6 text-secondary tracking-widest uppercase">Enlaces Rápidos</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-white/60 hover:text-white transition-colors text-sm font-light">Inicio</Link></li>
                <li><Link href="/propiedades" className="text-white/60 hover:text-white transition-colors text-sm font-light">Propiedades en Venta</Link></li>
                <li><Link href="/propiedades" className="text-white/60 hover:text-white transition-colors text-sm font-light">Alquileres</Link></li>
                <li><Link href="/propiedades" className="text-white/60 hover:text-white transition-colors text-sm font-light">Gestión Airbnb</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold mb-6 text-secondary tracking-widest uppercase">Servicios</h3>
              <ul className="space-y-3">
                <li className="text-white/60 text-sm font-light">Asesoría Legal Inmobiliaria</li>
                <li className="text-white/60 text-sm font-light">Tasación de Inmuebles</li>
                <li className="text-white/60 text-sm font-light">Marketing Inmobiliario</li>
                <li className="text-white/60 text-sm font-light">Inversiones y Proyectos</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold mb-6 text-secondary tracking-widest uppercase">Contacto</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span className="text-white/60 text-sm font-light">Av. Santo Toribio 143, San Isidro, Lima, Perú</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-secondary shrink-0" />
                  <span className="text-white/60 text-sm font-light">+51 999 999 999</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-secondary shrink-0" />
                  <span className="text-white/60 text-sm font-light">contacto@hdrivic.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-xs font-light">
              &copy; {new Date().getFullYear()} HD RIVIC GLOBAL S.A.C. Todos los derechos reservados.
            </p>
            <p className="text-white/40 text-xs font-light text-center md:text-right max-w-2xl">
              De conformidad con la Ley N° 29733, Ley de Protección de Datos Personales, sus datos serán tratados de manera confidencial y utilizados exclusivamente para los fines solicitados.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/51999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-xl hover:bg-[#1ebe57] transition-colors z-50"
        aria-label="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
