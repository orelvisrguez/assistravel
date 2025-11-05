import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './AuthPage';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit, Trash2, Copy, FileText, DollarSign, Calendar, TrendingUp, Filter, X } from 'lucide-react';
import { Caso, Corresponsal } from '../lib/supabase';

interface CasoWithCorresponsal extends Caso {
  corresponsalnombre: string;
}

export default function CasosDashboard() {
  const { user, canEdit } = useAuth();
  const [casos, setCasos] = useState<CasoWithCorresponsal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCaso, setEditingCaso] = useState<Caso | null>(null);
  const [duplicatingCaso, setDuplicatingCaso] = useState<Caso | null>(null);
  const [corresponsales, setCorresponsales] = useState<Corresponsal[]>([]);
  const [filters, setFilters] = useState({
    estado: '',
    corresponsal: '',
    pais: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    corresponsalid: '',
    nrocasoassistravel: '',
    nrocasocorresponsal: '',
    fechadeinicio: '',
    pais: '',
    informemedico: 'no',
    fee: '',
    costousd: '',
    costomonedalocal: '',
    simbolomoneda: 'USD',
    montoagregado: '',
    tienefactura: false,
    nrofactura: '',
    fechaemisionfactura: '',
    fechavencimientofactura: '',
    fechapagofactura: '',
    estadointerno: 'activo',
    estadodelcaso: '',
    observaciones: ''
  });

  const monedas = [
    { value: 'USD', label: 'USD - Dólar Estadounidense' },
    { value: 'ARS', label: 'ARS - Peso Argentino' },
    { value: 'BRL', label: 'BRL - Real Brasileño' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'MXN', label: 'MXN - Peso Mexicano' },
    { value: 'CLP', label: 'CLP - Peso Chileno' },
    { value: 'COP', label: 'COP - Peso Colombiano' },
    { value: 'PEN', label: 'PEN - Sol Peruano' },
    { value: 'UYU', label: 'UYU - Peso Uruguayo' },
    { value: 'PYG', label: 'PYG - Guaraní Paraguayo' }
  ];

  const paises = [
    'Argentina', 'Brasil', 'Chile', 'Colombia', 'Perú', 'Uruguay', 'Paraguay', 'México', 'Venezuela', 'Ecuador', 'Bolivia', 'Costa Rica', 'Panamá', 'El Salvador', 'Honduras', 'Guatemala', 'Nicaragua'
  ];

  const estados = [
    { value: 'activo', label: 'Activo', color: 'bg-blue-100 text-blue-800' },
    { value: 'en_proceso', label: 'En Proceso', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completado', label: 'Completado', color: 'bg-green-100 text-green-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    { value: 'pendiente', label: 'Pendiente', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar corresponsales
      const { data: corresponsales, error: corresponsalesError } = await supabase
        .from('corresponsales')
        .select('*')
        .eq('user_id', user?.id)
        .order('nombre');

      if (corresponsalesError) throw corresponsalesError;
      setCorresponsales(corresponsales || []);

      // Cargar casos
      const { data: casos, error: casosError } = await supabase
        .from('casos')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (casosError) throw casosError;

      // Combinar casos con nombres de corresponsales
      const casosConCorresponsal = (casos || []).map(caso => {
        const corresponsal = corresponsales?.find(c => c.id === caso.corresponsalid);
        return {
          ...caso,
          corresponsalnombre: corresponsal?.nombre || 'Corresponsal no encontrado'
        };
      });

      setCasos(casosConCorresponsal);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const casoData = {
        ...formData,
        fee: formData.fee ? parseFloat(formData.fee) : null,
        costousd: formData.costousd ? parseFloat(formData.costousd) : null,
        costomonedalocal: formData.costomonedalocal ? parseFloat(formData.costomonedalocal) : null,
        montoagregado: formData.montoagregado ? parseFloat(formData.montoagregado) : null,
        user_id: user?.id
      };

      if (editingCaso) {
        const { error } = await supabase
          .from('casos')
          .update(casoData)
          .eq('id', editingCaso.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('casos')
          .insert([casoData]);
        if (error) throw error;
      }
      
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving caso:', error);
    }
  };

  const handleEdit = (caso: Caso) => {
    setEditingCaso(caso);
    setFormData({
      corresponsalid: caso.corresponsalid,
      nrocasoassistravel: caso.nrocasoassistravel,
      nrocasocorresponsal: caso.nrocasocorresponsal || '',
      fechadeinicio: caso.fechadeinicio ? caso.fechadeinicio.split('T')[0] : '',
      pais: caso.pais || '',
      informemedico: caso.informemedico || 'no',
      fee: caso.fee?.toString() || '',
      costousd: caso.costousd?.toString() || '',
      costomonedalocal: caso.costomonedalocal?.toString() || '',
      simbolomoneda: caso.simbolomoneda || 'USD',
      montoagregado: caso.montoagregado?.toString() || '',
      tienefactura: caso.tienefactura,
      nrofactura: caso.nrofactura || '',
      fechaemisionfactura: caso.fechaemisionfactura ? caso.fechaemisionfactura.split('T')[0] : '',
      fechavencimientofactura: caso.fechavencimientofactura ? caso.fechavencimientofactura.split('T')[0] : '',
      fechapagofactura: caso.fechapagofactura ? caso.fechapagofactura.split('T')[0] : '',
      estadointerno: caso.estadointerno,
      estadodelcaso: caso.estadodelcaso || '',
      observaciones: caso.observaciones || ''
    });
    setShowForm(true);
  };

  const handleDuplicate = (caso: Caso) => {
    setDuplicatingCaso(caso);
    setFormData({
      corresponsalid: caso.corresponsalid,
      nrocasoassistravel: caso.nrocasoassistravel + '_COPY',
      nrocasocorresponsal: caso.nrocasocorresponsal || '',
      fechadeinicio: caso.fechadeinicio ? caso.fechadeinicio.split('T')[0] : '',
      pais: caso.pais || '',
      informemedico: caso.informemedico || 'no',
      fee: caso.fee?.toString() || '',
      costousd: caso.costousd?.toString() || '',
      costomonedalocal: caso.costomonedalocal?.toString() || '',
      simbolomoneda: caso.simbolomoneda || 'USD',
      montoagregado: caso.montoagregado?.toString() || '',
      tienefactura: caso.tienefactura,
      nrofactura: caso.nrofactura || '',
      fechaemisionfactura: caso.fechaemisionfactura ? caso.fechaemisionfactura.split('T')[0] : '',
      fechavencimientofactura: caso.fechavencimientofactura ? caso.fechavencimientofactura.split('T')[0] : '',
      fechapagofactura: caso.fechapagofactura ? caso.fechapagofactura.split('T')[0] : '',
      estadointerno: 'activo',
      estadodelcaso: caso.estadodelcaso || '',
      observaciones: caso.observaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este caso?')) {
      try {
        const { error } = await supabase
          .from('casos')
          .delete()
          .eq('id', id);
        if (error) throw error;
        loadData();
      } catch (error) {
        console.error('Error deleting caso:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCaso(null);
    setDuplicatingCaso(null);
    setFormData({
      corresponsalid: '',
      nrocasoassistravel: '',
      nrocasocorresponsal: '',
      fechadeinicio: '',
      pais: '',
      informemedico: 'no',
      fee: '',
      costousd: '',
      costomonedalocal: '',
      simbolomoneda: 'USD',
      montoagregado: '',
      tienefactura: false,
      nrofactura: '',
      fechaemisionfactura: '',
      fechavencimientofactura: '',
      fechapagofactura: '',
      estadointerno: 'activo',
      estadodelcaso: '',
      observaciones: ''
    });
  };

  const filteredCasos = casos.filter(caso => {
    const matchesSearch = 
      caso.nrocasoassistravel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caso.corresponsalnombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caso.pais?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caso.nrocasocorresponsal?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = !filters.estado || caso.estadointerno === filters.estado;
    const matchesCorresponsal = !filters.corresponsal || caso.corresponsalid === filters.corresponsal;
    const matchesPais = !filters.pais || caso.pais === filters.pais;
    
    return matchesSearch && matchesEstado && matchesCorresponsal && matchesPais;
  });

  const getTotalCasos = () => casos.length;
  const getCasosCompletados = () => casos.filter(c => c.estadointerno === 'completado').length;
  const getMontoTotal = () => casos.reduce((sum, c) => sum + (c.total || 0), 0);
  const getFacturasPendientes = () => casos.filter(c => c.tienefactura && !c.fechapagofactura).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Casos</h1>
          <p className="text-gray-600">Gestiona tus casos de asistencia médica</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Caso
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar casos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                {estados.map(estado => (
                  <option key={estado.value} value={estado.value}>{estado.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Corresponsal</label>
              <select
                value={filters.corresponsal}
                onChange={(e) => setFilters(prev => ({ ...prev, corresponsal: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los corresponsales</option>
                {corresponsales.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
              <select
                value={filters.pais}
                onChange={(e) => setFilters(prev => ({ ...prev, pais: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los países</option>
                {[...new Set(casos.map(c => c.pais).filter(Boolean))].map(pais => (
                  <option key={pais} value={pais}>{pais}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ estado: '', corresponsal: '', pais: '' })}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Casos</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalCasos()}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-green-600">{getCasosCompletados()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monto Total</p>
              <p className="text-2xl font-bold text-gray-900">${getMontoTotal().toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Facturas Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">{getFacturasPendientes()}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Casos List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Caso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Corresponsal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  País
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCasos.map((caso) => (
                <tr key={caso.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {caso.nrocasoassistravel}
                      </div>
                      {caso.nrocasocorresponsal && (
                        <div className="text-sm text-gray-500">
                          Ref: {caso.nrocasocorresponsal}
                        </div>
                      )}
                      {caso.fechadeinicio && (
                        <div className="text-xs text-gray-400">
                          {new Date(caso.fechadeinicio).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{caso.corresponsalnombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{caso.pais || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      ${(caso.total || 0).toLocaleString()}
                    </div>
                    {caso.informemedico === 'si' && (
                      <div className="text-xs text-blue-600">Médico</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      estados.find(e => e.value === caso.estadointerno)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {estados.find(e => e.value === caso.estadointerno)?.label || caso.estadointerno}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {caso.tienefactura ? (
                        caso.fechapagofactura ? (
                          <span className="text-green-600">Pagada</span>
                        ) : (
                          <span className="text-orange-600">Pendiente</span>
                        )
                      ) : (
                        <span className="text-gray-500">Sin factura</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(caso)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => handleDuplicate(caso)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          onClick={() => handleDelete(caso.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCasos.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || filters.estado || filters.corresponsal || filters.pais 
              ? 'No se encontraron casos' 
              : 'No hay casos'
            }
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filters.estado || filters.corresponsal || filters.pais
              ? 'Intenta con otros filtros'
              : 'Comienza agregando tu primer caso'
            }
          </p>
          {canEdit && !searchTerm && !filters.estado && !filters.corresponsal && !filters.pais && (
            <div className="mt-6">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Caso
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal Form - Se mantiene igual pero más compacto por espacio */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingCaso ? 'Editar Caso' : duplicatingCaso ? 'Duplicar Caso' : 'Nuevo Caso'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Corresponsal *
                  </label>
                  <select
                    required
                    value={formData.corresponsalid}
                    onChange={(e) => setFormData(prev => ({ ...prev, corresponsalid: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar corresponsal</option>
                    {corresponsales.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N° Caso AssistTravel *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nrocasoassistravel}
                    onChange={(e) => setFormData(prev => ({ ...prev, nrocasoassistravel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N° Caso Corresponsal
                  </label>
                  <input
                    type="text"
                    value={formData.nrocasocorresponsal}
                    onChange={(e) => setFormData(prev => ({ ...prev, nrocasocorresponsal: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Información del Caso */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.fechadeinicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechadeinicio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <input
                    list="paises-list"
                    value={formData.pais}
                    onChange={(e) => setFormData(prev => ({ ...prev, pais: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <datalist id="paises-list">
                    {paises.map(pais => (
                      <option key={pais} value={pais} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.estadointerno}
                    onChange={(e) => setFormData(prev => ({ ...prev, estadointerno: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {estados.map(estado => (
                      <option key={estado.value} value={estado.value}>{estado.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Información Médica */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Información Médica</h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="informemedico"
                      value="si"
                      checked={formData.informemedico === 'si'}
                      onChange={(e) => setFormData(prev => ({ ...prev, informemedico: e.target.value }))}
                    />
                    <span>Sí</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="informemedico"
                      value="no"
                      checked={formData.informemedico === 'no'}
                      onChange={(e) => setFormData(prev => ({ ...prev, informemedico: e.target.value }))}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Información Financiera */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Información Financiera</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fee
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.fee}
                      onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo USD
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costousd}
                      onChange={(e) => setFormData(prev => ({ ...prev, costousd: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo Moneda Local
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costomonedalocal}
                      onChange={(e) => setFormData(prev => ({ ...prev, costomonedalocal: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moneda
                    </label>
                    <select
                      value={formData.simbolomoneda}
                      onChange={(e) => setFormData(prev => ({ ...prev, simbolomoneda: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {monedas.map(moneda => (
                        <option key={moneda.value} value={moneda.value}>{moneda.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto Agregado
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.montoagregado}
                      onChange={(e) => setFormData(prev => ({ ...prev, montoagregado: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Información de Facturación */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Facturación</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tienefactura"
                      checked={formData.tienefactura}
                      onChange={(e) => setFormData(prev => ({ ...prev, tienefactura: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="tienefactura" className="ml-2 block text-sm text-gray-900">
                      Tiene factura
                    </label>
                  </div>
                  
                  {formData.tienefactura && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          N° Factura
                        </label>
                        <input
                          type="text"
                          value={formData.nrofactura}
                          onChange={(e) => setFormData(prev => ({ ...prev, nrofactura: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha Emisión
                        </label>
                        <input
                          type="date"
                          value={formData.fechaemisionfactura}
                          onChange={(e) => setFormData(prev => ({ ...prev, fechaemisionfactura: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha Vencimiento
                        </label>
                        <input
                          type="date"
                          value={formData.fechavencimientofactura}
                          onChange={(e) => setFormData(prev => ({ ...prev, fechavencimientofactura: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha Pago
                        </label>
                        <input
                          type="date"
                          value={formData.fechapagofactura}
                          onChange={(e) => setFormData(prev => ({ ...prev, fechapagofactura: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  rows={3}
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCaso ? 'Actualizar' : duplicatingCaso ? 'Crear Copia' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}