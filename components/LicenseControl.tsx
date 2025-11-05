import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getLicenses, addLicense, updateLicense, deleteLicense, getLicenseTotals, saveLicenseTotals, renameProduct } from '../services/apiService';
import { License, User, UserRole } from '../types';
import Icon from './common/Icon';
import ProductManagementModal from './ProductManagementModal'; // Importando o novo modal

const LicenseFormModal: React.FC<{
    license?: License | null;
    productNames: string[];
    onClose: () => void;
    onSave: () => void;
    currentUser: User;
    initialProduct?: string;
}> = ({ license, productNames, onClose, onSave, currentUser, initialProduct }) => {
    const [formData, setFormData] = useState<Omit<License, 'id' | 'approval_status' | 'rejection_reason'>>({
        produto: initialProduct || '',
        tipoLicenca: '',
        chaveSerial: '',
        dataExpiracao: '',
        usuario: '',
        cargo: '',
        setor: '',
        gestor: '',
        centroCusto: '',
        contaRazao: '',
        nomeComputador: '',
        numeroChamado: '',
        observacoes: ''
    });
    const [isSaving, setIsSaving] = useState(false);

     useEffect(() => {
        if (license) {
            setFormData({
                produto: license.produto,
                tipoLicenca: license.tipoLicenca || '',
                chaveSerial: license.chaveSerial,
                dataExpiracao: license.dataExpiracao || '',
                usuario: license.usuario,
                cargo: license.cargo || '',
                setor: license.setor || '',
                gestor: license.gestor || '',
                centroCusto: license.centroCusto || '',
                contaRazao: license.contaRazao || '',
                nomeComputador: license.nomeComputador || '',
                numeroChamado: license.numeroChamado || '',
                observacoes: license.observacoes || ''
            });
        }
    }, [license]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (license) {
                await updateLicense({ ...formData, id: license.id }, currentUser.username);
            } else {
                await addLicense(formData, currentUser);
            }
             if (currentUser.role !== UserRole.Admin && !license) {
                alert("Licença adicionada com sucesso! Sua solicitação foi enviada para aprovação do administrador.");
            }
            onSave();
            onClose();
        } catch (error) {
            console.error("Failed to save license", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start sm:items-center z-50 p-4 overflow-y-auto">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-dark-border flex-shrink-0">
                    <h3 className="text-xl font-bold text-brand-dark dark:text-dark-text-primary">{license ? 'Editar Licença' : 'Nova Licença'}</h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto">
                    <div className="sm:col-span-2">
                         <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Produto</label>
                        <select name="produto" value={formData.produto} onChange={handleChange} className="w-full mt-1 p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800">
                            <option value="" disabled>Selecione um produto</option>
                            {productNames.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                    
                    <input type="text" name="chaveSerial" placeholder="Chave/Serial" value={formData.chaveSerial} onChange={handleChange} className="p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />
                    
                    <input type="text" name="usuario" placeholder="Usuário Atribuído" value={formData.usuario} onChange={handleChange} className="p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />
                    <input type="text" name="cargo" placeholder="Cargo" value={formData.cargo} onChange={handleChange} className="p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />

                    <input type="text" name="setor" placeholder="Setor" value={formData.setor} onChange={handleChange} className="p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />
                    <input type="text" name="gestor" placeholder="Gestor" value={formData.gestor} onChange={handleChange} className="p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />
                    
                    <input type="text" name="centroCusto" placeholder="Centro de Custo" value={formData.centroCusto} onChange={handleChange} className="p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />
                    <input type="text" name="contaRazao" placeholder="Conta Razão" value={formData.contaRazao} onChange={handleChange} className="p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />
                    
                    <input type="text" name="nomeComputador" placeholder="Nome do Computador" value={formData.nomeComputador} onChange={handleChange} className="p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />
                    <input type="text" name="numeroChamado" placeholder="Nº do Chamado da Solicitação" value={formData.numeroChamado} onChange={handleChange} className="p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />

                    <div className="sm:col-span-2">
                         <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Data de Vencimento (deixe em branco se for perpétua)</label>
                         <input type="date" name="dataExpiracao" value={(formData.dataExpiracao || '').split('T')[0]} onChange={handleChange} className="w-full mt-1 p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />
                    </div>
                     <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Observações</label>
                        <textarea
                            name="observacoes"
                            value={formData.observacoes || ''}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-dark-border rounded-md"
                            placeholder="Adicione qualquer informação relevante sobre a solicitação ou a licença..."
                        ></textarea>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-card/50 border-t dark:border-dark-border flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                    <button type="submit" disabled={isSaving} className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const LicenseControl: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [licenseTotals, setLicenseTotals] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingLicense, setEditingLicense] = useState<License | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openProducts, setOpenProducts] = useState<Set<string>>(new Set());
    const [newLicenseProduct, setNewLicenseProduct] = useState<string | undefined>(undefined);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [licensesData, totalsData] = await Promise.all([
                getLicenses(currentUser),
                getLicenseTotals()
            ]);
            setLicenses(licensesData);
            setLicenseTotals(totalsData);
        } catch (error) {
            console.error("Failed to load license data:", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenFormModal = (license: License | null = null, initialProduct?: string) => {
        setEditingLicense(license);
        setNewLicenseProduct(initialProduct);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setEditingLicense(null);
        setNewLicenseProduct(undefined);
        setIsFormModalOpen(false);
    };

    const handleSave = () => {
        loadData();
        handleCloseFormModal();
        handleCloseProductModal();
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Tem certeza que deseja excluir esta licença?")) return;
        try {
            await deleteLicense(id, currentUser.username);
            loadData();
        } catch (error) {
            console.error("Failed to delete license", error);
        }
    };
    
    const handleOpenProductModal = () => setIsProductModalOpen(true);
    const handleCloseProductModal = () => setIsProductModalOpen(false);

    const handleSaveProducts = async (newTotals: Record<string, number>) => {
        try {
            await saveLicenseTotals(newTotals, currentUser.username);
            handleSave();
        } catch (error) {
            console.error("Failed to save license totals", error);
            alert("Falha ao salvar totais de licenças.");
        }
    };

    const handleRenameProduct = async (oldName: string, newName: string) => {
        try {
            await renameProduct(oldName, newName, currentUser.username);
            handleSave();
        } catch (error) {
            console.error("Failed to rename product", error);
            alert("Falha ao renomear produto.");
        }
    };

    const productNames = useMemo(() => {
        const fromLicenses = licenses.map(l => l.produto);
        const fromTotals = Object.keys(licenseTotals);
        return [...new Set([...fromLicenses, ...fromTotals])].sort((a,b) => a.localeCompare(b));
    }, [licenses, licenseTotals]);

    const groupedAndFilteredLicenses = useMemo(() => {
        const grouped: { [key: string]: License[] } = {};
        
        productNames.forEach(name => {
            grouped[name] = [];
        });

        licenses.forEach(license => {
            if (grouped[license.produto]) {
                grouped[license.produto].push(license);
            }
        });

        if (!searchTerm) {
            return grouped;
        }

        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredGroups: { [key: string]: License[] } = {};

        for (const productName in grouped) {
            const licensesInGroup = grouped[productName];
            const matchingLicenses = licensesInGroup.filter(license =>
                Object.values(license).some(value =>
                    String(value).toLowerCase().includes(lowercasedFilter)
                )
            );

            if (productName.toLowerCase().includes(lowercasedFilter) || matchingLicenses.length > 0) {
                filteredGroups[productName] = matchingLicenses;
            }
        }
        return filteredGroups;
    }, [searchTerm, licenses, productNames]);

    const toggleProductGroup = (productName: string) => {
        setOpenProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productName)) {
                newSet.delete(productName);
            } else {
                newSet.add(productName);
            }
            return newSet;
        });
    };

    const ExpirationStatus: React.FC<{ dateStr?: string }> = ({ dateStr }) => {
        if (!dateStr || dateStr === 'N/A') return <span className="text-xs text-gray-500">Perpétua</span>;
        const expDate = new Date(dateStr);
        if (isNaN(expDate.getTime())) return <span className="text-xs text-gray-500">Perpétua</span>;
        
        const today = new Date();
        today.setHours(0,0,0,0);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        if (expDate < today) {
            return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-200 text-red-800">Expirada</span>;
        }
        if (expDate <= thirtyDaysFromNow) {
            return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-200 text-yellow-800">Expira em breve</span>;
        }
        return <span className="text-xs">{expDate.toLocaleDateString('pt-BR')}</span>;
    };
    
    const StatusBadge: React.FC<{ status: License['approval_status'] }> = ({ status }) => {
        if (!status || status === 'approved') return null;
        const statusMap = {
            pending_approval: { text: 'Pendente', className: 'bg-yellow-200 text-yellow-800' },
            rejected: { text: 'Rejeitado', className: 'bg-red-200 text-red-800' },
        };
        const currentStatus = statusMap[status];
        if (!currentStatus) return null;
        return <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${currentStatus.className}`}>{currentStatus.text}</span>;
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-brand-dark dark:text-dark-text-primary">Controle de Licenças</h2>
                    <div className="flex gap-2">
                        <button onClick={handleOpenProductModal} className="bg-brand-secondary text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2">
                            <Icon name="List" size={18} /> Gerenciar Produtos
                        </button>
                        <button onClick={() => handleOpenFormModal()} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Icon name="CirclePlus" size={18} /> Nova Licença
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Buscar por Produto, Usuário, Chave..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-dark-text-primary"
                    />
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Icon name="LoaderCircle" className="animate-spin text-brand-primary" size={48} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(groupedAndFilteredLicenses).map(([productName, licensesInGroupUntyped]) => {
                            // FIX: Cast the value from Object.entries to the expected array type to resolve TypeScript errors.
                            const licensesInGroup = licensesInGroupUntyped as License[];
                            const total = licenseTotals[productName] || 0;
                            const used = licensesInGroup.length;
                            const available = total - used;
                            const isOpen = openProducts.has(productName);

                            return (
                                <div key={productName} className="border dark:border-dark-border rounded-lg overflow-hidden">
                                    <div 
                                        className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => toggleProductGroup(productName)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon name="Package" size={24} className="text-brand-secondary dark:text-dark-text-secondary" />
                                            <h3 className="text-lg font-bold text-brand-dark dark:text-dark-text-primary">{productName}</h3>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-gray-600 dark:text-dark-text-secondary">Total: <strong className="text-gray-800 dark:text-dark-text-primary">{total}</strong></span>
                                            <span className="text-gray-600 dark:text-dark-text-secondary">Usadas: <strong className="text-gray-800 dark:text-dark-text-primary">{used}</strong></span>
                                            <span className={`font-bold ${available < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                Disponíveis: {available}
                                            </span>
                                            <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={20} />
                                        </div>
                                    </div>
                                    {isOpen && (
                                        <div className="overflow-x-auto animate-fade-in">
                                            {licensesInGroup.length > 0 ? (
                                                <table className="w-full text-sm text-left text-gray-700 dark:text-dark-text-secondary">
                                                    <thead className="text-xs text-gray-800 dark:text-dark-text-primary uppercase bg-gray-100 dark:bg-gray-900/50">
                                                        <tr>
                                                            <th className="px-6 py-3">Usuário</th>
                                                            <th className="px-6 py-3">Chave/Serial</th>
                                                            <th className="px-6 py-3">Centro de Custo</th>
                                                            <th className="px-6 py-3">Conta Razão</th>
                                                            <th className="px-6 py-3">Nº Chamado</th>
                                                            <th className="px-6 py-3">Expiração</th>
                                                            <th className="px-6 py-3 text-right">Ações</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {licensesInGroup.map(item => (
                                                            <tr key={item.id} className={`border-b dark:border-dark-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${item.approval_status === 'pending_approval' ? 'bg-yellow-50 dark:bg-yellow-900/20' : item.approval_status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 opacity-70' : 'bg-white dark:bg-dark-card'}`}>
                                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-dark-text-primary">{item.usuario} <StatusBadge status={item.approval_status} /></td>
                                                                <td className="px-6 py-4 font-mono text-xs">{item.chaveSerial}</td>
                                                                <td className="px-6 py-4">{item.centroCusto}</td>
                                                                <td className="px-6 py-4">{item.contaRazao}</td>
                                                                <td className="px-6 py-4">{item.numeroChamado}</td>
                                                                <td className="px-6 py-4"><ExpirationStatus dateStr={item.dataExpiracao} /></td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-3">
                                                                        <button onClick={() => handleOpenFormModal(item)} className="text-blue-600 hover:text-blue-800" title="Editar"><Icon name="Pencil" size={16} /></button>
                                                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800" title="Excluir"><Icon name="Trash2" size={16} /></button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="p-4 text-center text-gray-500">
                                                    Nenhuma licença em uso para este produto.
                                                </div>
                                            )}
                                            <div className="p-2 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                                                <button onClick={() => handleOpenFormModal(null, productName)} className="text-sm text-brand-primary hover:underline flex items-center gap-1">
                                                    <Icon name="Plus" size={14}/> Adicionar Licença a este Produto
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {isFormModalOpen && <LicenseFormModal license={editingLicense} productNames={productNames} onClose={handleCloseFormModal} onSave={handleSave} currentUser={currentUser} initialProduct={newLicenseProduct} />}
            {isProductModalOpen && <ProductManagementModal isOpen={isProductModalOpen} onClose={handleCloseProductModal} onSave={handleSaveProducts} onRename={handleRenameProduct} initialTotals={licenseTotals} productNames={productNames} currentUser={currentUser} />}
        </div>
    );
};

export default LicenseControl;