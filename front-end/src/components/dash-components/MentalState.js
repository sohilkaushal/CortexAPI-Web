/* eslint-disable no-script-url */

import Typography from '@material-ui/core/Typography';
import React from 'react';
import Title from './Title';

const bandMappings = {
  betaL: 'Attentive',
  betaH: 'Attentive',
  theta: 'Deeply relaxed',
  delta: 'Asleep',
  gamma: 'High performance activity',
};

export default function MentalState(props) {
  const [ highestBand, setHighestBand ] = React.useState('');

  React.useEffect(() => {
    setHighestBand(props.highestBand);
  }, [props.highestBand]);

  return (
    <React.Fragment>
      <Title>Current state</Title>
      <Typography component="p" variant="h4">
        {bandMappings[highestBand] || 'Unknown'}
      </Typography>
    </React.Fragment>
  );
}
