import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Grid } from '@mui/material';

import ProjectCard from './ProjectCard';
import { getAllProjects } from '../../services/projects';
import { severityComp } from '../Global/severityComp';

const Projects = (props: { search: string }) => {
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<any[]>([]);

  useEffect(() => {
    getAllProjects()
      .then((response: any) => {
        setProjectData(response);
        setLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        throw new Error('Unable to get project data.');
      });
  }, []);

  return (
    <Box paddingTop={3} paddingBottom={3} paddingLeft={6} paddingRight={6}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={6}>
          {projectData
            .filter((item: any) => {
              return item.name
                .toLowerCase()
                .includes(props.search.toLowerCase());
            })
            .sort(severityComp)
            .map((project) => {
              return (
                <Grid item xs={3}>
                  <ProjectCard
                    id={project.id}
                    name={project.name}
                    url={project.url}
                    severityLevel={project.worstSeverity}
                  />
                </Grid>
              );
            })}
        </Grid>
      )}
    </Box>
  );
};

export default Projects;
