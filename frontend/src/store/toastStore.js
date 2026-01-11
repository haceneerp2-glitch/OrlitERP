import { create } from 'zustand';

const useToastStore = create((set) => ({
    toasts: [],
    addToast: (message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        set((state) => ({
            toasts: [...state.toasts, { id, message, type, duration }],
        }));
        return id;
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
    },
    clearToasts: () => set({ toasts: [] }),
}));

export default useToastStore;



