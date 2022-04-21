import React, { useState } from 'react';

import {
  AppBar,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from '@mui/material';

/* Gif from https://www.instagram.com/bynorafikse/ */
import PinkSparkles from './PinkSparkles.gif';

import SearchBar from './SearchBar';
import Packages from '../Packages';
import Projects from '../Projects';
import ReportVulnDialog from '../ReportVuln';
import enron2gif from '../../../../../../assets/enron.gif';

const HomePage = (props: { view: number }) => {
  const [search, setSearch] = useState('');
  const [toggle, setToggle] = useState(props.view);

  const [reportVulnDialogOpen, setReportVulnDialogOpen] = useState(false);

  return (
    <div>
      <AppBar
        sx={{
          backgroundColor: 'white',
          position: 'sticky',
        }}
      >
        <Toolbar style={{ justifyItems: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              marginTop: '4px',
              marginBottom: '4px',
              marginLeft: '24px',
            }}
          >
            <img
              src={PinkSparkles}
              alt="Pink sparkles"
              style={{
                maxHeight: '100%',
                width: 'auto',
                position: 'absolute',
                zIndex: -1,
              }}
            />
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
              <img
                src={enron2gif}
                alt="enron 2 logo"
                width="50"
                height="50"
                style={{}}
              />
            </a>
            <Typography
              variant="h6"
              sx={{ textAlign: 'right', lineHeight: 1.2 }}
            >
              Enron 2 <br />
              Dashboard
            </Typography>
          </div>
          <div style={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            onClick={() => {
              setReportVulnDialogOpen(true);
            }}
          >
            Report new vulnerability
          </Button>

          <div style={{ flexGrow: 2 }} />
          <SearchBar setSearch={setSearch} />
          <ToggleButtonGroup
            color="primary"
            size="small"
            value={toggle}
            exclusive
            onChange={(e, newValue) => {
              if (newValue !== null) {
                setToggle(newValue);
              }
            }}
            style={{ marginRight: '24px' }}
          >
            <ToggleButton value={0}>Project View</ToggleButton>
            <ToggleButton value={1}>Package View</ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>
      {toggle ? <Packages search={search} /> : <Projects search={search} />}
      <ReportVulnDialog
        open={reportVulnDialogOpen}
        setOpen={setReportVulnDialogOpen}
      />
    </div>
  );
};

export default HomePage;
