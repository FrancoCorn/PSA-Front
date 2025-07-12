import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import {projectApi, supportApi} from '../../services/api';
import {Ticket, Status, Version, Severity, Responsible, Customer} from '../../utils/types';
import styles from '../../styles/ticketOptions.module.css';
import SelectVersion from '../support/selectVersion';

interface TicketOptionsProps {
  selectedTicket: Ticket;
  statusOptions: Status[];
  versionOptions: Version[];
  severityOptions: Severity[];
  responsibleOptions: Responsible[];
  customerOptions: Customer[];
  closeTicketDetails: () => void;
  onUpdateTickets: (updatedTicket: Ticket) => void;
  onSelectVersion: (version: Version) => void;
  onSelectSeverity: (severity: Severity) => void;
  onSelectResponsible: (responsible: Responsible) => void;
  onSelectCustomer: (customer: Customer) => void;
}

const TicketOptions: React.FC<TicketOptionsProps> = ({
                                                       selectedTicket,
                                                       statusOptions,
                                                       versionOptions,
                                                       severityOptions,
                                                       responsibleOptions,
                                                       customerOptions,
                                                       closeTicketDetails,
                                                       onUpdateTickets,
                                                       onSelectVersion,
                                                       onSelectSeverity,
                                                       onSelectResponsible,
                                                       onSelectCustomer,
                                                     }) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatusId, setNewStatusId] = useState<number | null>(null);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showSeverityModal, setShowSeverityModal] = useState(false);
  const [showResponsibleModal, setShowResponsibleModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedSeverityId, setSelectedSeverityId] = useState<number | null>(null);
  const [editedDescription, setEditedDescription] = useState(selectedTicket.description);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState(selectedTicket.name);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [ticketType, setTicketType] = useState<'error' | 'consulta' | ''>('');
  const [tasks, setTasks] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResponsibleOptions, setFilteredResponsibleOptions] = useState<Responsible[]>([]);
  const [filteredCustomerOptions, setFilteredCustomerOptions] = useState<Customer[]>([]);

  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    setFilteredResponsibleOptions(
      responsibleOptions.filter((responsible) =>
        responsible.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, responsibleOptions]);

  useEffect(() => {
    setFilteredCustomerOptions(
      customerOptions.filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, customerOptions]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedTicket) {
        const timeRemaining = calculateRemainingTime(selectedTicket);
        setRemainingTime(timeRemaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTicket]);

  const handleChangeStateClick = () => {
    setShowStatusModal(true);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStatusId(Number(e.target.value));
  };

  const handleStatusUpdate = async () => {
    if (!selectedTicket || newStatusId === null) return;

    const patchBody = [
      {
        op: 'replace',
        path: '/status/id',
        value: newStatusId.toString(),
      },
    ];

    try {
      await supportApi.patch(`/tickets/${selectedTicket.id}`, patchBody, {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      });

      const updatedStatus = statusOptions.find((status) => status.id === newStatusId);
      const updatedTicket = {...selectedTicket, status: updatedStatus!};
      onUpdateTickets(updatedTicket);
      setShowStatusModal(false);
      setNewStatusId(null);
    } catch (err) {
      console.error('Error updating ticket status', err);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;

    try {
      await supportApi.delete(`/tickets/${selectedTicket.id}`, {
        headers: {
          accept: 'application/hal+json',
        },
      });


      closeTicketDetails();
      setShowVersionModal(false);
      window.location.reload();


    } catch (err) {
      console.error('Error deleting ticket', err);
    }

  };

  const handleSelectVersion = async (version: Version) => {
    if (!selectedTicket) return;

    const patchBody = [
      {
        op: 'replace',
        path: '/version/id',
        value: version.id.toString(),
      },
    ];

    try {
      await supportApi.patch(`/tickets/${selectedTicket.id}`, patchBody, {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      });

      const updatedTicket = {...selectedTicket, version};
      onUpdateTickets(updatedTicket);
      setShowVersionModal(false);
      closeTicketDetails();


      window.location.reload();


    } catch (error) {
      alert('Cliente no tiene la versión');
      console.error(error);
      setShowVersionModal(false);
      closeTicketDetails();
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isEditingDescription) {
      setEditedDescription(e.target.value);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isEditingTitle) {
      setEditedTitle(e.target.value);
    }
  };

  const handleEditDescription = () => {
    setIsEditingDescription(true);
  };

  const handleEditTitle = () => {
    setIsEditingTitle(true);
  };

  const handleDescriptionUpdate = async () => {
    if (!selectedTicket) return;

    const patchBody = [
      {
        op: 'replace',
        path: '/description',
        value: editedDescription,
      },
    ];

    try {
      await supportApi.patch(`/tickets/${selectedTicket.id}`, patchBody, {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      });

      const updatedTicket = {...selectedTicket, description: editedDescription};
      onUpdateTickets(updatedTicket);
      setIsEditingDescription(false);


    } catch (err) {
      console.error('Error updating ticket description', err);
    }
  };

  const handleTitleUpdate = async () => {
    if (!selectedTicket) return;

    const patchBody = [
      {
        op: 'replace',
        path: '/name',
        value: editedTitle,
      },
    ];

    try {
      await supportApi.patch(`/tickets/${selectedTicket.id}`, patchBody, {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      });

      const updatedTicket = {...selectedTicket, name: editedTitle};
      onUpdateTickets(updatedTicket);
      setIsEditingTitle(false);


    } catch (err) {
      console.error('Error updating ticket title', err);
    }
  };

  const handleTicketSelect = (ticketId: number) => {
    setSelectedTicketId(ticketId === selectedTicket.id ? null : ticketId);
  };

  const handleOpenSeverityModal = () => {
    setShowSeverityModal(true);
  };

  const handleCloseSeverityModal = () => {
    setShowSeverityModal(false);
  };

  const handleSelectSeverity = async (severity: Severity) => {
    if (!selectedTicket) return;

    const patchBody = [
      {
        op: 'replace',
        path: '/severity/id',
        value: severity.id.toString(),
      },
    ];

    try {
      await supportApi.patch(`/tickets/${selectedTicket.id}`, patchBody, {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      });

      const updatedTicket = {...selectedTicket, severity};
      onUpdateTickets(updatedTicket);
      setShowSeverityModal(false);
      closeTicketDetails();
    } catch (err) {
      console.error('Error updating ticket severity', err);
    }
  };

  const handleOpenResponsibleModal = () => {
    setShowResponsibleModal(true);
  };
  const handleOpenCustomerModal = () => {
    setShowCustomerModal(true);
  };

  const handleCloseResponsibleModal = () => {
    setShowResponsibleModal(false);
  };

  const handleCloseCustomerModal = () => {
    setShowCustomerModal(false);
  };

  const handleSelectResponsible = async (responsible: Responsible) => {
    if (!selectedTicket) return;

    const patchBody = [
      {
        op: 'replace',
        path: '/responsible',
        value: responsible.id.toString(),
      },
    ];

    try {
      await supportApi.patch(`/tickets/${selectedTicket.id}`, patchBody, {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      });

      onSelectResponsible(responsible);
      setShowResponsibleModal(false);
      window.location.reload();

    } catch (err) {
      console.error('Error updating ticket responsible', err);
    }
  };

  const handleSelectCustomer = async (customer: Customer) => {

    if (!selectedTicket) return;

    const patchBody = [
      {
        op: 'replace',
        path: '/customer',
        value: customer.id.toString(),
      },
    ];

    try {
      await supportApi.patch(`/tickets/${selectedTicket.id}`, patchBody, {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      });

      onSelectCustomer(customer);
      setShowCustomerModal(false);
      window.location.reload();

    } catch (error) {
      alert('Cliente no tiene la versión');
      console.error(error);
      setShowVersionModal(false);
      closeTicketDetails();
    }
  };

  const handleRemoveResponsible = async () => {

    if (!selectedTicket) return;

    const patchBody = [
      {
        op: 'remove',
        path: '/responsible',
      },
    ];

    try {
      await supportApi.patch(`/tickets/${selectedTicket.id}`, patchBody, {
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
      });


      setShowResponsibleModal(false);
      window.location.reload();

    } catch (error) {
      alert('No hay responsable asignado');
      setShowVersionModal(false);
      closeTicketDetails();
    }
  };

  const calculateRemainingTime = (ticket: Ticket): string => {
    let severityDays = 0;

    switch (ticket.severity.id) {
      case 1:
        severityDays = 7;
        break;
      case 2:
        severityDays = 30;
        break;
      case 3:
        severityDays = 90;
        break;
      case 4:
        severityDays = 365;
        break;
      default:
        return "Ticket del tipo consulta";
    }

    const createdDate = new Date(ticket.time);
    const dueDate = new Date(createdDate.getTime() + severityDays * 24 * 60 * 60 * 1000);

    const currentDate = new Date();
    let difference = Math.abs(dueDate.getTime() - currentDate.getTime()) / 1000;

    const days = Math.floor(difference / (24 * 60 * 60));
    difference -= days * 24 * 60 * 60;

    const hours = Math.floor(difference / (60 * 60)) % 24;
    difference -= hours * 60 * 60;

    const minutes = Math.floor(difference / 60) % 60;
    difference -= minutes * 60;

    const seconds = Math.floor(difference);

    return `Tiempo restante: ${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos`;
  };

  const getSeverityTime = (severityId: number): string => {
    switch (severityId) {
      case 1:
        return 'Tiempo según severidad: 7 días';
      case 2:
        return 'Tiempo según severidad: 30 días';
      case 3:
        return 'Tiempo según severidad: 90 días';
      case 4:
        return 'Tiempo según severidad: 365 días';
      default:
        return '';
    }
  };

  const getFinalDate = (ticket: Ticket): string => {
    switch (ticket.severity.id) {
      case 1:
        const date = new Date(ticket.time.slice(0, 10));
        date.setDate(date.getDate() + 7);
        const newDate = date.toISOString().split('T')[0];
        return 'Fecha de finalizacion: ' + newDate + ' ' + ticket.time.slice(11, 19);
      case 2:
        const dateS2 = new Date(ticket.time.slice(0, 10));
        dateS2.setDate(dateS2.getDate() + 30);
        const newDateS2 = dateS2.toISOString().split('T')[0];
        return 'Fecha de finalizacion: ' + newDateS2 + ' ' + ticket.time.slice(11, 19);

      case 3:
        const dateS3 = new Date(ticket.time.slice(0, 10));
        dateS3.setDate(dateS3.getDate() + 90);
        const newDateS3 = dateS3.toISOString().split('T')[0];
        return 'Fecha de finalizacion: ' + newDateS3 + ' ' + ticket.time.slice(11, 19);
      case 4:
        const dateS4 = new Date(ticket.time.slice(0, 10));
        dateS4.setDate(dateS4.getDate() + 365);
        const newDateS4 = dateS4.toISOString().split('T')[0];
        return 'Fecha de finalizacion: ' + newDateS4 + ' ' + ticket.time.slice(11, 19);
      default:
        return '';
    }
  };


  return (
    <div className={styles.ticketButtons}>
      <button className={styles.changeState} onClick={handleChangeStateClick}>
        Cambiar estado
      </button>
      <button className={styles.changeClient} onClick={handleOpenCustomerModal}>
        Cambiar cliente
      </button>
      <button className={styles.changeClient} onClick={handleOpenResponsibleModal}>
        Cambiar responsable
      </button>
      <button className={styles.viewDescription} onClick={() => setShowDescriptionModal(true)}>
        Ver detalles
      </button>
      {showDescriptionModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.descriptionText}>Detalles:</h2>
            <p className={styles.lineSpacing}>{getSeverityTime(selectedTicket.severity.id)}</p>
            <p className={styles.lineSpacing}>{remainingTime}</p>
            <p className={styles.lineSpacing}>{getFinalDate(selectedTicket)}</p>
            <h3 className={styles.descriptionText}>Título:</h3>

            {isEditingTitle ? (
              <textarea
                className={styles.descriptionTextarea}
                value={editedTitle}
                onChange={handleTitleChange}
              />
            ) : (
              <textarea
                className={styles.descriptionTextareaReadonly}
                value={editedTitle}
                readOnly
              />
            )}
            {isEditingTitle ? (
              <button
                className={styles.updateDescriptionButton}
                onClick={() => {
                  handleTitleUpdate();
                }}
              >
                Aplicar
              </button>
            ) : (
              <button
                className={styles.editDescriptionButton}
                onClick={handleEditTitle}
              >
                Modificar título
              </button>
            )}
            <h3 className={styles.descriptionText}>Descripción:</h3>

            {isEditingDescription ? (
              <textarea
                className={styles.descriptionTextarea}
                value={editedDescription}
                onChange={handleDescriptionChange}
              />
            ) : (
              <textarea
                className={styles.descriptionTextareaReadonly}
                value={editedDescription}
                readOnly
              />
            )}
            {isEditingDescription ? (
              <button
                className={styles.updateDescriptionButton}
                onClick={() => {
                  handleDescriptionUpdate();

                }}
              >
                Aplicar
              </button>
            ) : (
              <button
                className={styles.editDescriptionButton}
                onClick={handleEditDescription}
              >
                Modificar Descripción
              </button>
            )}
            <button
              className={styles.closeButton}
              onClick={() => {
                setShowDescriptionModal(false);
                window.location.reload();
                closeTicketDetails();
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      <button className={styles.deleteTicket} onClick={() => setShowCloseConfirmation(true)}>
        Eliminar ticket
      </button>
      {showCloseConfirmation && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>¿Seguro que deseas eliminar el ticket?</h2>
            <p>Ticket ID: {selectedTicket.id}</p>
            <button
              onClick={() => {
                handleDeleteTicket();
                setShowCloseConfirmation(false);
              }}
            >
              Confirmar
            </button>
            <button onClick={() => setShowCloseConfirmation(false)}>Cancelar</button>
          </div>
        </div>
      )}
      <button className={styles.moveVersion} onClick={() => setShowVersionModal(true)}>
        Mover a otra versión
      </button>
      <button className={styles.changeSeverity} onClick={handleOpenSeverityModal}>
        Cambiar severidad
      </button>
      <Link
        href={`/ticketProject?ticketId=${selectedTicket.id}&ticketDescription=${selectedTicket.description}`}
        passHref
      >
        <button className={styles.ticketProject}>Derivar tarea</button>
      </Link>
      <button className={styles.closeTicketOptions} onClick={closeTicketDetails}>
        Cerrar opciones
      </button>

      {showStatusModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Cambiar Estado del Ticket</h2>
            <select onChange={handleStatusChange}>
              <option value="">Seleccionar estado</option>
              {statusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                handleStatusUpdate();
                closeTicketDetails();
              }}
            >
              Actualizar Estado
            </button>
            <button
              onClick={() => {
                setShowStatusModal(false);
                closeTicketDetails();
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showVersionModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <SelectVersion onSelectVersion={handleSelectVersion}/>
            <button onClick={() => setShowVersionModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {showSeverityModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Cambiar Severidad del Ticket</h2>
            <select onChange={(e) => setTicketType(e.target.value as 'error' | 'consulta' | '')}>
              <option value="">Seleccionar tipo de ticket</option>
              <option value="consulta">Consulta</option>
              <option value="error">Error</option>
            </select>
            {ticketType === 'error' && (
              <select onChange={(e) => setSelectedSeverityId(Number(e.target.value))}>
                <option value="">Seleccionar severidad</option>
                {severityOptions.slice(1).map((severity) => (
                  <option key={severity.id} value={severity.id}>
                    {severity.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => {
                if (ticketType === 'consulta') {
                  const selectedSeverity = severityOptions.find((s) => s.id === 0);
                  if (selectedSeverity) {
                    handleSelectSeverity(selectedSeverity);
                    closeTicketDetails();
                  }
                } else if (ticketType === 'error') {
                  const selectedSeverity = severityOptions.find((s) => s.id === selectedSeverityId);
                  if (selectedSeverity) {
                    handleSelectSeverity(selectedSeverity);
                    closeTicketDetails();
                  }
                }
              }}
            >
              Actualizar Severidad
            </button>
            <button onClick={handleCloseSeverityModal}>Cancelar</button>
          </div>
        </div>
      )}

      {showResponsibleModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Seleccionar Responsable</h2>
            <input
              className={styles.searchBar}
              type="text"
              placeholder="Buscar responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <table className={styles.responsibleTable}>
              <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
              </tr>
              </thead>
              <tbody>
              {filteredResponsibleOptions.slice(0, 5).map((responsible) => (
                <tr key={responsible.id} onClick={() => handleSelectResponsible(responsible)}>
                  <td>{responsible.id}</td>
                  <td>{responsible.name}</td>
                  <td>{responsible.surname}</td>
                </tr>
              ))}
              </tbody>
            </table>
            <button onClick={handleCloseResponsibleModal}>Cancelar</button>
            <button onClick={() => {
              handleRemoveResponsible();
              closeTicketDetails();
            }}>Eliminar responsable
            </button>

          </div>
        </div>
      )}
      {showCustomerModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Seleccionar Cliente</h2>
            <input
              className={styles.searchBar}
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <table className={styles.responsibleTable}>
              <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
              </tr>
              </thead>
              <tbody>
              {filteredCustomerOptions.slice(0, 5).map((customer) => (
                <tr key={customer.id} onClick={() => handleSelectCustomer(customer)}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                </tr>
              ))}
              </tbody>
            </table>
            <button onClick={handleCloseCustomerModal}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketOptions;
