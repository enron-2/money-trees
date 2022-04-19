import React, { useEffect, useState } from 'react';
import {
  Chip,
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

import DependabotDisplay from '../Global/DependabotDisplay';
import SeverityIcon from '../Global/SeverityIcon';
import VulnDisplay from '../Global/VulnDisplay';
import { getAllPackageProjects } from '../../services/packages';
import { severityComp } from '../Global/severityComp';

const PackageDialog = (props: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  name: string;
  version: string;
  severityLevel: number;
}) => {
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (props.open) {
      getAllPackageProjects(props.id)
        .then((response) => {
          setProjectData(response);
          setLoading(false);
        })
        .catch((err: any) => {
          console.log(err);
          throw new Error('Unable to get projects using package.');
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
          &nbsp;&nbsp;
          <Chip label={props.version} color="primary" variant="outlined" />
          &nbsp;&nbsp;&nbsp;
          <SeverityIcon severityLevel={props.severityLevel} />
        </div>
        <TextField
          placeholder="Filter projects..."
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
        <div style={{ marginBottom: '12px' }}>
          <VulnDisplay packageId={props.id} />
        </div>
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
                Project Name
              </TableCell>
              <TableCell align="center" style={{ fontWeight: 550 }}>
                Dependabot Enabled
              </TableCell>
              <TableCell align="center" style={{ fontWeight: 550 }}>
                Dependabot PR
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
              projectData
                .filter((item: any) => {
                  return item.name.toLowerCase().includes(search.toLowerCase());
                })
                .sort(severityComp)
                .map((project) => (
                  <TableRow key={project.id}>
                    <TableCell align="center">
                      <Link
                        href={project.url}
                        target="blank"
                        rel="noopener"
                        color="#000000"
                        underline="hover"
                      >
                        {project.name}
                        <InsertLink fontSize="small" color="primary" />
                      </Link>
                    </TableCell>
                    <DependabotDisplay
                      projectUrl={project.url}
                      packageName={props.name}
                    />
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default PackageDialog;
