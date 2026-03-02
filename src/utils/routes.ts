export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password',
  RESET_PASSWORD_EMAIL: '/reset-password-email',
  FORMS: '/forms',
  ADD_FORM: '/form/create',
  FORM_DETAIL: '/form/:id',
  AGENTS: '/agents',
  FARMERS: '/farmers',
  FARMER_DETAIL: '/farmers/:id',
  CREDIT_SCORE_CALCULATORS: '/credit-score-calculators',
  ADD_AGENT: '/agent/create',
  ADMINS: '/admins',
  ADD_ADMIN: '/admin/create',
  MAPS: '/maps',
  RESPONSES: '/form/responses',
  RESPONSE_DETAIL: '/form/responses/:id',
} as const;

export const ROUTES_GROUP = {
  FORMS: [ROUTES.FORMS, ROUTES.ADD_FORM, ROUTES.RESPONSE_DETAIL, ROUTES.FORM_DETAIL],
  AGENTS: [ROUTES.AGENTS, ROUTES.ADD_AGENT],
  FARMERS: [ROUTES.FARMERS, ROUTES.FARMER_DETAIL],
  CREDIT_SCORE_CALCULATORS: [ROUTES.CREDIT_SCORE_CALCULATORS],
  ADMINS: [ROUTES.ADMINS, ROUTES.ADD_ADMIN],
} as const;

export default ROUTES;
