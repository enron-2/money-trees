import React, { useState } from 'react';
import { Card, IconButton, Link, Typography } from '@mui/material';
import { darken } from '@mui/material';
import {
  ChevronRightOutlined,
  KeyboardArrowDownOutlined,
} from '@mui/icons-material';

import SeverityIcon from '../Global/SeverityIcon';
import ProjectCollapse from './ProjectCollapse';
import ProjectDialog from './ProjectDialog';

const ProjectCard = (props: {
  id: string;
  name: string;
  url: string;
  severityLevel: number;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <>
      <ProjectDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        id={props.id}
        name={props.name}
        severityLevel={props.severityLevel}
      />
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '6px',
          paddingLeft: '20px',
          border: '2px solid',
          borderColor: 'secondary.main',
          boxShadow: 0,
          '&:hover': {
            transition: '0.4s',
            borderColor: (theme) => darken(theme.palette.secondary.main, 0.02),
            boxShadow: (theme) =>
              `2px 2px 12px 1px ${theme.palette.secondary.main}`,
          },
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '60%' }}>
            <Typography
              align="left"
              sx={{
                marginTop: '6px',
                marginBottom: '6px',
                wordWrap: 'break-word',
              }}
            >
              <Link
                href={props.url}
                target="blank"
                rel="noopener"
                color="#000000"
                underline="hover"
                fontWeight={dropdownOpen ? 550 : 400}
              >
                {props.name}
              </Link>
            </Typography>
          </div>
          <IconButton
            onClick={handleDropdown}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'right',
            }}
          >
            <SeverityIcon severityLevel={props.severityLevel} />
            {dropdownOpen ? (
              <KeyboardArrowDownOutlined />
            ) : (
              <ChevronRightOutlined />
            )}
          </IconButton>
        </div>
        <ProjectCollapse
          id={props.id}
          severityLevel={props.severityLevel}
          open={dropdownOpen}
          setDialogOpen={setDialogOpen}
        />
      </Card>
    </>
  );
};

export default ProjectCard;
