import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';

const SearchBar = (props: {
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <TextField
      placeholder="Search..."
      sx={{ m: 1, width: '30vw', marginLeft: '24px', marginRight: '24px' }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
      variant="standard"
      onChange={(e) => {
        props.setSearch(e.target.value);
      }}
    />
  );
};

export default SearchBar;
