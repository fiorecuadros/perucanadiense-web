import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-procedimientos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './procedimientos.component.html',
  styleUrl: './procedimientos.component.css',
})
export class ProcedimientosComponent {
  futForm: FormGroup;
  submitted = false;
  showSuccess = false;
  codigoTramite = '';
  selectedCategory = 'todos';
  searchTerm = '';

  constructor(private fb: FormBuilder) {
    this.futForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      tipoTramite: ['', Validators.required],
      asunto: ['', [Validators.required, Validators.minLength(10)]],
      descripcion: ['', [Validators.required, Validators.minLength(20)]],
      aceptoPrivacidad: [false, Validators.requiredTrue],
    });
  }

  get f() {
    return this.futForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.futForm.invalid) {
      return;
    }

    this.codigoTramite = 'FUT-' + Date.now().toString(36).toUpperCase();
    this.showSuccess = true;

    console.log('Formulario FUT enviado:', this.futForm.value);
  }

  onReset() {
    this.submitted = false;
    this.showSuccess = false;
    this.futForm.reset();
  }

  categorias = [
    { id: 'todos', nombre: 'Todos los Trámites' },
    { id: 'academico', nombre: 'Trámites Académicos' },
    { id: 'administrativo', nombre: 'Trámites Administrativos' },
    { id: 'certificacion', nombre: 'Certificaciones' },
    { id: 'economico', nombre: 'Trámites Económicos' },
  ];

  tupaItems = [
    {
      id: 1,
      nombre: 'Matrícula de Estudiantes Nuevos',
      categoria: 'academico',
      costo: 'S/ 200.00',
      tiempo: '1 día',
      requisitos: [
        'Partida de nacimiento original',
        'Certificado original de estudios secundarios',
        '04 fotografías tamaño carnet a colores',
        '02 copias del DNI - 02 micas',
        'Boucher de depósito de pago por inscripción',
      ],
    },
    {
      id: 2,
      nombre: 'Constancia de Matrícula',
      categoria: 'academico',
      costo: 'S/ 15.00',
      tiempo: '1 día',
      requisitos: ['DNI original y copia', 'Solicitud escrita', 'Pago por derecho de trámite'],
    },
    {
      id: 3,
      nombre: 'Certificado de Estudios',
      categoria: 'certificacion',
      costo: 'S/ 30.00',
      tiempo: '3 días',
      requisitos: [
        'DNI original y copia',
        'Constancia de no tener deudas',
        'Solicitud formal',
        'Pago por derecho de certificación',
      ],
    },
    {
      id: 4,
      nombre: 'Traslado de Expediente',
      categoria: 'administrativo',
      costo: 'S/ 50.00',
      tiempo: '5 días',
      requisitos: [
        'Solicitud de traslado',
        'Constancia de matrícula',
        'Certificado de estudios',
        'Paz y salvo de la institución',
        'Pago por derecho de traslado',
      ],
    },
    {
      id: 5,
      nombre: 'Revalidación de Estudios',
      categoria: 'academico',
      costo: 'S/ 100.00',
      tiempo: '15 días',
      requisitos: [
        'Certificados de estudios originales',
        'Programas de estudio',
        'Resolución de revalidación (si aplica)',
        'DNI original y copia',
        'Pago por derecho de revalidación',
      ],
    },
    {
      id: 6,
      nombre: 'Devolución de Pensiones',
      categoria: 'economico',
      costo: 'Gratuito',
      tiempo: '10 días',
      requisitos: [
        'Solicitud de devolución',
        'Comprobantes de pago',
        'Certificado de retiro',
        'DNI original y copia',
        'Cuenta bancaria (interbancaria)',
      ],
    },
    {
      id: 7,
      nombre: 'Carnet Estudiantil',
      categoria: 'certificacion',
      costo: 'S/ 20.00',
      tiempo: '2 días',
      requisitos: [
        'DNI original y copia',
        'Constancia de matrícula',
        '2 fotos tamaño carnet',
        'Pago por derecho de carnet',
      ],
    },
    {
      id: 8,
      nombre: 'Certificado de Egresado',
      categoria: 'certificacion',
      costo: 'S/ 40.00',
      tiempo: '5 días',
      requisitos: [
        'DNI original y copia',
        'Constancia de egreso',
        'Paz y salvo administrativo',
        'Pago por derecho de certificación',
      ],
    },
  ];

  tiposTramite = [
    'Solicitud de Información',
    'Reclamo',
    'Sugerencia',
    'Denuncia',
    'Consulta Académica',
    'Consulta Administrativa',
    'Otro',
  ];

  get filteredTupa() {
    let filtered = this.tupaItems;

    if (this.selectedCategory !== 'todos') {
      filtered = filtered.filter((item) => item.categoria === this.selectedCategory);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.nombre.toLowerCase().includes(term) ||
          item.requisitos.some((req) => req.toLowerCase().includes(term)),
      );
    }

    return filtered;
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  downloadFUT() {
    console.log('Descargando Formulario Único de Trámite');
    alert('Descargando Formulario Único de Trámite (FUT)');
  }

  getCategoriaNombre(categoriaId: string): string {
    const categoria = this.categorias.find((c) => c.id === categoriaId);
    return categoria ? categoria.nombre : categoriaId;
  }
}
