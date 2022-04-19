// import React, { useEffect, useState } from "react";
// import { useForm, Controller, SubmitHandler } from "react-hook-form";
// import { Input, Box, Dialog, MenuItem, Step, Stepper, StepLabel, StepContent, Button, Typography, List, ListItem } from "@mui/material";
// import { getAllPackages } from "../../services/packages";
// import axios from "axios";
// import Select, { SelectChangeEvent } from "@mui/material/Select";
// import { getVulns } from "../../services/vulnerabilities";

// const baseUrl = process.env.REACT_APP_API_HOST;

// interface IFormInput {
//   packageId: string;
//   vulnId: string;
// }

// const AddExistingVulnDialog = (props: {
//   open: boolean;
//   setOpen: React.Dispatch<React.SetStateAction<boolean>>;
// }) => {
//   const { control, handleSubmit } = useForm<IFormInput>();

//   const [packageData, setPackageData] = useState<any[]>([]);

//   const [vulnData, setVulnData] = useState<any[]>([]);

//   const [packageList, setPackageList] = useState<string[]>([]);

//   const [activeStep, setActiveStep] = React.useState(0);

//   const handleChange = (event: SelectChangeEvent<typeof packageList>) => {
//     const {
//       target: { value },
//     } = event;
//     setPackageList(typeof value === "string" ? value.split(",") : value);
//   };

//   useEffect(() => {
//     getAllPackages()
//       .then((response: any) => {
//         setPackageData(response.data);
//       })
//       .catch((err: any) => {
//         console.log(err);
//         throw new Error("Unable to get package data.");
//       });

//       getVulns()
//         .then((response: any) => {
//           setVulnData(response.data);
//         })
//         .catch((err: any) => {
//           console.log(err);
//           throw new Error("Unable to get package data.");
//         })
//         console.log(vulnData);
//   }, []);

//   const onSubmit: SubmitHandler<IFormInput> = (data) => {
//     console.log(vulnData)
//     console.log(data);
//     console.log(packageData);
//     console.log(packageList);
//     axios
//       .post(`${baseUrl}/vulns`, {
//         packageId: data.packageId,
//         vulnID: data.vulnId,
//       })
//       .then(function (response) {
//         console.log(response);
//       })
//       .catch(function (error) {
//         console.log(error);
//       });
//       handleClose();
//       setActiveStep(0);
//   };

//   const handleClose = () => {
//     props.setOpen(false);
//   };

//   const handleNext = () => {
//     setActiveStep((prevActiveStep) => prevActiveStep + 1);
//   };

//   const handleBack = () => {
//     setActiveStep((prevActiveStep) => prevActiveStep - 1);
//   };

//   return (
//     <Dialog
//       open={props.open}
//       onClose={handleClose}
//       sx={{
//         "& .MuiPaper-root": {
//           minHeight: "80%",
//           maxHeight: "80%",
//         },
//       }}
//       maxWidth="md"
//       fullWidth
//     >
//       <Box paddingTop={3} paddingBottom={3} paddingLeft={6} paddingRight={6}>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <Stepper activeStep={activeStep} orientation="vertical">
//             <Step>
//               <StepLabel> Link existing Vulnerability to another package </StepLabel>
//               <StepContent>
//                 <Box>
//                   <Typography> Follow the steps to add a vulnerability to an exisitng package. </Typography>
//                 </Box>
//                 <Box>
//                   <Button onClick={handleNext}> Next </Button>
//                 </Box>
//               </StepContent>
//             </Step>
//             <Step>
//               <StepLabel> Vulnerability: </StepLabel>
//               <StepContent>
//                 <Box>
//                   <Typography> Vulnerabilites: </Typography>
//                   <Controller
//                     name="packageId"
//                     control={control}
//                     render={({ field }) => (
//                       <Select
//                         {...field}
//                         value={packageList}
//                         onChange={handleChange}
//                       >
//                         {vulnData?.map((vulnData) => {
//                           return (
//                             <MenuItem key={vulnData.name} value={vulnData.id}>
//                               {vulnData.name ?? vulnData.id}
//                             </MenuItem>
//                           );
//                         })}
//                       </Select>
//                     )}
//                   />
//                 </Box>
//                 <Box>
//                   <Button onClick={handleNext}> Next </Button>
//                 </Box>
//                 <Box>
//                   <Button onClick={handleBack}> Back </Button>
//                 </Box>
//               </StepContent>
//             </Step>
//             <Step>
//               <StepLabel> Select impacted package: </StepLabel>
//               <StepContent>
//                 <Box>
//                   <Typography> Package: </Typography>
//                   <Controller
//                     name="packageId"
//                     control={control}
//                     render={({ field }) => (
//                       <Select
//                         {...field}
//                         value={packageList}
//                         onChange={handleChange}
//                       >
//                         {packageData?.map((packageData) => {
//                           return (
//                             <MenuItem key={packageData.id} value={packageData.id}>
//                               {packageData.name ?? packageData.id}
//                             </MenuItem>
//                           );
//                         })}
//                       </Select>
//                     )}
//                   />
//                 </Box>
//                 <Box>
//                   <Button onClick={handleNext}> Next </Button>
//                 </Box>
//                 <Box>
//                   <Button onClick={handleBack}> Back </Button>
//                 </Box>
//               </StepContent>
//             </Step>
//           </Stepper>
//           {activeStep === 3 && (
//             <Box>
//               <Typography> Click Submit to report the vulnerability</Typography>
//               <Button type="submit" > Submit </Button>
//             </Box>
//           )}

//         </form>
//       </Box>
//     </Dialog>
//   );
// };

// export default AddExistingVulnDialog;
