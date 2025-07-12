import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import styles from '../styles/supportTicket.module.css';
import {supportApi} from '../services/api';
import {Version, Ticket, Status, Customer, Severity, Responsible} from '../utils/types';
import SelectVersion from './support/selectVersion';
import TicketOptions from './support/ticketOptions';
import TicketTable from './support/ticketTable';

const SupportTicket: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusOptions, setStatusOptions] = useState<Status[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<Version[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [severityOptions, setSeverityOptions] = useState<Severity[]>([]);
  const [responsibleOptions, setResponsibleOptions] = useState<Responsible[]>([]);
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  const router = useRouter();
  const getCustomersUrl = selectedVersion ? `/versions/${selectedVersion.id}/customers` : `/versions/${1}/customers`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVersion = localStorage.getItem('selectedVersion');
      if (savedVersion) {
        setSelectedVersion(JSON.parse(savedVersion));
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedVersion) return;

    const fetchTickets = async () => {
      try {
        const response = await supportApi.get('/tickets');
        setTickets(response.data);
        setFilteredTickets(response.data);
      } catch (err) {
        setError('Error fetching tickets');
      } finally {
        setLoading(false);
      }
    };

    const fetchVersions = async () => {
      try {
        const response = await supportApi.get('/versions');
        setVersions(response.data);
        setFilteredVersions(response.data);
      } catch (err) {
        console.error('Error fetching versions', err);
      }
    };

    const fetchCustomers = async () => {
      try {
        const response = await supportApi.get('/customers');
        setCustomers(response.data);
      } catch (err) {
        console.error('Error fetching customers', err);
      }
    };

    const fetchSeverityOptions = async () => {
      try {
        const response = await supportApi.get('/severities');
        setSeverityOptions(response.data);
      } catch (err) {
        console.error('Error fetching severity options', err);
      }
    };

    const fetchResponsibleOptions = async () => {
      try {
        const response = await supportApi.get('/responsibles');
        setResponsibleOptions(response.data);
      } catch (err) {
        console.error('Error fetching responsible options', err);
      }
    };

    const fetchCustomerOptions = async () => {
      try {
        const response = await supportApi.get(getCustomersUrl);
        setCustomerOptions(response.data);
      } catch (err) {
        console.error('Error fetching customer options', err);
      }
    };

    fetchTickets();
    fetchVersions();
    fetchCustomers();
    fetchSeverityOptions();
    fetchResponsibleOptions();
    fetchCustomerOptions();
  }, [selectedVersion]);

  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        const response = await supportApi.get('/statuses');
        setStatusOptions(response.data);
      } catch (err) {
        console.error('Error fetching status options', err);
      }
    };

    fetchStatusOptions();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVersion = localStorage.getItem('selectedVersion');

      if (savedVersion) {
        setSelectedVersion(JSON.parse(savedVersion));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedVersion) {
      localStorage.setItem('selectedVersion', JSON.stringify(selectedVersion));
    }
  }, [selectedVersion]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterTickets(e.target.value);
  };

  const filterTickets = (term: string) => {
    if (term.trim() === '') {
      setFilteredTickets(tickets.filter(ticket => selectedVersion ? ticket.version.id === selectedVersion.id : true));
    } else {
      const filtered = tickets.filter(ticket =>
        ticket.description.toLowerCase().includes(term.toLowerCase()) &&
        (selectedVersion ? ticket.version.id === selectedVersion.id : true)
      );
      setFilteredTickets(filtered);
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const closeTicketDetails = () => {
    setSelectedTicket(null);
  };

  const handleVersionSelect = (version: Version) => {
    setSelectedVersion(version);
    if (tickets.length > 0) {
      setFilteredTickets(tickets.filter(ticket => ticket.version.id === version.id));
    }
  };

  const clearSelectedVersion = () => {
    setSelectedVersion(null);
    localStorage.removeItem('selectedVersion');
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue, bValue;
    switch (sortColumn) {
      case 'title':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'severity':
        aValue = a.severity.name.toLowerCase();
        bValue = b.severity.name.toLowerCase();
        break;
      case 'status':
        aValue = a.status.name.toLowerCase();
        bValue = b.status.name.toLowerCase();
        break;
      case 'openDate':
        aValue = new Date(a.openDate).getTime();
        bValue = new Date(b.openDate).getTime();
        break;
      case 'version':
        aValue = a.version.name.toLowerCase();
        bValue = b.version.name.toLowerCase();
        break;
      case 'product':
        aValue = a.version.product.name.toLowerCase();
        bValue = b.version.product.name.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getHeaderClass = (column: string) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? `${styles.sortableHeader} ${styles.asc}` : `${styles.sortableHeader} ${styles.desc}`;
    }
    return styles.sortableHeader;
  };

  const handleUpdateTickets = (updatedTicket: Ticket) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
    setFilteredTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
  };

  const handleSelectResponsible = async (responsible: Responsible) => {
    if (!selectedTicket) return;
    const selectedResponsibleId = responsible.id;
    const patchBody = [
      {
        op: 'replace',
        path: '/responsible/id',
        value: responsible.id.toString(),
      },
    ];

    try {
      await supportApi.patch(`/tickets/${selectedTicket.id}`, patchBody, {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      });

      const updatedTicket = {...selectedTicket, selectedResponsibleId};
      handleUpdateTickets(updatedTicket);

    } catch (err) {
      console.error('Error updating ticket responsible', err);
    }
  };

  const handleSelectCustomer = async (customer: Customer) => {
    if (!selectedTicket) return;
    const selectedCustomerId = customer.id;
    const patchBody = [
      {
        op: 'replace',
        path: '/customer/id',
        value: selectedCustomerId.toString(),
      },
    ];

    try {
      await supportApi.patch(`/tickets/${selectedTicket.id}`, patchBody, {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      });

      const updatedTicket = {...selectedTicket, selectedCustomerId};
      handleUpdateTickets(updatedTicket);

    } catch (err) {
      console.error('Error updating ticket responsible', err);
    }
  };

  if (!selectedVersion) {
    return (
      <div className={styles.supportContainer}>
        <main className={styles.mainContent}>
          <SelectVersion onSelectVersion={handleVersionSelect}/>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.supportContainer}>
      <main className={styles.mainContent}>
        <div className={styles.selectedVersionBanner}>
          <span>
            {selectedVersion.product.name} - {selectedVersion.name}
          </span>
          <button onClick={clearSelectedVersion}>Cambiar versión</button>
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Buscar por descripción..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Link href={'/createTicket'} passHref>
            <button className={styles.newTicket}>Crear nuevo ticket</button>
          </Link>
        </div>

        <div className={styles.buttonAndTable}>
          <TicketTable
            tickets={tickets}
            loading={loading}
            error={error}
            sortedTickets={sortedTickets}
            selectedTicket={selectedTicket}
            customers={customers}
            responsibles={responsibleOptions}
            handleTicketClick={handleTicketClick}
            handleSort={handleSort}
            getHeaderClass={getHeaderClass}
            selectedVersion={selectedVersion}
          />

          {selectedTicket && (
            <TicketOptions
              selectedTicket={selectedTicket}
              statusOptions={statusOptions}
              versionOptions={versions}
              severityOptions={severityOptions}
              responsibleOptions={responsibleOptions}
              customerOptions={customerOptions}
              closeTicketDetails={closeTicketDetails}
              onUpdateTickets={handleUpdateTickets}
              onSelectVersion={handleVersionSelect}
              onSelectSeverity={(severity: Severity) => {
              }}
              onSelectResponsible={handleSelectResponsible}
              onSelectCustomer={handleSelectCustomer}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default SupportTicket;
