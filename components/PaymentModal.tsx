import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Loader2, QrCode } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess }) => {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // ---------------------------------------------------------------------------
  // CHAVE PIX DO USUÁRIO
  // ---------------------------------------------------------------------------
  const pixKey = "90b278a3-4ae5-45c6-a707-195acb7f1b67";
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isOpen) {
      setIsVerifying(false);
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    // Simulação: Em um app real, você usaria uma API para verificar o recebimento.
    setTimeout(() => {
      setIsVerifying(false);
      onPaymentSuccess();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-primary p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Pagamento via Pix
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-6">
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Valor para liberar o download</p>
            <p className="text-4xl font-bold text-gray-800">R$ 12,00</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 w-full flex flex-col items-center gap-4">
            <div className="bg-white p-2 rounded shadow-sm">
               {/* Gera o QR Code visualmente baseado na chave */}
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixKey)}`} 
                 alt="QR Code Pix" 
                 className="w-40 h-40"
               />
            </div>
            <p className="text-xs text-gray-500">Escaneie ou use a chave abaixo</p>
          </div>

          <div className="w-full space-y-2">
            <p className="text-sm font-medium text-gray-700">Chave Pix (Aleatória):</p>
            <div className="flex gap-2">
              <input 
                readOnly 
                value={pixKey} 
                className="flex-1 text-xs bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-600 truncate focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className={`p-2 rounded border transition-all flex items-center justify-center w-10 ${copied ? 'bg-green-50 border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400">Copie a chave e selecione "Chave Aleatória" no seu app do banco.</p>
          </div>

          <div className="w-full pt-4 border-t border-gray-100">
            <button
              onClick={handleSimulatePayment}
              disabled={isVerifying}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando pagamento...
                </>
              ) : (
                "Já fiz o pagamento"
              )}
            </button>
            <p className="text-xs text-gray-400 mt-2">O download será liberado automaticamente após a confirmação.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;