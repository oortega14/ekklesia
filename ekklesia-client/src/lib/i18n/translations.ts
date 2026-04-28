export type Locale = "es" | "en"

export interface TranslationKeys {
  common: {
    search: string
    save: string
    cancel: string
    delete: string
    edit: string
    create: string
    add: string
    view: string
    close: string
    confirm: string
    back: string
    next: string
    previous: string
    loading: string
    success: string
    error: string
    warning: string
    yes: string
    no: string
    actions: string
    status: string
    date: string
    time: string
    name: string
    email: string
    phone: string
    address: string
    description: string
    notes: string
    total: string
    amount: string
    selectDate: string
    noResults: string
    seeAll: string
    errorRetry: string
    empty: string
    retry: string
  }
  contributionTypes: {
    Tithe: string
    Offering: string
    Donation: string
    Firstfruit: string
    Covenant: string
  }
  auth: {
    login: string
    logout: string
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    ministryName: string
    country: string
    city: string
    phoneOptional: string
    emailPlaceholder: string
    passwordPlaceholder: string
    phonePlaceholder: string
    languageSpanish: string
    languageEnglish: string
    forgotPassword: string
    rememberMe: string
    signIn: string
    invalidCredentials: string
    sessionStartFailed: string
    signOut: string
    welcome: string
    loginTitle: string
    loginSubtitle: string
  }
  roles: {
    superadmin: string
    superadminSubtitle: string
    leadPastor: string
    leadPastorSubtitle: string
    pastor: string
    pastorSubtitle: string
    assistant: string
    assistantSubtitle: string
  }
  nav: {
    dashboard: string
    ministries: string
    churches: string
    users: string
    reports: string
    notifications: string
    settings: string
    pastors: string
    services: string
    finances: string
    assistants: string
    help: string
    myChurches: string
    attendance: string
    treasury: string
  }
  dashboard: {
    title: string
    welcome: string
    overview: string
    totalChurches: string
    totalUsers: string
    totalMembers: string
    totalIncome: string
    recentActivity: string
    quickActions: string
    weeklyAttendance: string
    monthlyIncome: string
    pendingReports: string
    completedReports: string
  }
  dashboards: {
    leadPastor: {
      title: string
      subtitle: string
      churches: string
      pastors: string
      servicesThisMonth: string
      totalAttendance: string
      totalContributions: string
      attendanceTitle: string
      attendanceSubtitle: string
      contributionsTitle: string
      contributionsSubtitle: string
      churchesTableTitle: string
      colChurchName: string
      colPastor: string
      colMembers: string
      emptyChurches: string
    }
    pastor: {
      title: string
      subtitle: string
      services: string
      pendingAttendance: string
      pendingContributions: string
      assistants: string
      attendanceTitle: string
      attendanceSubtitle: string
      contributionsTitle: string
      contributionsSubtitle: string
      upcomingHeader: string
      emptyUpcoming: string
    }
    assistant: {
      title: string
      subtitle: string
      pendingRequests: string
      submittedReports: string
      pendingServicesHeader: string
      myRequestsHeader: string
      emptyPendingServices: string
      emptyMyRequests: string
    }
  }
  superadminDashboard: {
    title: string
    userName: string
    userRole: string
    totalChurches: string
    activePastors: string
    servicesThisMonth: string
    totalIncome: string
    generalAttendance: string
    generalAttendanceSubtitle: string
    incomeDistribution: string
    incomeDistributionSubtitle: string
    newChurch: string
    filter: string
    export: string
    registeredChurches: string
    recentActivity: string
    activity1Action: string
    activity1Details: string
    activity1Time: string
    activity2Action: string
    activity2Details: string
    activity2Time: string
    activity3Action: string
    activity3Details: string
    activity3Time: string
    activity4Action: string
    activity4Details: string
    activity4Time: string
    colName: string
    colLeadPastor: string
    colMembers: string
    colCity: string
    colStatus: string
    statusActive: string
    statusPending: string
    monthJan: string
    monthFeb: string
    monthMar: string
    monthApr: string
    monthMay: string
    monthJun: string
    monthJul: string
  }
  churches: {
    title: string
    addChurch: string
    editChurch: string
    deleteChurch: string
    churchName: string
    pastor: string
    members: string
    location: string
    founded: string
    activeChurches: string
    inactiveChurches: string
    noChurches: string
    deleteConfirm: string
    deleteWarning: string
  }
  users: {
    title: string
    addUser: string
    editUser: string
    deleteUser: string
    userName: string
    userEmail: string
    userRole: string
    userStatus: string
    active: string
    inactive: string
    lastLogin: string
    deleteConfirm: string
    deleteWarning: string
  }
  reports: {
    title: string
    tabAttendance: string
    tabContributions: string
    filterPeriod: string
    filterChurch: string
    filterServiceType: string
    filterContributionType: string
    filterAllChurches: string
    filterAllTypes: string
    periodThisMonth: string
    periodThisQuarter: string
    periodThisYear: string
    exportCsv: string
    exporting: string
    truncated: string
    summaryTotalRecords: string
    summaryTotalAttendance: string
    summaryAveragePerService: string
    summaryTotalAmount: string
    summaryBreakdownByType: string
    colService: string
    colServiceType: string
    colChurch: string
    colDate: string
    colAdults: string
    colYouth: string
    colChildren: string
    colTotal: string
    colType: string
    colAmount: string
    colReportedBy: string
    colSubmittedAt: string
    loading: string
    empty: string
    error: string
  }
  notifications: {
    title: string
    tabUnread: string
    tabAll: string
    markAllRead: string
    viewAll: string
    empty: string
    markRead: string
    delete: string
    genericFallback: string
    filterAllKinds: string
    relativeJustNow: string
    relativeMinutes: string
    relativeHours: string
    relativeDays: string
    kinds: {
      ministry_created:            { title: string; body: string }
      service_request_created:     { title: string; body: string }
      service_request_approved:    { title: string; body: string }
      service_request_rejected:    { title: string; body: string }
      attendance_report_submitted: { title: string; body: string }
      contribution_recorded:       { title: string; body: string }
      user_created:                { title: string; body: string }
      church_created:              { title: string; body: string }
    }
  }
  attendance: {
    title: string
    pendingHeader: string
    pendingCountSingular: string
    pendingCountPlural: string
    recentHeader: string
    correctionHint: string
    emptyTitle: string
    emptyBody: string
    reportButton: string
    cancelButton: string
    saveButton: string
    saving: string
    adults: string
    youth: string
    children: string
    total: string
    notesLabel: string
    notesPlaceholder: string
    savedToast: string
    saveFailedToast: string
  }
  services: {
    title: string
    subtitlePastor: string
    subtitleLeadPastor: string
    pendingRequestsHeader: string
    myRequestsHeader: string
    upcomingServicesHeader: string
    recentResolvedHeader: string
    newRequestButton: string
    scheduleServiceButton: string
    approveButton: string
    rejectButton: string
    statusPending: string
    statusApproved: string
    statusRejected: string
    statusPendingHelp: string
    statusApprovedBy: string
    statusRejectedBy: string
    approveConfirmTitle: string
    approveConfirmBody: string
    rejectConfirmTitle: string
    rejectConfirmBody: string
    emptyPending: string
    emptyMyRequests: string
    emptyUpcoming: string
    emptyRecent: string
    typeRegularSunday: string
    typeBibleStudy: string
    typeSpecialMeeting: string
    typeConference: string
    typeVigil: string
    typeBaptisms: string
    typeOther: string
    formServiceType: string
    formChurch: string
    formRequestedFor: string
    formScheduledAt: string
    formNotes: string
    formNotesPlaceholder: string
    formRequiredFutureDate: string
    toastRequestCreated: string
    toastApproved: string
    toastRejected: string
    toastServiceScheduled: string
    toastError: string
    reportedBadge: string
    notReportedBadge: string
    requestedForLabel: string
    requestedByLabel: string
  }
  profile: {
    title: string
    myProfile: string
    editProfile: string
    changePassword: string
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }
  settings: {
    title: string
    subtitle: string
    profileTitle: string
    profileSubtitle: string
    securityTitle: string
    securitySubtitle: string
    preferencesTitle: string
    preferencesSubtitle: string
    firstName: string
    lastName: string
    phone: string
    email: string
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
    language: string
    saveProfile: string
    changePasswordBtn: string
    savePreferences: string
    profileSaved: string
    passwordSaved: string
    preferencesSaved: string
    saveFailed: string
    currentPasswordWrong: string
    passwordTooShort: string
    passwordsDoNotMatch: string
  }
  header: {
    search: string
    notifications: string
    seeAllNotifications: string
    profile: string
    settings: string
  }
  modals: {
    confirmDelete: string
    deleteWarning: string
    cannotUndo: string
    areYouSure: string
  }
  errors: {
    required: string
    invalidEmail: string
    minLength: string
    maxLength: string
    passwordMismatch: string
    futureDate: string
    serverError: string
  }
  time: {
    today: string
    yesterday: string
    daysAgo: string
    hoursAgo: string
    minutesAgo: string
    justNow: string
  }
}

const es: TranslationKeys = {
  common: {
    search: "Buscar",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    add: "Agregar",
    view: "Ver",
    close: "Cerrar",
    confirm: "Confirmar",
    back: "Volver",
    next: "Siguiente",
    previous: "Anterior",
    loading: "Cargando...",
    success: "Operacion exitosa",
    error: "Error",
    warning: "Advertencia",
    yes: "Si",
    no: "No",
    actions: "Acciones",
    status: "Estado",
    date: "Fecha",
    time: "Hora",
    name: "Nombre",
    email: "Correo electronico",
    phone: "Telefono",
    address: "Direccion",
    description: "Descripcion",
    notes: "Notas",
    total: "Total",
    amount: "Monto",
    selectDate: "Seleccionar fecha",
    noResults: "Sin resultados",
    seeAll: "Ver todos",
    errorRetry: "Algo salio mal. Intentalo de nuevo.",
    empty: "Sin datos",
    retry: "Reintentar",
  },
  contributionTypes: {
    Tithe: "Diezmos",
    Offering: "Ofrendas",
    Donation: "Donaciones",
    Firstfruit: "Primicias",
    Covenant: "Pactos",
  },
  auth: {
    login: "Iniciar Sesion",
    logout: "Cerrar Sesion",
    email: "Correo electronico",
    password: "Contrasena",
    confirmPassword: "Confirmar contrasena",
    firstName: "Nombre",
    lastName: "Apellido",
    ministryName: "Nombre del ministerio",
    country: "Pais",
    city: "Ciudad",
    phoneOptional: "Telefono (opcional)",
    emailPlaceholder: "correo@iglesia.com",
    passwordPlaceholder: "********",
    phonePlaceholder: "+52 55 0000 0000",
    languageSpanish: "Espanol",
    languageEnglish: "English",
    forgotPassword: "Olvide mi contrasena",
    rememberMe: "Recordarme",
    signIn: "Ingresar",
    invalidCredentials: "Credenciales incorrectas. Intenta de nuevo.",
    sessionStartFailed: "No se pudo iniciar la sesion. Intenta nuevamente.",
    signOut: "Salir",
    welcome: "Bienvenido de vuelta",
    loginTitle: "Iglesia Digital",
    loginSubtitle: "Sistema de Gestion Integral",
  },
  roles: {
    superadmin: "Super Administrador",
    superadminSubtitle: "Control Total",
    leadPastor: "Pastor Principal",
    leadPastorSubtitle: "Gestion General",
    pastor: "Pastor",
    pastorSubtitle: "Mi Iglesia",
    assistant: "Asistente",
    assistantSubtitle: "Reportes de Iglesia",
  },
  nav: {
    dashboard: "Panel Principal",
    ministries: "Ministerios",
    churches: "Iglesias",
    users: "Usuarios",
    reports: "Reportes",
    notifications: "Notificaciones",
    settings: "Configuracion",
    pastors: "Pastores",
    services: "Servicios",
    finances: "Finanzas",
    assistants: "Asistentes",
    help: "Ayuda",
    myChurches: "Mis Iglesias",
    attendance: "Asistencia",
    treasury: "Tesoreria",
  },
  dashboard: {
    title: "Panel Principal",
    welcome: "Bienvenido",
    overview: "Resumen General",
    totalChurches: "Total de Iglesias",
    totalUsers: "Total de Usuarios",
    totalMembers: "Total de Miembros",
    totalIncome: "Ingresos Totales",
    recentActivity: "Actividad Reciente",
    quickActions: "Acciones Rapidas",
    weeklyAttendance: "Asistencia Semanal",
    monthlyIncome: "Ingresos Mensuales",
    pendingReports: "Reportes Pendientes",
    completedReports: "Reportes Completados",
  },
  dashboards: {
    leadPastor: {
      title:                    "Resumen del ministerio",
      subtitle:                 "Vista general de tus iglesias",
      churches:                 "Iglesias",
      pastors:                  "Pastores",
      servicesThisMonth:        "Servicios del mes",
      totalAttendance:          "Asistencia total",
      totalContributions:       "Contribuciones totales",
      attendanceTitle:          "Asistencia (últimos meses)",
      attendanceSubtitle:       "Suma por mes",
      contributionsTitle:       "Contribuciones del mes",
      contributionsSubtitle:    "Distribución por tipo",
      churchesTableTitle:       "Iglesias del ministerio",
      colChurchName:            "Iglesia",
      colPastor:                "Pastor",
      colMembers:               "Miembros",
      emptyChurches:            "Aún no hay iglesias registradas."
    },
    pastor: {
      title:                    "Resumen de tu iglesia",
      subtitle:                 "Vista general",
      services:                 "Servicios",
      pendingAttendance:        "Asistencia pendiente",
      pendingContributions:     "Contribuciones pendientes",
      assistants:               "Asistentes",
      attendanceTitle:          "Asistencia (últimos meses)",
      attendanceSubtitle:       "Suma por mes",
      contributionsTitle:       "Contribuciones del mes",
      contributionsSubtitle:    "Distribución por tipo",
      upcomingHeader:           "Próximos servicios",
      emptyUpcoming:            "No hay servicios próximos."
    },
    assistant: {
      title:                    "Resumen de tu actividad",
      subtitle:                 "Tus pendientes y solicitudes",
      pendingRequests:          "Solicitudes pendientes",
      submittedReports:         "Reportes enviados",
      pendingServicesHeader:    "Servicios pendientes de reporte",
      myRequestsHeader:         "Mis solicitudes recientes",
      emptyPendingServices:     "No hay servicios pendientes de reporte.",
      emptyMyRequests:          "No has enviado solicitudes recientemente."
    }
  },
  superadminDashboard: {
    title: "Dashboard Super Admin",
    userName: "Admin Principal",
    userRole: "Super Administrador",
    totalChurches: "Total Iglesias",
    activePastors: "Pastores Activos",
    servicesThisMonth: "Servicios este Mes",
    totalIncome: "Ingresos Totales",
    generalAttendance: "Asistencia General",
    generalAttendanceSubtitle: "Promedio mensual de asistencia",
    incomeDistribution: "Distribucion de Ingresos",
    incomeDistributionSubtitle: "Por tipo de contribucion",
    newChurch: "Nueva Iglesia",
    filter: "Filtrar",
    export: "Exportar",
    registeredChurches: "Iglesias Registradas",
    recentActivity: "Actividad Reciente",
    activity1Action: "Nueva iglesia creada",
    activity1Details: "Iglesia Nueva Vida en Queretaro",
    activity1Time: "Hace 2 horas",
    activity2Action: "Pastor asignado",
    activity2Details: "Juan Lopez asignado a Iglesia del Sur",
    activity2Time: "Hace 5 horas",
    activity3Action: "Reporte generado",
    activity3Details: "Reporte mensual de asistencia",
    activity3Time: "Hace 1 dia",
    activity4Action: "Servicio registrado",
    activity4Details: "Culto dominical en Iglesia Central",
    activity4Time: "Hace 2 dias",
    colName: "Nombre",
    colLeadPastor: "Pastor Principal",
    colMembers: "Miembros",
    colCity: "Ciudad",
    colStatus: "Estado",
    statusActive: "Activa",
    statusPending: "Pendiente",
    monthJan: "Ene",
    monthFeb: "Feb",
    monthMar: "Mar",
    monthApr: "Abr",
    monthMay: "May",
    monthJun: "Jun",
    monthJul: "Jul",
  },
  churches: {
    title: "Gestion de Iglesias",
    addChurch: "Agregar Iglesia",
    editChurch: "Editar Iglesia",
    deleteChurch: "Eliminar Iglesia",
    churchName: "Nombre de la Iglesia",
    pastor: "Pastor",
    members: "Miembros",
    location: "Ubicacion",
    founded: "Fundada",
    activeChurches: "Iglesias Activas",
    inactiveChurches: "Iglesias Inactivas",
    noChurches: "No hay iglesias registradas",
    deleteConfirm: "Confirmar eliminacion",
    deleteWarning: "Esta accion eliminara permanentemente la iglesia y todos sus datos asociados.",
  },
  users: {
    title: "Gestion de Usuarios",
    addUser: "Agregar Usuario",
    editUser: "Editar Usuario",
    deleteUser: "Eliminar Usuario",
    userName: "Nombre del Usuario",
    userEmail: "Correo del Usuario",
    userRole: "Rol del Usuario",
    userStatus: "Estado del Usuario",
    active: "Activo",
    inactive: "Inactivo",
    lastLogin: "Ultimo Acceso",
    deleteConfirm: "Confirmar eliminacion",
    deleteWarning: "Esta accion eliminara permanentemente el usuario y revocara todos sus permisos.",
  },
  reports: {
    title:                    "Reportes",
    tabAttendance:            "Asistencia",
    tabContributions:         "Finanzas",
    filterPeriod:             "Período",
    filterChurch:             "Iglesia",
    filterServiceType:        "Tipo de servicio",
    filterContributionType:   "Tipo de contribución",
    filterAllChurches:        "Todas las iglesias",
    filterAllTypes:           "Todos los tipos",
    periodThisMonth:          "Este mes",
    periodThisQuarter:        "Este trimestre",
    periodThisYear:           "Este año",
    exportCsv:                "Exportar CSV",
    exporting:                "Exportando...",
    truncated:                "Mostrando 1000 filas. Exporta CSV para el set completo.",
    summaryTotalRecords:      "Total de registros",
    summaryTotalAttendance:   "Total de asistencia",
    summaryAveragePerService: "Promedio por servicio",
    summaryTotalAmount:       "Total recaudado",
    summaryBreakdownByType:   "Desglose por tipo",
    colService:               "Servicio",
    colServiceType:           "Tipo de servicio",
    colChurch:                "Iglesia",
    colDate:                  "Fecha",
    colAdults:                "Adultos",
    colYouth:                 "Jóvenes",
    colChildren:              "Niños",
    colTotal:                 "Total",
    colType:                  "Tipo",
    colAmount:                "Monto",
    colReportedBy:            "Reportado por",
    colSubmittedAt:           "Reportado el",
    loading:                  "Cargando reportes...",
    empty:                    "No hay registros para el período seleccionado.",
    error:                    "No se pudo cargar el reporte. Inténtalo de nuevo."
  },
  notifications: {
    title:           "Notificaciones",
    tabUnread:       "No leídas",
    tabAll:          "Todas",
    markAllRead:     "Marcar todas como leídas",
    viewAll:         "Ver todas",
    empty:           "No tienes notificaciones",
    markRead:        "Marcar leída",
    delete:          "Borrar",
    genericFallback: "Nueva notificación",
    filterAllKinds:  "Todos los tipos",
    relativeJustNow: "ahora mismo",
    relativeMinutes: "hace {{n}} min",
    relativeHours:   "hace {{n}} h",
    relativeDays:    "hace {{n}} d",
    kinds: {
      ministry_created: {
        title: "Nuevo ministerio: {{ministry_name}}",
        body:  "Pastor principal: {{lead_pastor_name}}"
      },
      service_request_created: {
        title: "{{requested_by_name}} solicitó programar un servicio",
        body:  "{{church_name}} · {{service_type}} · {{requested_for}}"
      },
      service_request_approved: {
        title: "Tu solicitud fue aprobada",
        body:  "{{service_type}} en {{church_name}} para {{requested_for}}, aprobada por {{reviewed_by_name}}"
      },
      service_request_rejected: {
        title: "Tu solicitud fue rechazada",
        body:  "{{service_type}} en {{church_name}} para {{requested_for}}, rechazada por {{reviewed_by_name}}"
      },
      attendance_report_submitted: {
        title: "Nuevo reporte de asistencia",
        body:  "{{reported_by_name}} reportó {{total}} asistentes en {{church_name}} ({{service_type}})"
      },
      contribution_recorded: {
        title: "{{reported_by_name}} registró una contribución",
        body:  "{{type_label}} de ${{amount}} en {{church_name}}"
      },
      user_created: {
        title: "Nuevo {{user_role_label}}: {{user_name}}",
        body:  "Asignado a {{church_name}}"
      },
      church_created: {
        title: "Nueva iglesia: {{church_name}}",
        body:  "Ciudad: {{city}}"
      }
    }
  },
  attendance: {
    title:                 "Reportar asistencia",
    pendingHeader:         "Servicios pendientes",
    pendingCountSingular:  "1 servicio pendiente",
    pendingCountPlural:    "{{n}} servicios pendientes",
    recentHeader:          "Mis reportes recientes",
    correctionHint:        "Para corregir un reporte, contacta al pastor principal.",
    emptyTitle:            "Estás al día",
    emptyBody:             "No hay servicios pendientes de reportar.",
    reportButton:          "Reportar",
    cancelButton:          "Cancelar",
    saveButton:            "Guardar reporte",
    saving:                "Guardando...",
    adults:                "Adultos",
    youth:                 "Jóvenes",
    children:              "Niños",
    total:                 "Total",
    notesLabel:            "Notas (opcional)",
    notesPlaceholder:      "Algo destacable del servicio...",
    savedToast:            "Reporte guardado",
    saveFailedToast:       "No se pudo guardar el reporte. Inténtalo de nuevo."
  },
  services: {
    title:                "Servicios y solicitudes",
    subtitlePastor:       "Resumen de tu iglesia",
    subtitleLeadPastor:   "Resumen del ministerio",
    pendingRequestsHeader: "Solicitudes pendientes ({{n}})",
    myRequestsHeader:     "Mis solicitudes",
    upcomingServicesHeader: "Próximos servicios",
    recentResolvedHeader: "Solicitudes resueltas recientes",
    newRequestButton:     "Solicitar servicio especial",
    scheduleServiceButton: "Programar servicio",
    approveButton:        "Aprobar",
    rejectButton:         "Rechazar",
    statusPending:        "Pendiente",
    statusApproved:       "Aprobada",
    statusRejected:       "Rechazada",
    statusPendingHelp:    "Esperando revisión",
    statusApprovedBy:     "Aprobada por {{reviewer}}, {{relative}}",
    statusRejectedBy:     "Rechazada por {{reviewer}}, {{relative}}",
    approveConfirmTitle:  "¿Aprobar este servicio?",
    approveConfirmBody:   "Se agendará automáticamente para el {{date}}.",
    rejectConfirmTitle:   "¿Rechazar este pedido?",
    rejectConfirmBody:    "El pastor podrá ver el rechazo en su lista.",
    emptyPending:         "No hay solicitudes pendientes de revisión.",
    emptyMyRequests:      "Aún no has hecho solicitudes.",
    emptyUpcoming:        "No hay servicios próximos agendados.",
    emptyRecent:          "No hay solicitudes resueltas recientes.",
    typeRegularSunday:    "Culto Dominical",
    typeBibleStudy:       "Estudio Bíblico",
    typeSpecialMeeting:   "Reunión Especial",
    typeConference:       "Conferencia",
    typeVigil:            "Vigilia",
    typeBaptisms:         "Bautismos",
    typeOther:            "Otros",
    formServiceType:      "Tipo de servicio",
    formChurch:           "Iglesia",
    formRequestedFor:     "Fecha y hora propuesta",
    formScheduledAt:      "Fecha y hora",
    formNotes:            "Notas (opcional)",
    formNotesPlaceholder: "Detalles adicionales...",
    formRequiredFutureDate: "La fecha debe ser futura",
    toastRequestCreated:  "Solicitud enviada",
    toastApproved:        "Solicitud aprobada y servicio agendado",
    toastRejected:        "Solicitud rechazada",
    toastServiceScheduled: "Servicio agendado",
    toastError:           "No se pudo completar la operación",
    reportedBadge:        "Reportado",
    notReportedBadge:     "Sin reporte",
    requestedForLabel:    "Para el {{date}}",
    requestedByLabel:     "{{name}} · {{church}}"
  },
  profile: {
    title: "Perfil",
    myProfile: "Mi Perfil",
    editProfile: "Editar Perfil",
    changePassword: "Cambiar Contrasena",
    currentPassword: "Contrasena Actual",
    newPassword: "Nueva Contrasena",
    confirmPassword: "Confirmar Contrasena",
  },
  settings: {
    title:                "Configuración",
    subtitle:             "Administra tu cuenta",
    profileTitle:         "Perfil",
    profileSubtitle:      "Actualiza tu información personal",
    securityTitle:        "Seguridad",
    securitySubtitle:     "Cambia tu contraseña",
    preferencesTitle:     "Preferencias",
    preferencesSubtitle:  "Ajustes de la aplicación",
    firstName:            "Nombre",
    lastName:             "Apellido",
    phone:                "Teléfono",
    email:                "Correo electrónico",
    currentPassword:      "Contraseña actual",
    newPassword:          "Nueva contraseña",
    confirmNewPassword:   "Confirmar nueva contraseña",
    language:             "Idioma",
    saveProfile:          "Guardar perfil",
    changePasswordBtn:    "Cambiar contraseña",
    savePreferences:      "Guardar preferencias",
    profileSaved:         "Perfil actualizado",
    passwordSaved:        "Contraseña actualizada",
    preferencesSaved:     "Preferencias actualizadas",
    saveFailed:           "No se pudo guardar. Intenta de nuevo.",
    currentPasswordWrong: "La contraseña actual es incorrecta",
    passwordTooShort:     "La contraseña debe tener al menos 8 caracteres",
    passwordsDoNotMatch:  "Las contraseñas no coinciden"
  },
  header: {
    search: "Buscar...",
    notifications: "Notificaciones",
    seeAllNotifications: "Ver todas las notificaciones",
    profile: "Perfil",
    settings: "Configuracion",
  },
  modals: {
    confirmDelete: "Confirmar Eliminacion",
    deleteWarning: "Esta accion no se puede deshacer.",
    cannotUndo: "Esta accion es permanente y no se puede revertir.",
    areYouSure: "Esta seguro de que desea continuar?",
  },
  errors: {
    required: "Este campo es requerido",
    invalidEmail: "Correo electronico invalido",
    minLength: "Minimo de caracteres no alcanzado",
    maxLength: "Maximo de caracteres excedido",
    passwordMismatch: "Las contrasenas no coinciden",
    futureDate: "No se permiten fechas futuras",
    serverError: "Error del servidor. Intente nuevamente.",
  },
  time: {
    today: "Hoy",
    yesterday: "Ayer",
    daysAgo: "hace {count} dias",
    hoursAgo: "hace {count} horas",
    minutesAgo: "hace {count} minutos",
    justNow: "Ahora mismo",
  },
}

const en: TranslationKeys = {
  common: {
    search: "Search",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    add: "Add",
    view: "View",
    close: "Close",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
    loading: "Loading...",
    success: "Operation successful",
    error: "Error",
    warning: "Warning",
    yes: "Yes",
    no: "No",
    actions: "Actions",
    status: "Status",
    date: "Date",
    time: "Time",
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    description: "Description",
    notes: "Notes",
    total: "Total",
    amount: "Amount",
    selectDate: "Select date",
    noResults: "No results",
    seeAll: "See all",
    errorRetry: "Something went wrong. Try again.",
    empty: "No data",
    retry: "Retry",
  },
  contributionTypes: {
    Tithe: "Tithes",
    Offering: "Offerings",
    Donation: "Donations",
    Firstfruit: "Firstfruits",
    Covenant: "Covenants",
  },
  auth: {
    login: "Log In",
    logout: "Log Out",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    firstName: "First name",
    lastName: "Last name",
    ministryName: "Ministry name",
    country: "Country",
    city: "City",
    phoneOptional: "Phone (optional)",
    emailPlaceholder: "email@church.com",
    passwordPlaceholder: "********",
    phonePlaceholder: "+1 555 000 0000",
    languageSpanish: "Spanish",
    languageEnglish: "English",
    forgotPassword: "Forgot password",
    rememberMe: "Remember me",
    signIn: "Sign In",
    invalidCredentials: "Invalid credentials. Please try again.",
    sessionStartFailed: "Could not start your session. Please try again.",
    signOut: "Sign Out",
    welcome: "Welcome back",
    loginTitle: "Digital Church",
    loginSubtitle: "Integral Management System",
  },
  roles: {
    superadmin: "Super Admin",
    superadminSubtitle: "Full Control",
    leadPastor: "Lead Pastor",
    leadPastorSubtitle: "General Management",
    pastor: "Pastor",
    pastorSubtitle: "My Church",
    assistant: "Assistant",
    assistantSubtitle: "Church Reports",
  },
  nav: {
    dashboard: "Dashboard",
    ministries: "Ministries",
    churches: "Churches",
    users: "Users",
    reports: "Reports",
    notifications: "Notifications",
    settings: "Settings",
    pastors: "Pastors",
    services: "Services",
    finances: "Finances",
    assistants: "Assistants",
    help: "Help",
    myChurches: "My Churches",
    attendance: "Attendance",
    treasury: "Treasury",
  },
  dashboard: {
    title: "Dashboard",
    welcome: "Welcome",
    overview: "Overview",
    totalChurches: "Total Churches",
    totalUsers: "Total Users",
    totalMembers: "Total Members",
    totalIncome: "Total Income",
    recentActivity: "Recent Activity",
    quickActions: "Quick Actions",
    weeklyAttendance: "Weekly Attendance",
    monthlyIncome: "Monthly Income",
    pendingReports: "Pending Reports",
    completedReports: "Completed Reports",
  },
  dashboards: {
    leadPastor: {
      title:                    "Ministry overview",
      subtitle:                 "Snapshot of your churches",
      churches:                 "Churches",
      pastors:                  "Pastors",
      servicesThisMonth:        "Services this month",
      totalAttendance:          "Total attendance",
      totalContributions:       "Total contributions",
      attendanceTitle:          "Attendance (recent months)",
      attendanceSubtitle:       "Monthly totals",
      contributionsTitle:       "Contributions this month",
      contributionsSubtitle:    "By type",
      churchesTableTitle:       "Churches in this ministry",
      colChurchName:            "Church",
      colPastor:                "Pastor",
      colMembers:               "Members",
      emptyChurches:            "No churches yet."
    },
    pastor: {
      title:                    "Your church overview",
      subtitle:                 "Snapshot",
      services:                 "Services",
      pendingAttendance:        "Pending attendance",
      pendingContributions:     "Pending contributions",
      assistants:               "Assistants",
      attendanceTitle:          "Attendance (recent months)",
      attendanceSubtitle:       "Monthly totals",
      contributionsTitle:       "Contributions this month",
      contributionsSubtitle:    "By type",
      upcomingHeader:           "Upcoming services",
      emptyUpcoming:            "No upcoming services."
    },
    assistant: {
      title:                    "Your activity overview",
      subtitle:                 "Pending items and requests",
      pendingRequests:          "Pending requests",
      submittedReports:         "Submitted reports",
      pendingServicesHeader:    "Services awaiting report",
      myRequestsHeader:         "My recent requests",
      emptyPendingServices:     "No services awaiting report.",
      emptyMyRequests:          "You haven't submitted requests recently."
    }
  },
  superadminDashboard: {
    title: "Super Admin Dashboard",
    userName: "Primary Admin",
    userRole: "Super Administrator",
    totalChurches: "Total Churches",
    activePastors: "Active Pastors",
    servicesThisMonth: "Services this Month",
    totalIncome: "Total Income",
    generalAttendance: "General Attendance",
    generalAttendanceSubtitle: "Monthly average attendance",
    incomeDistribution: "Income Distribution",
    incomeDistributionSubtitle: "By contribution type",
    newChurch: "New Church",
    filter: "Filter",
    export: "Export",
    registeredChurches: "Registered Churches",
    recentActivity: "Recent Activity",
    activity1Action: "New church created",
    activity1Details: "New Life Church in Queretaro",
    activity1Time: "2 hours ago",
    activity2Action: "Pastor assigned",
    activity2Details: "Juan Lopez assigned to South Church",
    activity2Time: "5 hours ago",
    activity3Action: "Report generated",
    activity3Details: "Monthly attendance report",
    activity3Time: "1 day ago",
    activity4Action: "Service registered",
    activity4Details: "Sunday service at Central Church",
    activity4Time: "2 days ago",
    colName: "Name",
    colLeadPastor: "Lead Pastor",
    colMembers: "Members",
    colCity: "City",
    colStatus: "Status",
    statusActive: "Active",
    statusPending: "Pending",
    monthJan: "Jan",
    monthFeb: "Feb",
    monthMar: "Mar",
    monthApr: "Apr",
    monthMay: "May",
    monthJun: "Jun",
    monthJul: "Jul",
  },
  churches: {
    title: "Church Management",
    addChurch: "Add Church",
    editChurch: "Edit Church",
    deleteChurch: "Delete Church",
    churchName: "Church Name",
    pastor: "Pastor",
    members: "Members",
    location: "Location",
    founded: "Founded",
    activeChurches: "Active Churches",
    inactiveChurches: "Inactive Churches",
    noChurches: "No churches registered",
    deleteConfirm: "Confirm deletion",
    deleteWarning: "This action will permanently delete the church and all its associated data.",
  },
  users: {
    title: "User Management",
    addUser: "Add User",
    editUser: "Edit User",
    deleteUser: "Delete User",
    userName: "User Name",
    userEmail: "User Email",
    userRole: "User Role",
    userStatus: "User Status",
    active: "Active",
    inactive: "Inactive",
    lastLogin: "Last Login",
    deleteConfirm: "Confirm deletion",
    deleteWarning: "This action will permanently delete the user and revoke all their permissions.",
  },
  reports: {
    title:                    "Reports",
    tabAttendance:            "Attendance",
    tabContributions:         "Finance",
    filterPeriod:             "Period",
    filterChurch:             "Church",
    filterServiceType:        "Service type",
    filterContributionType:   "Contribution type",
    filterAllChurches:        "All churches",
    filterAllTypes:           "All types",
    periodThisMonth:          "This month",
    periodThisQuarter:        "This quarter",
    periodThisYear:           "This year",
    exportCsv:                "Export CSV",
    exporting:                "Exporting...",
    truncated:                "Showing 1000 rows. Export CSV for the full dataset.",
    summaryTotalRecords:      "Total records",
    summaryTotalAttendance:   "Total attendance",
    summaryAveragePerService: "Average per service",
    summaryTotalAmount:       "Total collected",
    summaryBreakdownByType:   "Breakdown by type",
    colService:               "Service",
    colServiceType:           "Service type",
    colChurch:                "Church",
    colDate:                  "Date",
    colAdults:                "Adults",
    colYouth:                 "Youth",
    colChildren:              "Children",
    colTotal:                 "Total",
    colType:                  "Type",
    colAmount:                "Amount",
    colReportedBy:            "Reported by",
    colSubmittedAt:           "Submitted at",
    loading:                  "Loading reports...",
    empty:                    "No records for the selected period.",
    error:                    "Could not load the report. Please try again."
  },
  notifications: {
    title:           "Notifications",
    tabUnread:       "Unread",
    tabAll:          "All",
    markAllRead:     "Mark all as read",
    viewAll:         "View all",
    empty:           "No notifications",
    markRead:        "Mark read",
    delete:          "Delete",
    genericFallback: "New notification",
    filterAllKinds:  "All kinds",
    relativeJustNow: "just now",
    relativeMinutes: "{{n}}m ago",
    relativeHours:   "{{n}}h ago",
    relativeDays:    "{{n}}d ago",
    kinds: {
      ministry_created: {
        title: "New ministry: {{ministry_name}}",
        body:  "Lead pastor: {{lead_pastor_name}}"
      },
      service_request_created: {
        title: "{{requested_by_name}} requested a service",
        body:  "{{church_name}} · {{service_type}} · {{requested_for}}"
      },
      service_request_approved: {
        title: "Your request was approved",
        body:  "{{service_type}} at {{church_name}} for {{requested_for}}, approved by {{reviewed_by_name}}"
      },
      service_request_rejected: {
        title: "Your request was rejected",
        body:  "{{service_type}} at {{church_name}} for {{requested_for}}, rejected by {{reviewed_by_name}}"
      },
      attendance_report_submitted: {
        title: "New attendance report",
        body:  "{{reported_by_name}} reported {{total}} attendees at {{church_name}} ({{service_type}})"
      },
      contribution_recorded: {
        title: "{{reported_by_name}} recorded a contribution",
        body:  "{{type_label}} of ${{amount}} at {{church_name}}"
      },
      user_created: {
        title: "New {{user_role_label}}: {{user_name}}",
        body:  "Assigned to {{church_name}}"
      },
      church_created: {
        title: "New church: {{church_name}}",
        body:  "City: {{city}}"
      }
    }
  },
  attendance: {
    title:                 "Submit attendance",
    pendingHeader:         "Pending services",
    pendingCountSingular:  "1 pending service",
    pendingCountPlural:    "{{n}} pending services",
    recentHeader:          "My recent reports",
    correctionHint:        "To correct a report, contact the lead pastor.",
    emptyTitle:            "You're all caught up",
    emptyBody:             "No services pending to be reported.",
    reportButton:          "Report",
    cancelButton:          "Cancel",
    saveButton:            "Save report",
    saving:                "Saving...",
    adults:                "Adults",
    youth:                 "Youth",
    children:              "Children",
    total:                 "Total",
    notesLabel:            "Notes (optional)",
    notesPlaceholder:      "Anything notable about the service...",
    savedToast:            "Report saved",
    saveFailedToast:       "Couldn't save the report. Try again."
  },
  services: {
    title:                "Services and requests",
    subtitlePastor:       "Your church overview",
    subtitleLeadPastor:   "Your ministry overview",
    pendingRequestsHeader: "Pending requests ({{n}})",
    myRequestsHeader:     "My requests",
    upcomingServicesHeader: "Upcoming services",
    recentResolvedHeader: "Recently resolved requests",
    newRequestButton:     "Request special service",
    scheduleServiceButton: "Schedule service",
    approveButton:        "Approve",
    rejectButton:         "Reject",
    statusPending:        "Pending",
    statusApproved:       "Approved",
    statusRejected:       "Rejected",
    statusPendingHelp:    "Awaiting review",
    statusApprovedBy:     "Approved by {{reviewer}}, {{relative}}",
    statusRejectedBy:     "Rejected by {{reviewer}}, {{relative}}",
    approveConfirmTitle:  "Approve this service?",
    approveConfirmBody:   "It will be scheduled automatically for {{date}}.",
    rejectConfirmTitle:   "Reject this request?",
    rejectConfirmBody:    "The pastor will see the rejection in their list.",
    emptyPending:         "No pending requests to review.",
    emptyMyRequests:      "You haven't made any requests yet.",
    emptyUpcoming:        "No upcoming services scheduled.",
    emptyRecent:          "No recently resolved requests.",
    typeRegularSunday:    "Sunday Service",
    typeBibleStudy:       "Bible Study",
    typeSpecialMeeting:   "Special Meeting",
    typeConference:       "Conference",
    typeVigil:            "Vigil",
    typeBaptisms:         "Baptisms",
    typeOther:            "Other",
    formServiceType:      "Service type",
    formChurch:           "Church",
    formRequestedFor:     "Proposed date and time",
    formScheduledAt:      "Date and time",
    formNotes:            "Notes (optional)",
    formNotesPlaceholder: "Additional details...",
    formRequiredFutureDate: "Date must be in the future",
    toastRequestCreated:  "Request sent",
    toastApproved:        "Request approved and service scheduled",
    toastRejected:        "Request rejected",
    toastServiceScheduled: "Service scheduled",
    toastError:           "Could not complete the operation",
    reportedBadge:        "Reported",
    notReportedBadge:     "Not reported",
    requestedForLabel:    "For {{date}}",
    requestedByLabel:     "{{name}} · {{church}}"
  },
  profile: {
    title: "Profile",
    myProfile: "My Profile",
    editProfile: "Edit Profile",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
  },
  settings: {
    title:                "Settings",
    subtitle:             "Manage your account",
    profileTitle:         "Profile",
    profileSubtitle:      "Update your personal information",
    securityTitle:        "Security",
    securitySubtitle:     "Change your password",
    preferencesTitle:     "Preferences",
    preferencesSubtitle:  "Application settings",
    firstName:            "First name",
    lastName:             "Last name",
    phone:                "Phone",
    email:                "Email",
    currentPassword:      "Current password",
    newPassword:          "New password",
    confirmNewPassword:   "Confirm new password",
    language:             "Language",
    saveProfile:          "Save profile",
    changePasswordBtn:    "Change password",
    savePreferences:      "Save preferences",
    profileSaved:         "Profile updated",
    passwordSaved:        "Password updated",
    preferencesSaved:     "Preferences updated",
    saveFailed:           "Couldn't save. Please try again.",
    currentPasswordWrong: "Current password is incorrect",
    passwordTooShort:     "Password must be at least 8 characters",
    passwordsDoNotMatch:  "Passwords do not match"
  },
  header: {
    search: "Search...",
    notifications: "Notifications",
    seeAllNotifications: "See all notifications",
    profile: "Profile",
    settings: "Settings",
  },
  modals: {
    confirmDelete: "Confirm Deletion",
    deleteWarning: "This action cannot be undone.",
    cannotUndo: "This action is permanent and cannot be reversed.",
    areYouSure: "Are you sure you want to continue?",
  },
  errors: {
    required: "This field is required",
    invalidEmail: "Invalid email address",
    minLength: "Minimum character count not met",
    maxLength: "Maximum character count exceeded",
    passwordMismatch: "Passwords do not match",
    futureDate: "Future dates are not allowed",
    serverError: "Server error. Please try again.",
  },
  time: {
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "{count} days ago",
    hoursAgo: "{count} hours ago",
    minutesAgo: "{count} minutes ago",
    justNow: "Just now",
  },
}

export const translations: Record<Locale, TranslationKeys> = { es, en }
