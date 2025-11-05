import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Icon from './common/Icon';

interface ProductManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (totals: Record<string, number>) => void;
    onRename: (oldName: string, newName: string) => void;
    initialTotals: Record<string, number>;
    productNames: string[];
    currentUser: User;
}

const ProductManagementModal: React.FC<ProductManagementModalProps> = ({ isOpen, onClose, onSave, onRename, initialTotals, productNames, currentUser }) => {
    const [totals, setTotals] = useState<Record<string, number>>({});
    const [newProductName, setNewProductName] = useState('');
    const [editingProductName, setEditingProductName] = useState<string | null>(null);
    const [renamingTo, setRenamingTo] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            const allProducts = [...new Set([...Object.keys(initialTotals), ...productNames])];
            const initialData: Record<string, number> = {};
            allProducts.forEach(name => {
                initialData[name] = initialTotals[name] || 0;
            });
            setTotals(initialData);
        }
    }, [isOpen, initialTotals, productNames]);

    const handleTotalChange = (productName: string, value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
            setTotals(prev => ({ ...prev, [productName]: numValue }));
        } else if (value === '') {
             setTotals(prev => ({ ...prev, [productName]: 0 }));
        }
    };

    const handleAddNewProduct = () => {
        if (newProductName && !totals.hasOwnProperty(newProductName)) {
            setTotals(prev => ({ ...prev, [newProductName]: 0 }));
            setNewProductName('');
        }
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        await onSave(totals);
        setIsSaving(false);
    };

    const handleConfirmRename = async () => {
        if (editingProductName && renamingTo && editingProductName !== renamingTo) {
            if (totals.hasOwnProperty(renamingTo)) {
                alert("Este nome de produto já existe.");
                return;
            }
            setIsSaving(true);
            await onRename(editingProductName, renamingTo);
            setEditingProductName(null);
            setRenamingTo('');
            setIsSaving(false);
        } else {
             setEditingProductName(null);
             setRenamingTo('');
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start sm:items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-dark-border flex-shrink-0">
                    <h3 className="text-xl font-bold text-brand-dark dark:text-dark-text-primary">Gerenciar Produtos e Totais de Licenças</h3>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    {Object.entries(totals).sort(([a], [b]) => a.localeCompare(b)).map(([productName, total]) => (
                        <div key={productName} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                           {editingProductName === productName ? (
                                <div className="flex-grow flex items-center gap-2">
                                    <input 
                                        type="text"
                                        value={renamingTo}
                                        onChange={(e) => setRenamingTo(e.target.value)}
                                        className="p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"
                                        autoFocus
                                    />
                                     <button onClick={handleConfirmRename} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><Icon name="Check" size={18} /></button>
                                     <button onClick={() => setEditingProductName(null)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Icon name="X" size={18} /></button>
                                </div>
                           ) : (
                                <span className="flex-grow font-semibold text-gray-800 dark:text-dark-text-primary">{productName}</span>
                           )}
                           <button onClick={() => {setEditingProductName(productName); setRenamingTo(productName)}} className="text-blue-600 hover:underline text-sm">Renomear</button>
                            <label className="flex items-center gap-2 text-sm">
                                Total Comprado:
                                <input
                                    type="number"
                                    value={total}
                                    onChange={(e) => handleTotalChange(productName, e.target.value)}
                                    className="w-24 p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800 text-right"
                                    min="0"
                                />
                            </label>
                        </div>
                    ))}
                    <div className="pt-4 border-t dark:border-dark-border">
                        <h4 className="font-semibold mb-2">Adicionar Novo Produto</h4>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                                placeholder="Nome do novo produto"
                                className="flex-grow p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"
                            />
                            <button onClick={handleAddNewProduct} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Adicionar</button>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-card/50 border-t dark:border-dark-border flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                    <button type="button" onClick={handleSaveClick} disabled={isSaving} className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
                        {isSaving ? 'Salvando...' : 'Salvar Totais'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductManagementModal;