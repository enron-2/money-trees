import { useEffect } from 'react';

import { Typography } from '@mui/material';

import axios from 'axios';
import { environment } from '../../../environments/environment';

const baseUrl = environment.apiHost;

export const CompletedStep = (props: { isNewVuln: boolean; formData: any }) => {
  useEffect(() => {
    if (!props.isNewVuln) {
      axios
        .put(
          `${baseUrl}/vulns/${encodeURIComponent(
            props.formData.vulnId
          )}/packages/${encodeURIComponent(props.formData.packageId)}`,
          {}
        )
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      console.log(props.formData);
      axios
        .post(`${baseUrl}/vulns`, {
          name: props.formData.name,
          description: props.formData.description,
          severity: props.formData.severity,
          packageIds: props.formData.packageIds,
        })
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }, []);

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
      <Typography>Thanks for submitting the vulnerability!</Typography>
    </div>
  );
};
