import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Collapse, Typography } from '@mui/material';

import { ChevronRightOutlined } from '@mui/icons-material';

import SeverityChip from '../Global/SeverityChip';
import { getAllProjectDependencies } from '../../services/projects';

const ProjectCollapse = (props: {
  id: string;
  severityLevel: number;
  open: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [loading, setLoading] = useState(true);
  const [vulnDependencyData, setVulnDependencyData] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    if (props.open && props.severityLevel !== 0) {
      getAllProjectDependencies(props.id)
        .then((response) => {
          setVulnDependencyData(
            response.filter((item: any) => {
              return item.worstSeverity && item.worstSeverity > 0;
            })
          );
          setLoading(false);
        })
        .catch((err: any) => {
          console.log(err);
          throw new Error('Unable to get project dependencies.');
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
          {vulnDependencyData.length === 0 ? (
            'No dependencies with known vulnerabilities.'
          ) : (
            <div>
              Dependencies with known vulnerabilities:
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {vulnDependencyData
                  .sort((a: any, b: any) => {
                    return b.worstSeverity - a.worstSeverity;
                  })
                  .map((vulnDependency: any) => {
                    return (
                      <SeverityChip
                        label={
                          vulnDependency.name + '-' + vulnDependency.version
                        }
                        severityLevel={vulnDependency.worstSeverity}
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

export default ProjectCollapse;
