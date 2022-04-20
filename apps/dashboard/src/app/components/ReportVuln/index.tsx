import React, { useState } from 'react';
import {
  Dialog,
  Box,
  Step,
  Stepper,
  StepLabel,
  Button,
  Typography,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { StepOne } from './StepOne';
import { StepTwo } from './StepTwo';
import { StepThree } from './StepThree';
import { CompletedStep } from './CompletedStep';
import CloseIcon from '@mui/icons-material/Close';

import { environment } from '../../../environments/environment';

const ReportVulnDialog = (props: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [isNewVuln, setIsNewVuln] = useState(true);

  const steps = ['Step 1', 'Step 2', 'Step 3'];

  const [activeStep, setActiveStep] = React.useState(0);

  const [formData, setFormData] = useState<any>({});

  const handleClose = () => {
    setActiveStep(0);
    props.setOpen(false);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <StepOne setIsNewVuln={setIsNewVuln} setActiveStep={setActiveStep} />
        );
      case 1:
        return (
          <StepTwo
            isNewVuln={isNewVuln}
            setFormData={setFormData}
            formData={formData}
          />
        );
      case 2:
        return (
          <StepThree
            isNewVuln={isNewVuln}
            setFormData={setFormData}
            formData={formData}
          />
        );
      case 3:
        return <CompletedStep isNewVuln={isNewVuln} formData={formData} />;
    }
    return <CompletedStep isNewVuln={isNewVuln} formData={formData} />;
  };

  const getBackDisabled = () => {
    switch (activeStep) {
      case 0:
        return true;
      case 1:
        return false;
      case 2:
        return false;
      case 3:
        return false;
    }
    return true;
  };

  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root': {
          minHeight: '80%',
          maxHeight: '80%',
        },
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Box flexGrow={1}> Report Vulnerability </Box>
          <Box>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((stepz, index) => (
            <Step key={index}>
              <StepLabel> {stepz} </StepLabel>
            </Step>
          ))}
        </Stepper>
        <div> {getStepContent(activeStep)} </div>
      </DialogContent>
      <DialogActions>
        <div style={{ flex: '1 0 0' }}>
          {activeStep !== 0 && activeStep !== steps.length ? (
            <Button disabled={getBackDisabled()} onClick={handleBack}>
              Back
            </Button>
          ) : null}
        </div>
        {activeStep !== 0 && activeStep !== steps.length ? (
          <Button onClick={handleNext}>Next</Button>
        ) : null}
        {activeStep === steps.length ? (
          <Button onClick={handleReset}>Reset</Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

export default ReportVulnDialog;
