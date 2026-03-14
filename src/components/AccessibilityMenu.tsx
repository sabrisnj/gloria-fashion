import { motion, AnimatePresence } from 'motion/react';
import { X, Type, Sun, Moon, Eye, Layout } from 'lucide-react';

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
  accessibility: any;
  setAccessibility: (a: any) => void;
}

export function AccessibilityMenu({ isOpen, onClose, accessibility, setAccessibility }: AccessibilityMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-8 z-[120] shadow-2xl space-y-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Acessibilidade</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
                  <Type size={14} />
                  Tamanho do Texto
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setAccessibility({ ...accessibility, fontSize: Math.max(80, accessibility.fontSize - 10) })}
                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold"
                  >
                    A-
                  </button>
                  <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${(accessibility.fontSize - 80) / 120 * 100}%` }} />
                  </div>
                  <button 
                    onClick={() => setAccessibility({ ...accessibility, fontSize: Math.min(200, accessibility.fontSize + 10) })}
                    className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold"
                  >
                    A+
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setAccessibility({ ...accessibility, highContrast: !accessibility.highContrast })}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    accessibility.highContrast ? 'border-primary bg-accent text-primary' : 'border-gray-100 text-gray-500'
                  }`}
                >
                  <Eye size={24} />
                  <span className="text-xs font-bold uppercase">Alto Contraste</span>
                </button>
                <button 
                  onClick={() => setAccessibility({ ...accessibility, simplifiedMode: !accessibility.simplifiedMode })}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    accessibility.simplifiedMode ? 'border-primary bg-accent text-primary' : 'border-gray-100 text-gray-500'
                  }`}
                >
                  <Layout size={24} />
                  <span className="text-xs font-bold uppercase">Modo Leitura</span>
                </button>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="btn-primary w-full"
            >
              Aplicar Configurações
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
