import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "Inmovalores - Todo en bienes inmuebles",
  description: "Encuentra la propiedad ideal en Guatemala con Inmovalores.",
};

const API_URL = 'https://theodore-unhasted-erlene.ngrok-free.dev/api';
// Helper para limpiar la url base si ya tiene /api
const getImageUrl = (path) => {
  const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
  return `${baseUrl}/images/${path}`;
}

export default function RootLayout({ children }) {
  const logoUrl = getImageUrl('logo_redondo_inmovalores.png');
  return (
    <html lang="es" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${manrope.variable} font-display bg-[#f6f7f8] text-[#1A1A1A] antialiased`}>
        {/* Top Fixed Gradient (Ensures nav visibility on scroll) */}
        <div className="fixed top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-40 pointer-events-none"></div>

        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 lg:px-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/5 backdrop-blur-xl rounded-full border border-white/10 px-8 py-3 shadow-2xl">
            <div className="flex items-center gap-2 flex-shrink-0">
              <a href="/">
                <img src={logoUrl} alt="InmoValores Logo" className="w-10 h-10 object-contain" />
              </a>
              <h2 className="text-white text-xl font-extrabold tracking-tight">INMOVALORES</h2>
            </div>

            <div className="flex items-center flex-1 overflow-x-auto ml-4 lg:ml-10 no-scrollbar">
              <div className="flex items-center gap-6 lg:gap-10 whitespace-nowrap px-4 text-white/90 text-sm font-semibold">
                <a className="hover:text-white transition-colors" href="/">Inicio</a>
                <a className="hover:text-white transition-colors" href="/?t=venta">Comprar</a>
                <a className="hover:text-white transition-colors" href="/?t=alquiler">Alquilar</a>
                <a className="hover:text-white transition-colors" href="#nosotros">Nosotros</a>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <button className="hidden lg:flex px-6 py-2.5 bg-[#137fec] hover:bg-[#137fec]/90 text-white rounded-full text-sm font-bold transition-all transform hover:scale-105">
                Listar Propiedad
              </button>
            </div>
          </div>
        </nav>

        {children}

        {/* Footer */}
        <footer id="nosotros" className="bg-white py-20 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
              <div>
                <div className="flex items-center gap-2 mb-8">
                  <img src={logoUrl} alt="InmoValores Logo" className="w-12 h-12 object-contain" />
                  <h2 className="text-xl font-extrabold tracking-tight text-[#1A1A1A]">INMOVALORES</h2>
                </div>
                <p className="text-gray-500 mb-4 leading-relaxed text-sm">Real Estate</p>
                <p className="text-gray-500 mb-8 leading-relaxed text-sm">Guatemala</p>
                <div className="flex items-center gap-4">
                  <a className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#137fec] hover:text-white transition-all" href="#"><i className="fab fa-facebook-f"></i></a>
                  <a className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#137fec] hover:text-white transition-all" href="#"><i className="fab fa-instagram"></i></a>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold mb-8 text-sm uppercase tracking-widest text-[#1A1A1A]">Contáctanos aquí</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-map-marker-alt mt-1 text-[#137fec]"></i>
                    <span>Boulevard Los Próceres, Zona 10, Guatemala C.A.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-phone mt-1 text-[#137fec]"></i>
                    <span>(502) 34117103</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-envelope mt-1 text-[#137fec]"></i>
                    <span>inmovaloresgt@gmail.com</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-extrabold mb-8 text-sm uppercase tracking-widest text-[#1A1A1A]">Otros recursos</h4>
                <ul className="space-y-4 text-gray-500">
                  <li><a className="hover:text-[#137fec] transition-colors text-sm" href="#">Quienes somos?</a></li>
                  <li><a className="hover:text-[#137fec] transition-colors text-sm" href="#">Nuestros Servicios</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-extrabold mb-8 text-sm uppercase tracking-widest text-[#1A1A1A]">Ubicaciones</h4>
                <ul className="space-y-4 text-gray-500">
                  <li><a className="hover:text-[#137fec] transition-colors text-sm" href="#">Vender Propiedades</a></li>
                  <li><a className="hover:text-[#137fec] transition-colors text-sm" href="#">Alquilar Propiedades</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
              <p>© 2025 Inmovalores. Todos los derechos reservados.</p>
              <a className="hover:text-[#1A1A1A]" href="#">Política de Privacidad</a>
            </div>
          </div>
        </footer>

        {/* WhatsApp Float */}
        <a href="https://wa.me/50234117103" target="_blank" className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl z-[1000] hover:scale-110 transition-transform animate-bounce">
          <i className="fab fa-whatsapp text-white text-3xl"></i>
        </a>
      </body>
    </html>
  );
}
