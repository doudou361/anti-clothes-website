import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    products,
    cart,
    cartCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    openProductDetail,
  } = useStore();

  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      clearCart();
    }, 400);
  };

  const closeDrawer = () => {
    setIsCartOpen(false);
    setTimeout(() => setCheckoutSuccess(false), 300);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
          />

          {/* Slide-Over Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#FFFFFF] text-[#0A0A0A] border-l border-neutral-200 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="h-16 px-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  YOUR BAG ({cartCount})
                </span>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-1.5 text-neutral-400 hover:text-[#0A0A0A] transition cursor-pointer"
                aria-label="Close Cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Express Courier Banner */}
            <div className="px-6 py-2.5 bg-neutral-50 border-b border-neutral-100 text-[10px] font-mono-tech uppercase tracking-widest text-neutral-600 flex items-center justify-between">
              <span>COMPLIMENTARY DHL EXPRESS DISPATCH</span>
              <span className="text-emerald-700 font-semibold">UNLOCKED</span>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {checkoutSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-[10px] font-mono-tech uppercase tracking-widest text-neutral-400">
                    DISPATCH CONFIRMED // NOCTA-FS26
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight mt-1">
                    Order Received
                  </h3>
                  <p className="text-xs text-neutral-500 mt-2 max-w-xs leading-relaxed">
                    Your Drop 02 allocation has been reserved. A serialized dispatch
                    manifest has been generated.
                  </p>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="mt-6 px-6 py-2.5 bg-[#0A0A0A] text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition cursor-pointer"
                  >
                    Return to Store
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <p className="text-xs uppercase tracking-widest text-neutral-400 font-mono-tech">
                    YOUR BAG IS CURRENTLY EMPTY
                  </p>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="mt-4 border border-black rounded-full px-6 py-2 text-xs uppercase tracking-widest font-medium hover:bg-black hover:text-white transition cursor-pointer"
                  >
                    Explore Drop 02
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    if (!prod) return null;

                    return (
                      <div
                        key={`${item.productId}-${item.size}-${item.colorwayName}`}
                        className="flex gap-4 pb-6 border-b border-neutral-100"
                      >
                        <div
                          onClick={() => {
                            closeDrawer();
                            openProductDetail(prod.id);
                          }}
                          className="w-20 h-24 bg-neutral-50 border border-neutral-100 p-2 flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          <img
                            src={prod.frontCutoutUrl}
                            alt={prod.title}
                            className="w-full h-full object-contain"
                            draggable={false}
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                onClick={() => {
                                  closeDrawer();
                                  openProductDetail(prod.id);
                                }}
                                className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] truncate cursor-pointer hover:underline"
                              >
                                {prod.title}
                              </h4>
                              <button
                                type="button"
                                onClick={() =>
                                  removeFromCart(
                                    item.productId,
                                    item.size,
                                    item.colorwayName
                                  )
                                }
                                className="text-neutral-400 hover:text-black transition cursor-pointer"
                                aria-label="Remove Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[11px] text-neutral-500 mt-0.5 font-mono-tech">
                              Size: {item.size} • {item.colorwayName}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="inline-flex items-center border border-neutral-200">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(
                                    item.productId,
                                    item.size,
                                    item.colorwayName,
                                    -1
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-mono-tech font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(
                                    item.productId,
                                    item.size,
                                    item.colorwayName,
                                    1
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-xs font-semibold font-mono-tech">
                              €{(prod.price * item.quantity).toFixed(2).replace('.', ',')} EUR
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {!checkoutSuccess && cart.length > 0 && (
              <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-widest text-neutral-500 font-medium">
                    Subtotal (Taxes Included)
                  </span>
                  <span className="text-base font-bold font-mono-tech text-[#0A0A0A]">
                    €{cartSubtotal.toFixed(2).replace('.', ',')} EUR
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full h-12 bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
