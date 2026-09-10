import { Routes } from '@angular/router';
import { salirConCambios } from './admin/shared/aviso-cambios/salir-con-cambios';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ==========================================
  // RUTAS PÚBLICAS (PORTAL INSTITUCIONAL)
  // ==========================================
  {
    path: '',
    loadComponent: () =>
      import('./features/public-layout/public-layout.component').then(
        (m) => m.PublicLayoutComponent,
      ),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/inicio/inicio.component').then((m) => m.InicioComponent),
        title: 'Inicio — IESPP Peruano Canadiense',
      },
      {
        path: 'nosotros',
        loadComponent: () => import('./features/nosotros/nosotros').then((m) => m.Nosotros),
        title: 'Nosotros — IESPP Peruano Canadiense',
      },
      {
        path: 'programas',
        loadComponent: () => import('./features/programas/programas').then((m) => m.Programas),
        title: 'Programas de Estudio — IESPP Peruano Canadiense',
      },
      {
        path: 'admision',
        loadComponent: () =>
          import('./features/admision/admision.component').then((m) => m.AdmisionComponent),
        title: 'Admisión 2026 — IESPP Peruano Canadiense',
      },
      {
        path: 'becas',
        loadComponent: () => import('./features/becas/becas').then((m) => m.Becas),
        title: 'Becas y créditos — IESPP Peruano Canadiense',
      },
      {
        path: 'costos',
        loadComponent: () => import('./features/costos/costos').then((m) => m.Costos),
        title: 'Costos — IESPP Peruano Canadiense',
      },
      {
        path: 'estadisticas',
        loadComponent: () =>
          import('./features/estadisticas/estadisticas').then((m) => m.Estadisticas),
        title: 'Estadísticas — IESPP Peruano Canadiense',
      },
      {
        path: 'horarios',
        loadComponent: () => import('./features/horarios/horarios').then((m) => m.Horarios),
        title: 'Horarios — IESPP Peruano Canadiense',
      },
      {
        path: 'inversiones',
        loadComponent: () =>
          import('./features/inversiones/inversiones').then((m) => m.Inversiones),
        title: 'Inversiones — IESPP Peruano Canadiense',
      },
      {
        path: 'licenciamiento',
        loadComponent: () =>
          import('./features/licenciamiento/licenciamiento').then((m) => m.Licenciamiento),
        title: 'Licenciamiento — IESPP Peruano Canadiense',
      },
      {
        path: 'transparencia',
        loadComponent: () =>
          import('./features/transparencia/transparencia.component').then(
            (m) => m.TransparenciaComponent,
          ),
        title: 'Transparencia Institucional — IESPP Peruano Canadiense',
      },
      {
        path: 'noticias',
        loadComponent: () => import('./features/noticias/noticias').then((m) => m.Noticias),
        title: 'Noticias y Comunicados — IESPP Peruano Canadiense',
      },
      {
        path: 'noticias/:id',
        loadComponent: () =>
          import('./features/noticia-detalle/noticia-detalle').then((m) => m.NoticiaDetalle),
        title: 'Detalle de Noticia — IESPP Peruano Canadiense',
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./features/servicios/servicios.component').then((m) => m.ServiciosComponent),
        title: 'Servicios y EVA — IESPP Peruano Canadiense',
      },
      {
        path: 'psicopedagogico',
        loadComponent: () =>
          import('./features/psicopedagogico/psicopedagogico.component').then(
            (m) => m.PsicopedagogicoComponent,
          ),
        title: 'Servicio Psicopedagógico — IESPP Peruano Canadiense',
      },
      {
        path: 'servicio-social',
        loadComponent: () =>
          import('./features/servicio-social/servicio-social.component').then(
            (m) => m.ServicioSocialComponent,
          ),
        title: 'Servicio Social — IESPP Peruano Canadiense',
      },
      {
        path: 'soporte-medico',
        loadComponent: () =>
          import('./features/soporte-medico/soporte-medico.component').then(
            (m) => m.SoporteMedicoComponent,
          ),
        title: 'Soporte Médico — IESPP Peruano Canadiense',
      },
      {
        path: 'repositorio',
        loadComponent: () =>
          import('./features/repositorio/repositorio.component').then(
            (m) => m.RepositorioComponent,
          ),
        title: 'Repositorio Institucional — IESPP Peruano Canadiense',
      },
      {
        path: 'repositorio/:id',
        loadComponent: () =>
          import('./features/repositorio-detalle/repositorio-detalle.component').then(
            (m) => m.RepositorioDetalleComponent,
          ),
        title: 'Detalle de Investigación — IESPP Peruano Canadiense',
      },
      {
        path: 'mesa-de-partes',
        loadComponent: () =>
          import('./features/mesa-de-partes/mesa-de-partes').then((m) => m.MesaDePartes),
        title: 'Mesa de Partes Virtual — IESPP Peruano Canadiense',
      },
      {
        path: 'procedimientos',
        loadComponent: () =>
          import('./features/procedimientos/procedimientos').then((m) => m.Procedimientos),
        title: 'Procedimientos — IESPP Peruano Canadiense',
      },
      {
        path: 'reglamentos',
        loadComponent: () =>
          import('./features/reglamentos/reglamentos.component').then(
            (m) => m.ReglamentosComponent,
          ),
        title: 'Reglamentos Institucionales — IESPP Peruano Canadiense',
      },
      {
        path: 'reclamaciones',
        loadComponent: () =>
          import('./features/reclamaciones/reclamaciones.component').then(
            (m) => m.ReclamacionesComponent,
          ),
        title: 'Libro de Reclamaciones — IESPP Peruano Canadiense',
      },
      {
        path: 'privacidad',
        loadComponent: () => import('./features/privacidad/privacidad').then((m) => m.Privacidad),
        title: 'Política de Privacidad — IESPP Peruano Canadiense',
      },
    ],
  },

  // ==========================================
  // RUTAS ADMINISTRATIVAS (PANEL ADMIN)
  // ==========================================
  {
    path: 'admin/login',
    loadComponent: () => import('./admin/login/login.component').then((m) => m.AdminLoginComponent),
    title: 'Iniciar Sesión — Panel Admin',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard.component').then((m) => m.AdminDashboardComponent),
        title: 'Dashboard — Admin',
      },
      {
        path: 'contenido',
        loadComponent: () => import('./admin/contenido/contenido').then((m) => m.AdminContenido),
        title: 'Contenido del portal — Admin',
      },
      {
        path: 'inicio',
        loadComponent: () => import('./admin/contenido/inicio/inicio').then((m) => m.AdminInicio),
        canDeactivate: [salirConCambios],
        title: 'Inicio — Admin',
      },
      {
        path: 'admision',
        loadComponent: () =>
          import('./admin/contenido/admision/admision').then((m) => m.AdminAdmision),
        canDeactivate: [salirConCambios],
        title: 'Admisión — Admin',
      },
      {
        path: 'becas',
        loadComponent: () => import('./admin/contenido/becas/becas').then((m) => m.AdminBecas),
        canDeactivate: [salirConCambios],
        title: 'Becas y créditos — Admin',
      },
      {
        path: 'costos',
        loadComponent: () => import('./admin/contenido/costos/costos').then((m) => m.AdminCostos),
        canDeactivate: [salirConCambios],
        title: 'Costos — Admin',
      },
      {
        path: 'estadisticas',
        loadComponent: () =>
          import('./admin/contenido/estadisticas/estadisticas').then((m) => m.AdminEstadisticas),
        canDeactivate: [salirConCambios],
        title: 'Estadísticas — Admin',
      },
      {
        path: 'horarios',
        loadComponent: () =>
          import('./admin/contenido/horarios/horarios').then((m) => m.AdminHorarios),
        canDeactivate: [salirConCambios],
        title: 'Horarios — Admin',
      },
      {
        path: 'inversiones',
        loadComponent: () =>
          import('./admin/contenido/inversiones/inversiones').then((m) => m.AdminInversiones),
        canDeactivate: [salirConCambios],
        title: 'Inversiones — Admin',
      },
      {
        path: 'licenciamiento',
        loadComponent: () =>
          import('./admin/contenido/licenciamiento/licenciamiento').then(
            (m) => m.AdminLicenciamiento,
          ),
        canDeactivate: [salirConCambios],
        title: 'Licenciamiento — Admin',
      },
      {
        path: 'nosotros',
        loadComponent: () =>
          import('./admin/contenido/nosotros/nosotros').then((m) => m.AdminNosotros),
        canDeactivate: [salirConCambios],
        title: 'Nosotros — Admin',
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./admin/contenido/servicios/servicios').then((m) => m.AdminServicios),
        canDeactivate: [salirConCambios],
        title: 'Servicios — Admin',
      },
      {
        path: 'transparencia',
        loadComponent: () =>
          import('./admin/contenido/transparencia/transparencia').then((m) => m.AdminTransparencia),
        canDeactivate: [salirConCambios],
        title: 'Transparencia — Admin',
      },
      {
        path: 'reglamentos',
        loadComponent: () =>
          import('./admin/contenido/reglamentos/reglamentos').then((m) => m.AdminReglamentos),
        canDeactivate: [salirConCambios],
        title: 'Reglamentos — Admin',
      },
      {
        path: 'procedimientos',
        loadComponent: () =>
          import('./admin/contenido/procedimientos/procedimientos').then(
            (m) => m.AdminProcedimientos,
          ),
        canDeactivate: [salirConCambios],
        title: 'Procedimientos — Admin',
      },
      {
        path: 'psicopedagogico',
        loadComponent: () =>
          import('./admin/contenido/psicopedagogico/psicopedagogico').then(
            (m) => m.AdminPsicopedagogico,
          ),
        canDeactivate: [salirConCambios],
        title: 'Psicopedagógico — Admin',
      },
      {
        path: 'servicio-social',
        loadComponent: () =>
          import('./admin/contenido/servicio-social/servicio-social').then(
            (m) => m.AdminServicioSocial,
          ),
        canDeactivate: [salirConCambios],
        title: 'Servicio social — Admin',
      },
      {
        path: 'soporte-medico',
        loadComponent: () =>
          import('./admin/contenido/soporte-medico/soporte-medico').then(
            (m) => m.AdminSoporteMedico,
          ),
        canDeactivate: [salirConCambios],
        title: 'Soporte médico — Admin',
      },
      {
        path: 'pagina-reclamaciones',
        loadComponent: () =>
          import('./admin/contenido/reclamaciones-pagina/reclamaciones-pagina').then(
            (m) => m.AdminReclamacionesPagina,
          ),
        canDeactivate: [salirConCambios],
        title: 'Página de reclamaciones — Admin',
      },
      {
        path: 'privacidad',
        loadComponent: () =>
          import('./admin/contenido/privacidad/privacidad').then((m) => m.AdminPrivacidad),
        canDeactivate: [salirConCambios],
        title: 'Privacidad — Admin',
      },
      {
        path: 'repositorio-copy',
        loadComponent: () =>
          import('./admin/contenido/repositorio-copy/repositorio-copy').then(
            (m) => m.AdminRepositorioCopy,
          ),
        title: 'Textos del repositorio — Admin',
      },
      {
        path: 'programas',
        loadComponent: () => import('./admin/programas/programas').then((m) => m.AdminProgramas),
        title: 'Programas de estudio — Admin',
      },
      {
        path: 'menu',
        loadComponent: () => import('./admin/menu/menu').then((m) => m.AdminMenu),
        title: 'Menú de navegación — Admin',
      },
      {
        path: 'noticias',
        loadComponent: () =>
          import('./admin/noticias/noticias.component').then((m) => m.AdminNoticiasComponent),
        title: 'Gestión de Noticias — Admin',
      },
      {
        path: 'comunicados',
        loadComponent: () =>
          import('./admin/comunicados/comunicados.component').then(
            (m) => m.AdminComunicadosComponent,
          ),
        title: 'Gestión de Comunicados — Admin',
      },
      {
        path: 'personal',
        loadComponent: () =>
          import('./admin/personal/personal.component').then((m) => m.AdminPersonalComponent),
        title: 'Gestión de Personal — Admin',
      },
      {
        path: 'trayectoria',
        redirectTo: 'nosotros',
        pathMatch: 'full',
      },
      {
        path: 'contactos',
        loadComponent: () =>
          import('./admin/contactos/contactos.component').then((m) => m.AdminContactosComponent),
        title: 'Gestión de Contactos — Admin',
      },
      {
        path: 'investigaciones',
        loadComponent: () =>
          import('./admin/investigaciones/investigaciones.component').then(
            (m) => m.AdminInvestigacionesComponent,
          ),
        title: 'Gestión de Investigaciones — Admin',
      },
      {
        path: 'documentos',
        loadComponent: () =>
          import('./admin/documentos/documentos.component').then((m) => m.AdminDocumentosComponent),
        title: 'Gestión de Documentos — Admin',
      },
      {
        path: 'mesa-de-partes',
        loadComponent: () =>
          import('./admin/mesa-de-partes/mesa-de-partes.component').then(
            (m) => m.AdminMesaDePartesComponent,
          ),
        title: 'Gestión de Mesa de Partes — Admin',
      },
      {
        path: 'reclamaciones',
        loadComponent: () =>
          import('./admin/reclamaciones/reclamaciones.component').then(
            (m) => m.AdminReclamacionesComponent,
          ),
        title: 'Gestión de Reclamaciones — Admin',
      },
      {
        path: 'solicitudes',
        loadComponent: () =>
          import('./admin/solicitudes/solicitudes').then((m) => m.AdminSolicitudes),
        title: 'Solicitudes de bienestar y transparencia — Admin',
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./admin/usuarios/usuarios.component').then((m) => m.AdminUsuariosComponent),
        title: 'Gestión de Usuarios — Admin',
      },
      {
        path: 'mi-cuenta',
        loadComponent: () => import('./admin/mi-cuenta/mi-cuenta').then((m) => m.AdminMiCuenta),
        title: 'Mi cuenta — Admin',
      },
    ],
  },

  // ==========================================
  // RUTA 404 (FALLBACK)
  // ==========================================
  {
    path: '**',
    loadComponent: () =>
      import('./features/no-encontrado/no-encontrado').then((m) => m.NoEncontrado),
    title: 'Página no encontrada — IESPP Peruano Canadiense',
  },
];
