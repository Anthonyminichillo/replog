import PropTypes from 'prop-types';
import './ProgressChart.css';

const WIDTH = 900;
const HEIGHT = 320;
const PADDING = { top: 20, right: 20, bottom: 40, left: 56 };

function formatShortDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
}

function ProgressChart({ points, label, unit }) {
  const values = points.map((point) => point.value);
  const times = points.map((point) => new Date(point.date).getTime());

  let min = Math.min(...values);
  let max = Math.max(...values);
  // A flat line would divide by zero below, so give it some room
  if (min === max) {
    min -= 5;
    max += 5;
  }
  const first = times[0];
  const last = times[times.length - 1];

  const chartWidth = WIDTH - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;

  // Turn a date into an x position and a value into a y position
  function x(time) {
    const share = last === first ? 0.5 : (time - first) / (last - first);
    return PADDING.left + share * chartWidth;
  }
  function y(value) {
    return PADDING.top + (1 - (value - min) / (max - min)) * chartHeight;
  }

  const ticks = [min, (min + max) / 2, max];
  const line = points
    .map((point, index) => `${x(times[index])},${y(point.value)}`)
    .join(' ');

  return (
    <figure className="progress-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${label} went from ${values[0]} to ${values[values.length - 1]} ${unit}`}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="currentColor"
              strokeOpacity="0.15"
            />
            <text
              x={PADDING.left - 8}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="12"
              fill="currentColor"
            >
              {Math.round(tick)}
            </text>
          </g>
        ))}

        <text
          x={PADDING.left}
          y={HEIGHT - 12}
          fontSize="12"
          fill="currentColor"
        >
          {formatShortDate(points[0].date)}
        </text>
        <text
          x={WIDTH - PADDING.right}
          y={HEIGHT - 12}
          textAnchor="end"
          fontSize="12"
          fill="currentColor"
        >
          {formatShortDate(points[points.length - 1].date)}
        </text>

        <polyline
          points={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />

        {points.map((point, index) => (
          <circle
            key={`${point.date}-${index}`}
            cx={x(times[index])}
            cy={y(point.value)}
            r="3"
            fill="currentColor"
          >
            <title>{`${formatShortDate(point.date)}: ${point.value} ${unit}`}</title>
          </circle>
        ))}
      </svg>
      <figcaption>
        {label} ({unit}) over time. Hover over a point to see its value.
      </figcaption>
    </figure>
  );
}

ProgressChart.propTypes = {
  points: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  label: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
};

export default ProgressChart;