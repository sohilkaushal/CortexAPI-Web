import React, { useEffect, useContext } from 'react';
import { Typography, IconButton } from '@material-ui/core';
import { Image, HeaderElements } from '../../../components';
import { LayoutContext } from '../../../contexts';
import { ProviderDeviceList } from 'components/index';

export const Home = () => {
  const { setHeaderElements, pageTitle } = useContext(LayoutContext)
  useEffect(() => {
    setHeaderElements(<HeaderElements>
      <Typography>
        {pageTitle}
      </Typography>
      <IconButton>
        <i className="material-icons"></i>
      </IconButton>
    </HeaderElements>);
  }, [pageTitle, setHeaderElements]);
  return (
    <ProviderDeviceList />
  );
};

export default Home;
