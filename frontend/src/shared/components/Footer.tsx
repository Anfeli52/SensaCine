export function Footer() {
  return (
    <footer className="border-t border-[#e0e0e0] bg-[#f5f5f7] mt-24 text-[#86868b] text-[12px]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} SensaCine. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#1d1d1f] transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-[#1d1d1f] transition-colors">
              Términos de uso
            </a>
            <a href="#" className="hover:text-[#1d1d1f] transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
