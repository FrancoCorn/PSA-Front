import Head from 'next/head';
import TicketProject from '../components/ticketProject';
import NavBar from '../components/navBar';
import styles from '../components/projectsTable.module.css';


const Home = () => {
  return (
    <div>
      <Head>
        <title>PSA - Ticket</title>
      </Head>
      
      <NavBar />
      <TicketProject />
      
    </div>
  );
};

export default Home;