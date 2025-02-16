import React, { useState, useEffect } from 'react';
import './Search.css';
import logo from './images/MedicusLogo.PNG';
import { useNavigate } from 'react-router-dom';


const Search = () => {

  const navigate = useNavigate();
 
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    severity: '',
    admissionId: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const handlePatientClick = (id, name) => {
    navigate(`/profile/${id}/${name}`);
  };

  // Fetch patients from API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const ipaddr = window.location.hostname;
       
        const response = await fetch(`http://${ipaddr}:2006/api/doctors/admissions`, {
          method: 'GET', // Change to POST if your API requires it
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setPatients(data);
        setFilteredPatients(data); // Set the initial filtered data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Handle changes in the filters and apply filtering
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // Update the filter state
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, [name]: value };

      // Apply filtering based on all the current filter values
      const filteredData = patients.filter((patient) => {
        return (
          (newFilters.name ? patient.name.toLowerCase().includes(newFilters.name.toLowerCase()) : true) &&
          (newFilters.severity ? patient.severity.toLowerCase().includes(newFilters.severity.toLowerCase()) : true) &&
          (newFilters.admissionId ? patient.admissionId.toLowerCase().includes(newFilters.admissionId.toLowerCase()) : true)
        );
      });

      // Set filtered patients
      setFilteredPatients(filteredData);
      return newFilters;
    });
  };

  // Sorting function
  const [sortBy, setSortBy] = useState({ field: 'name', direction: 'asc' });

  const sortPatients = (field) => {
    const sorted = [...filteredPatients].sort((a, b) => {
      if (a[field] < b[field]) return sortBy.direction === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return sortBy.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortBy({ field, direction: sortBy.direction === 'asc' ? 'desc' : 'asc' });
    setPatients(sorted);
    setFilteredPatients(sorted);
  };

  const openMessage = (admissionId,patientId) =>{
      alert(patientId);
   
    const data = { admissionId: admissionId,patientId:patientId };
    navigate('/profile', { state: data });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <header className="header">
        <div className="logo">
          {/* Logo image or icon */}
          <img src={logo} alt="Medicus Logo" className="logo" />
        </div>
        <nav className="nav">
          <a href="/home" className="nav-link">Home</a>
          <a href="/home" className="nav-link">Create a Patient</a>
        </nav>
        <div className="actions">
          <button className="btn create-patient-btn">Logout</button>
          <button className="btn search-btn">
            <i className="fa fa-search"></i>
          </button>
        </div>
      </header>

      <div className="patient-table">
        <h2>Patients</h2>
        <div className="filters">
          <input
            type="text"
            name="name"
            placeholder="Filter by name"
            value={filters.name}
            onChange={handleFilterChange}
            className="search-input"
          />
          <input
            type="text"
            name="severity"
            placeholder="Filter by severity"
            value={filters.severity}
            onChange={handleFilterChange}
            className="search-input"
          />
          <input
            type="text"
            name="admissionId"
            placeholder="Filter by admission ID"
            value={filters.admissionId}
            onChange={handleFilterChange}
            className="search-input"
          />
        </div>

        <table>
          <thead>
            <tr>
              <th onClick={() => sortPatients('name')}>
                Name {sortBy.field === 'name' && (sortBy.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => sortPatients('severity')}>
                Severity {sortBy.field === 'severity' && (sortBy.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => sortPatients('lastVisit')}>
                Last Visit {sortBy.field === 'lastVisit' && (sortBy.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th>Actions</th>
              <th onClick={() => sortPatients('admissionId')}>
                Admission Id {sortBy.field === 'admissionId' && (sortBy.direction === 'asc' ? '▲' : '▼')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, index) => (
              <tr key={index}>
                <td><a onClick={() => handlePatientClick(patient.id, patient.name)}>{patient.name}</a></td>
                <td>
                  <span className={`severity ${patient.severity.toLowerCase()}`}>
                    {patient.severity}
                  </span>
                </td>
                <td>{patient.lastVisit}</td>
                <td>
                <button className="open-btn" onClick={() => openMessage(patient.admissionId , patient.id)}>Open</button>

                </td>
                <td>{patient.admissionId}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button className="page-btn">◀</button>
          <span>1</span>
          <button className="page-btn">▶</button>
        </div>
      </div>
    </div>
  );
};

export default Search;
