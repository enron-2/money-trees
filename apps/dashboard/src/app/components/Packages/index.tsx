import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Grid } from '@mui/material';

import PackageCard from './PackageCard';
import { getAllPackages } from '../../services/packages';
import { severityComp } from '../Global/severityComp';

const Packages = (props: { search: string }) => {
  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState<any[]>([]);

  useEffect(() => {
    getAllPackages()
      .then((response: any) => {
        setPackageData(response);
        setLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        throw new Error('Unable to get package data.');
      });
  }, []);

  return (
    <Box
      sx={{ justifyContent: 'center', textAlign: 'center' }}
      paddingTop={3}
      paddingBottom={3}
      paddingLeft={6}
      paddingRight={6}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={6}>
          {packageData
            .filter((item: any) => {
              return item.name
                .toLowerCase()
                .includes(props.search.toLowerCase());
            })
            .sort(severityComp)
            .map((pkg: any) => {
              return (
                <Grid item xs={3}>
                  <PackageCard
                    id={pkg.id}
                    name={pkg.name}
                    url={pkg.url}
                    version={pkg.version}
                    severityLevel={pkg.worstSeverity}
                  />
                </Grid>
              );
            })}
        </Grid>
      )}
    </Box>
  );
};

export default Packages;
