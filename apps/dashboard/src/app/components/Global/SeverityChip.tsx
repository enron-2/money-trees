import { Chip } from '@mui/material';

const SeverityChip = (props: { label: string; severityLevel: number }) => {
  return (
    <div>
      {props.severityLevel >= 3 ? (
        <Chip
          label={props.label}
          color="error"
          variant="outlined"
          size="small"
        />
      ) : null}
      {props.severityLevel === 2 ? (
        <Chip
          label={props.label}
          color="warning"
          variant="outlined"
          size="small"
        />
      ) : null}
      {props.severityLevel === 1 ? (
        <Chip
          label={props.label}
          color="info"
          variant="outlined"
          size="small"
        />
      ) : null}
      {props.severityLevel === 0 || !props.severityLevel ? (
        <Chip
          label={props.label}
          color="success"
          variant="outlined"
          size="small"
        />
      ) : null}
    </div>
  );
};

export default SeverityChip;
