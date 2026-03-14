import { Instagram, Facebook, MapPin, Phone, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink text-white p-6 pb-24 mt-auto">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-300">
              R. Mal. Rondon, 113 – Loja 65 – Centro, SBC
              <Phone size={12} className="inline-block text-red-500 mx-1" /> 
              +55 11 95069-6045
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center gap-2">
          <a 
            href="https://wa.me/5511950696045" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-9 h-9 bg-[#25D366] text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <span className="text-[8px] uppercase font-bold text-gray-400">Whats</span>
          </a>

          <a 
            href="https://instagram.com/glorinha_presentesepiercings" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Instagram size={18} />
            </div>
            <span className="text-[8px] uppercase font-bold text-gray-400">@glorinha</span>
          </a>

          <a 
            href="https://instagram.com/divulga_gloriafashion" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Instagram size={18} />
            </div>
            <span className="text-[8px] uppercase font-bold text-gray-400">@divulga</span>
          </a>

          <a 
            href="https://facebook.com/GloriaFerreira" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-9 h-9 bg-[#1877F2] text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Facebook size={18} />
            </div>
            <span className="text-[8px] uppercase font-bold text-gray-400">Face</span>
          </a>

          <a 
            href="https://share.google/abEnEVk8C6kVBWzjy" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-9 h-9 bg-[#4285F4] text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <MapPin size={18} />
            </div>
            <span className="text-[8px] uppercase font-bold text-gray-400">Maps</span>
          </a>
        </div>

        <div className="pt-4 border-t border-white/10 text-center text-[9px] text-gray-500 uppercase tracking-[0.1em]">
          &copy; 2026 Glória Fashion. Baba aí e vem!
        </div>
      </div>
    </footer>
  );
}
