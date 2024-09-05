import React, { useRef, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const ChartComponent = ({ data, type }) => {
  const chartRef = useRef(null);

  // Process chart data to include both duration and popularity
  const processChartData = () => {
    const labels = data.map(track => track.name);
    const durations = data.map(track => track.duration_ms / 1000 / 60);
    const popularity = data.map(track => track.popularity);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Track Duration (min)',
          data: durations,
          backgroundColor: ['#6366F1', '#A5B4FC', '#C7D2FE', '#818CF8', '#4F46E5'],
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
        },
        {
          label: 'Popularity',
          data: popularity,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
        },
      ],
    };

    return chartData;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#4B5563',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        bodyColor: '#F9FAFB',
        titleColor: '#F9FAFB',
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            return label === 'Track Duration (min)' 
              ? `${label}: ${context.raw.toFixed(2)} min`
              : `${label}: ${context.raw}`; 
          },
        },
      },
    },
  };

  useEffect(() => {
    const chartInstance = chartRef.current?.chartInstance;

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [data]);

  const chartData = processChartData();

  switch (type) {
    case 'bar':
      return <div className="relative h-72"><Bar data={chartData} options={chartOptions} ref={chartRef} /></div>;
    case 'line':
      return <div className="relative h-72"><Line data={chartData} options={chartOptions} ref={chartRef} /></div>;
    case 'pie':
      return <div className="relative h-96"><Pie data={chartData} options={chartOptions} ref={chartRef} /></div>;
    default:
      return <div>Invalid chart type</div>;
  }
};

export default ChartComponent;
