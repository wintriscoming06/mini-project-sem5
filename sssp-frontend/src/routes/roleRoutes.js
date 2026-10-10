export const ROLE_ROUTES = {
  PLAYER: ['/dashboard', '/tournaments', '/my-applications', '/player/stats', '/profile'],
  ORGANIZER: ['/dashboard', '/my-tournaments', '/tournaments/create', '/matches'],
  SCOUT: ['/dashboard', '/search', '/compare', '/shortlist', '/alerts', '/profile'],
  ADMIN: ['/dashboard', '/users', '/corrections', '/audit-log', '/gpi-config']
};
export default ROLE_ROUTES;
