export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('clinic-theme');
    // Cinematic look is dark-first: visitors with no saved choice start in dark mode.
    var theme = stored || 'dark';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;
