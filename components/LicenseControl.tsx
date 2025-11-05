import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getLicenses, addLicense, updateLicense, deleteLicense, renameProduct, getLicenseTotals, saveLicenseTotals } from '../services/apiService';
import { License, User, UserRole } from '../types';
import Icon from './common/Icon';

const ProductManagementModal: React.FC<{
    initialProductNames: string[];
    onClose: () => void;
    onSave: (newProductNames: string[], renames: Record<string, string>) => void;
}> = ({ initialProductNames, onClose, onSave }) => {
    const [productNames, setProductNames] = useState([...initialProductNames].sort());
    const [newProductName, setNewProductName] = useState('');
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [draftName, setDraftName] = useState('');
    const [renames, setRenames] = useState<Record<string, string>>({});
    const editInputRef = useRef<HTMLInputElement>(null);

     useEffect(() => {
        if (editingProduct && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingProduct]);

    const handleAddProduct = () => {
        const trimmedName = newProductName.trim();
        if (trimmedName && !productNames.find(p => p.toLowerCase() === trimmedName.toLowerCase())) {
            setProductNames(prev => [...prev, trimmedName].sort());
            setNewProductName('');
        }
    };

    const handleDeleteProduct = (productNameToDelete: string) => {
        if (window.confirm(`Tem certeza que deseja remover "${productNameToDelete}" da lista de produtos?`)) {
            setProductNames(prev => prev.filter(p => p !== productNameToDelete));
        }
    };

    const handleStartEditing = (productName: string) => {
        setEditingProduct(productName);
        setDraftName(productName);
    };

    const handleCancelEditing = () => {
        setEditingProduct(null);
        setDraftName('');
    };
    
    const handleConfirmEdit = () => {
        if (!editingProduct || !draftName.trim() || draftName.trim() === editingProduct) {
            handleCancelEditing();
            return;
        }
        const trimmedDraft = draftName.trim();
        
        if (productNames.find(p => p.toLowerCase() === trimmedDraft.toLowerCase() && p !== editingProduct)) {
            alert(`O produto "${trimmedDraft}" já existe.`);
            return;
        }

        setProductNames(prev => prev.map(p => p === editingProduct ? trimmedDraft : p).sort());
        setRenames(prev => ({ ...prev, [editingProduct]: trimmedDraft }));
        handleCancelEditing();
    };

    const handleSave = () => {
        onSave(productNames, renames);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                <div className="p-6 border-b dark:border-dark-border">
                    <h3 className="text-xl font-bold text-brand-dark dark:text-dark-text-primary">Gerenciar Nomes de Produtos</h3>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Adicione ou remova os nomes de software que aparecerão na caixa de seleção ao criar uma nova licença.</p>
                    <div className="space-y-2">
                        {productNames.map(name => (
                            <div key={name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-bg rounded">
                                {editingProduct === name ? (
                                    <div className="flex-grow flex items-center gap-2">
                                        <input
                                            ref={editInputRef}
                                            type="text"
                                            value={draftName}
                                            onChange={(e) => setDraftName(e.target.value)}
                                            onBlur={handleConfirmEdit}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleConfirmEdit();
                                                if (e.key === 'Escape') handleCancelEditing();
                                            }}
                                            className="flex-grow p-1 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"
                                        />
                                        <button onClick={handleConfirmEdit} className="text-green-500 hover:text-green-700" title="Salvar"><Icon name="Check" size={20} /></button>
                                        <button onClick={handleCancelEditing} className="text-red-500 hover:text-red-700" title="Cancelar"><Icon name="X" size={20} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-gray-800 dark:text-dark-text-primary">{name}</span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleStartEditing(name)} className="text-blue-500 hover:text-blue-700" title={`Editar ${name}`}>
                                                <Icon name="Pencil" size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteProduct(name)} className="text-red-500 hover:text-red-700" title={`Remover ${name}`}>
                                                <Icon name="Trash2" size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                         {productNames.length === 0 && <p className="text-center text-gray-500">Nenhum produto cadastrado.</p>}
                    </div>
                    <div className="pt-4 border-t dark:border-dark-border">
                         <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Adicionar novo produto</label>
                         <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                                placeholder="Nome do Software"
                                className="flex-grow p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"
                            />
                            <button onClick={handleAddProduct} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Adicionar</button>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-card/50 border-t dark:border-dark-border flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                    <button type="button" onClick={handleSave} className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-blue-700">Salvar Alterações</button>
                </div>
            </div>
        </div>
    );
};


const LicenseFormModal: React.FC<{
    license?: License | null;
    productNames: string[];
    onClose: () => void;
    onSave: () => void;
    currentUser: User;
}> = ({ license, productNames, onClose, onSave, currentUser }) => {
    const [formData, setFormData] = useState<Omit<License, 'id' | 'approval_status' | 'rejection_reason'>>({
        produto: '',
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
                            value={formData.observacoes}
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

const EditableTotal: React.FC<{
    productName: string;
    value: number;
    onSave: (productName: string, newValue: number) => Promise<void>;
    disabled: boolean;
}> = ({ productName, value, onSave, disabled }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draftValue, setDraftValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setDraftValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = async () => {
        const newTotal = parseInt(String(draftValue), 10);
        if (!isNaN(newTotal) && newTotal >= 0) {
            await onSave(productName, newTotal);
        } else {
            setDraftValue(value); // revert on invalid input
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setDraftValue(value);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') handleCancel();
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="number"
                    value={draftValue}
                    onChange={(e) => setDraftValue(Number(e.target.value))}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    className="w-20 p-1 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800 text-center"
                />
                <button onClick={handleSave} className="text-green-500 hover:text-green-700" title="Salvar"><Icon name="Check" size={20} /></button>
                <button onClick={handleCancel} className="text-red-500 hover:text-red-700" title="Cancelar"><Icon name="X" size={20} /></button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-dark-text-primary">{value}</span>
            {!disabled && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                    title="Editar total"
                >
                    <Icon name="Pencil" size={14} />
                </button>
            )}
        </div>
    );
};

const LicenseControl: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingLicense, setEditingLicense] = useState<License | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProduct, setFilterProduct] = useState('');
    const [licenseTotals, setLicenseTotals] = useState<Record<string, number>>({});
    const [productNames, setProductNames] = useState<string[]>([]);
    
    const isAdmin = currentUser.role === UserRole.Admin;

    const loadData = async () => {
        setLoading(true);
        try {
            const [licensesData, totalsData] = await Promise.all([
                getLicenses(currentUser),
                getLicenseTotals()
            ]);
            setLicenses(licensesData);
            setLicenseTotals(totalsData);
            
            const pNamesFromLicenses = [...new Set(licensesData.map(l => l.produto))];
            const pNamesFromTotals = Object.keys(totalsData);
            setProductNames([...new Set([...pNamesFromLicenses, ...pNamesFromTotals])].sort());
        } catch (error) {
            console.error("Failed to load license data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentUser]);

    const handleOpenFormModal = (license: License | null = null) => {
        setEditingLicense(license);
        setIsFormModalOpen(true);
    };
    
    const handleCloseFormModal = () => {
        setEditingLicense(null);
        setIsFormModalOpen(false);
    };

    const handleSave = () => {
        loadData();
        handleCloseFormModal();
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
    
    const handleSaveTotals = async (productName: string, newTotal: number) => {
        const newTotals = { ...licenseTotals, [productName]: newTotal };
        try {
            await saveLicenseTotals(newTotals, currentUser.username);
            setLicenseTotals(newTotals);
        } catch (error) {
            console.error("Failed to save license totals", error);
        }
    };

    const handleSaveProducts = async (newProductNames: string[], renames: Record<string, string>) => {
        setProductNames(newProductNames);
        const newTotals = { ...licenseTotals };
        for (const oldName in renames) {
            const newName = renames[oldName];
            if (oldName in newTotals) {
                newTotals[newName] = newTotals[oldName];
                delete newTotals[oldName];
            }
            await renameProduct(oldName, newName, currentUser.username);
        }
        await saveLicenseTotals(newTotals, currentUser.username);
        await loadData();
    };
    
    const filteredLicenses = useMemo(() => {
        return licenses.filter(item => {
            const matchesSearch = searchTerm ?
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                ) : true;

            const matchesProduct = filterProduct ? item.produto === filterProduct : true;
            return matchesSearch && matchesProduct;
        });
    }, [searchTerm, licenses, filterProduct]);

    const licenseUsage = useMemo(() => {
        return productNames.reduce((acc, name) => {
            acc[name] = licenses.filter(l => l.produto === name).length;
            return acc;
        }, {} as Record<string, number>);
    }, [licenses, productNames]);

    const ExpirationStatus: React.FC<{ dateStr?: string }> = ({ dateStr }) => {
        const parseDateString = (dateString: string) => {
            const parts = dateString.split(/[-/]/);
            if (parts.length === 3) {
                 if (parts[0].length === 4) { // YYYY-MM-DD or YYYY/MM/DD
                    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                }
            }
            return new Date(dateString); // Fallback for other formats
        };
        
        const isExpiringSoon = (dateStr: string | undefined): boolean => {
             if (typeof dateStr === 'undefined' || dateStr === 'N/A') return false;
            const expDate = parseDateString(dateStr);
            if (isNaN(expDate.getTime())) return false;
            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            return expDate > today && expDate <= thirtyDaysFromNow;
        };
    
        const isExpired = (dateStr: string | undefined): boolean => {
            if (typeof dateStr === 'undefined' || dateStr === 'N/A') return false;
            const expDate = parseDateString(dateStr);
            if (isNaN(expDate.getTime())) return false;
            const today = new Date();
            return expDate < today;
        };
        
        if (!dateStr || dateStr === 'N/A' || isNaN(parseDateString(dateStr).getTime())) {
            return <span className="text-xs text-gray-500 dark:text-dark-text-secondary">Perpétua</span>;
        }
    
        if (isExpired(dateStr)) {
            return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-200 text-red-800">Expirada</span>;
        }
        if (isExpiringSoon(dateStr)) {
            return <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-200 text-yellow-800">Expira em breve</span>;
        }
        return <span className="text-xs text-gray-700 dark:text-dark-text-primary">{parseDateString(dateStr).toLocaleDateString('pt-BR')}</span>;
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
                        {isAdmin && (
                            <button onClick={() => setIsProductModalOpen(true)} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2">
                                <Icon name="List" size={18} /> Gerenciar Produtos
                            </button>
                        )}
                        <button onClick={() => handleOpenFormModal()} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Icon name="CirclePlus" size={18} /> Nova Licença
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Buscar por usuário, chave, etc..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-dark-text-primary"
                    />
                    <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} className="p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-dark-text-primary">
                        <option value="">Todos os Produtos</option>
                        {productNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Icon name="LoaderCircle" className="animate-spin text-brand-primary" size={48} />
                    </div>
                ) : (
                    <div className="overflow-x-auto border dark:border-dark-border rounded-lg">
                        <table className="w-full text-sm text-left text-gray-700 dark:text-dark-text-secondary">
                            <thead className="text-xs text-gray-800 dark:text-dark-text-primary uppercase bg-gray-100 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Produto</th>
                                    <th scope="col" className="px-6 py-3">Chave/Serial</th>
                                    <th scope="col" className="px-6 py-3">Usuário</th>
                                    <th scope="col" className="px-6 py-3">Status de Expiração</th>
                                    <th scope="col" className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLicenses.map(item => (
                                    <tr key={item.id} className={`border-b dark:border-dark-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${item.approval_status === 'pending_approval' ? 'bg-yellow-50 dark:bg-yellow-900/20' : item.approval_status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 opacity-70' : 'bg-white dark:bg-dark-card'}`}>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-dark-text-primary">
                                            {item.produto} <StatusBadge status={item.approval_status} />
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{item.chaveSerial}</td>
                                        <td className="px-6 py-4">{item.usuario}</td>
                                        <td className="px-6 py-4"><ExpirationStatus dateStr={item.dataExpiracao} /></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button onClick={() => handleOpenFormModal(item)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Editar"><Icon name="Pencil" size={16} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Excluir"><Icon name="Trash2" size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <div className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-brand-dark dark:text-dark-text-primary mb-4">Uso de Licenças</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700 dark:text-dark-text-secondary">
                         <thead className="text-xs text-gray-800 dark:text-dark-text-primary uppercase bg-gray-100 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Produto</th>
                                <th scope="col" className="px-6 py-3">Em Uso</th>
                                <th scope="col" className="px-6 py-3">Total Adquirido</th>
                                <th scope="col" className="px-6 py-3">Disponível</th>
                            </tr>
                         </thead>
                         <tbody>
                            {productNames.map(name => {
                                const used = licenseUsage[name] || 0;
                                const total = licenseTotals[name] || 0;
                                const available = total - used;
                                return (
                                    <tr key={name} className="bg-white dark:bg-dark-card border-b dark:border-dark-border last:border-0">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-dark-text-primary">{name}</td>
                                        <td className="px-6 py-4">{used}</td>
                                        <td className="px-6 py-4">
                                            <EditableTotal productName={name} value={total} onSave={handleSaveTotals} disabled={!isAdmin} />
                                        </td>
                                        <td className={`px-6 py-4 font-bold ${available > 5 ? 'text-green-600' : available > 0 ? 'text-yellow-600' : 'text-red-600'}`}>{available}</td>
                                    </tr>
                                );
                            })}
                         </tbody>
                    </table>
                </div>
            </div>

            {isFormModalOpen && <LicenseFormModal license={editingLicense} productNames={productNames} onClose={handleCloseFormModal} onSave={handleSave} currentUser={currentUser} />}
            {isProductModalOpen && <ProductManagementModal initialProductNames={productNames} onClose={() => setIsProductModalOpen(false)} onSave={handleSaveProducts} />}
        </div>
    );
};

export default LicenseControl;