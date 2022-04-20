import {
  ErrorOutlineOutlined,
  GppGoodOutlined,
  ReportGmailerrorredOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';

const SeverityIcon = (props: { severityLevel: number }) => {
  return (
    <>
      {props.severityLevel >= 3 ? <ErrorOutlineOutlined color="error" /> : null}
      {props.severityLevel === 2 ? (
        <WarningAmberOutlined color="warning" />
      ) : null}
      {props.severityLevel === 1 ? (
        <ReportGmailerrorredOutlined color="info" />
      ) : null}
      {props.severityLevel === 0 || !props.severityLevel ? (
        <GppGoodOutlined color="success" />
      ) : null}
    </>
  );
};

export default SeverityIcon;
