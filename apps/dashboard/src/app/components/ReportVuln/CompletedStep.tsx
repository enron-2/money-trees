// import React, { useEffect } from "react";

// import { Typography } from "@mui/material";

// import axios from "axios";
// const baseUrl = process.env.REACT_APP_API_HOST;

// export const CompletedStep = (props: { isNewVuln: boolean }) => {
//   useEffect(() => {
//     if (!props.isNewVuln) {
//       axios
//         .post(`${baseUrl}/vulns`, {})
//         .then(function (response) {
//           console.log(response);
//         })
//         .catch(function (error) {
//           console.log(error);
//         });
//     }
//   }, []);

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
//       <Typography>
//         Welcome to Level Up! An e-commerce store for games.
//       </Typography>
//       <Typography style={{ paddingTop: "24px" }}>
//         The following steps will guide you through setting up your account!
//       </Typography>
//     </div>
//   );
// };
