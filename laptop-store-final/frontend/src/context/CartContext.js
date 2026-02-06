import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (laptop, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item._id === laptop._id);

            if (existingItem) {
                return prevItems.map(item =>
                    item._id === laptop._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevItems, {
                    _id: laptop._id,
                    model: laptop.model,
                    brand: laptop.brand,
                    price: Number(laptop.price),
                    discount: Number(laptop.discount || 0),
                    finalPrice: Number(laptop.price) * (1 - Number(laptop.discount || 0) / 100),
                    images: laptop.images,
                    quantity,
                    specifications: laptop.specifications
                }];
            }
        });
    };

    const removeFromCart = (laptopId) => {
        setCartItems(prevItems => prevItems.filter(item => item._id !== laptopId));
    };

    const updateQuantity = (laptopId, quantity) => {
        if (quantity < 1) {
            removeFromCart(laptopId);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item._id === laptopId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.finalPrice * item.quantity);
        }, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        cartTotal: getCartTotal(),
        cartCount: getCartCount()
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};