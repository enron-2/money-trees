import React, { useEffect, useState } from 'react';
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { InsertLink, Search } from '@mui/icons-material';

import SeverityIcon from '../Global/SeverityIcon';
import VulnDisplay from '../Global/VulnDisplay';
import { severityComp } from '../Global/severityComp';
import { getAllProjectDependencies } from '../../services/projects';

const ProjectDialog = (props: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  name: string;
  severityLevel: number;
}) => {
  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (props.open) {
      getAllProjectDependencies(props.id)
        .then((response: any) => {
          setPackageData(response);
          setLoading(false);
        })
        .catch((err: any) => {
          console.log(err);
          throw new Error('Unable to get project dependencies.');
        });
    }
  }, [props.id, props.name, props.open]);

  const handleClose = () => {
    props.setOpen(false);
  };

  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      sx={{
        '& .MuiPaper-root': {
          minHeight: 'calc(100% - 64px)',
          maxHeight: 'calc(100% - 64px)',
        },
      }}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {props.name}
          &nbsp;&nbsp;&nbsp;
          <SeverityIcon severityLevel={props.severityLevel} />
        </div>
        <TextField
          placeholder="Filter dependencies..."
          sx={{ m: 1, width: '30vw' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          variant="standard"
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
      </DialogTitle>
      <DialogContent>
        <Table
          width="100%"
          sx={{
            th: {
              border: (theme) => `1px solid ${theme.palette.secondary.main}`,
              backgroundColor: (theme) => theme.palette.secondary.main,
            },
            td: {
              border: (theme) => `1px solid ${theme.palette.secondary.main}`,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell align="center" style={{ fontWeight: 550 }}>
                Package Name
              </TableCell>
              <TableCell align="center" style={{ fontWeight: 550 }}>
                Package Version
              </TableCell>
              <TableCell align="center" style={{ fontWeight: 550 }}>
                Vulnerabilities
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              packageData
                .filter((item: any) => {
                  return item.name.toLowerCase().includes(search.toLowerCase());
                })
                .sort(severityComp)
                .map((pkg) => (
                  <TableRow key={pkg.name}>
                    <TableCell align="center">
                      <Link
                        href={pkg.url}
                        target="blank"
                        rel="noopener"
                        color="#000000"
                        underline="hover"
                      >
                        {pkg.name}
                        <InsertLink fontSize="small" color="primary" />
                      </Link>
                    </TableCell>
                    <TableCell align="center">{pkg.version}</TableCell>
                    <TableCell align="center">
                      {pkg.worstSeverity && pkg.worstSeverity > 0 ? (
                        <div
                          style={{ display: 'flex', justifyContent: 'center' }}
                        >
                          <VulnDisplay packageId={pkg.id} />
                        </div>
                      ) : (
                        <SeverityIcon severityLevel={pkg.worstSeverity} />
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;
