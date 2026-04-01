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
  const navBg = isScrolled || !isHome ? "bg-white shadow-sm" : "bg-transparent";
  const navText = isScrolled || !isHome ? "text-primary" : "text-white";
  const logoText = isScrolled || !isHome ? "text-primary" : "text-white";

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-primary text-white text-xs py-2 px-4 md:px-8 hidden md:flex justify-between items-center z-50 relative">
        <div className="flex space-x-6">
          <span className="flex items-center"><Phone className="w-3 h-3 mr-2 text-secondary" /> +51 999 999 999</span>
          <span className="flex items-center"><Mail className="w-3 h-3 mr-2 text-secondary" /> contacto@hdrivic.com</span>
        </div>
        <div className="flex space-x-4">
          <Facebook className="w-4 h-4 hover:text-secondary cursor-pointer transition-colors" />
          <Instagram className="w-4 h-4 hover:text-secondary cursor-pointer transition-colors" />
          <Linkedin className="w-4 h-4 hover:text-secondary cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Navbar */}
      <nav className={`fixed w-full z-40 transition-all duration-300 ${isScrolled ? "top-0" : "top-0 md:top-8"} ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link href="/" className={`flex items-center font-serif text-2xl font-bold ${logoText} tracking-wider`}>
              <span className="text-secondary mr-2">HD</span>RIVIC
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${navText} hover:text-secondary transition-colors font-medium text-sm tracking-wide uppercase`}
                >
                  {link.label}
                </Link>
              ))}
              
              {user ? (
                <div className="flex items-center gap-4 ml-4">
                  <span className={`text-sm ${navText}`}>Hola, {user.name}</span>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="border-secondary text-secondary hover:bg-secondary hover:text-white">
                    Salir
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm" className={isScrolled || !isHome ? "border-primary text-primary hover:bg-primary hover:text-white" : "border-white text-white hover:bg-white hover:text-primary"}>
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`${navText} hover:text-secondary focus:outline-none`}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg absolute w-full">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:text-secondary hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-primary hover:text-secondary hover:bg-gray-50"
                >
                  Salir
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:text-secondary hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
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
              <Link href="/" className="flex items-center font-serif text-2xl font-bold text-white mb-6">
                <span className="text-secondary mr-2">HD</span>RIVIC
              </Link>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Firma inmobiliaria peruana de prestigio, especializada en la compra, venta, alquiler y gestión Airbnb de propiedades exclusivas.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
                  <Facebook className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
                  <Linkedin className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold mb-6 text-secondary">Enlaces Rápidos</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">Inicio</Link></li>
                <li><Link href="/propiedades" className="text-gray-300 hover:text-white transition-colors text-sm">Propiedades en Venta</Link></li>
                <li><Link href="/propiedades" className="text-gray-300 hover:text-white transition-colors text-sm">Alquileres</Link></li>
                <li><Link href="/propiedades" className="text-gray-300 hover:text-white transition-colors text-sm">Gestión Airbnb</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold mb-6 text-secondary">Servicios</h3>
              <ul className="space-y-3">
                <li className="text-gray-300 text-sm">Asesoría Legal Inmobiliaria</li>
                <li className="text-gray-300 text-sm">Tasación de Inmuebles</li>
                <li className="text-gray-300 text-sm">Marketing Inmobiliario</li>
                <li className="text-gray-300 text-sm">Inversiones y Proyectos</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-serif font-bold mb-6 text-secondary">Contacto</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 text-secondary shrink-0" />
                  <span className="text-gray-300 text-sm">Av. Santo Toribio 143, San Isidro, Lima, Perú</span>
                </li>
                <li className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-secondary shrink-0" />
                  <span className="text-gray-300 text-sm">+51 999 999 999</span>
                </li>
                <li className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-secondary shrink-0" />
                  <span className="text-gray-300 text-sm">contacto@hdrivic.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} HD RIVIC GLOBAL S.A.C. Todos los derechos reservados.
            </p>
            <p className="text-gray-400 text-xs text-center md:text-right max-w-2xl">
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-colors z-50 hover-elevate"
        aria-label="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      </a>
    </div>
  );
}
