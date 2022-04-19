// import React, { useEffect, useState } from "react";
// import { useForm, Controller, SubmitHandler } from "react-hook-form";
// import {
//   Input,
//   Box,
//   Dialog,
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
// } from "@mui/material";
// import { getAllPackages } from "../../services/packages";
// import axios from "axios";
// import Select, { SelectChangeEvent } from "@mui/material/Select";
// import SeverityIcon from "../Global/SeverityIcon";

// const baseUrl = process.env.REACT_APP_API_HOST;

// interface IFormInput {
//   cve: string;
//   title: string;
//   description: string;
//   severity: number;
//   packageIds: [value: string];
// }

// const ReportVulnDialog = (props: {
//   open: boolean;
//   setOpen: React.Dispatch<React.SetStateAction<boolean>>;
// }) => {
//   const { control, handleSubmit } = useForm<IFormInput>();

//   const [packageData, setPackageData] = useState<any[]>([]);

//   const [packageList, setPackageList] = useState<string[]>([]);

//   const [loading, setLoading] = useState(true);

//   const [activeStep, setActiveStep] = React.useState(0);

//   const handleChange = (event: SelectChangeEvent<typeof packageList>) => {
//     const {
//       target: { value },
//     } = event;
//     setPackageList(typeof value === "string" ? value.split(",") : value);
//   };

//   useEffect(() => {
//     if (props.open) {
//       getAllPackages()
//         .then((response: any) => {
//           setPackageData(response);
//           setLoading(false);
//         })
//         .catch((err: any) => {
//           console.log(err);
//           throw new Error("Unable to get package data.");
//         });
//     }
//   }, [props.open]);

//   const onSubmit: SubmitHandler<IFormInput> = (data) => {
//     console.log(data);
//     console.log(packageData);
//     console.log(packageList);
//     axios
//       .post(`${baseUrl}/vulns`, {
//         cve: data.cve,
//         title: data.title,
//         description: data.description,
//         severity: data.severity,
//         packageIds: packageList,
//       })
//       .then(function (response) {
//         console.log(response);
//       })
//       .catch(function (error) {
//         console.log(error);
//       });
//     handleClose();
//     setActiveStep(0);
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
//           <Stepper activeStep={activeStep}>
//             <Step>
//               <StepLabel></StepLabel>
//               <DialogContent>
//                 <Button> New Vuln </Button>
//                 <Button> Existing Vuln </Button>
//               </DialogContent>
//             </Step>
//             <Step>
//               <StepLabel> Report new vulnerability </StepLabel>
//               <Box>
//                 <Button onClick={handleNext}> Next </Button>
//               </Box>
//             </Step>
//             <Step>
//               <StepLabel> Vulnerability Description </StepLabel>
//               <StepContent>
//                 <Box>
//                   <Typography> CVE: </Typography>
//                   <Controller
//                     name="cve"
//                     control={control}
//                     render={({ field }) => (
//                       <Input placeholder="cve" {...field} />
//                     )}
//                   />
//                 </Box>
//                 <Box>
//                   <Typography> Title: </Typography>
//                   <Controller
//                     name="title"
//                     control={control}
//                     render={({ field }) => (
//                       <Input placeholder="title" {...field} />
//                     )}
//                   />
//                 </Box>
//                 <Box>
//                   <Typography> Description: </Typography>
//                   <Controller
//                     name="description"
//                     control={control}
//                     render={({ field }) => (
//                       <Input placeholder="description" {...field} />
//                     )}
//                   />
//                 </Box>
//                 <Box>
//                   <Typography> Severity: </Typography>
//                   <Controller
//                     name="severity"
//                     control={control}
//                     render={({ field }) => (
//                       <Select {...field}>
//                         <MenuItem value={1}>
//                           1 - Low <SeverityIcon severityLevel={1} />{" "}
//                         </MenuItem>
//                         <MenuItem value={2}>
//                           2 - Medium <SeverityIcon severityLevel={2} />{" "}
//                         </MenuItem>
//                         <MenuItem value={3}>
//                           3 - High <SeverityIcon severityLevel={3} />{" "}
//                         </MenuItem>
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
//               <StepLabel> Select impacted packages: </StepLabel>
//               <StepContent>
//                 <Box>
//                   <Typography> Packages: </Typography>
//                   <Controller
//                     name="packageIds"
//                     control={control}
//                     render={({ field }) => (
//                       <Select
//                         {...field}
//                         multiple
//                         value={packageList}
//                         onChange={handleChange}
//                       >
//                         {loading ? (
//                           <CircularProgress />
//                         ) : (
//                           packageData.map((pkg) => {
//                             return (
//                               <MenuItem key={pkg.id} value={pkg.id}>
//                                 {pkg.name ?? pkg.id}
//                               </MenuItem>
//                             );
//                           })
//                         )}
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
//               <Button type="submit"> Submit </Button>
//             </Box>
//           )}
//         </form>
//       </Box>
//       <DialogActions>
//         <Button onClick={handleNext}> Next </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ReportVulnDialog;
