import React, {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import axios from 'axios';
import dayjs from 'dayjs';
import {debounce} from 'lodash';
import styles from './createTicket.module.css';

interface HumanResource {
  legajo: number;
  nombre: string;
  apellido: string; 
}

const CreateTask: React.FC = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [consumedHours, setConsumedHours] = useState<number>(0);
  const [humanResource, setHumanResource] = useState<HumanResource | null>(null);
  const [selectedHumanResource, setSelectedHumanResource] = useState<HumanResource | null>(null);
  const [humanResourceOptions, setHumanResourceOptions] = useState<HumanResource[]>([]);
  const [allHumanResources, setAllHumanResources] = useState<HumanResource[]>([]);

  const handleCancel = () => {
    router.push('/projects');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!humanResource) {
    //   alert('Por favor, seleccione una severidad válida');
    //   return;
    // }
    try {
      const data = {
        name,
        description,
        startDate : dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss'),
        endDate: dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss'),
        consumedHours,
      };
      const response = await axios.post(`https://moduloproyecto.onrender.com/tasks/${projectId}`, data,);
      if (response.status === 201) {
        alert('Tarea creada exitosamente');
        router.push('/projects');
      }
    } catch (error) {
      alert('Error al crear la tarea');
      console.error(error);
    }
    
  };


  const fetchHumanResources = async () => {
    try {
      const response = await axios.get<HumanResource[]>('https://anypoint.mulesoft.com/mocking/api/v1/sources/exchange/assets/754f50e8-20d8-4223-bbdc-56d50131d0ae/recursos-psa/1.0.0/m/api/recursos');
      setAllHumanResources(response.data);
    } catch (error) {
      console.error('Error fetching human resources', error);
    }
  };

  const debouncedFetchHumanResources = useCallback(debounce(fetchHumanResources, 300), []);

  useEffect(() => {
    debouncedFetchHumanResources();
  }, [debouncedFetchHumanResources]);

  // const handleHumanResourceSelect = (humanResource: HumanResource) => {
  //   setSelectedHumanResource(humanResource);
  //   setAllHumanResources([]);
  // };

  return (
    <div className={styles.createTaskContainer}>
      <main className={styles.mainContent}>
        <h1>Crear Tarea</h1>
        <br></br>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="name">Nombre</label>
          <div className={styles.textareaContainer}>
            <input
              id="name"
              name="name"
              placeholder="Ingresar nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={255}
            />
          </div>

          <label htmlFor="startDate">Fecha de Inicio</label>
          <div className={styles.textareaContainer}>
            <input
              id="startDate"
              name="startDate"
              placeholder="Ingresar una fecha de inicio: AAAA/MM/DD"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              maxLength={255}
            />
          </div>

          <label htmlFor="endDate">Fecha de Finalización</label>
          <div className={styles.textareaContainer}>
            <input
              id="endDate"
              name="endDate"
              placeholder="Ingresar una fecha de finalización: AAAA/MM/DD"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              maxLength={255}
            />
          </div>

          <label htmlFor="consumedHours">Horas consumidas</label>
          <div className={styles.textareaContainer}>
            <input
              id="consumedHours"
              name="consumedHours"
              placeholder="Ingresar las horas consumidas"
              value={consumedHours}
              onChange={(e) => setEndDate(e.target.value)}
              maxLength={255}
            />
          </div>

          <label htmlFor="description">Descripción</label>
          <div className={styles.textareaContainer}>
            <textarea
              id="descripcion"
              name="descripcion"
              placeholder="Ingresar una descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={255}
            />
            <span className={styles.charCount}>{description.length}/255</span>
          </div>

          {/* <label htmlFor="humanResource">Lider de Proyecto</label>
          <select
            id="humanResource"
            name="humanResource"
            value={humanResource}
            onChange={(e) => setHumanResource(e.target.value)} */}

          <div className={styles.buttonContainer}>
            <button type="button" onClick={handleCancel}>Cancelar</button>
            <button type="submit">Crear Tarea</button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateTask;
