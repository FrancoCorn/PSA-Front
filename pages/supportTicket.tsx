import Head from 'next/head';
import SupportTicket from '../components/supportTicket';
import NavBar from '../components/navBar';



const Home = () => {
  return (
    <div>
      <Head>
        <title>PSA - Soporte</title>
      </Head>
      
      <NavBar />
      <SupportTicket />
      
    </div>
  );
};

export default Home;