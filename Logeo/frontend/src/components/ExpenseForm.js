import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
const ExpenseForm = () => {
    // Inicializa el estado para los campos del formulario
    const [formData, setFormData] = useState({ description: '', amount: '', group: '' });
    // Inicializa el estado para el archivo
    const [file, setFile] = useState(null);

    // Maneja los cambios en los campos de texto
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    // Maneja el cambio en el campo de archivo
    const onFileChange = e => setFile(e.target.files[0]);

    const onSubmit = async e => {
        e.preventDefault();

        try {
            // Paso 1: Obtener y verificar el token
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Por favor, inicia sesión para registrar un gasto.');
                return;
            }

            // Paso 2: Decodificar el token para obtener el ID del usuario que paga
            const decoded = jwtDecode(token);
            const userId = decoded.user.id;
            
            // Si el backend espera un array para 'splitAmong', define un valor por defecto (ej. el mismo usuario)
            const splitAmong = [userId]; // Ejemplo: el gasto se divide solo entre el que paga

            // Paso 3: Crear el objeto FormData con todos los campos
            const data = new FormData();
            data.append('description', formData.description);
            data.append('amount', formData.amount);
            data.append('group', formData.group);
            data.append('paidBy', userId); // Usa el ID del usuario del token
            data.append('splitAmong', JSON.stringify(splitAmong)); // Convierte el array a JSON string

            if (file) {
                data.append('comprobante', file);
            }

            // Paso 4: Realizar la petición POST con el token
            await axios.post('/api/expenses', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token // Envía el token en los headers
                }
            });

            alert('Gasto agregado exitosamente');
            // Opcional: Limpiar el formulario
            setFormData({ description: '', amount: '', group: '' });
            setFile(null);

        } catch (err) {
            console.error('Error al enviar el formulario:', err);
            alert('Error al agregar el gasto');
        }
    };

    return (
        <div className="module-content">
            <h2>Registro de Gastos</h2>
            <form onSubmit={onSubmit}>
                <input type="text" name="description" placeholder="Descripción" onChange={onChange} required />
                <input type="number" name="amount" placeholder="Monto" onChange={onChange} required />
                <input type="file" onChange={onFileChange} />
                <button type="submit">Agregar Gasto</button>
            </form>
        </div>
    );
};

export default ExpenseForm;