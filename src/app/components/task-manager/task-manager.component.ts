import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


interface Task{
  id:number;

  title:string;
  completed:boolean;
}

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './task-manager.component.html',
  styleUrl: './task-manager.component.css'
})
export class TaskManagerComponent {
  Object = Object; // Agregamos esta línea para que sea accesible en el template
  newTaskTitle: string = '';
  tasks: string[] = [];
  completedTasks: { [week: string]: string[] } = {};

  ngOnInit(){
    this.loadTasks()
  }

   // Guardar en LocalStorage
   saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    localStorage.setItem('completedTasks', JSON.stringify(this.completedTasks));
  }

   // Agregar una nueva tarea
   addTask() {
    if (this.newTaskTitle.trim()) {
      this.tasks.push(this.newTaskTitle);
      this.newTaskTitle = ""; // Limpiar input
      this.saveTasks(); // Guardar en localStorage
    }
  }
  

   // Cargar las tareas almacenadas
   loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    const storedCompletedTasks = localStorage.getItem('completedTasks');

    

    if (storedTasks) this.tasks = JSON.parse(storedTasks);
    if (storedCompletedTasks) this.completedTasks = JSON.parse(storedCompletedTasks);
  }

  completeTask(task: string) {
    this.tasks = this.tasks.filter(t => t !== task); // Filtrar y eliminar la tarea
  
    const week = this.getCurrentWeek(); // Obtener la semana actual
    if (!this.completedTasks[week]) {
      this.completedTasks[week] = [];
    }
    this.completedTasks[week].push(task);
  
    this.saveTasks(); // Guardar después de completar la tarea
  }
  
  

    // Obtener la semana actual en formato Año-Semana (ej. 2024-W05)
    getCurrentWeek(): string {
      const now = new Date();
      const year = now.getFullYear();
      
      // Obtener el primer día del año
      const firstDayOfYear = new Date(year, 0, 1);
      
      // Ajustar para que la semana empiece el lunes (ISO 8601)
      const dayOffset = firstDayOfYear.getDay() === 0 ? 6 : firstDayOfYear.getDay() - 1;
      
      // Calcular el número de semana actual
      const week = Math.ceil((((now.getTime() - firstDayOfYear.getTime()) / 86400000) + 1 + dayOffset) / 7);
      
      // Obtener el primer día de la semana actual
      const startOfWeek = new Date(year, 0, 1 + (week - 1) * 7 - dayOffset);
      
      // Obtener el último día de la semana (sábado)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 5); // De lunes a sábado
      
      // Formatear las fechas en YYYY-MM-DD
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
      return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)} // Semana ${week}`;
    }
  removeCompletedTask(week: string, taskIndex: number) {
    this.completedTasks[week].splice(taskIndex, 1);
    if (this.completedTasks[week].length === 0) {
      delete this.completedTasks[week]; // Eliminar la semana si ya no tiene tareas
    }
  }

  getWeekIdentifier(date: Date): string {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Lunes de la semana

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // Domingo de la semana

    return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
  }


  // Método para exportar a PDF
  exportToPDF() {
    const doc = new jsPDF();

doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.text('Task Manager Report', 105, 15, { align: 'center' });

let startY = 25;

// Tabla de tareas activas
if (this.tasks.length > 0) {
  doc.setFontSize(14);
  doc.text('Tareas Activas', 15, startY);
  startY += 5;
  autoTable(doc, {
    startY,
    head: [['Tarea']],
    body: this.tasks.map(task => [task]),
    theme: 'grid',
    styles: { fontSize: 12, cellPadding: 5 },
  });
  startY = (doc as any).lastAutoTable.finalY + 10;
}

// Tabla de tareas completadas por semana
if (Object.keys(this.completedTasks).length > 0) {
  doc.setFontSize(14);
  doc.text('Tareas Completadas', 15, startY);
  startY += 5;

  Object.keys(this.completedTasks).forEach(week => {
    doc.setFontSize(12);
    doc.text(`Semana: ${week}`, 15, startY);
    startY += 5;

    autoTable(doc, {
      startY,
      head: [['Tarea']],
      body: this.completedTasks[week].map(task => [task]),
      theme: 'grid',
      styles: { fontSize: 12, cellPadding: 5 },
    });

    startY = (doc as any).lastAutoTable.finalY + 10;
  });
}

doc.save('Task_Manager_Report.pdf');
  }

}
