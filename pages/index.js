import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Home() {
 const [vista, setVista] = useState('formulario');
 const [filtroTemporal, setFiltroTemporal] = useState('mensual');
 const [filtroAno, setFiltroAno] = useState(2024);
 const [editingId, setEditingId] = useState(null);

 const [formData, setFormData] = useState({
   id: null,
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

 const COLORS = {
   'BIM': '#0088FE',
   'Obra Civil': '#00C49F',
   'Edificación': '#FFBB28',
   'Industrial': '#FF8042'
 };

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
   if (editingId !== null) {
     setProyectos(prev => prev.map(p => 
       p.id === editingId ? {...formData, id: editingId} : p
     ));
     setEditingId(null);
   } else {
     setProyectos([...proyectos, {...formData, id: Date.now()}]);
   }
   setFormData({
     id: null,
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

 const handleEdit = (proyecto) => {
   setEditingId(proyecto.id);
   setFormData(proyecto);
 };

 const formatNumber = (value) => {
   return new Intl.NumberFormat('es-ES', {
     style: 'currency',
     currency: 'EUR'
   }).format(value);
 };

 const getChartData = () => {
   switch(filtroTemporal) {
     case 'diario':
       // Agrupa por día
       const dailyData = {};
       proyectos.forEach(p => {
         const fecha = p.fechaEmision;
         if (!dailyData[fecha]) {
           dailyData[fecha] = { fecha, pendiente: 0, enviada: 0, pagada: 0 };
         }
         dailyData[fecha][p.estado.toLowerCase()] += parseFloat(p.total);
       });
       return Object.values(dailyData).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

     case 'semanal':
       // Agrupa por semana
       const weeklyData = {};
       proyectos.forEach(p => {
         const date = new Date(p.fechaEmision);
         const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
         const weekKey = weekStart.toISOString().split('T')[0];
         if (!weeklyData[weekKey]) {
           weeklyData[weekKey] = { semana: `Semana ${weekStart.toLocaleDateString()}`, pendiente: 0, enviada: 0, pagada: 0 };
         }
         weeklyData[weekKey][p.estado.toLowerCase()] += parseFloat(p.total);
       });
       return Object.values(weeklyData);

     case 'mensual':
       // Agrupa por mes
       return Array.from({ length: 12 }, (_, i) => {
         const monthProjects = proyectos.filter(p => {
           if (!p.fechaEmision) return false;
           const date = new Date(p.fechaEmision);
           return date.getMonth() === i && date.getFullYear() === filtroAno;
         });

         return {
           mes: new Date(2024, i).toLocaleString('es-ES', { month: 'long' }),
           pendiente: monthProjects
             .filter(p => p.estado === 'Pendiente de enviar')
             .reduce((sum, p) => sum + parseFloat(p.total), 0),
           enviada: monthProjects
             .filter(p => p.estado === 'Enviada')
             .reduce((sum, p) => sum + parseFloat(p.total), 0),
           pagada: monthProjects
             .filter(p => p.estado === 'Pagada')
             .reduce((sum, p) => sum + parseFloat(p.total), 0)
         };
       });

     case 'anual':
       // Agrupa por año
       const years = [...new Set(proyectos.map(p => new Date(p.fechaEmision).getFullYear()))];
       return years.map(year => ({
         año: year,
         pendiente: proyectos
           .filter(p => new Date(p.fechaEmision).getFullYear() === year && p.estado === 'Pendiente de enviar')
           .reduce((sum, p) => sum + parseFloat(p.total), 0),
         enviada: proyectos
           .filter(p => new Date(p.fechaEmision).getFullYear() === year && p.estado === 'Enviada')
           .reduce((sum, p) => sum + parseFloat(p.total), 0),
         pagada: proyectos
           .filter(p => new Date(p.fechaEmision).getFullYear() === year && p.estado === 'Pagada')
           .reduce((sum, p) => sum + parseFloat(p.total), 0)
       }));

     case 'departamentos':
       // Agrupa por departamento
       return Object.keys(COLORS).map(dep => ({
         nombre: dep,
         total: proyectos
           .filter(p => p.departamento === dep)
           .reduce((sum, p) => sum + parseFloat(p.total || 0), 0)
       }));
   }
 };

 const getDepartmentAnalysis = () => {
   const analysis = Object.keys(COLORS).map(dep => {
     const depProjects = proyectos.filter(p => p.departamento === dep);
     const totalFacturado = depProjects.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
     const totalPagado = depProjects
       .filter(p => p.estado === 'Pagada')
       .reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
     
     return {
       departamento: dep,
       proyectos: depProjects.length,
       facturado: totalFacturado,
       pagado: totalPagado,
       pendiente: totalFacturado - totalPagado,
       rentabilidad: (totalPagado / totalFacturado * 100) || 0
     };
   });

   return analysis.sort((a, b) => b.rentabilidad - a.rentabilidad);
 };

 return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
     <div className="max-w-7xl mx-auto">
       {/* Header mejorado */}
       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mb-8 shadow-2xl">
         <h1 className="text-4xl font-bold text-white">Increa Ingeniería - Sistema de Gestión</h1>
         <p className="text-blue-100 mt-2">Control y Análisis de Proyectos</p>
       </div>

       {/* Navegación mejorada */}
       <div className="flex gap-4 mb-8">
         <button
           onClick={() => setVista('formulario')}
           className={`px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 ${
             vista === 'formulario'
               ? 'bg-blue-600 text-white shadow-lg'
               : 'bg-white text-blue-600 hover:bg-blue-50'
           }`}
         >
           FORMULARIO
         </button>
         <button
           onClick={() => setVista('graficas')}
           className={`px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 ${
             vista === 'graficas'
               ? 'bg-blue-600 text-white shadow-lg'
               : 'bg-white text-blue-600 hover:bg-blue-50'
           }`}
         >
           GRÁFICAS
         </button>
       </div>

       {vista === 'formulario' ? (
         <div className="bg-white rounded-xl shadow-xl p-8">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-gray-800">
               {editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'}
             </h2>
             {editingId && (
               <button
                 onClick={() => {
                   setEditingId(null);
                   setFormData({
                     id: null,
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
                 }}
                 className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
               >
                 Cancelar Edición
               </button>
             )}
           </div>

           {/* Formulario */}
           <form onSubmit={handleSubmit} className="space-y-8">
             {/* ... Resto del formulario igual que antes ... */}
           </form>

           {/* Tabla de Proyectos Mejorada */}
           {proyectos.length > 0 && (
             <div className="mt-12">
               <h3 className="text-xl font-bold mb-6 text-gray-800">Proyectos Registrados</h3>
               <div className="overflow-x-auto">
                 <table className="min-w-full bg-white rounded-lg overflow-hidden">
                   <thead className="bg-gray-50">
                     <tr>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Expediente
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Proyecto
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Cliente
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Total
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Estado
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Acciones
                       </th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200">
                     {proyectos.map((proyecto) => (
                       <tr
                         key={proyecto.id}
                         className={`
                           transition-colors
                           ${proyecto.estado === 'Pendiente de enviar' ? 'bg-red-50 hover:bg-red-100' :
                             proyecto.estado === 'Enviada' ? 'bg-yellow-50 hover:bg-yellow-100' :
                             proyecto.estado === 'Pagada' ? 'bg-green-50 hover:bg-green-100' : ''
                           }
                         `}
                       >
                         <td className="px-6 py-4">{proyecto.expediente}</td>
                         <td className="px-6 py-4">{proyecto.proyecto}</td>
                         <td className="px-6 py-4">{proyecto.cliente}</td>
                         <td className="px-6 py-4">{formatNumber(proyecto.total)}</td>
                         <td className="px-6 py-4">
                           <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold
                             ${proyecto.estado === 'Pendiente de enviar' ? 'bg-red-100 text-red-800' :
                               proyecto.estado === 'Enviada' ? 'bg-yellow-100 text-yellow-800' :
                               proyecto.estado === 'Pagada' ? 'bg-green-100 text-green-800' : ''
                             }
                           `}>
                             {proyecto.estado}
                           </span>
                         </td>
                         <td className="px-6 py-4">
                           <button
                             onClick={() => handleEdit(proyecto)}
                             className="text-blue-600 hover:text-blue-900 mr-4"
                           >
                             Editar
                           </button>
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
         <div className="space-y-8">
           {/* Panel de Filtros */}
           <div className="bg-white rounded-xl shadow-lg p-6">
             <div className="flex gap-4 flex-wrap">
               <select
                 value={filtroTemporal}
                 onChange={(e) => setFiltroTemporal(e.target.value)}
                 className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
               >
                 <option value="diario">Vista Diaria</option>
                 <option value="semanal">Vista Semanal</option>
                 <option value="mensual">Vista Mensual</option>
                 <option value="anual">Vista Anual</option>
                 <option value="departamentos">Por Departamentos</option>
               </select>

               {filtroTemporal !== 'departamentos' && (
                 <select
                   value={filtroAno}
                   onChange={(e) => setFiltroAno(parseInt(e.target.value))}
                   className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                 >
                   <option value={2024}>2024</option>
                   <option value={2025}>2025</option>
                 </select>
               )}
             </div>
           </div>

           {/* Gráficas */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Gráfico Principal */}
             <div className="bg-white rounded-xl shadow-lg p-6">
               <h3 className="text-xl font-bold mb-6">Evolución de Facturación</h3>
               <div style={{ height: 400 }}>
                 <ResponsiveContainer width="100%" height="100%">
                   {filtroTemporal === 'departamentos' ? (
                     <PieChart>
                       <Pie
                         data={getChartData()}
                         dataKey="total"
                         nameKey="nombre"
                         cx="50%"
                         cy="50%"
                         outerRadius={150}
                         label={({ nombre, percent }) => `${nombre}: ${(percent * 100).toFixed(1)}%`}
                       >
                         {getChartData().map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[entry.nombre]} />
                         ))}
                       </Pie>
                       <Tooltip formatter={(value) => formatNumber(value)} />
                       <Legend />
                     </PieChart>
                   ) : (
                     <BarChart data={getChartData()}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey={
                         filtroTemporal === 'diario' ? 'fecha' :
                         filtroTemporal === 'semanal' ? 'semana' :
                         filtroTemporal === 'mensual' ? 'mes' : 'año'
                       } />
                       <YAxis tickFormatter={(value) => `${value.toLocaleString()}€`} />
                       <Tooltip formatter={(value) => formatNumber(value)} />
                       <Legend />
                       <Bar dataKey="pendiente" name="Pendiente" fill="#EF4444" />
                       <Bar dataKey="enviada" name="Enviada" fill="#F59E0B" />
                       <Bar dataKey="pagada" name="Pagada" fill="#10B981" />
                     </BarChart>
                   )}
                 </ResponsiveContainer>
               </div>
             </div>

             {/* Análisis de Rentabilidad */}
             <div className="bg-white rounded-xl shadow-lg p-6">
               <h3 className="text-xl font-bold mb-6">Análisis de Rentabilidad por Departamento</h3>
               <div className="space-y-4">
                 {getDepartmentAnalysis().map((dep) => (
                   <div key={dep.departamento} className="p-4 rounded-lg bg-gray-50">
                     <div className="flex justify-between items-center mb-2">
                       <h4 className="font-semibold">{dep.departamento}</h4>
                       <span className="text-sm font-medium text-gray-500">
                         {dep.proyectos} proyectos
                       </span>
                     </div>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                       <div>
                         <span className="text-gray-500">Facturado:</span>
                         <span className="ml-2 font-medium">{formatNumber(dep.facturado)}</span>
                       </div>
                       <div>
                         <span className="text-gray-500">Pagado:</span>
                         <span className="ml-2 font-medium">{formatNumber(dep.pagado)}</span>
                       </div>
                     </div>
                     <div className="mt-2">
                       <div className="h-2 bg-gray-200 rounded-full">
                         <div
                           className="h-2 bg-blue-600 rounded-full"
                           style={{ width: `${dep.rentabilidad}%` }}
                         />
                       </div>
                       <div className="text-right text-sm mt-1">
                         <span className="font-medium">{dep.rentabilidad.toFixed(1)}%</span>
                         <span className="text-gray-500"> rentabilidad</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   </div>
 );
}
