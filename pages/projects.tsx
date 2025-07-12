import Head from 'next/head';
import Projects from '../components/projects';
import NavBar from '../components/navBar';



const Home = () => {
  return (
    <div>
      <Head>
        <title>PSA - Proyecto</title>
      </Head>
      
      <NavBar />
      <Projects />
      
    </div>
  );
};

export default Home;