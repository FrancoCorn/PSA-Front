import React from 'react';
import styles from '../styles/navBar.module.css';
import { useRouter } from 'next/router';

const SupportTicket: React.FC = () => {
	const router = useRouter();
	const currentPath = router.pathname;

	const handleSupport = () => {
		localStorage.removeItem('selectedVersion');
		window.location.href = '/supportTicket';

	};

	const handleProject = () => {
		router.push('/projects');
	};

	const isSupportActive = currentPath === '/supportTicket' || currentPath === '/createTicket' || currentPath === '/ticketProject';
	const isProjectActive = currentPath === '/projects' || currentPath === '/createProject' || currentPath === '/createTask';

	return (
		<div className={styles.navBarContainer}>
			<div className={styles.header}>
				<div className={styles.logoContainer}>
					<div className={styles.logo}>PSA</div>
				</div>
				<nav className={styles.navigation}>
					<button className={isProjectActive ? styles.active : ''} onClick={handleProject}>Proyectos</button>
					<button className={isSupportActive ? styles.active : ''} onClick={handleSupport}>Soporte</button>
					<button>Ventas</button>
					<button>Marketing</button>
					<button>Finanzas</button>
					<button>Recursos</button>
				</nav>
			</div>
		</div>
	);
};

export default SupportTicket;