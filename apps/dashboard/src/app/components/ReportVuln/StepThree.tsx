// import React, { FC, useEffect, useState } from "react";

// import { Typography, Select, MenuItem, CircularProgress } from "@mui/material";
// import { getAllPackages } from "../../services/packages";

// export const StepThree = (props: { isNewVuln: boolean; setFormData: any }) => {
//   const [packageData, setPackageData] = useState<any[]>([]);
//   const [selectedVuln, setSelectedVuln] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [selectedPackage, setSelectedPackage] = useState("");

//   useEffect(() => {
//     if (!props.isNewVuln) {
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
//   }, [props.isNewVuln]);

//   const handleChange = (e: any) => {
//     props.setFormData({ packageId: e.target.value });
//     setSelectedVuln(e.target.value);
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "300px",
//       }}
//     >
//       {props.isNewVuln ? (
//         <div></div>
//       ) : (
//         <div>
//           <Select value={selectedPackage} onChange={handleChange}>
//             {loading ? (
//               <CircularProgress />
//             ) : (
//               packageData.map((pkg) => {
//                 return (
//                   <MenuItem key={pkg.id} value={pkg.id}>
//                     {pkg.name ?? pkg.id}
//                   </MenuItem>
//                 );
//               })
//             )}
//           </Select>
//         </div>
//       )}
//     </div>
//   );
// };
