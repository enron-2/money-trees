import { useEffect, useState } from 'react';

import {
  Typography,
  MenuItem,
  CircularProgress,
  Chip,
  FormControl,
  Box,
  Autocomplete,
  TextField,
  Divider,
} from '@mui/material';
import { getAllPackages } from '../../services/packages';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export const StepThree = (props: {
  isNewVuln: boolean;
  setFormData: any;
  formData: any;
}) => {
  const [packageData, setPackageData] = useState<any[]>([]);
  const [packageList, setPackageList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState('');
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

  const handleChange = (e: any, value: any) => {
    props.formData.packageId = value.id;
    props.setFormData(props.formData);
    setSelectedPackage(value.id);
  };

  const handlePackageChange = (e: any, value: any[]) => {
    console.log(value);
    for (let i = 0; i < value.length; i++) {
      packageList.push(value[i].id);
    }
    console.log(packageList);
    props.formData.packageIds = packageList;
    props.setFormData(props.formData);
  };

  return (
    <div>
      {props.isNewVuln ? (
        <Box
          sx={{
            width: '100%',
            pt: 5,
            pb: 5,
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {loading ? (
            <Box>
              <Typography> Loading Packages</Typography>
              <CircularProgress />
            </Box>
          ) : (
            <Autocomplete
              fullWidth
              multiple
              options={packageData}
              getOptionLabel={(option) => option.name}
              filterSelectedOptions
              onChange={(e, value) => handlePackageChange(e, value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Packages"
                  placeholder="Search for packages...."
                />
              )}
            />
          )}
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            pt: 5,
            pb: 5,
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {loading ? (
            <Box>
              <Typography> Loading Packages</Typography>
              <CircularProgress />
            </Box>
          ) : (
            <Autocomplete
              fullWidth
              options={packageData}
              getOptionLabel={(option) => option.name}
              filterSelectedOptions
              onChange={(e, value) => handleChange(e, value)}
              renderInput={(params) => (
                <TextField {...params} label="Select impacted package" />
              )}
            />
          )}
        </Box>
      )}
    </div>
  );
};
