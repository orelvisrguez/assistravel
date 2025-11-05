import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './AuthPage';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Edit, Trash2, MapPin, Phone, Mail, Building2, FileText, TrendingUp } from 'lucide-react';
import { Corresponsal } from '../lib/supabase';

interface CorresponsalWithStats extends Corresponsal {
  total_casos: number;
  casos_completados: number;
  monto_total: number;
}

export default function CorresponsalesDashboard() {
  const { user, canEdit } = useAuth();
  const [corresponsales, setCorresponsales] = useState<CorresponsalWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCorresponsal, setEditingCorresponsal] = useState<Corresponsal | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    contactoprincipal: '',
    emailcontacto: '',
    telefonocontacto: '',
    direccion: '',
    pais: '',
    observaciones: ''
  });

  useEffect(() => {
    loadCorresponsales();
  }, [user]);

  const loadCorresponsales = async () => {
    try {
      setLoading(true);
      
      // Obtener corresponsales del usuario actual
      const { data: corresponsales, error } = await supabase
        .from('corresponsales')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Obtener estadísticas para cada corresponsal
      const corresponsalesWithStats = await Promise.all(
        (corresponsales || []).map(async (corresponsal) => {
          // Obtener casos del corresponsal
          const { data: casos } = await supabase
            .from('casos')
            .select('total, estadointerno')
            .eq('corresponsalid', corresponsal.id)
            .eq('user_id', user?.id);

          const totalCasos = casos?.length || 0;
          const casosCompletados = casos?.filter(c => c.estadointerno === 'completado').length || 0;
          const montoTotal = casos?.reduce((sum, c) => sum + (c.total || 0), 0) || 0;

          return {
            ...corresponsal,
            total_casos: totalCasos,
            casos_completados: casosCompletados,
            monto_total: montoTotal
          };
        })
      );

      setCorresponsales(corresponsalesWithStats);
    } catch (error) {
      console.error('Error loading corresponsales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCorresponsal) {
        const { error } = await supabase
          .from('corresponsales')
          .update(formData)
          .eq('id', editingCorresponsal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('corresponsales')
          .insert([{ ...formData, user_id: user?.id }]);
        if (error) throw error;
      }
      
      setShowForm(false);
      setEditingCorresponsal(null);
      setFormData({
        nombre: '',
        contactoprincipal: '',
        emailcontacto: '',
        telefonocontacto: '',
        direccion: '',
        pais: '',
        observaciones: ''
      });
      loadCorresponsales();
    } catch (error) {
      console.error('Error saving corresponsal:', error);
    }
  };

  const handleEdit = (corresponsal: Corresponsal) => {
    setEditingCorresponsal(corresponsal);
    setFormData({
      nombre: corresponsal.nombre,
      contactoprincipal: corresponsal.contactoprincipal || '',
      emailcontacto: corresponsal.emailcontacto || '',
      telefonocontacto: corresponsal.telefonocontacto || '',
      direccion: corresponsal.direccion || '',
      pais: corresponsal.pais || '',
      observaciones: corresponsal.observaciones || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este corresponsal?')) {
      try {
        const { error } = await supabase
          .from('corresponsales')
          .delete()
          .eq('id', id);
        if (error) throw error;
        loadCorresponsales();
      } catch (error) {
        console.error('Error deleting corresponsal:', error);
      }
    }
  };

  const filteredCorresponsales = corresponsales.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pais?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.emailcontacto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Corresponsales</h1>
          <p className="text-gray-600">Gestiona tu red de corresponsales médicos</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Corresponsal
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar corresponsal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Corresponsales</p>
              <p className="text-2xl font-bold text-gray-900">{corresponsales.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Casos</p>
              <p className="text-2xl font-bold text-gray-900">
                {corresponsales.reduce((sum, c) => sum + c.total_casos, 0)}
              </p>
            </div>
            <FileText className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Casos Completados</p>
              <p className="text-2xl font-bold text-gray-900">
                {corresponsales.reduce((sum, c) => sum + c.casos_completados, 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monto Total</p>
              <p className="text-2xl font-bold text-gray-900">
                ${corresponsales.reduce((sum, c) => sum + c.monto_total, 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Corresponsales List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCorresponsales.map((corresponsal) => (
          <div key={corresponsal.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{corresponsal.nombre}</h3>
                {corresponsal.pais && (
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {corresponsal.pais}
                  </div>
                )}
              </div>
              {canEdit && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(corresponsal)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(corresponsal.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {corresponsal.contactoprincipal && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {corresponsal.contactoprincipal}
                </div>
              )}
              {corresponsal.emailcontacto && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {corresponsal.emailcontacto}
                </div>
              )}
              {corresponsal.telefonocontacto && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {corresponsal.telefonocontacto}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{corresponsal.total_casos}</p>
                  <p className="text-xs text-gray-600">Casos</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-600">{corresponsal.casos_completados}</p>
                  <p className="text-xs text-gray-600">Completados</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-600">${corresponsal.monto_total.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Monto</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCorresponsales.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No se encontraron corresponsales' : 'No hay corresponsales'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer corresponsal'}
          </p>
          {canEdit && !searchTerm && (
            <div className="mt-6">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Corresponsal
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingCorresponsal ? 'Editar Corresponsal' : 'Nuevo Corresponsal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contacto Principal
                  </label>
                  <input
                    type="text"
                    value={formData.contactoprincipal}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactoprincipal: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.emailcontacto}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailcontacto: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefonocontacto}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefonocontacto: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => setFormData(prev => ({ ...prev, pais: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
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
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCorresponsal(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCorresponsal ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}