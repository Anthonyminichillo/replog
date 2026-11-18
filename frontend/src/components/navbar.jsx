import PropTypes from 'prop-types';

const PAGES = [
  { id: 'exercises', label: 'Exercises' },
  { id: 'history', label: 'Workout History' },
];

function NavBar({ currentPage, onNavigate }) {
  return (
    <nav className="nav-bar" aria-label="Main navigation">
      {PAGES.map((page) => (
        <button
          key={page.id}
          type="button"
          className={
            currentPage === page.id ? 'nav-button active' : 'nav-button'
          }
          aria-current={currentPage === page.id ? 'page' : undefined}
          onClick={() => onNavigate(page.id)}
        >
          {page.label}
        </button>
      ))}
    </nav>
  );
}

NavBar.propTypes = {
  currentPage: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default NavBar;