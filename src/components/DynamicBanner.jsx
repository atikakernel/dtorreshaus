import React from 'react';
import { Tag, Zap, Search, HelpCircle, Star } from 'lucide-react';

export const DynamicBanner = ({ label }) => {
  if (!label || label === "Usuario Nuevo") {
    return null; // No mostrar nada especial para usuarios nuevos
  }

  let bannerConfig = {
    color: '#f8f9fa',
    text: '¡Bienvenido a Dtorreshaus!',
    icon: <Star size={24} color="#666" />,
    textColor: '#333'
  };

  switch (label) {
    case 'Cazador de Ofertas':
      bannerConfig = {
        color: '#fff3cd',
        text: '🔥 ¡Notamos que buscas los mejores precios! Usa el código OFERTA10 al finalizar tu compra.',
        icon: <Tag size={24} color="#856404" />,
        textColor: '#856404'
      };
      break;
    case 'Comprador Impulsivo':
      bannerConfig = {
        color: '#cce5ff',
        text: '⚡ ¡No te quedes sin stock! Compra ahora y tu pedido saldrá hoy mismo.',
        icon: <Zap size={24} color="#004085" />,
        textColor: '#004085'
      };
      break;
    case 'Investigador Meticuloso':
      bannerConfig = {
        color: '#d4edda',
        text: '📖 Tómate tu tiempo. Apreciamos a quienes valoran los detalles técnicos de nuestros artículos.',
        icon: <Search size={24} color="#155724" />,
        textColor: '#155724'
      };
      break;
    case 'Indeciso':
      bannerConfig = {
        color: '#e2e3e5',
        text: '🤔 ¿No sabes qué elegir? Nuestro equipo de soporte está listo para ayudarte.',
        icon: <HelpCircle size={24} color="#383d41" />,
        textColor: '#383d41'
      };
      break;
    default:
      bannerConfig = {
        color: '#e2e3e5',
        text: `🌟 ${label}: ¡Encuentra lo que buscas en Dtorreshaus!`,
        icon: <Star size={24} color="#383d41" />,
        textColor: '#383d41'
      };
      break;
  }

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div style={{
        backgroundColor: bannerConfig.color,
        color: bannerConfig.textColor,
        padding: '15px 20px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: `1px solid ${bannerConfig.textColor}22`
      }}>
        <div>{bannerConfig.icon}</div>
        <div style={{ fontWeight: '500', fontSize: '15px' }}>
          {bannerConfig.text}
        </div>
      </div>
    </div>
  );
};
