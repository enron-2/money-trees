import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';

import SeverityChip from './SeverityChip';
import { getAllPackageVulns } from '../../services/packages';

const VulnDisplay = (props: { packageId: string }) => {
  const [loading, setLoading] = useState(true);
  const [vulnData, setVulnData] = useState<any[]>([]);

  useEffect(() => {
    getAllPackageVulns(props.packageId)
      .then((response: any) => {
        setVulnData(response);
        setLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        throw new Error('Unable to get package vulnerabilities.');
      });
  }, [props.packageId]);

  return (
    <div>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        vulnData
          .sort((a: any, b: any) => {
            return b.severity - a.severity;
          })
          .map((vuln: any) => {
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <SeverityChip label={vuln.name} severityLevel={vuln.severity} />
                &nbsp;&nbsp;&nbsp;
                {vuln.description}
              </div>
            );
          })
      )}
    </div>
  );
};

export default VulnDisplay;
