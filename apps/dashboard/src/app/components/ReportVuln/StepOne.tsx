import React from 'react';

import { Typography, Button } from '@mui/material';

export const StepOne = (props: {
  setIsNewVuln: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}) => {
  // const handleClick = () => {};

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
      }}
    >
      <Button
        onClick={() => {
          props.setIsNewVuln(true);
          props.setActiveStep(1);
        }}
      >
        New Vuln
      </Button>
      <Button
        onClick={() => {
          props.setIsNewVuln(false);
          props.setActiveStep(1);
        }}
      >
        Exisitng Vuln
      </Button>
    </div>
  );
};
