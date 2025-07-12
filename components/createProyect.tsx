import React, {useState} from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import styles from "@/components/createTicket.module.css";
import {useRouter} from "next/router"; // Assuming you have a types.ts file with the Project interface

interface Status {
  id: number;
  name: string;
}

const CreateProject: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [consumedHours, setConsumedHours] = useState<number>(0);

  const handleCancel = () => {
    router.push('/projects');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name,
        description,
        startDate : dayjs(startDate).format('YYYY-MM-DDTHH:mm:ss'),
        endDate: dayjs(endDate).format('YYYY-MM-DDTHH:mm:ss'),
        consumedHours,
      };
      const response = await axios.post(`https://moduloproyecto.onrender.com/projects`, data,);
      if (response.status === 201) {
        alert('Proyecto creado exitosamente');
        router.push('/projects');
      }
    } catch (error) {
      alert('Error al crear el Proyecto');
      console.error(error);
    }

  };

  return (
    <div className={styles.createTaskContainer}>
      <main className={styles.mainContent}>
        <h1>Crear Proyecto</h1>
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
              maxLength={200}
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
              maxLength={200}
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
              maxLength={10}
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

          <div className={styles.buttonContainer}>
            <button type="button" onClick={handleCancel}>Cancelar</button>
            <button type="submit">Crear Proyecto</button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateProject;