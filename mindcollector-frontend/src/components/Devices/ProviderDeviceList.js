import React, { useState } from 'react';
import { Paper, List, ListItem, ListItemText, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

export const ProviderDeviceList = () => {
  const [providers, setProviders] = useState([]);
  const classes = useStyles();

  return (
    <List className={classes.root} subheader={<li />}>
      {
        providers.map((provider, providerIndex) => (
          <li key={`provider-${providerIndex}`} className={classes.listSection}>
            <ul className={classes.ul}>
              {
                provider.devices.map((device, deviceIndex) => (
                  <ListItem key={`provider-${providerIndex}-device-${deviceIndex}`}>
                    <ListItemText primary={`${device.id}`} />
                  </ListItem>
                ))
              }
            </ul>
          </li>
        ))
      }
    </List>
  );
};

export default ProviderDeviceList;
