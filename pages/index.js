import React, { useState } from 'react';

export default function Home() {
  const [vista, setVista] = useState('formulario');
  const [formData, setFormData] = useState({
    expediente: '',
    proyecto: '',
    departamento: '',
    cliente: '',
    presupuestoBase: '',
    iva: '',
    total: '',
    estado: '',
    fechaEmision: '',
    fechaPago: '',
    observaciones: ''
  });
  const [proyectos, setProyectos] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'presupuestoBase') {
        const base = parseFloat(value) || 0;
        const iva = base * 0.21;
        const total = base + iva;
        newData.iva = iva.toFixed(2);
        newData.total = total.toFixed(2);
      }
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProyectos([...proyectos, formData]);
    setFormData({
      expediente: '',
      proyecto: '',
      departamento: '',
      cliente: '',
      presupuestoBase: '',
      iva: '',
      total: '',
      estado: '',
      fechaEmision: '',
      fechaPago: '',
      observaciones: ''
    });
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white">Increa Ingeniería - Sistema de Gestión</h1>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setVista('formulario')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              vista === 'formulario'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 border border-blue-600'
            }`}
          >
            FORMULARIO
          </button>
          <button
            onClick={() => setVista('graficas')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              vista === 'graficas'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 border border-blue-600'
            }`}
          >
            GRÁFICAS
          </button>
        </div>

        {vista === 'formulario' ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Nuevo Proyecto</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nº Expediente</label>
                  <input
                    type="text"
                    name="expediente"
                    value={formData.expediente}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Proyecto</label>
                  <input
                    type="text"
                    name="proyecto"
                    value={formData.proyecto}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Departamento</label>
                  <select
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option>BIM</option>
                    <option>Obra Civil</option>
                    <option>Edificación</option>
                    <option>Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cliente</label>
                  <input
                    type="text"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Presupuesto Base (€)</label>
                  <input
                    type="number"
                    name="presupuestoBase"
                    value={formData.presupuestoBase}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">IVA (21%)</label>
                  <input
                    type="text"
                    value={formData.iva ? formatNumber(formData.iva) : ''}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Total</label>
                  <input
                    type="text"
                    value={formData.total ? formatNumber(formData.total) : ''}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option>Pendiente de enviar</option>
                    <option>Enviada</option>
                    <option>Pagada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Emisión</label>
                  <input
                    type="date"
                    name="fechaEmision"
                    value={formData.fechaEmision}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Pago</label>
                  <input
                    type="date"
                    name="fechaPago"
                    value={formData.fechaPago}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Observaciones</label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({
                    expediente: '',
                    proyecto: '',
                    departamento: '',
                    cliente: '',
                    presupuestoBase: '',
                    iva: '',
                    total: '',
                    estado: '',
                    fechaEmision: '',
                    fechaPago: '',
                    observaciones: ''
                  })}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar Proyecto
                </button>
              </div>
            </form>

            {proyectos.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Proyectos Registrados</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expediente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proyectos.map((proyecto, index) => (
                        <tr
                          key={index}
                          className={
                            proyecto.estado === 'Pendiente de enviar' ? 'bg-red-50' :
                            proyecto.estado === 'Enviada' ? 'bg-yellow-50' :
                            proyecto.estado === 'Pagada' ? 'bg-green-50' : ''
                          }
                        >
                          <td className="px-6 py-4">{proyecto.expediente}</td>
                          <td className="px-6 py-4">{proyecto.proyecto}</td>
                          <td className="px-6 py-4">{proyecto.cliente}</td>
                          <td className="px-6 py-4">{formatNumber(proyecto.total)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm
                              ${proyecto.estado === 'Pendiente de enviar' ? 'bg-red-100 text-red-800' :
                                proyecto.estado === 'Enviada' ? 'bg-yellow-100 text-yellow-800' :
                                proyecto.estado === 'Pagada' ? 'bg-green-100 text-green-800' : ''
                              }
                            `}>
                              {proyecto.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Panel de Gráficas</h2>
            <p>Las gráficas aparecerán aquí cuando haya datos</p>
          </div>
        )}
      </div>
    </div>
  );
}
