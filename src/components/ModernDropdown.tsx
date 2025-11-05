import React, { useState } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  allowAdd?: boolean;
  required?: boolean;
}

export default function ModernDropdown({ 
  label, 
  value, 
  options, 
  onSelect, 
  placeholder = "Seleccionar...", 
  allowAdd = false,
  required = false
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectOption = (option: string) => {
    onSelect(option);
    setIsOpen(false);
    setSearchTerm('');
    setShowAddNew(false);
  };

  const handleAddNew = () => {
    if (customValue.trim()) {
      onSelect(customValue.trim());
      setIsOpen(false);
      setCustomValue('');
      setShowAddNew(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || placeholder}
          </span>
          <ChevronDown className={`absolute right-3 top-3.5 h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150"
                >
                  {option}
                </button>
              ))}
              
              {filteredOptions.length === 0 && !showAddNew && allowAdd && (
                <div className="px-4 py-2 text-gray-500 text-sm">
                  No se encontraron resultados
                </div>
              )}
            </div>

            {allowAdd && (
              <div className="border-t border-gray-200 p-3">
                {!showAddNew ? (
                  <button
                    type="button"
                    onClick={() => setShowAddNew(true)}
                    className="w-full px-3 py-2 text-left text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar nuevo
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Ingrese nuevo valor..."
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleAddNew}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 text-sm"
                      >
                        Agregar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddNew(false);
                          setCustomValue('');
                        }}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-150 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setShowAddNew(false);
            setCustomValue('');
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
}