import React from 'react';

import { Typography, Button, Box } from '@mui/material';

export const StepOne = (props: {
  setIsNewVuln: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}) => {
  // const handleClick = () => {};

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button
        sx={{ mt: 15, ml: 5, mr: 5, mb: 5, p: 5 }}
        onClick={() => {
          props.setIsNewVuln(true);
          props.setActiveStep(1);
        }}
        variant="outlined"
        size="large"
      >
        Report a new vulnerability
      </Button>
      <Button
        sx={{ m: 10, p: 5 }}
        onClick={() => {
          props.setIsNewVuln(false);
          props.setActiveStep(1);
        }}
        variant="outlined"
        size="large"
      >
        Add a vulnerability to an existing package
      </Button>
    </Box>
  );
};
