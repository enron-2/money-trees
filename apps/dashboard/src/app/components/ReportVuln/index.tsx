import React, { useEffect, useState } from 'react';
// import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  //   Input,
  //   Box,
  Dialog,
  //   MenuItem,
  //   Step,
  //   Stepper,
  //   StepLabel,
  //   StepContent,
  //   Button,
  //   Typography,
  //   List,
  //   ListItem,
  //   DialogActions,
  //   DialogContent,
  //   CircularProgress,
  //   DialogTitle,
  //   StepIcon,
} from '@mui/material';
// import { getAllPackages } from '../../services/packages';
// import axios from 'axios';
// import Select, { SelectChangeEvent } from '@mui/material/Select';
// import SeverityIcon from '../Global/SeverityIcon';
// import { StepOne } from './StepOne';
// import { StepTwo } from './StepTwo';
// import { StepThree } from './StepThree';
// import { CompletedStep } from './CompletedStep';

// const baseUrl = process.env.REACT_APP_API_HOST;

// interface IFormInput {
//   cve: string;
//   title: string;
//   description: string;
//   severity: number;
//   packageIds: [value: string];
// }

const ReportVulnDialog = (props: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // const { control, handleSubmit } = useForm<IFormInput>();

  // const [packageData, setPackageData] = useState<any[]>([]);

  // const [packageList, setPackageList] = useState<string[]>([]);

  // const [isNewVuln, setIsNewVuln] = useState(true);

  // const steps = ['Step 1', 'Step 2', 'Step 3'];

  // const [loading, setLoading] = useState(true);

  // const [activeStep, setActiveStep] = React.useState(0);

  // const [formData, setFormData] = useState<any>({});

  // const handleChange = (event: SelectChangeEvent<typeof packageList>) => {
  //   const {
  //     target: { value },
  //   } = event;
  //   setPackageList(typeof value === 'string' ? value.split(',') : value);
  // };

  // useEffect(() => {
  //   if (props.open) {
  //     getAllPackages()
  //       .then((response: any) => {
  //         setPackageData(response);
  //         setLoading(false);
  //       })
  //       .catch((err: any) => {
  //         console.log(err);
  //         throw new Error('Unable to get package data.');
  //       });
  //   }
  // }, [props.open]);

  const handleClose = () => {
    //   setActiveStep(0);
    props.setOpen(false);
  };

  // const handleNext = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep + 1);
  // };

  // const handleBack = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep - 1);
  // };

  // const getStepContent = (step: number) => {
  //   switch (step) {
  //     case 0:
  //       return (
  //         <StepOne setIsNewVuln={setIsNewVuln} setActiveStep={setActiveStep} />
  //       );
  //     case 1:
  //       return <StepTwo isNewVuln={isNewVuln} setFormData={setFormData} />;
  //     case 2:
  //       return <StepThree isNewVuln={isNewVuln} setFormData={setFormData} />;
  //     case 3:
  //       return <CompletedStep isNewVuln={isNewVuln} />;
  //   }
  // };

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
      {/* <DialogTitle>Report Vulnerability</DialogTitle>
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
        {console.log(formData)}
        <Button onClick={handleNext}> Next </Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default ReportVulnDialog;
