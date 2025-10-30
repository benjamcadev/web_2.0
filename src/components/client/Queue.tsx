'use client';

import { useState } from 'react';
import { XMarkIcon, UserIcon, ClockIcon, TicketIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface QueueProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Queue({ isOpen, onClose }: QueueProps) {
  const [isClosing, setIsClosing] = useState(false);

  // Datos de ejemplo - luego se obtendrán por web scraping
  const queueData = {
    peopleAhead: 5,
    estimatedMinutes: 15,
    currentTicket: 'G330'
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-90 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
          isOpen && !isClosing ? 'animate-fadeIn' : 'animate-fadeOut'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Estado de la Fila</h2>
          <button
            onClick={handleCloseModal}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Cerrar modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Tarjetas de información */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Personas antes de ti */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-600 rounded-full p-3 mb-3">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Personas antes de ti</p>
              <p className="text-4xl font-bold text-blue-600">{queueData.peopleAhead}</p>
            </div>

            {/* Minutos de espera estimados */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-600 rounded-full p-3 mb-3">
                <ClockIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Minutos de espera</p>
              <p className="text-4xl font-bold text-purple-600">{queueData.estimatedMinutes}</p>
            </div>

            {/* Ticket en atención */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-600 rounded-full p-3 mb-3">
                <TicketIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">Ticket en atención</p>
              <p className="text-4xl font-bold text-green-600">{queueData.currentTicket}</p>
            </div>
          </div>

          {/* Botón de Unirse a la Fila */}
          <div className="mt-8">
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="bg-white/20 rounded-full p-4">
                  <UserGroupIcon className="w-12 h-12" />
                </div>
                <span className="text-2xl font-bold">Unirse a la Fila</span>
                <span className="text-sm text-blue-100">
                  Obtén tu ticket virtual y espera cómodamente
                </span>
              </div>
            </button>
          </div>

          {/* Información adicional */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="text-xs text-gray-600 text-center">
              Los tiempos de espera son estimados y pueden variar según la demanda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}