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
    setPackageList(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
    props.formData.packageIds = packageList;
    console.log(props.formData);
    props.setFormData(props.formData);
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
          <Select multiple value={packageList} onChange={handlePackageChange}>
            {loading ? (
              <CircularProgress />
            ) : (
              packageData.map((pkg) => {
                return (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    {pkg.name ?? pkg.id}
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
                    {pkg.name ?? pkg.id}
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
