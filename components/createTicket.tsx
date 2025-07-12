import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { debounce } from 'lodash';
import styles from '../styles/createTicket.module.css';
import { supportApi } from '../services/api';

interface Customer {
  id: number;
  name: string;
}

interface Responsible {
  id: number;
  name: string;
}

interface Version {
  id: number;
  name: string;
  product: Product;
}

interface Product {
  id: number;
  name: string;
}

interface Severity {
  id: number;
  name: string;
}

const CreateTicket: React.FC = () => {
  const router = useRouter();
 

  const [description, setDescription] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [responsible, setResponsible] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedResponsibleId, setSelectedResponsible] = useState<number | null>(null);
  const [ticketType, setTicketType] = useState<string>('');
  const [severityId, setSeverityId] = useState<number | null>(null);
  const [versionId, setVersionId] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [responsibleOptions, setResponsibleOptions] = useState<Responsible[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [allResponsibles, setAllResponsibles] = useState<Responsible[]>([]);
  const [versionOptions, setVersionOptions] = useState<Version[]>([]);
  const [allVersions, setAllVersions] = useState<Version[]>([]);
  const [severityOptions, setSeverityOptions] = useState<Severity[]>([]);
  const [allSeverities, setAllSeverities] = useState<Severity[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  


  useEffect(() => {
    const savedVersion = localStorage.getItem('selectedVersion');
    if (savedVersion) {
      setSelectedVersion(JSON.parse(savedVersion));
    }else{
      alert("No hay version seleccionada")
      router.push('/supportTicket');
    }
  }, []);


  const handleCancel = () => {
    setSelectedVersion(selectedVersion)
    router.push('/supportTicket');
    
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Por favor, seleccione un cliente válido');
      return;
    }
    if (ticketType === 'error' && !severityId) {
      alert('Por favor, seleccione una severidad válida');
      return;
    }
    try {
      if(selectedVersion){
      const response = await supportApi.post(`/versions/${selectedVersion.id}/tickets`, null, {
        params: {
          name,
          description,
          customerId: selectedCustomerId,
          responsibleId: selectedResponsibleId,
          severityId: ticketType === 'consulta' ? 0 : severityId,
        },
      });
      if (response.status === 201) {
        alert('Ticket creado exitosamente' );
        router.push('/supportTicket');
      }
    }
    } catch (error) {
      alert('Error al crear el ticket');
      console.error(error);
    }
  
  };

  const fetchCustomers = async () => {
    try {
      if(selectedVersion){
      const response = await supportApi.get<Customer[]>(`/versions/${selectedVersion.id}/customers`);
      setAllCustomers(response.data);
      setCustomerOptions(response.data);
    } 
    } catch (error) {
      console.error('Error fetching customers', error);
    }
  };

  const fetchResponsibles = async () => {
    try {
      if(selectedVersion){
      const response = await supportApi.get<Responsible[]>(`/responsibles`);
      setAllResponsibles(response.data);
      setResponsibleOptions(response.data);
    } 
    } catch (error) {
      console.error('Error fetching responsibles', error);
    }
  };


  const fetchSeverities = async () => {
    try {
      const response = await supportApi.get<Severity[]>('/severities');
      setAllSeverities(response.data);
    } catch (error) {
      console.error('Error fetching severities', error);
    }
  };

  const debouncedFetchCustomers = useCallback(debounce(fetchCustomers, 300), [selectedVersion]);
  const debouncedFetchResponsibles = useCallback(debounce(fetchResponsibles, 300), [selectedVersion]);

  const debouncedFetchSeverities = useCallback(debounce(fetchSeverities, 300), []);

  useEffect(() => {
    debouncedFetchCustomers();
    debouncedFetchResponsibles();
    debouncedFetchSeverities();
  }, [debouncedFetchCustomers,debouncedFetchResponsibles, debouncedFetchSeverities]);


  useEffect(() => {
    if (customerId) {
      const filteredCustomers = allCustomers.filter((customer) =>
        customer.name && customer.name.toLowerCase().startsWith(customerId.toLowerCase())
      );
      setCustomerOptions(filteredCustomers.slice(0, 5));
    } else {
      setCustomerOptions(allCustomers); 
    }
  }, [customerId, allCustomers]);

  useEffect(() => {
    if (responsible) {
      const filteredResponsible = allResponsibles.filter((responsibleSelected) =>
        responsibleSelected.name && responsibleSelected.name.toLowerCase().startsWith(responsible.toLowerCase())
      );
      setResponsibleOptions(filteredResponsible.slice(0, 5));
    } else {
      setResponsibleOptions(allResponsibles); 
    }
  }, [responsible, allResponsibles]);


  useEffect(() => {
    setSeverityOptions(allSeverities);
  }, [allSeverities]);

  


  const handleCustomerSelect = (customer: Customer) => {
    setCustomerId(`${customer.name} - ID: ${customer.id}`);
    setSelectedCustomerId(customer.id);
    setCustomerOptions([]);
  };

  const handleResponsibleSelect = (responsible: Responsible) => {
    setResponsible(`${responsible.name} - ID: ${responsible.id}`);
    setSelectedResponsible(responsible.id);
    setResponsibleOptions([]);
  };

  const handleTicketTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setTicketType(selectedType);
    if (selectedType === 'consulta') {
      setSeverityId(0);
    } else {
      setSeverityId(null);
    }
  };

  return (
    <div className={styles.createTicketContainer}>
      <main className={styles.mainContent}>

        <h1>Crear Ticket</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
        {selectedVersion && (
          <label htmlFor="title"className={styles.form}>Versión seleccionada: {selectedVersion.product.name + " - "+selectedVersion.name}</label>

        )}
          <label htmlFor="title">Título</label>
          <div className={styles.textareaContainer}>
            <textarea
              id="name"
              name="name"
              placeholder="Ingresar título"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={1000}
            />
            <span className={styles.charCount}>{name.length}/1000</span>
          </div>

          <label htmlFor="title">Descripción</label>
          <div className={styles.textareaContainer}>
            <textarea
              id="description"
              name="description"
              placeholder="Ingresar descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
            />
            <span className={styles.charCount}>{description.length}/1000</span>
          </div>

          <label htmlFor="client">Cliente</label>
          <div className={styles.searchContainer}>
            <input
              type="text"
              id="client"
              name="client"
              placeholder="Nombre del cliente"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              autoComplete="off"
            />
            {customerOptions.length > 0 && (
              <ul className={styles.suggestions}>
                {customerOptions.map((customer) => (
                  <li
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    {customer.name} - ID: {customer.id}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label htmlFor="responsible">Responsable</label>
          <div className={styles.searchContainer}>
            <input
              type="text"
              id="responsible"
              name="responsible"
              placeholder="Nombre del responsable"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              autoComplete="off"
            />
            {responsibleOptions.length > 0 && (
              <ul className={styles.suggestions}>
                {responsibleOptions.map((responsible) => (
                  <li
                    key={responsible.id}
                    onClick={() => handleResponsibleSelect(responsible)}
                  >
                    {responsible.name} - ID: {responsible.id}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <label htmlFor="ticketType">Tipo de Ticket</label>
          <select
            id="ticketType"
            name="ticketType"
            value={ticketType}
            onChange={handleTicketTypeChange}
          >
            <option value="">Seleccione un tipo de ticket</option>
            <option value="error">Error</option>
            <option value="consulta">Consulta</option>
          </select>

          {ticketType === 'error' && (
            <>
              <label htmlFor="severity">Severidad</label>
              <select
                id="severity"
                name="severity"
                value={severityId || ''}
                onChange={(e) => setSeverityId(Number(e.target.value))}
              >
                <option value="">Seleccione una severidad</option>
                {severityOptions.slice(1).map((severity) => (
                  <option key={severity.id} value={severity.id}>
                    {severity.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <div className={styles.buttonContainer}>
            <button type="button" onClick={handleCancel}>Cancelar</button>
            <button type="submit">Crear Ticket</button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateTicket;
