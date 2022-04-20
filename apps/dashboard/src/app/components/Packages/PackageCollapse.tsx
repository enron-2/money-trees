import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Collapse, Typography } from '@mui/material';
import { ChevronRightOutlined } from '@mui/icons-material';

import SeverityChip from '../Global/SeverityChip';
import { getAllPackageVulns } from '../../services/packages';

const PackageCollapse = (props: {
  id: string;
  severityLevel: number;
  open: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [loading, setLoading] = useState(true);
  const [vulnData, setVulnData] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    if (props.open && props.severityLevel !== 0) {
      getAllPackageVulns(props.id)
        .then((response) => {
          setVulnData(response);
          setLoading(false);
        })
        .catch((err: any) => {
          console.log(err);
          throw new Error('Unable to get package vulnerabilities.');
        });
    }
  }, [props.id, props.open, props.severityLevel]);

  const handleOpenDialog = () => {
    props.setDialogOpen(true);
  };

  return (
    <Collapse
      in={props.open}
      timeout="auto"
      unmountOnExit
      style={{ paddingTop: '12px' }}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Typography textAlign="left">
          {vulnData.length === 0 ? (
            'No known vulnerabilities.'
          ) : (
            <div>
              Known Vulnerabilities:
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {vulnData
                  .sort((a: any, b: any) => {
                    return b.severity - a.severity;
                  })
                  .map((vuln: any) => {
                    return (
                      <SeverityChip
                        label={vuln.name}
                        severityLevel={vuln.severity}
                      />
                    );
                  })}
              </div>
            </div>
          )}
        </Typography>
      )}
      <div
        style={{
          display: 'flex',
          width: '100%',
        }}
      >
        <Button
          style={{
            textTransform: 'none',
            marginLeft: 'auto',
          }}
          onClick={handleOpenDialog}
        >
          <div>See more</div> <ChevronRightOutlined />
        </Button>
      </div>
    </Collapse>
  );
};

export default PackageCollapse;
