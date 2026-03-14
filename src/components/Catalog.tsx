import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  ChevronRight,
  ChevronDown,
  ExternalLink, 
  Heart,
  Package,
  Star
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { CATALOG_ITEMS } from '../constants';
import { Product } from '../types';

export function Catalog() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-orange-50/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-orange-200 text-ink relative overflow-hidden"
      >
        <div className="relative z-10 space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold leading-tight text-primary">
              Bem-vindo(a) à Glória Fashion!
            </h2>
            <p className="text-sm font-medium text-ink/80">
              Estamos muito felizes em ter você aqui! 💖
            </p>
          </div>
          
          <p className="text-xs text-ink/70 leading-relaxed">
            A Glória Fashion é um espaço feito para quem ama estilo, atitude e personalidade. Aqui você encontra joias, piercings, acessórios, presentes, moda e muito mais, além de serviços realizados com cuidado, higiene e profissionalismo.
          </p>

          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <p className="text-[11px] leading-relaxed font-medium text-ink/80">
              📣 Nosso serviço de divulgação ajuda de pequenos a grandes negócios e profissionais a alcançarem mais pessoas por meio de nossos perfis nas redes sociais, que contam com uma comunidade grande e engajada.
            </p>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-peach/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Quick Action CTA */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-primary to-peach p-5 rounded-3xl shadow-xl shadow-primary/20 text-white flex items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <h3 className="font-display font-bold text-lg">Pronto para brilhar?</h3>
          <p className="text-[10px] opacity-90 font-medium">Agende seu horário agora mesmo!</p>
        </div>
        <Link 
          to="/agendar" 
          className="bg-white text-primary px-6 py-3 rounded-2xl font-bold text-xs shadow-lg hover:bg-peach/10 hover:text-white transition-all whitespace-nowrap"
        >
          Agendar Horário
        </Link>
      </motion.div>

      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold text-ink">Catálogo</h1>
          <ShoppingBag className="text-primary" size={24} />
        </div>

        {/* Highlighted Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link 
            to="/agendar" 
            className="flex flex-col items-center justify-center p-4 bg-primary text-white rounded-2xl shadow-lg text-center gap-2 hover:scale-105 transition-transform"
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Heart size={20} className="fill-white" />
            </div>
            <span className="text-[10px] font-bold uppercase leading-tight">Agende sua colocação<br/>(piercing e alargadores)</span>
          </Link>
          <a 
            href="https://wa.me/5511950696045?text=Olá! Gostaria de fazer um orçamento."
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 bg-ink text-white rounded-2xl shadow-lg text-center gap-2 hover:scale-105 transition-transform"
          >
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase leading-tight">Faça seu orçamento<br/>(divulgue seu produto_serviço)</span>
          </a>
        </div>
      </header>

      {/* Collapsed Product List */}
      <div className="card overflow-hidden border-peach/30 bg-white/50 backdrop-blur-sm">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-peach/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="font-bold text-ink">Nossos Produtos</h2>
              <p className="text-[10px] text-gray-custom uppercase tracking-wider">Toque para ver a lista completa</p>
            </div>
          </div>
          {isExpanded ? <ChevronDown className="text-gray-custom" size={20} /> : <ChevronRight className="text-gray-custom" size={20} />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-5 pb-5 divide-y divide-peach/10">
                {CATALOG_ITEMS.map((item, index) => (
                  <a 
                    key={index}
                    href="https://instagram.com/glorinha_presentesepiercings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-3 group hover:px-2 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Package size={14} className="text-primary/60" />
                      <span className="text-sm font-medium text-ink group-hover:text-primary transition-colors">{item}</span>
                    </div>
                    <ExternalLink size={12} className="text-gray-300 group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Promotions Section */}
      <section className="pt-4 space-y-4">
        <h2 className="font-display text-2xl font-bold text-ink">Promoções Ativas</h2>
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-primary text-white p-4 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[100px]">
            <div className="relative z-10">
              <h4 className="font-bold text-sm">Indique e ganhe 5%</h4>
              <p className="text-[10px] opacity-80">Ganhe desconto quando seu indicado fizer check-in!</p>
            </div>
            <Heart className="absolute -right-4 -bottom-4 text-white/10" size={60} />
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {!loading && products.length > 0 && (
        <section className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-ink">Destaques</h2>
            <Star className="text-primary" size={20} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 4).map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -5 }}
                className="card p-0 overflow-hidden border-peach/20 group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold text-primary shadow-sm">
                      R$ {product.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{product.category}</p>
                  <h3 className="font-bold text-xs text-ink line-clamp-1">{product.name}</h3>
                  <a 
                    href={`https://wa.me/5511950696045?text=Olá! Tenho interesse no produto: ${product.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-2 bg-peach/10 text-primary rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-colors mt-2"
                  >
                    Eu quero
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
