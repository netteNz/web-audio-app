const Icon = ({ name, size = 24, fill = false, className = '' }) => (
  <span
    className={`material-symbols-rounded leading-none select-none ${className}`}
    style={{
      fontSize: size,
      fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${Math.min(Math.max(size, 20), 48)}`,
    }}
  >
    {name}
  </span>
);

export default Icon;
