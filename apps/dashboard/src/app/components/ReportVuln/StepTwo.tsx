// import React, { FC, useEffect, useState } from "react";

// import { getVulns } from "../../services/vulnerabilities";

// import { Typography, Select, MenuItem } from "@mui/material";

// export const StepTwo = (props: { isNewVuln: boolean; setFormData: any }) => {
//   const [vulnData, setVulnData] = useState<any[]>([]);
//   const [selectedVuln, setSelectedVuln] = useState("");

//   useEffect(() => {
//     if (!props.isNewVuln) {
//       getVulns()
//         .then((response: any) => {
//           setVulnData(response.data);
//         })
//         .catch((err: any) => {
//           console.log(err);
//           throw new Error("Unable to get vuln data.");
//         });
//     }
//   }, []);

//   const handleChange = (e: any) => {
//     props.setFormData({ vulnId: e.target.value });
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
//           <Select value={selectedVuln} onChange={handleChange}>
//             {vulnData.map((vuln) => {
//               return (
//                 <MenuItem key={vuln.name} value={vuln.id}>
//                   {vuln.name}
//                 </MenuItem>
//               );
//             })}
//           </Select>
//         </div>
//       )}
//     </div>
//   );
// };
