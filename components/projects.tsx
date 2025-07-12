import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import axios from 'axios';
import styles from './projects.module.css';

interface Status {
  id: number;
  name: string;
}

const STATUSES: string[] = ['Iniciado', 'En proceso', 'Finalizado']

interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  consumedHours: number;
  status: Status;
  tasks: Task[];
}

interface Task {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  consumedHours: number;
  priority: string;
  status: Status;
  project: number;
  assignee: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusOptions, setStatusOptions] = useState<Status[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatusId, setNewStatusId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [newAssignee, setNewAssignee] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('https://moduloproyecto.onrender.com/projects');
        setProjects(response.data);
        setFilteredProjects(response.data);
      } catch (err) {
        setError('Error fetching projects');
      } finally {
        setLoading(false);
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await axios.get('https://moduloproyecto.onrender.com/tasks/all');
        setTasks(response.data);
        setFilteredTasks(response.data);
      } catch (err) {
        console.error('Error fetching tasks', err);
      }
    };

    fetchProjects();
    fetchTasks();
  }, []);

  const handleChangeAssignee = () => {
    setShowAssigneeModal(true);
  };

  const handleSaveAssignee = async () => {
    if (!selectedTask) {
      console.error('No task selected');
      return;
    }

    try {
      const response = await fetch(`https://moduloproyecto.onrender.com/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignee: newAssignee,
          consumedHours: selectedTask.consumedHours,
          description: selectedTask.description,
          endDate: selectedTask.endDate,
          name: selectedTask.name,
          priority: selectedTask.priority,
          startDate: selectedTask.startDate,
        }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setSelectedTask(updatedTask);
        setShowAssigneeModal(false);
      } else {
        console.error('Error updating task:', response.status);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleTaskSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskSearchTerm(e.target.value);
    filterProjects(e.target.value);
  };

  const filterProjects = (term: string) => {
    if (term.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setFilteredTasks(tasks.filter(task => task.project === project.id));
  };

  const resetProjectSelection = () => {
    setSelectedProject(null);
    setFilteredProjects(projects);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterTasks(e.target.value);
  };

  const filterTasks = (term: string) => {
    if (term.trim() === '') {
      setFilteredTasks(tasks.filter(task => selectedProject ? task.project === selectedProject.id : true));
    } else {
      const filtered = tasks.filter(task =>
        task.name.toLowerCase().includes(term.toLowerCase()) &&
        (selectedProject ? task.project === selectedProject.id : true)
      );
      setFilteredTasks(filtered);
    }
  };

  const getHeaderClass = (column: string) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? `${styles.sortableHeader} ${styles.asc}` : `${styles.sortableHeader} ${styles.desc}`;
    }
    return styles.sortableHeader;
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Si ya estamos ordenando por esta columna, invertimos la dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si estamos cambiando a una nueva columna, la dirección es ascendente por defecto
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortColumn) return 0;
    let aValue, bValue;
    switch (sortColumn) {
      case 'description':
        aValue = a.description.toLowerCase();
        bValue = b.description.toLowerCase();
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'priority':
        aValue = a.priority.toLowerCase();
        bValue = b.priority.toLowerCase();
        break;
      case 'status':
        aValue = a.status.name.toLowerCase();
        bValue = b.status.name.toLowerCase();
        break;
      case 'startDate':
        aValue = new Date(a.startDate).getTime();
        bValue = new Date(b.startDate).getTime();
        break;
      case 'endDate':
        aValue = new Date(a.endDate).getTime();
        bValue = new Date(b.endDate).getTime();
        break;
      /*case 'project':
        aValue = a.project.name.toLowerCase();
        bValue = b.project.name.toLowerCase();
        break;
        */
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

  const handleChangeStateClick = () => {
    setShowStatusModal(true);
  };

  const closeTaskDetails = () => {
    setSelectedTask(null);
  };

  const handleCloseTask = () => {
    setShowCloseConfirmation(true);
  };

  const handleConfirmClose = async () => {
    if (!selectedTask) return;

    try {
      await axios.delete(`https://moduloproyecto.onrender.com/tasks/${selectedTask.id}`);
      /*
      const updatedStatus = statusOptions.find(status => status.id === newStatusId);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === selectedTask.id ? {...task, status: updatedStatus!} : task
        )
      );
      setFilteredTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === selectedTask.id ? {...task, status: updatedStatus!} : task
        )
      );
       */

      // Update the tasks and filteredTasks states
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== selectedTask.id));
      setFilteredTasks((prevFilteredTasks) =>
        prevFilteredTasks.filter((task) => task.id !== selectedTask.id)
      );

      setShowCloseConfirmation(false);
      setSelectedTask(null);
    } catch (err) {
      console.error('Error updating task status', err);
    }
  };

  const handleCancelClose = () => {
    setShowCloseConfirmation(false);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStatusId(Number(e.target.value));
  };

  const handleStatusUpdate = async () => {
    if (!selectedTask || newStatusId === null) return;

    const patchBody = [
      {
        op: "replace",
        path: "/status/id",
        value: newStatusId.toString()
      }
    ];

    try {
      await axios.patch(`https://moduloproyecto.onrender.com/tasks/${selectedTask.id}`, patchBody, {
        headers: {
          'Content-Type': 'application/json-patch+json'
        }
      });

      const updatedStatus = statusOptions.find(status => status.id === newStatusId);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === selectedTask.id ? {...task, status: updatedStatus!} : task
        )
      );
      setFilteredTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === selectedTask.id ? {...task, status: updatedStatus!} : task
        )
      );
      setShowStatusModal(false);
      setNewStatusId(null);
    } catch (err) {
      console.error('Error updating task status', err);
    }
  };

  return (
    <div className={styles.projectContainer}>
      <main className={styles.mainContent}>
        {!selectedProject ? (
          <div className={styles.projectTableContainer}
               style={{
                 flexDirection: 'column',
                 alignItems: 'flex-end',
               }}>
            <h2>Seleccione un proyecto:</h2>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Buscar por proyecto"
                value={taskSearchTerm}
                onChange={handleTaskSearchChange}
              />
            </div>
            <table className={styles.taskTable}>
              <thead>
              <tr>
                <th>Id</th>
                <th>Descripción</th>
                <th>Nombre</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
              </tr>
              </thead>
              <tbody>
              {filteredProjects.map(project => (
                <tr key={project.id} onClick={() => handleProjectClick(project)}>
                  <td>{project.id}</td>
                  <td>{project.description}</td>
                  <td>{project.name}</td>
                  <td>{new Date(project.startDate).toLocaleDateString()}</td>
                  <td>{new Date(project.endDate).toLocaleDateString()}</td>

                </tr>
              ))}
              </tbody>
            </table>
            <Link href={`/createProyect`} passHref>
              <button style={{
                marginTop: '1rem',
              }} className={styles.newTask}>Crear nuevo Proyecto
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.selectedVersionBanner}>
              <span>Proyecto seleccionado: {selectedProject.name}</span>
              <button style={{
                marginLeft: '20px',
              }}
                      className={styles.newTask} onClick={resetProjectSelection}>Cambiar proyecto
              </button>
            </div>

            <div className={styles.searchBar}>

              <input
                type="text"
                placeholder="Buscar por tarea..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Link href={`/createTask?projectId=${selectedProject.id}`} passHref>
                <button className={styles.newTask}>Crear nueva tarea</button>
              </Link>

            </div>

            <div className={styles.buttonAndTable}>
              <table className={styles.taskTable}>
                <thead>
                <tr>
                  <th className={getHeaderClass('id')} onClick={() => handleSort('id')}>ID</th>
                  <th className={getHeaderClass('name')} onClick={() => handleSort('id')}>Nombre</th>
                  <th className={getHeaderClass('startDate')} onClick={() => handleSort('startDate')}>Fecha de Inicio
                  </th>
                  <th className={getHeaderClass('endDate')} onClick={() => handleSort('endDate')}>Fecha de
                    Finalización
                  </th>
                  <th className={getHeaderClass('consumedHours')} onClick={() => handleSort('consumedHours')}>Horas
                    Insumidas
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
                ) : sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.emptyRow}>
                      <span>No hay tareas disponibles</span>
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map(task => (
                    <tr
                      key={task.id}
                      className={selectedTask === task ? styles.selectedRow : ''}
                      onClick={() => handleTaskClick(task)}
                    >
                      <td>{task.id}</td>
                      <td>{task.name}</td>
                      <td>{new Date(task.startDate).toLocaleDateString()}</td>
                      <td>{new Date(task.endDate).toLocaleDateString()}</td>
                      <td>{task.consumedHours}</td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>


              {selectedTask && (
                <div className={styles.taskButtons}>
                  <button className={styles.changeState} onClick={handleChangeStateClick}>
                    Editar tarea
                  </button>
                  <button className={styles.changeState} onClick={handleChangeStateClick}>
                    Cambiar estado
                  </button>
                  <button className={styles.changeClient} onClick={handleChangeAssignee}>Cambiar responsable</button>
                  <button className={styles.viewDescription} onClick={() => setShowDescriptionModal(true)}>
                    Ver descripción completa
                  </button>
                  {showDescriptionModal && (
                    <div className={styles.modal}>
                      <div className={styles.modalContent}>
                        <h2 className={styles.descriptionText}>Descripción:</h2>
                        <div className={styles.descriptionContainer}>
                          <p className={styles.descriptionText}>{selectedTask.description}</p>
                        </div>
                        <button
                          className={styles.closeButton}
                          onClick={() => (setShowDescriptionModal(false), closeTaskDetails())}
                        >
                          Cerrar
                        </button>
                      </div>
                    </div>
                  )}
                  <button className={styles.closeTask} onClick={handleCloseTask}>
                    Eliminar Tarea
                  </button>
                  {showCloseConfirmation && (
                    <div className={styles.modal}>
                      <div className={styles.modalContent}>
                        <h2>¿Seguro que deseas eliminar la tarea?</h2>

                        <button onClick={() => (handleConfirmClose(), closeTaskDetails())}>Continuar</button>
                        <button onClick={() => (handleCancelClose(), closeTaskDetails())}>Cancelar</button>
                      </div>
                    </div>
                  )}
                  <button
                    className={styles.closeTicketOptions}
                    onClick={closeTaskDetails}
                  >
                    Cerrar opciones
                  </button>
                </div>
              )}
            </div>

            {showStatusModal && (
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <h2>Cambiar Estado de la tarea</h2>
                  <select onChange={handleStatusChange}>
                    <option value="">Seleccionar estado</option>
                    {statusOptions.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => (handleStatusUpdate(), closeTaskDetails())}>Actualizar Estado</button>
                  <button onClick={() => (setShowStatusModal(false), closeTaskDetails())}>Cancelar</button>
                </div>
              </div>
            )}
            {showAssigneeModal && (
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <h2>Cambiar Responsable de la tarea</h2>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      handleSaveAssignee();
                      setShowAssigneeModal(false);
                    }}
                  >
                    Actualizar Responsable
                  </button>
                  <button
                    onClick={() => {
                      setShowAssigneeModal(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Projects;