import { useEffect, useState } from 'react';

import { Typography, MenuItem, CircularProgress } from '@mui/material';
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

  const handlePackageChange = (
    event: SelectChangeEvent<typeof packageList>
  ) => {
    const {
      target: { value },
    } = event;
    const val = typeof value === 'string' ? value.split(',') : value;
    setPackageList(val);
    props.formData.packageIds = val;
    props.setFormData(props.formData);
    console.log(props.formData);
  };

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
      {props.isNewVuln ? (
        <div>
          <Select
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
          </Select>
        </div>
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
