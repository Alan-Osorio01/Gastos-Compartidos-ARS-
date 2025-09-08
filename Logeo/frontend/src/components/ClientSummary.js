import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2'; // Ejemplo de librería para gráficas

const ClientSummary = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await axios.get('/api/summary', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setSummary(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) return <div>Cargando resumen...</div>;
    if (!summary) return <div>No hay datos disponibles.</div>;

    return (
        <div className="module-content">
            <h2>Resumen General</h2>
            <div className="summary-cards">
                <div className="summary-card">
                    <h3>Deudas Pendientes</h3>
                    <p>${summary.totalDebt}</p>
                </div>
                {/* ... otras tarjetas de resumen ... */}
            </div>
            <div className="chart-container">
                {/* <Bar data={summary.chartData} /> */}
            </div>
        </div>
    );
};

export default ClientSummary;