import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import styles from '../styles/ticketProject.module.css';
import {projectApi} from '@/services/api';
import {supportApi} from '@/services/api';

interface Task {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    consumedHours: number;
    project: number;
}

interface Project {
    id: number;
    startDate: string;
    endDate: string;
    estimatedHours: number;
    consumedHours: number;
    name: string;
    description: string;
    tasks: Task[];
}

const TicketProject: React.FC = () => {
    const router = useRouter();
    const {ticketId, ticketDescription} = router.query;

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<number | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await projectApi.get('/projects');
                setProjects(response.data);
            } catch (err) {
                setError('Error fetching projects');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleProjectSelect = (projectId: number) => {
        setSelectedProject(projectId);
    };

    const handleDerivarTarea = async () => {
        if (selectedProject && ticketId) {
            try {
                const querystring = require('querystring')
                await supportApi.post(`/tickets/${ticketId}`, querystring.stringify({projectId: `${selectedProject}`}));
                alert('Tarea derivada exitosamente');
                await router.push('/supportTicket');
            } catch (err) {
                alert('Error al derivar la tarea');
                await router.push('/supportTicket');
            }
        } else {
            alert('Por favor, seleccione un proyecto y asegúrese de que el ticket ID esté disponible');
        }
    };

    return (
        <div className={styles.projectsContainer}>
            <main className={styles.mainContent}>
                <div>
                    <h2>Ticket seleccionado:</h2>
                    <p>ID: {ticketId}</p>
                    <p>Descripción: </p>
                    <textarea
                        className={styles.descriptionTextarea}
                        readOnly
                        value={ticketDescription as string}
                        rows={5}
                    />
                </div>
                <h2>Proyectos:</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <table className={styles.projectTable}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Fecha de Inicio</th>
                            <th>Fecha de Fin</th>
                            <th>Horas Estimadas</th>
                            <th>Horas Consumidas</th>
                            <th>Seleccionar</th>
                        </tr>
                        </thead>
                        <tbody>
                        {projects.map((project) => (
                            <tr key={project.id}>
                                <td>{project.id}</td>
                                <td>{project.name}</td>
                                <td>{project.description}</td>
                                <td>{project.startDate}</td>
                                <td>{project.endDate}</td>
                                <td>{project.estimatedHours}</td>
                                <td>{project.consumedHours}</td>
                                <td>
                                    <input
                                        type="radio"
                                        name="selectProject"
                                        value={project.id}
                                        onChange={() => handleProjectSelect(project.id)}
                                        checked={selectedProject === project.id}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                <button onClick={handleDerivarTarea} className={styles.deriveButton}>
                    Derivar tarea
                </button>
                <Link href="/supportTicket" className={styles.backButton}>
                    Cancelar
                </Link>
            </main>
        </div>
    );
};

export default TicketProject;
