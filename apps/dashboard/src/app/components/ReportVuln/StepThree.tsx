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

  const handleChange = (e: any) => {
    props.formData.packageId = e.target.value;
    props.setFormData(props.formData);
    setSelectedPackage(e.target.value);
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
            m: 5,
            justifyContent: 'center',
          }}
        >
          <Autocomplete
            fullWidth
            multiple
            options={packageData}
            getOptionLabel={(option) => option.name}
            filterSelectedOptions
            onChange={(e, value) => handlePackageChange(e, value)}
            renderInput={(params) =>
              loading ? (
                <CircularProgress />
              ) : (
                <TextField
                  {...params}
                  label="Select Packages"
                  placeholder="Search for packages...."
                />
              )
            }
          />
          {/* <Select
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
              multiple
              value={packageList}
              onChange={(e) => handlePackageChange(e)}
            >
              {loading ? (
                <CircularProgress />
              ) : (
                packageData.map((pkg) => {
                  return (
                    <MenuItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </MenuItem>
                  );
                })
              )}
            </Select> */}
        </Box>
      ) : (
        <div>
          <Select value={selectedPackage} onChange={handleChange}>
            {loading ? (
              <CircularProgress />
            ) : (
              packageData.map((pkg) => {
                return (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </MenuItem>
                );
              })
            )}
          </Select>
        </div>
      )}
    </div>
  );
};
