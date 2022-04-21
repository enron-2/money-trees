import { useEffect, useState } from 'react';

import { getVulns } from '../../services/vulnerabilities';

import { Typography, Select, MenuItem, Input } from '@mui/material';
import SeverityIcon from '../Global/SeverityIcon';

export const StepTwo = (props: {
  isNewVuln: boolean;
  setFormData: any;
  formData: any;
}) => {
  const [vulnData, setVulnData] = useState<any[]>([]);
  const [selectedVuln, setSelectedVuln] = useState('');

  useEffect(() => {
    if (!props.isNewVuln) {
      getVulns()
        .then((response: any) => {
          setVulnData(response.data);
        })
        .catch((err: any) => {
          console.log(err);
          throw new Error('Unable to get vuln data.');
        });
    }
  }, [props.isNewVuln]);

  const handleChange = (e: any) => {
    props.formData.vulnId = e.target.value;
    props.setFormData(props.formData);
    setSelectedVuln(e.target.value);
  };

  const handleSeverityChange = (e: any) => {
    props.formData.severity = e.target.value;
    props.setFormData(props.formData);
    setSelectedVuln(e.target.value);
  };

  const handleNameChange = (e: any) => {
    props.formData.name = e.target.value;
    props.setFormData(props.formData);
    setSelectedVuln(e.target.value);
  };

  const handleTitleChange = (e: any) => {
    props.formData.title = e.target.value;
    props.setFormData(props.formData);
    setSelectedVuln(e.target.value);
  };

  const handleDescriptionChange = (e: any) => {
    props.formData.description = e.target.value;
    props.setFormData(props.formData);
    setSelectedVuln(e.target.value);
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
          <div>
            <Input placeholder="cve" onChange={handleNameChange} />
          </div>
          <div>
            <Input placeholder="title" onChange={handleTitleChange} />
          </div>
          <div>
            <Input placeholder="title" onChange={handleTitleChange} />
          </div>
          <div>
            <Input
              placeholder="description"
              onChange={handleDescriptionChange}
            />
            <Select onChange={handleSeverityChange}>
              <MenuItem value={1}>
                <SeverityIcon severityLevel={1} /> Low
              </MenuItem>
              <MenuItem value={2}>
                <SeverityIcon severityLevel={2} /> Medium
              </MenuItem>
              <MenuItem value={3}>
                <SeverityIcon severityLevel={3} /> High
              </MenuItem>
              <MenuItem value={3}>
                <SeverityIcon severityLevel={4} /> Critical
              </MenuItem>
            </Select>
          </div>
        </div>
      ) : (
        <div>
          <Select value={selectedVuln} onChange={handleChange}>
            {vulnData.map((vuln) => {
              return (
                <MenuItem key={vuln.name} value={vuln.id} id="test">
                  {vuln.name}
                </MenuItem>
              );
            })}
          </Select>
        </div>
      )}
    </div>
  );
};
