import styles from '../../styles/selectVersion.module.css';
import React, { useState, useEffect } from 'react';
import { supportApi } from '../../services/api';
import { Version } from '../../utils/types';

interface SelectVersionProps {
  onSelectVersion: (version: Version) => void;
}

const SelectVersion: React.FC<SelectVersionProps> = ({ onSelectVersion }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<Version[]>([]);
  const [versionSearchTerm, setVersionSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const versionsPerPage = 10;

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await supportApi.get('/versions');
        setVersions(response.data);
        setFilteredVersions(response.data);
      } catch (err) {
        console.error('Error fetching versions', err);
      }
    };

    fetchVersions();
  }, []);

  const filterVersions = (term: string) => {
    if (term.trim() === '') {
      setFilteredVersions(versions);
    } else {
      const filtered = versions.filter(
        (version) =>
          version.product.name.toLowerCase().includes(term.toLowerCase()) ||
          version.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredVersions(filtered);
    }
  };

  const handleVersionSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVersionSearchTerm(e.target.value);
    filterVersions(e.target.value);
  };

  const handleVersionClick = (version: Version) => {
    onSelectVersion(version);
  };

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
  };

 
  const indexOfLastVersion = currentPage * versionsPerPage;
  const indexOfFirstVersion = indexOfLastVersion - versionsPerPage;
  const currentVersions = filteredVersions.slice(indexOfFirstVersion, indexOfLastVersion);

  return (
    <div>
      <h2>Seleccione una versión:</h2>
      <div className={styles.versionTableContainer}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Buscar por producto o versión..."
            value={versionSearchTerm}
            onChange={handleVersionSearchChange}
          />
        </div>
        <table className={styles.ticketTable}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Versión</th>
            </tr>
          </thead>
          <tbody>
            {currentVersions.map((version) => (
              <tr key={version.id} onClick={() => handleVersionClick(version)}>
                <td>{version.product.name}</td>
                <td>{version.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.paginationButtons}>
          <button onClick={prevPage} disabled={currentPage === 1}>
            Anterior
          </button>
          <button onClick={nextPage} disabled={currentVersions.length < versionsPerPage}>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectVersion;
