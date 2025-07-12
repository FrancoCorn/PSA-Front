import Head from 'next/head';
import SupportTicket from '../components/supportTicket';
import NavBar from '../components/navBar';
import styles from '../styles/index.module.css';

const Home = () => {
  return (
    <div>
    <NavBar />
      <div className={styles.homeContainer}>

        
        <h1 className={styles.title}>Seleccione módulo para comenzar</h1>
        
      </div>
    </div>
  );
};

export default Home;