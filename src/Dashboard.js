import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChartComponent from './ChartComponent';
import 'tailwindcss/tailwind.css';

const getAccessToken = async () => {
  const clientId = '5211afcff0da45168de1c4bafd328710';
  const clientSecret = '71092f07ab114adab56cf7d7f735219b';

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
    }
  );

  return response.data.access_token;
};

const fetchSpotifyData = async () => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(
      'https://api.spotify.com/v1/search?q=year:2023&market=IN&type=track',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.tracks.items;
  } catch (error) {
    console.error('Error fetching data from Spotify', error);
    return [];
  }
};

const Dashboard = () => {
  const [spotifyData, setSpotifyData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('all');
  const [popularityFilter, setPopularityFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSpotifyData();
      setSpotifyData(data);
      setFilteredData(data);
    };

    fetchData();
  }, []);

  // Handle filter by artist name
  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
    applyFilters(newFilter, durationFilter, popularityFilter);
  };

  // Handle filter by duration
  const handleDurationFilterChange = (e) => {
    const newDurationFilter = e.target.value;
    setDurationFilter(newDurationFilter);
    applyFilters(filter, newDurationFilter, popularityFilter);
  };

  // Handle filter by popularity
  const handlePopularityFilterChange = (e) => {
    const newPopularityFilter = e.target.value;
    setPopularityFilter(newPopularityFilter);
    applyFilters(filter, durationFilter, newPopularityFilter);
  };

  // Apply all filters (artist, duration, popularity)
  const applyFilters = (artistFilter, durationFilter, popularityFilter) => {
    let filtered = spotifyData;

    // Filter by artist name
    if (artistFilter) {
      filtered = filtered.filter((track) =>
        track.artists.some((artist) =>
          artist.name.toLowerCase().includes(artistFilter.toLowerCase())
        )
      );
    }

    // Filter by duration
    if (durationFilter !== 'all') {
      filtered = filtered.filter((track) => {
        const durationInMinutes = track.duration_ms / 1000 / 60;
        if (durationFilter === '<3') return durationInMinutes < 3;
        if (durationFilter === '3-5') return durationInMinutes >= 3 && durationInMinutes <= 5;
        if (durationFilter === '>5') return durationInMinutes > 5;
        return true;
      });
    }

    // Filter by popularity
    if (popularityFilter !== 'all') {
      filtered = filtered.filter((track) => {
        const popularity = track.popularity;
        if (popularityFilter === '<50') return popularity < 50;
        if (popularityFilter === '50-75') return popularity >= 50 && popularity <= 75;
        if (popularityFilter === '>75') return popularity > 75;
        return true;
      });
    }

    setFilteredData(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-gray-100 py-10 px-4 font-roboto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-gray-800 mb-8">
          Spotify Dashboard 2023
        </h1>

        {/* Filter Inputs */}
        <div className="flex sm:flex-row flex-col justify-center mb-8 gap-4">
          <input
            type="text"
            value={filter}
            onChange={handleFilterChange}
            placeholder="Search by artist name"
            className="w-full max-w-lg p-4 rounded-lg shadow-lg text-gray-700 bg-white border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-500 transition"
          />

          <select
            value={durationFilter}
            onChange={handleDurationFilterChange}
            className="p-4 rounded-lg shadow-lg bg-white border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-500"
          >
            <option value="all">All Durations</option>
            <option value="<3">Less than 3 min</option>
            <option value="3-5">3 to 5 min</option>
            <option value=">5">More than 5 min</option>
          </select>

          <select
            value={popularityFilter}
            onChange={handlePopularityFilterChange}
            className="p-4 rounded-lg shadow-lg bg-white border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-500"
          >
            <option value="all">All Popularity</option>
            <option value="<50">Less than 50</option>
            <option value="50-75">50 to 75</option>
            <option value=">75">More than 75</option>
          </select>
        </div>

        {/* Charts Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-xl hover:shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Track Duration (Bar Chart)</h2>
            <ChartComponent data={filteredData} type="bar" />
          </div>
          <div className="p-6 bg-white rounded-lg shadow-xl hover:shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Track Duration (Line Chart)</h2>
            <ChartComponent data={filteredData} type="line" />
          </div>
          <div className="col-span-1 lg:col-span-2 p-6 bg-white rounded-lg shadow-xl hover:shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Track Duration Distribution (Pie Chart)</h2>
            <ChartComponent data={filteredData} type="pie" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
