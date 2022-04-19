import React, { useEffect, useState } from 'react';

import { CircularProgress, Link, TableCell } from '@mui/material';
import { Clear, Done } from '@mui/icons-material';

import {
  getDependabotPR,
  isDependabotEnabled,
} from '../../services/dependabot';

const DependabotDisplay = (props: {
  projectUrl: string;
  packageName: string;
}) => {
  const [loading, setLoading] = useState(true);
  const [dependabotEnabled, setDependabotEnabled] = useState('');
  const [dependabotPRFound, setDependabotPRFound] = useState(false);
  const [dependabotPRUrl, setDependabotPRUrl] = useState('');

  useEffect(() => {
    const url = new URL(props.projectUrl);
    const repo = url.pathname.substring(1);
    isDependabotEnabled(repo)
      .then((response: any) => {
        setDependabotEnabled(response);
        if (response === true) {
          getDependabotPR(repo, props.packageName)
            .then((response: any) => {
              setDependabotPRFound(response.found);
              if (response.found) {
                setDependabotPRUrl(response.url);
              }
            })
            .catch((err: any) => {
              console.log(err);
              throw new Error('Unable to get dependabot PR.');
            });
        }
        setLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        throw new Error('Unable to get check if dependabot is enabled.');
      });
  }, [props.projectUrl, props.packageName]);

  return (
    <>
      <>
        <TableCell align="center">
          {loading ? (
            <CircularProgress size={24} />
          ) : dependabotEnabled ? (
            <Done />
          ) : (
            <Clear />
          )}
        </TableCell>
        <TableCell align="center">
          {dependabotEnabled ? (
            dependabotPRFound ? (
              <Link
                href={dependabotPRUrl}
                target="blank"
                rel="noopener"
                color="#000000"
                underline="hover"
              >
                {dependabotPRUrl}
              </Link>
            ) : (
              'No dependabot PR for this package.'
            )
          ) : (
            'N/A'
          )}
        </TableCell>
      </>
    </>
  );
};

export default DependabotDisplay;
