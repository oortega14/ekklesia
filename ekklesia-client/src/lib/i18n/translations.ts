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
    churches: string
    users: string
    roles: string
    reports: string
    statistics: string
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
    attendanceReport: string
    treasuryReport: string
    submitReport: string
    reportDate: string
    reportType: string
    reportStatus: string
    pending: string
    approved: string
    rejected: string
    submitted: string
    adults: string
    youth: string
    children: string
    visitors: string
    totalAttendance: string
    tithes: string
    offerings: string
    donations: string
    specialOfferings: string
    totalAmount: string
    selectService: string
    noFutureReports: string
    todayOnly: string
    pastDatesAllowed: string
    uploadSuccess: string
    uploadError: string
  }
  services: {
    title: string
    addService: string
    editService: string
    deleteService: string
    serviceName: string
    serviceDate: string
    serviceTime: string
    serviceType: string
    sunday: string
    wednesday: string
    friday: string
    special: string
    youth: string
    prayer: string
    deleteConfirm: string
  }
  statistics: {
    title: string
    attendanceTrend: string
    incomeTrend: string
    memberGrowth: string
    serviceComparison: string
    topChurches: string
    monthlyOverview: string
    yearlyOverview: string
    average: string
    growth: string
    decline: string
  }
  notifications: {
    title: string
    markAllRead: string
    noNotifications: string
    newChurch: string
    newReport: string
    newPastor: string
    reportApproved: string
    reportRejected: string
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
    churches: "Iglesias",
    users: "Usuarios",
    roles: "Roles",
    reports: "Reportes",
    statistics: "Estadisticas",
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
    title: "Centro de Reportes",
    attendanceReport: "Reporte de Asistencia",
    treasuryReport: "Reporte de Tesoreria",
    submitReport: "Enviar Reporte",
    reportDate: "Fecha del Reporte",
    reportType: "Tipo de Reporte",
    reportStatus: "Estado del Reporte",
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
    submitted: "Enviado",
    adults: "Adultos",
    youth: "Jovenes",
    children: "Ninos",
    visitors: "Visitantes",
    totalAttendance: "Asistencia Total",
    tithes: "Diezmos",
    offerings: "Ofrendas",
    donations: "Donaciones",
    specialOfferings: "Ofrendas Especiales",
    totalAmount: "Monto Total",
    selectService: "Seleccionar Servicio",
    noFutureReports: "No se pueden crear reportes para fechas futuras",
    todayOnly: "Solo puede reportar para hoy o fechas anteriores",
    pastDatesAllowed: "Fechas pasadas permitidas",
    uploadSuccess: "Reporte enviado exitosamente",
    uploadError: "Error al enviar el reporte",
  },
  services: {
    title: "Gestion de Servicios",
    addService: "Agregar Servicio",
    editService: "Editar Servicio",
    deleteService: "Eliminar Servicio",
    serviceName: "Nombre del Servicio",
    serviceDate: "Fecha del Servicio",
    serviceTime: "Hora del Servicio",
    serviceType: "Tipo de Servicio",
    sunday: "Domingo",
    wednesday: "Miercoles",
    friday: "Viernes",
    special: "Especial",
    youth: "Jovenes",
    prayer: "Oracion",
    deleteConfirm: "Esta seguro de eliminar este servicio?",
  },
  statistics: {
    title: "Centro de Estadisticas",
    attendanceTrend: "Tendencia de Asistencia",
    incomeTrend: "Tendencia de Ingresos",
    memberGrowth: "Crecimiento de Miembros",
    serviceComparison: "Comparacion de Servicios",
    topChurches: "Iglesias Destacadas",
    monthlyOverview: "Resumen Mensual",
    yearlyOverview: "Resumen Anual",
    average: "Promedio",
    growth: "Crecimiento",
    decline: "Decrecimiento",
  },
  notifications: {
    title: "Notificaciones",
    markAllRead: "Marcar todo como leido",
    noNotifications: "No hay notificaciones",
    newChurch: "Nueva iglesia registrada",
    newReport: "Nuevo reporte enviado",
    newPastor: "Nuevo pastor asignado",
    reportApproved: "Reporte aprobado",
    reportRejected: "Reporte rechazado",
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
    churches: "Churches",
    users: "Users",
    roles: "Roles",
    reports: "Reports",
    statistics: "Statistics",
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
    title: "Reports Center",
    attendanceReport: "Attendance Report",
    treasuryReport: "Treasury Report",
    submitReport: "Submit Report",
    reportDate: "Report Date",
    reportType: "Report Type",
    reportStatus: "Report Status",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    submitted: "Submitted",
    adults: "Adults",
    youth: "Youth",
    children: "Children",
    visitors: "Visitors",
    totalAttendance: "Total Attendance",
    tithes: "Tithes",
    offerings: "Offerings",
    donations: "Donations",
    specialOfferings: "Special Offerings",
    totalAmount: "Total Amount",
    selectService: "Select Service",
    noFutureReports: "Cannot create reports for future dates",
    todayOnly: "You can only report for today or past dates",
    pastDatesAllowed: "Past dates allowed",
    uploadSuccess: "Report submitted successfully",
    uploadError: "Error submitting report",
  },
  services: {
    title: "Service Management",
    addService: "Add Service",
    editService: "Edit Service",
    deleteService: "Delete Service",
    serviceName: "Service Name",
    serviceDate: "Service Date",
    serviceTime: "Service Time",
    serviceType: "Service Type",
    sunday: "Sunday",
    wednesday: "Wednesday",
    friday: "Friday",
    special: "Special",
    youth: "Youth",
    prayer: "Prayer",
    deleteConfirm: "Are you sure you want to delete this service?",
  },
  statistics: {
    title: "Statistics Center",
    attendanceTrend: "Attendance Trend",
    incomeTrend: "Income Trend",
    memberGrowth: "Member Growth",
    serviceComparison: "Service Comparison",
    topChurches: "Top Churches",
    monthlyOverview: "Monthly Overview",
    yearlyOverview: "Yearly Overview",
    average: "Average",
    growth: "Growth",
    decline: "Decline",
  },
  notifications: {
    title: "Notifications",
    markAllRead: "Mark all as read",
    noNotifications: "No notifications",
    newChurch: "New church registered",
    newReport: "New report submitted",
    newPastor: "New pastor assigned",
    reportApproved: "Report approved",
    reportRejected: "Report rejected",
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
