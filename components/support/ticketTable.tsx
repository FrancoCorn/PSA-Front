import React, {useState} from 'react';
import styles from '../../styles/ticketTable.module.css';
import {Ticket, Customer, Version, Responsible} from '../../utils/types';

interface Props {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  sortedTickets: Ticket[];
  selectedTicket: Ticket | null;
  customers: Customer[];
  responsibles: Responsible[];
  handleTicketClick: (ticket: Ticket) => void;
  handleSort: (column: string) => void;
  getHeaderClass: (column: string) => string;
  selectedVersion: Version | null;
}

const TicketTable: React.FC<Props> = ({
                                        tickets,
                                        loading,
                                        error,
                                        sortedTickets,
                                        selectedTicket,
                                        customers,
                                        responsibles,
                                        handleTicketClick,
                                        handleSort,
                                        getHeaderClass,
                                        selectedVersion,
                                      }) => {
  type TicketKey = 'id' | 'name' | 'time' | 'customer' | 'severity' | 'status' | 'responsible';
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: TicketKey; direction: 'asc' | 'desc' } | null>(null);
  const ticketsPerPage = 20;

  const filteredTickets = sortedTickets.filter(ticket => ticket.version.id === selectedVersion?.id);

  const sortedAndFilteredTickets = filteredTickets.sort((a, b) => {
    if (!sortConfig) return 0;
    const {key, direction} = sortConfig;
    let aValue: any, bValue: any;

    switch (key) {
      case 'time':
        aValue = new Date(a[key]);
        bValue = new Date(b[key]);
        break;
      case 'customer':
        aValue = getCustomerName(a[key], customers);
        bValue = getCustomerName(b[key], customers);
        break;
      case 'severity':
        aValue = a[key].name;
        bValue = b[key].name;
        break;
      case 'status':
        aValue = a[key].name;
        bValue = b[key].name;
        break;
      case 'responsible':
        aValue = getResponsibleName(a[key], responsibles);
        bValue = getResponsibleName(b[key], responsibles);
        break;
      default:
        aValue = a[key];
        bValue = b[key];
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = sortedAndFilteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  const nextPage = () => setCurrentPage(currentPage + 1);
  const prevPage = () => setCurrentPage(currentPage - 1);

  const handleSortColumn = (key: TicketKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({key, direction});
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.ticketTable}>
        <thead>
        <tr>
          <th className={getHeaderClass('id')} onClick={() => handleSortColumn('id')}>
            ID {sortConfig?.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </th>
          <th className={getHeaderClass('Titulo')} onClick={() => handleSortColumn('name')}>
            Título {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </th>
          <th className={getHeaderClass('time')} onClick={() => handleSortColumn('time')}>
            Fecha de Apertura {sortConfig?.key === 'time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </th>
          <th className={getHeaderClass('customer')} onClick={() => handleSortColumn('customer')}>
            Cliente {sortConfig?.key === 'customer' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </th>
          <th className={getHeaderClass('severity')} onClick={() => handleSortColumn('severity')}>
            Tipo {sortConfig?.key === 'severity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </th>
          <th className={getHeaderClass('severity')} onClick={() => handleSortColumn('severity')}>
            Severidad {sortConfig?.key === 'severity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </th>
          <th className={getHeaderClass('status')} onClick={() => handleSortColumn('status')}>
            Estado {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </th>
          <th className={getHeaderClass('responsible')} onClick={() => handleSortColumn('responsible')}>
            Responsable {sortConfig?.key === 'responsible' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </th>
        </tr>
        </thead>
        <tbody>
        {loading ? (
          <tr>
            <td colSpan={8} className={styles.emptyRow}>
              <span>Loading...</span>
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td colSpan={8} className={styles.emptyRow}>
              <span>{error}</span>
            </td>
          </tr>
        ) : currentTickets.length === 0 ? (
          <tr>
            <td colSpan={8} className={styles.emptyRow}>
              <span>No hay tickets disponibles</span>
            </td>
          </tr>
        ) : (
          currentTickets.map(ticket => (
            <tr
              key={ticket.id}
              className={selectedTicket === ticket ? styles.selectedRow : ''}
              onClick={() => handleTicketClick(ticket)}
            >
              <td>{ticket.id}</td>
              <td>{ticket.name}</td>
              <td>{ticket.time.slice(0, 10) + ' ' + ticket.time.slice(11, 19)}</td>
              <td>{getCustomerName(ticket.customer, customers)}</td>
              <td>{ticket.severity.name === 'NA' ? 'Consulta' : 'Error'}</td>
              <td>{ticket.severity.name === 'NA' ? '' : ticket.severity.name}</td>
              <td>{ticket.status.name}</td>
              <td>{getResponsibleName(ticket.responsible, responsibles) === 'NA' ? '' : getResponsibleName(ticket.responsible, responsibles)}</td>
            </tr>
          ))
        )}
        </tbody>
      </table>

      <div className={styles.paginationContainer}>
        <button onClick={prevPage} disabled={currentPage === 1}>Anterior</button>
        <span style={{margin: '0 10px'}}>Página {currentPage}</span>
        <button onClick={nextPage} disabled={currentTickets.length < ticketsPerPage}>Siguiente</button>
      </div>
    </div>
  );
};

function getCustomerName(customer: number, customers: Customer[]): string {
  const ticketCustomer = customers.find(c => c.id === customer);
  return ticketCustomer ? ticketCustomer.name : '';
}


function getResponsibleName(responsible: number, responsibles: Responsible[]): string {
  const ticketResponsible = responsibles.find(r => r.id === responsible);
  return ticketResponsible ? ticketResponsible.name + ' ' + ticketResponsible.surname : '';
}

export default TicketTable;
