document.addEventListener('DOMContentLoaded', function() {
  const themeButtons = document.querySelectorAll('.theme-button');
  const themeStylesheet = document.getElementById('css-theme');

  function setActiveTheme(themeName) {
    themeStylesheet.href = `styles/${themeName}.css`;

    themeButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.theme === themeName);
    });

    localStorage.setItem('preferredTheme', themeName);
  }

  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const themeName = button.dataset.theme;
      setActiveTheme(themeName);
    });
  });

  const savedTheme = localStorage.getItem('preferredTheme');
  if (savedTheme) {
    setActiveTheme(savedTheme);
  }
});
